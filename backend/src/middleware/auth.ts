import { Request, Response, NextFunction } from 'express';
import { verifyToken, getAuthToken, unauthorizedResponse } from '../utils';
import { User } from '../types';

// Extend Request interface for authenticated requests
interface AuthenticatedRequest extends Request {
    user?: User;
}

// Middleware to authenticate JWT tokens
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const token = getAuthToken(req);

    if (!token) {
        unauthorizedResponse(res, 'Access token required');
        return;
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded as User;
        next();
    } catch (error) {
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
