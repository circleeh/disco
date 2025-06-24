"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.logout = exports.handleGoogleCallback = exports.initiateGoogleAuth = void 0;
const utils_1 = require("../utils");
const auth_1 = __importDefault(require("../services/auth"));
// Initiate Google OAuth2 flow
const initiateGoogleAuth = (req, res) => {
    const passport = auth_1.default.getPassport();
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res);
};
exports.initiateGoogleAuth = initiateGoogleAuth;
// Handle Google OAuth2 callback
const handleGoogleCallback = (req, res) => {
    const passport = auth_1.default.getPassport();
    passport.authenticate('google', { session: false }, (err, user) => {
        if (err) {
            console.error('Google OAuth error:', err);
            (0, utils_1.serverErrorResponse)(res, 'Authentication failed');
            return;
        }
        if (!user) {
            (0, utils_1.serverErrorResponse)(res, 'User not found');
            return;
        }
        try {
            const authResponse = auth_1.default.generateAuthResponse(user);
            // In a real app, you might want to redirect to frontend with token
            // For now, we'll return the response directly
            (0, utils_1.successResponse)(res, authResponse);
        }
        catch (error) {
            console.error('Error generating auth response:', error);
            (0, utils_1.serverErrorResponse)(res, 'Failed to complete authentication');
        }
    })(req, res);
};
exports.handleGoogleCallback = handleGoogleCallback;
// Logout user
const logout = (req, res) => {
    try {
        // In a real app, you might want to invalidate the token
        // For now, we'll just return a success message
        (0, utils_1.successResponse)(res, { message: 'Logged out successfully' });
    }
    catch (error) {
        console.error('Error during logout:', error);
        (0, utils_1.serverErrorResponse)(res, 'Failed to logout');
    }
};
exports.logout = logout;
// Get current user information
const getCurrentUser = (req, res) => {
    try {
        // The user should be attached to req by the auth middleware
        const user = req.user;
        if (!user) {
            (0, utils_1.serverErrorResponse)(res, 'User not found');
            return;
        }
        (0, utils_1.successResponse)(res, user);
    }
    catch (error) {
        console.error('Error getting current user:', error);
        (0, utils_1.serverErrorResponse)(res, 'Failed to get user information');
    }
};
exports.getCurrentUser = getCurrentUser;
//# sourceMappingURL=auth.js.map