"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatGoogleSheetsRow = exports.parseGoogleSheetsRow = exports.formatGoogleSheetsRange = exports.getAuthToken = exports.generateId = exports.parseDate = exports.formatDate = exports.sanitizeString = exports.validatePagination = exports.serverErrorResponse = exports.forbiddenResponse = exports.unauthorizedResponse = exports.notFoundResponse = exports.errorResponse = exports.successResponse = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
// JWT utilities
const generateToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        googleId: user.googleId
    };
    const options = {
        expiresIn: '7d' // Use a fixed value for now
    };
    return jsonwebtoken_1.default.sign(payload, config_1.default.jwtSecret, options);
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, config_1.default.jwtSecret);
    }
    catch (error) {
        throw new Error('Invalid token');
    }
};
exports.verifyToken = verifyToken;
// Response utilities
const successResponse = (res, data, statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        data
    });
};
exports.successResponse = successResponse;
const errorResponse = (res, error, statusCode = 400) => {
    res.status(statusCode).json({
        success: false,
        ...error
    });
};
exports.errorResponse = errorResponse;
const notFoundResponse = (res, message = 'Resource not found') => {
    (0, exports.errorResponse)(res, {
        error: 'Not Found',
        message
    }, 404);
};
exports.notFoundResponse = notFoundResponse;
const unauthorizedResponse = (res, message = 'Unauthorized') => {
    (0, exports.errorResponse)(res, {
        error: 'Unauthorized',
        message
    }, 401);
};
exports.unauthorizedResponse = unauthorizedResponse;
const forbiddenResponse = (res, message = 'Forbidden') => {
    (0, exports.errorResponse)(res, {
        error: 'Forbidden',
        message
    }, 403);
};
exports.forbiddenResponse = forbiddenResponse;
const serverErrorResponse = (res, message = 'Internal server error') => {
    (0, exports.errorResponse)(res, {
        error: 'Internal Server Error',
        message
    }, 500);
};
exports.serverErrorResponse = serverErrorResponse;
// Validation utilities
const validatePagination = (filters) => {
    const page = Math.max(1, parseInt(filters.page?.toString() || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(filters.limit?.toString() || '20', 10)));
    return { page, limit };
};
exports.validatePagination = validatePagination;
const sanitizeString = (str) => {
    return str.trim().replace(/[<>]/g, '');
};
exports.sanitizeString = sanitizeString;
// Date utilities
const formatDate = (date) => {
    return date.toISOString();
};
exports.formatDate = formatDate;
const parseDate = (dateString) => {
    return new Date(dateString);
};
exports.parseDate = parseDate;
// ID generation
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
exports.generateId = generateId;
// Request utilities
const getAuthToken = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
};
exports.getAuthToken = getAuthToken;
// Google Sheets utilities
const formatGoogleSheetsRange = (sheetName = 'Vinyl_Collection') => {
    return `${sheetName}!A:K`; // A-K covers all our columns
};
exports.formatGoogleSheetsRange = formatGoogleSheetsRange;
const parseGoogleSheetsRow = (row) => {
    return {
        artistName: row[0] || '',
        albumName: row[1] || '',
        year: parseInt(row[2] || '0', 10),
        format: row[3] || 'Vinyl',
        genre: row[4] || '',
        price: parseFloat(row[5] || '0'),
        owner: row[6] || '',
        status: row[7] || 'Owned',
        notes: row[8] || '',
        createdAt: row[9] ? new Date(row[9]) : new Date(),
        updatedAt: row[10] ? new Date(row[10]) : new Date()
    };
};
exports.parseGoogleSheetsRow = parseGoogleSheetsRow;
const formatGoogleSheetsRow = (record) => {
    return [
        record.artistName,
        record.albumName,
        record.year,
        record.format,
        record.genre,
        record.price,
        record.owner,
        record.status,
        record.notes || '',
        record.createdAt ? (0, exports.formatDate)(record.createdAt) : (0, exports.formatDate)(new Date()),
        record.updatedAt ? (0, exports.formatDate)(record.updatedAt) : (0, exports.formatDate)(new Date())
    ];
};
exports.formatGoogleSheetsRow = formatGoogleSheetsRow;
//# sourceMappingURL=index.js.map
