import { Router } from 'express';
import * as vinylController from '../controllers/vinyl';
import { authenticateToken } from '../middleware/auth';
import { validateVinylRecord, validateVinylFilters, validateVinylUpdate } from '../middleware/validation';

const router = Router();

// Apply authentication to all vinyl routes
router.use(authenticateToken as any);

// GET /api/vinyl - Get all records with filtering and pagination
router.get('/', validateVinylFilters, vinylController.getRecords);

// GET /api/vinyl/:id - Get a single record
router.get('/:id', vinylController.getRecordById);

// POST /api/vinyl - Create a new record
router.post('/', validateVinylRecord, vinylController.createRecord);

// PUT /api/vinyl/:id - Update an existing record
router.put('/:id', validateVinylUpdate, vinylController.updateRecord);

// DELETE /api/vinyl/:id - Delete a record
router.delete('/:id', vinylController.deleteRecord);

// GET /api/vinyl/stats - Get collection statistics
router.get('/stats', vinylController.getStats);

export default router;
