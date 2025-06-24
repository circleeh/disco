"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticateToken = void 0;
const utils_1 = require("../utils");
// Middleware to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
    const token = (0, utils_1.getAuthToken)(req);
    if (!token) {
        (0, utils_1.unauthorizedResponse)(res, 'Access token required');
        return;
    }
    try {
        const decoded = (0, utils_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        (0, utils_1.unauthorizedResponse)(res, 'Invalid or expired token');
    }
};
exports.authenticateToken = authenticateToken;
// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
    const token = (0, utils_1.getAuthToken)(req);
    if (token) {
        try {
            const decoded = (0, utils_1.verifyToken)(token);
            req.user = decoded;
        }
        catch (error) {
            // Token is invalid, but we don't fail the request
            console.warn('Invalid token in optional auth:', error);
        }
    }
    next();
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map