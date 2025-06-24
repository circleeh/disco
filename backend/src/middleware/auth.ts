import { Request, Response, NextFunction } from 'express';
import { verifyToken, getAuthToken, unauthorizedResponse } from '../utils';
import { User } from '../types';
import config from '../config';

// Extend Request interface for authenticated requests
interface AuthenticatedRequest extends Request {
    user?: User;
}

// Middleware to authenticate JWT tokens
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    console.log('🔐 Authenticating request:', req.method, req.path);

    const token = getAuthToken(req);

    if (!token) {
        console.log('❌ No token provided');
        unauthorizedResponse(res, 'Access token required');
        return;
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded as User;
        console.log('✅ Authentication successful for user:', decoded.email);
        next();
    } catch (error) {
        console.log('❌ Authentication failed:', error);
        unauthorizedResponse(res, 'Invalid or expired token');
    }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const token = getAuthToken(req);

    if (token) {
        try {
            const decoded = verifyToken(token);
            req.user = decoded as User;
        } catch (error) {
            // Token is invalid, but we don't fail the request
            console.warn('Invalid token in optional auth:', error);
        }
    }

    next();
};

// Conditional authentication middleware - requires auth for write operations, optional for read operations
export const conditionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const isWriteOperation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);

    if (isWriteOperation) {
        // Always require authentication for write operations
        console.log('🔐 Write operation detected, requiring authentication');
        authenticateToken(req, res, next);
    } else {
        // For read operations, check the feature flag
        if (config.allowPublicRead) {
            console.log('📖 Read operation with public access enabled, using optional auth');
            optionalAuth(req, res, next);
        } else {
            console.log('🔐 Read operation with public access disabled, requiring authentication');
            authenticateToken(req, res, next);
        }
    }
};
