import { Request, Response } from 'express';
import { successResponse, notFoundResponse, serverErrorResponse, validateAndSanitizeFormat } from '../utils';
import { VinylFilters, VinylRecord } from '../types';
import googleSheetsService from '../services/googleSheets';
import imageSearchService from '../services/imageSearch';

// Get all vinyl records with filtering and pagination
export const getRecords = async (req: Request, res: Response): Promise<void> => {
    try {
        const filters: VinylFilters = req.query as any;
        const result = await googleSheetsService.getRecords(filters);

        successResponse(res, result);
    } catch (error) {
        console.error('Error getting vinyl records:', error);
        serverErrorResponse(res, 'Failed to fetch vinyl records');
    }
};

// Get a single vinyl record by ID
export const getRecordById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const decodedId = decodeURIComponent(id);

        console.log('🔍 Getting record with ID:', { original: id, decoded: decodedId });

        const record = await googleSheetsService.getRecordById(decodedId);

        if (!record) {
            notFoundResponse(res, 'Vinyl record not found');
            return;
        }

        successResponse(res, record);
    } catch (error) {
        console.error('Error getting vinyl record:', error);
        serverErrorResponse(res, 'Failed to fetch vinyl record');
    }
};

// Create a new vinyl record
export const createRecord = async (req: Request, res: Response): Promise<void> => {
    try {
        const recordData = req.body;

        // Validate and sanitize format
        recordData.format = validateAndSanitizeFormat(recordData.format);

        // Optimize cover art if present
        if (recordData.coverArt) {
            console.log('🖼️ Optimizing cover art for new record');
            recordData.coverArt = await imageSearchService.optimizeBase64Image(recordData.coverArt, 200, 200);
        }

        const newRecord = await googleSheetsService.createRecord(recordData);

        successResponse(res, newRecord, 201);
    } catch (error) {
        console.error('Error creating vinyl record:', error);
        serverErrorResponse(res, 'Failed to create vinyl record');
    }
};

// Update an existing vinyl record
export const updateRecord = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('📝 Update record request received:', {
            method: req.method,
            path: req.path,
            params: req.params,
            body: req.body
        });

        const { id } = req.params;
        const decodedId = decodeURIComponent(id);
        const updates = req.body;

        // Validate and sanitize format if it's being updated
        if (updates.format !== undefined) {
            updates.format = validateAndSanitizeFormat(updates.format);
        }

        // Optimize cover art if present
        if (updates.coverArt) {
            console.log('🖼️ Optimizing cover art for updated record');
            updates.coverArt = await imageSearchService.optimizeBase64Image(updates.coverArt, 200, 200);
        }

        console.log('🔄 Updating record with ID:', { original: id, decoded: decodedId });

        const updatedRecord = await googleSheetsService.updateRecord(decodedId, updates);

        if (!updatedRecord) {
            console.log('❌ Record not found for update');
            notFoundResponse(res, 'Vinyl record not found');
            return;
        }

        console.log('✅ Record updated successfully');
        successResponse(res, updatedRecord);
    } catch (error) {
        console.error('Error updating vinyl record:', error);
        serverErrorResponse(res, 'Failed to update vinyl record');
    }
};

// Delete a vinyl record
export const deleteRecord = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const decodedId = decodeURIComponent(id);

        console.log('🗑️ Deleting record with ID:', { original: id, decoded: decodedId });

        const deleted = await googleSheetsService.deleteRecord(decodedId);

        if (!deleted) {
            notFoundResponse(res, 'Vinyl record not found');
            return;
        }

        successResponse(res, { message: 'Record deleted successfully' });
    } catch (error) {
        console.error('Error deleting vinyl record:', error);
        serverErrorResponse(res, 'Failed to delete vinyl record');
    }
};

// Get collection statistics
export const getStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const stats = await googleSheetsService.getStats();
        successResponse(res, stats);
    } catch (error) {
        console.error('Error getting collection stats:', error);
        serverErrorResponse(res, 'Failed to fetch collection statistics');
    }
};
