import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import passport from 'passport';

import config, { validateConfig } from './config';
import authService from './services/auth';

// Import routes
import authRoutes from './routes/auth';
import vinylRoutes from './routes/vinyl';
import metadataRoutes from './routes/metadata';

// Validate configuration
validateConfig();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: config.frontendUrl,
    credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: config.nodeEnv === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Disco API is running',
        timestamp: new Date().toISOString(),
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/vinyl', vinylRoutes);
app.use('/api/metadata', metadataRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Route not found',
    });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);

    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: config.nodeEnv === 'production' ? 'An unexpected error occurred' : err.message,
    });
});

// Start server
const PORT = config.port;

app.listen(PORT, () => {
    console.log(`🚀 Disco API server running on port ${PORT}`);
    console.log(`📊 Environment: ${config.nodeEnv}`);
    console.log(`🔗 Frontend URL: ${config.frontendUrl}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
