import { Router } from 'express';
import { searchAlbumCovers, downloadImageAsBase64 } from '../controllers/imageSearch';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Search for album cover images
router.get('/search', authenticateToken as any, searchAlbumCovers);

// Download and convert image to base64
router.post('/download', authenticateToken as any, downloadImageAsBase64);

export default router;
