import dotenv from 'dotenv';
import { Config } from '../types';

// Load environment variables
dotenv.config();

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
export const config: Config = {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    googleClientId: process.env.GOOGLE_CLIENT_ID!,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    googleSheetsId: process.env.GOOGLE_SHEETS_ID!,
    googleServiceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    sessionSecret: process.env.SESSION_SECRET!,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    // Cache configuration
    cacheTTL: parseInt(process.env.CACHE_TTL || '300000', 10), // 5 minutes in milliseconds
    cacheInvalidationInterval: parseInt(process.env.CACHE_INVALIDATION_INTERVAL || '1800000', 10), // 30 minutes in milliseconds
    enableCache: process.env.ENABLE_CACHE !== 'false' // Default to true
};

// Validate configuration
export const validateConfig = (): void => {
    if (config.port < 1 || config.port > 65535) {
        throw new Error('Invalid PORT configuration');
    }

    if (!config.googleClientId || !config.googleClientSecret) {
        throw new Error('Google OAuth2 credentials are required');
    }

    if (!config.jwtSecret || config.jwtSecret.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters long');
    }

    if (!config.googleSheetsId || !config.googleServiceAccountEmail || !config.googlePrivateKey) {
        throw new Error('Google Sheets configuration is required');
    }
};

// Export default configuration
export default config;
