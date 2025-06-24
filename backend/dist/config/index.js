"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateConfig = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Validate required environment variables
const requiredEnvVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'JWT_SECRET',
    'GOOGLE_SHEETS_ID',
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
    'SESSION_SECRET'
];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars.join(', '));
    console.error('Please check your .env file');
    process.exit(1);
}
// Configuration object
exports.config = {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    googleSheetsId: process.env.GOOGLE_SHEETS_ID,
    googleServiceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    sessionSecret: process.env.SESSION_SECRET,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
};
// Validate configuration
const validateConfig = () => {
    if (exports.config.port < 1 || exports.config.port > 65535) {
        throw new Error('Invalid PORT configuration');
    }
    if (!exports.config.googleClientId || !exports.config.googleClientSecret) {
        throw new Error('Google OAuth2 credentials are required');
    }
    if (!exports.config.jwtSecret || exports.config.jwtSecret.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters long');
    }
    if (!exports.config.googleSheetsId || !exports.config.googleServiceAccountEmail || !exports.config.googlePrivateKey) {
        throw new Error('Google Sheets configuration is required');
    }
};
exports.validateConfig = validateConfig;
// Export default configuration
exports.default = exports.config;
//# sourceMappingURL=index.js.map