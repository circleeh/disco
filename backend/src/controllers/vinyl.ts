import { Request, Response } from 'express';
import { successResponse, notFoundResponse, serverErrorResponse } from '../utils';
import { VinylFilters, VinylRecord } from '../types';
import googleSheetsService from '../services/googleSheets';

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
        const record = await googleSheetsService.getRecordById(id);

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
        const { id } = req.params;
        const updates = req.body;

        const updatedRecord = await googleSheetsService.updateRecord(id, updates);

        if (!updatedRecord) {
            notFoundResponse(res, 'Vinyl record not found');
            return;
        }

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
        const deleted = await googleSheetsService.deleteRecord(id);

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
