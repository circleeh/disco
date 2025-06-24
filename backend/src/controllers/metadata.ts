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
