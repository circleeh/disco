import { Request, Response } from 'express';
import { successResponse, serverErrorResponse, errorResponse } from '../utils';
import imageSearchService from '../services/imageSearch';

// Extend Request interface for authenticated requests
interface AuthenticatedRequest extends Request {
    user?: any;
}

// Search for album cover images
export const searchAlbumCovers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { query, limit = 10 } = req.query;

        if (!query || typeof query !== 'string') {
            errorResponse(res, {
                error: 'Bad Request',
                message: 'Query parameter is required'
            });
            return;
        }

        const results = await imageSearchService.searchAlbumCovers(query, parseInt(limit.toString(), 10));
        successResponse(res, { results });
    } catch (error) {
        console.error('Error searching for album covers:', error);
        serverErrorResponse(res, 'Failed to search for album covers');
    }
};

// Download and convert image to base64
export const downloadImageAsBase64 = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { imageUrl } = req.body;

        if (!imageUrl || typeof imageUrl !== 'string') {
            errorResponse(res, {
                error: 'Bad Request',
                message: 'imageUrl is required'
            });
            return;
        }

        const base64Data = await imageSearchService.downloadImageAsBase64(imageUrl);
        const optimizedData = await imageSearchService.optimizeBase64Image(base64Data);

        successResponse(res, {
            base64Data: optimizedData,
            size: optimizedData.length
        });
    } catch (error) {
        console.error('Error downloading image:', error);
        serverErrorResponse(res, 'Failed to download image');
    }
};
