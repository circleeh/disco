import { Router } from 'express';
import { getGenres, getArtists, getOwners, getStatuses, searchAlbumMetadata, searchByArtist, getReleaseMetadata, invalidateCache, getCacheStatus } from '../controllers/metadata';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication to all metadata routes
router.use(authenticateToken as any);

// GET /api/metadata/genres - Get all unique genres
router.get('/genres', getGenres);

// GET /api/metadata/artists - Get all unique artists
router.get('/artists', getArtists);

// GET /api/metadata/owners - Get all unique owners
router.get('/owners', getOwners);

// GET /api/metadata/statuses - Get all status options
router.get('/statuses', getStatuses);

// GET /api/metadata/search - Search for album metadata
router.get('/search', searchAlbumMetadata);

// GET /api/metadata/artist/:artist - Search by artist name
router.get('/artist/:artist', searchByArtist);

// GET /api/metadata/release/:releaseId - Get metadata for specific release
router.get('/release/:releaseId', getReleaseMetadata);

// Cache management routes
router.post('/cache/invalidate', invalidateCache);
router.get('/cache/status', getCacheStatus);

export default router;
