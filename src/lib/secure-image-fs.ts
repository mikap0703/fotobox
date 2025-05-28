// src/lib/secureImageFS.ts
import fs from 'fs';
import path from 'path';
import { loadConfig } from './config.js';

const config = loadConfig();

interface ImageResult {
  base64: string;
  mimeType: string;
  filePath: string;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

class SecureImageFS {
  private static instance: SecureImageFS;
  private readonly tempDir: string;
  private readonly allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  
  private constructor() {
    this.tempDir = path.resolve(config.storage.tempDirectory);
    this.ensureTempDirectoryExists();
  }
  
  public static getInstance(): SecureImageFS {
    if (!SecureImageFS.instance) {
      SecureImageFS.instance = new SecureImageFS();
    }
    return SecureImageFS.instance;
  }
  
  private ensureTempDirectoryExists(): void {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }
  
  private validateUUID(uuid: string): ValidationResult {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(uuid)) {
      return { isValid: false, error: 'Invalid UUID format' };
    }
    
    return { isValid: true };
  }
  
  private validateDirectory(): ValidationResult {
    try {
      const stats = fs.statSync(this.tempDir);
      if (!stats.isDirectory()) {
        return { isValid: false, error: 'Temp path is not a directory' };
      }
      return { isValid: true };
    } catch (error) {
			console.error('Failed to validate directory:', error);
      return { isValid: false, error: `Directory does not exist: ${this.tempDir}` };
    }
  }
  
  private validateFileExtension(filePath: string): ValidationResult {
    const ext = path.extname(filePath).toLowerCase();
    if (!this.allowedExtensions.includes(ext)) {
      return { isValid: false, error: `Unsupported file extension: ${ext}` };
    }
    return { isValid: true };
  }
  
  private validateFileSize(filePath: string): ValidationResult {
    try {
      const stats = fs.statSync(filePath);
      if (stats.size > config.security.maxFileSize) {
        return { isValid: false, error: 'File size exceeds maximum allowed size' };
      }
      return { isValid: true };
    } catch (error) {
			console.error('Failed to get file stats:', error);
      return { isValid: false, error: 'Could not read file stats' };
    }
  }
  
  private sanitizePath(filePath: string): string {
    // Prevent directory traversal attacks
    const normalizedPath = path.normalize(filePath);
    const resolvedPath = path.resolve(this.tempDir, normalizedPath);
    
    // Ensure the resolved path is still within the temp directory
    if (!resolvedPath.startsWith(this.tempDir)) {
      throw new Error('Access denied: Path traversal detected');
    }
    
    return resolvedPath;
  }
  
  public async getImageByUUID(uuid: string): Promise<ImageResult> {
    // Validate UUID
    const uuidValidation = this.validateUUID(uuid);
    if (!uuidValidation.isValid) {
      throw new Error(uuidValidation.error);
    }
    
    // Validate directory
    const dirValidation = this.validateDirectory();
    if (!dirValidation.isValid) {
      throw new Error(dirValidation.error);
    }
    
    try {
      const files = fs.readdirSync(this.tempDir);
      const matchingFile = files.find((file) => path.parse(file).name === uuid);
      
      if (!matchingFile) {
        throw new Error(`Image with ID ${uuid} not found`);
      }
      
      const filePath = this.sanitizePath(matchingFile);
      
      // Validate file extension
      const extValidation = this.validateFileExtension(filePath);
      if (!extValidation.isValid) {
        throw new Error(extValidation.error);
      }
      
      // Validate file size
      const sizeValidation = this.validateFileSize(filePath);
      if (!sizeValidation.isValid) {
        throw new Error(sizeValidation.error);
      }
      
      const fileContents = fs.readFileSync(filePath);
      const ext = path.extname(matchingFile).toLowerCase().substring(1);
      const mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      
      // Validate MIME type
      if (!config.security.allowedImageTypes.includes(mimeType)) {
        throw new Error(`Unsupported image type: ${mimeType}`);
      }
      
      const base64 = `data:${mimeType};base64,${Buffer.from(fileContents).toString('base64')}`;
      
      return { base64, mimeType, filePath };
      
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to retrieve image: ${error.message}`);
      }
      throw new Error('Failed to retrieve image: Unknown error');
    }
  }
  
  public async saveImage(uuid: string, imageBuffer: Buffer, extension: string): Promise<string> {
    const uuidValidation = this.validateUUID(uuid);
    if (!uuidValidation.isValid) {
      throw new Error(uuidValidation.error);
    }
    
    // Validate extension
    if (!this.allowedExtensions.includes(extension.toLowerCase())) {
      throw new Error(`Unsupported file extension: ${extension}`);
    }
    
    // Validate buffer size
    if (imageBuffer.length > config.security.maxFileSize) {
      throw new Error('Image size exceeds maximum allowed size');
    }
    
    const fileName = `${uuid}${extension}`;
    const filePath = this.sanitizePath(fileName);
    
    try {
      fs.writeFileSync(filePath, imageBuffer);
      return filePath;
    } catch (error) {
      throw new Error(`Failed to save image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  public async deleteImage(uuid: string): Promise<void> {
    const uuidValidation = this.validateUUID(uuid);
    if (!uuidValidation.isValid) {
      throw new Error(uuidValidation.error);
    }
    
    try {
      const files = fs.readdirSync(this.tempDir);
      const matchingFile = files.find((file) => path.parse(file).name === uuid);
      
      if (!matchingFile) {
        throw new Error(`Image with ID ${uuid} not found`);
      }
      
      const filePath = this.sanitizePath(matchingFile);
      fs.unlinkSync(filePath);
    } catch (error) {
      throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  public listImages(): string[] {
    try {
      const files = fs.readdirSync(this.tempDir);
      return files
        .filter(file => this.allowedExtensions.includes(path.extname(file).toLowerCase()))
        .map(file => path.parse(file).name);
    } catch (error) {
      throw new Error(`Failed to list images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const secureImageFS = SecureImageFS.getInstance();

// Legacy compatibility function
export async function getImageBase64ByUUID(
	uuid: string,
	tempDir?: string
): Promise<{
	base64: string;
	mimeType: string;
	filePath: string;
}> {
	if (tempDir && tempDir !== config.storage.tempDirectory) {
		console.warn('Custom tempDir parameter is deprecated and ignored for security reasons');
	}

	try {
		return await secureImageFS.getImageByUUID(uuid);
	} catch (error) {
		throw error;
	}
}