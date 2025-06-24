import { Request, Response } from 'express';
import { successResponse, serverErrorResponse } from '../utils';
import authService from '../services/auth';
import config from '../config';

// Initiate Google OAuth2 flow
export const initiateGoogleAuth = (req: Request, res: Response): void => {
    const passport = authService.getPassport();
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res);
};

// Handle Google OAuth2 callback
export const handleGoogleCallback = (req: Request, res: Response): void => {
    const passport = authService.getPassport();

    passport.authenticate('google', { session: false }, (err: any, user: any) => {
        if (err) {
            console.error('Google OAuth error:', err);
            // Redirect to frontend with error
            res.redirect(`${config.frontendUrl}?error=auth_failed`);
            return;
        }

        if (!user) {
            // Redirect to frontend with error
            res.redirect(`${config.frontendUrl}?error=user_not_found`);
            return;
        }

        try {
            const authResponse = authService.generateAuthResponse(user);

            // Redirect to frontend with success and token
            const token = encodeURIComponent(authResponse.token);
            const userData = encodeURIComponent(JSON.stringify(authResponse.user));
            res.redirect(`${config.frontendUrl}?token=${token}&user=${userData}&success=true`);
        } catch (error) {
            console.error('Error generating auth response:', error);
            res.redirect(`${config.frontendUrl}?error=auth_failed`);
        }
    })(req, res);
};

// Logout user
export const logout = (req: Request, res: Response): void => {
    try {
        // In a real app, you might want to invalidate the token
        // For now, we'll just return a success message
        successResponse(res, { message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error during logout:', error);
        serverErrorResponse(res, 'Failed to logout');
    }
};

// Get current user information
export const getCurrentUser = (req: Request, res: Response): void => {
    try {
        // The user should be attached to req by the auth middleware
        const user = (req as any).user;

        if (!user) {
            serverErrorResponse(res, 'User not found');
            return;
        }

        successResponse(res, user);
    } catch (error) {
        console.error('Error getting current user:', error);
        serverErrorResponse(res, 'Failed to get user information');
    }
};
