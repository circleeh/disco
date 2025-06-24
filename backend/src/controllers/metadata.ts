import { Request, Response } from 'express';
import { successResponse, serverErrorResponse } from '../utils';
import googleSheetsService from '../services/googleSheets';

// Get all unique artist names
export const getArtists = async (req: Request, res: Response): Promise<void> => {
    try {
        const artists = await googleSheetsService.getUniqueValues('artistName');
        successResponse(res, artists);
    } catch (error) {
        console.error('Error getting artists:', error);
        serverErrorResponse(res, 'Failed to fetch artists');
    }
};

// Get all unique genres
export const getGenres = async (req: Request, res: Response): Promise<void> => {
    try {
        const genres = await googleSheetsService.getUniqueValues('genre');
        successResponse(res, genres);
    } catch (error) {
        console.error('Error getting genres:', error);
        serverErrorResponse(res, 'Failed to fetch genres');
    }
};

// Get all unique owners
export const getOwners = async (req: Request, res: Response): Promise<void> => {
    try {
        const owners = await googleSheetsService.getUniqueValues('owner');
        successResponse(res, owners);
    } catch (error) {
        console.error('Error getting owners:', error);
        serverErrorResponse(res, 'Failed to fetch owners');
    }
};

// Cache management endpoints
export const invalidateCache = async (req: Request, res: Response): Promise<void> => {
    try {
        await googleSheetsService.invalidateAllCache();
        successResponse(res, { message: 'Cache invalidated successfully' });
    } catch (error) {
        console.error('Error invalidating cache:', error);
        serverErrorResponse(res, 'Failed to invalidate cache');
    }
};

export const getCacheStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const cacheStatus = await googleSheetsService.getCacheStatus();
        successResponse(res, cacheStatus);
    } catch (error) {
        console.error('Error getting cache status:', error);
        serverErrorResponse(res, 'Failed to get cache status');
    }
};
