import { Router } from 'express';
import * as authController from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/auth/google - Initiate Google OAuth2 flow
router.get('/google', authController.initiateGoogleAuth);

// GET /api/auth/google/callback - Handle OAuth2 callback
router.get('/google/callback', authController.handleGoogleCallback);

// GET /api/auth/logout - Logout user
router.get('/logout', authController.logout);

// GET /api/auth/me - Get current user (requires authentication)
router.get('/me', authenticateToken as any, authController.getCurrentUser);

export default router;
