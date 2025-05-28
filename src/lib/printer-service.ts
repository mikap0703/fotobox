// src/lib/printerService.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import { loadConfig } from './config.js';

const execAsync = promisify(exec);
const config = loadConfig();

export interface PrintResult {
  success: boolean;
  message: string;
  jobId?: string;
  error?: string;
}

export interface PrinterStatus {
  available: boolean;
  status: string;
  queueLength: number;
}

class PrinterService {
  private static instance: PrinterService;
  private readonly printerName: string;
  
  private constructor() {
    this.printerName = config.printing.printerName;
  }
  
  public static getInstance(): PrinterService {
    if (!PrinterService.instance) {
      PrinterService.instance = new PrinterService();
    }
    return PrinterService.instance;
  }
  
  /**
   * Check if the printer is available and get its status
   */
  public async getPrinterStatus(): Promise<PrinterStatus> {
    try {
      const { stdout } = await execAsync(`lpstat -p ${this.printerName}`);
      const isEnabled = stdout.includes('is idle') || stdout.includes('is printing');
      
      // Get queue length
      let queueLength = 0;
      try {
        const { stdout: queueOutput } = await execAsync(`lpstat -o ${this.printerName}`);
        queueLength = queueOutput.split('\n').filter(line => line.trim()).length;
      } catch {
        // Queue might be empty or command failed
        queueLength = 0;
      }
      
      return {
        available: isEnabled,
        status: stdout.trim(),
        queueLength
      };
    } catch (error) {
      return {
        available: false,
        status: error instanceof Error ? error.message : 'Unknown error',
        queueLength: 0
      };
    }
  }
  
  /**
   * Print an image file
   */
  public async printImage(filePath: string, copies: number = 1): Promise<PrintResult> {
    // Validate inputs
    if (copies < 1 || copies > config.printing.maxCopies) {
      return {
        success: false,
        message: `Invalid number of copies. Must be between 1 and ${config.printing.maxCopies}`,
        error: 'INVALID_COPIES'
      };
    }
    
    if (!config.printing.enabled) {
      return {
        success: false,
        message: 'Printing is disabled in configuration',
        error: 'PRINTING_DISABLED'
      };
    }
    
    // Check printer status first
    const status = await this.getPrinterStatus();
    if (!status.available) {
      return {
        success: false,
        message: `Printer is not available: ${status.status}`,
        error: 'PRINTER_UNAVAILABLE'
      };
    }
    
    try {
      // Build print command with additional options for better quality
      const printCommand = [
        'lp',
        `-d ${this.printerName}`,
        `-n ${copies}`,
        '-o media=4x6',           // Standard photo size
        '-o fit-to-page',         // Fit image to page
        '-o print-quality=5',     // High quality
        `"${filePath}"`
      ].join(' ');
      
      const { stdout, stderr } = await execAsync(printCommand);
      
      // Extract job ID from output (format: "request id is PrinterName-JobID")
      const jobIdMatch = stdout.match(/request id is (.+)/);
      const jobId = jobIdMatch ? jobIdMatch[1] : undefined;
      
      if (stderr && stderr.trim()) {
        console.warn('Print command stderr:', stderr);
      }
      
      const message = copies === 1 
        ? 'Das Bild wird gedruckt...' 
        : `${copies} Bilder werden gedruckt...`;
      
      return {
        success: true,
        message,
        jobId
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Parse common printing errors
      let userFriendlyMessage = 'Beim Drucken ist ein Fehler aufgetreten';
      let errorCode = 'PRINT_FAILED';
      
      if (errorMessage.includes('No such file or directory')) {
        userFriendlyMessage = 'Die Bilddatei wurde nicht gefunden';
        errorCode = 'FILE_NOT_FOUND';
      } else if (errorMessage.includes('not accepting jobs')) {
        userFriendlyMessage = 'Der Drucker akzeptiert derzeit keine Aufträge';
        errorCode = 'PRINTER_NOT_ACCEPTING';
      } else if (errorMessage.includes('out of paper')) {
        userFriendlyMessage = 'Kein Papier im Drucker';
        errorCode = 'OUT_OF_PAPER';
      } else if (errorMessage.includes('out of ink') || errorMessage.includes('low ink')) {
        userFriendlyMessage = 'Tinte/Toner ist leer oder niedrig';
        errorCode = 'LOW_INK';
      } else if (errorMessage.includes('offline')) {
        userFriendlyMessage = 'Der Drucker ist offline';
        errorCode = 'PRINTER_OFFLINE';
      }
      
      return {
        success: false,
        message: userFriendlyMessage,
        error: errorCode
      };
    }
  }
  
  /**
   * Cancel a print job
   */
  public async cancelPrintJob(jobId: string): Promise<PrintResult> {
    try {
      await execAsync(`cancel ${jobId}`);
      return {
        success: true,
        message: 'Druckauftrag wurde abgebrochen'
      };
    } catch (error) {
			console.error('Failed to cancel print job:', error);
      return {
        success: false,
        message: 'Fehler beim Abbrechen des Druckauftrags',
        error: 'CANCEL_FAILED'
      };
    }
  }
  
  /**
   * Get list of available printers
   */
  public async getAvailablePrinters(): Promise<string[]> {
    try {
      const { stdout } = await execAsync('lpstat -p');
      const printers = stdout
        .split('\n')
        .filter(line => line.startsWith('printer'))
        .map(line => line.split(' ')[1])
        .filter(Boolean);
      
      return printers;
    } catch (error) {
      console.error('Failed to get available printers:', error);
      return [];
    }
  }
  
  /**
   * Test printer connectivity
   */
  public async testPrinter(): Promise<PrintResult> {
    const status = await this.getPrinterStatus();
    
    if (!status.available) {
      return {
        success: false,
        message: `Drucker ist nicht verfügbar: ${status.status}`,
        error: 'PRINTER_UNAVAILABLE'
      };
    }
    
    return {
      success: true,
      message: `Drucker ist verfügbar. Status: ${status.status}`,
    };
  }
}

// Export singleton instance
export const printerService = PrinterService.getInstance();