import { Router } from 'express';
import * as metadataController from '../controllers/metadata';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication to all metadata routes
router.use(authenticateToken as any);

// GET /api/metadata/artists - Get all unique artist names
router.get('/artists', metadataController.getArtists);

// GET /api/metadata/genres - Get all unique genres
router.get('/genres', metadataController.getGenres);

// GET /api/metadata/owners - Get all unique owners
router.get('/owners', metadataController.getOwners);

export default router;
