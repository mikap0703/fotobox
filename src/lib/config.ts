// src/lib/config.ts
export interface AppConfig {
	// Camera settings
	camera: {
		countdown: number;
		streamURL: string;
		useStream: boolean;
		useWebcam: boolean;
		webcamName: string;
	};

	// Printing settings
	printing: {
		enabled: boolean;
		maxCopies: number;
		printerName: string;
	};

	// UI settings
	ui: {
		confetti: boolean;
		allowDownload: boolean;
	};

	// File system settings
	storage: {
		tempDirectory: string;
		overlayPath: string;
		enableOverlay: boolean;
	};

	// Security settings
	security: {
		maxFileSize: number; // in bytes
		allowedImageTypes: string[];
		adminPassword?: string;
	};
}

// Default configuration
export const defaultConfig: AppConfig = {
	camera: {
		countdown: 3,
		streamURL: "https://tekeye.uk/html/images/Joren_Falls_Izu_Jap.mp4",
		useStream: false,
		useWebcam: true,
		webcamName: "MX Brio"
	},

	printing: {
		enabled: true,
		maxCopies: 5,
		printerName: "Canon_SELPHY_CP1500"
	},

	ui: {
		confetti: true,
		allowDownload: true
	},

	storage: {
		tempDirectory: './temp',
		overlayPath: 'files/overlay-marius.png',
		enableOverlay: false
	},

	security: {
		maxFileSize: 10 * 1024 * 1024, // 10MB
		allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
		adminPassword: process.env.ADMIN_PASSWORD
	}
};

// Configuration loader with environment variable overrides
export function loadConfig(): AppConfig {
	const config = { ...defaultConfig };

	// Override with environment variables if available
	if (process.env.CAMERA_COUNTDOWN) {
		config.camera.countdown = parseInt(process.env.CAMERA_COUNTDOWN);
	}

	if (process.env.PRINTER_NAME) {
		config.printing.printerName = process.env.PRINTER_NAME;
	}

	if (process.env.MAX_COPIES) {
		config.printing.maxCopies = parseInt(process.env.MAX_COPIES);
	}

	if (process.env.TEMP_DIRECTORY) {
		config.storage.tempDirectory = process.env.TEMP_DIRECTORY;
	}

	if (process.env.ENABLE_PRINTING !== undefined) {
		config.printing.enabled = process.env.ENABLE_PRINTING === 'true';
	}

	if (process.env.ENABLE_CONFETTI !== undefined) {
		config.ui.confetti = process.env.ENABLE_CONFETTI === 'true';
	}

	return config;
}