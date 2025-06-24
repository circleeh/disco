"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const config_1 = __importStar(require("./config"));
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const vinyl_1 = __importDefault(require("./routes/vinyl"));
const metadata_1 = __importDefault(require("./routes/metadata"));
// Validate configuration
(0, config_1.validateConfig)();
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
// CORS configuration
app.use((0, cors_1.default)({
    origin: config_1.default.frontendUrl,
    credentials: true,
}));
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Session configuration
app.use((0, express_session_1.default)({
    secret: config_1.default.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: config_1.default.nodeEnv === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
}));
// Passport middleware
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Disco API is running',
        timestamp: new Date().toISOString(),
    });
});
// API routes
app.use('/api/auth', auth_1.default);
app.use('/api/vinyl', vinyl_1.default);
app.use('/api/metadata', metadata_1.default);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Route not found',
    });
});
// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: config_1.default.nodeEnv === 'production' ? 'An unexpected error occurred' : err.message,
    });
});
// Start server
const PORT = config_1.default.port;
app.listen(PORT, () => {
    console.log(`🚀 Disco API server running on port ${PORT}`);
    console.log(`📊 Environment: ${config_1.default.nodeEnv}`);
    console.log(`🔗 Frontend URL: ${config_1.default.frontendUrl}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});
exports.default = app;
//# sourceMappingURL=index.js.map