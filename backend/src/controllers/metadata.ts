import { Request, Response } from 'express';
import { successResponse, serverErrorResponse } from '../utils';
import googleSheetsService from '../services/googleSheets';
import musicbrainzService from '../services/musicbrainz';
import imageSearchService from '../services/imageSearch';

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

// Get all status options
export const getStatuses = async (req: Request, res: Response): Promise<void> => {
    try {
        const statuses = ['Owned', 'Wanted', 'Borrowed', 'Loaned', 'Re-purchase Necessary'];
        successResponse(res, statuses);
    } catch (error) {
        console.error('Error getting statuses:', error);
        serverErrorResponse(res, 'Failed to fetch statuses');
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

// Search for album metadata
export const searchAlbumMetadata = async (req: Request, res: Response): Promise<void> => {
    try {
        const { query, limit = 5 } = req.query;

        if (!query || typeof query !== 'string') {
            serverErrorResponse(res, 'Query parameter is required');
            return;
        }

        console.log('🔍 Searching for album metadata:', query);

        const results = await musicbrainzService.searchAlbumMetadata(query, parseInt(limit as string));

        // For each result, check if cover art exists and download it
        const resultsWithCoverArt = await Promise.all(
            results.map(async (metadata) => {
                if (metadata.coverArtUrl) {
                    try {
                        // Download and optimize the cover art
                        const base64Data = await imageSearchService.downloadImageAsBase64(metadata.coverArtUrl);
                        const optimizedBase64 = await imageSearchService.optimizeBase64Image(base64Data);

                        return {
                            ...metadata,
                            coverArtUrl: optimizedBase64,
                            hasCoverArt: true
                        };
                    } catch (error) {
                        // Cover art doesn't exist, remove the URL
                        const { coverArtUrl, ...metadataWithoutCover } = metadata;
                        return {
                            ...metadataWithoutCover,
                            hasCoverArt: false
                        };
                    }
                }
                return {
                    ...metadata,
                    hasCoverArt: false
                };
            })
        );

        successResponse(res, {
            results: resultsWithCoverArt,
            total: resultsWithCoverArt.length
        });
    } catch (error) {
        console.error('Error searching album metadata:', error);
        serverErrorResponse(res, 'Failed to search album metadata');
    }
};

// Search by artist name
export const searchByArtist = async (req: Request, res: Response): Promise<void> => {
    try {
        const { artist, limit = 5 } = req.query;

        if (!artist || typeof artist !== 'string') {
            serverErrorResponse(res, 'Artist parameter is required');
            return;
        }

        console.log('🔍 Searching by artist:', artist);

        const results = await musicbrainzService.searchByArtist(artist, parseInt(limit as string));

        // For each result, check if cover art exists
        const resultsWithCoverArt = await Promise.all(
            results.map(async (metadata) => {
                if (metadata.coverArtUrl) {
                    try {
                        // Download and optimize the cover art
                        const base64Data = await imageSearchService.downloadImageAsBase64(metadata.coverArtUrl);
                        const optimizedBase64 = await imageSearchService.optimizeBase64Image(base64Data);

                        return {
                            ...metadata,
                            coverArtUrl: optimizedBase64,
                            hasCoverArt: true
                        };
                    } catch (error) {
                        const { coverArtUrl, ...metadataWithoutCover } = metadata;
                        return {
                            ...metadataWithoutCover,
                            hasCoverArt: false
                        };
                    }
                }
                return {
                    ...metadata,
                    hasCoverArt: false
                };
            })
        );

        successResponse(res, {
            results: resultsWithCoverArt,
            total: resultsWithCoverArt.length
        });
    } catch (error) {
        console.error('Error searching by artist:', error);
        serverErrorResponse(res, 'Failed to search by artist');
    }
};

// Get metadata for a specific release
export const getReleaseMetadata = async (req: Request, res: Response): Promise<void> => {
    try {
        const { releaseId } = req.params;

        if (!releaseId) {
            serverErrorResponse(res, 'Release ID is required');
            return;
        }

        console.log('🔍 Getting release metadata for:', releaseId);

        const metadata = await musicbrainzService.getReleaseDetails(releaseId);

        if (!metadata) {
            serverErrorResponse(res, 'Release not found');
            return;
        }

        // Check if cover art exists
        let hasCoverArt = false;
        let optimizedCoverArt = null;
        if (metadata.coverArtUrl) {
            try {
                // Download and optimize the cover art
                const base64Data = await imageSearchService.downloadImageAsBase64(metadata.coverArtUrl);
                optimizedCoverArt = await imageSearchService.optimizeBase64Image(base64Data);
                hasCoverArt = true;
            } catch (error) {
                const { coverArtUrl, ...metadataWithoutCover } = metadata;
                successResponse(res, {
                    ...metadataWithoutCover,
                    hasCoverArt: false
                });
                return;
            }
        }

        successResponse(res, {
            ...metadata,
            coverArtUrl: optimizedCoverArt,
            hasCoverArt
        });
    } catch (error) {
        console.error('Error getting release metadata:', error);
        serverErrorResponse(res, 'Failed to get release metadata');
    }
};
