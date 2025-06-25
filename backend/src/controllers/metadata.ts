import { Request, Response } from 'express';
import { successResponse, serverErrorResponse } from '../utils';
import googleSheetsService from '../services/googleSheets';
import musicbrainzService from '../services/musicbrainz';
import imageSearchService from '../services/imageSearch';
import axios from 'axios';

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

/**
 * Helper function to check if cover art exists for a release
 */
async function checkCoverArtExists(releaseId: string): Promise<boolean> {
    try {
        const coverUrl = `https://coverartarchive.org/release/${releaseId}/front`;
        await axios.head(coverUrl, {
            timeout: 5000,
            headers: {
                'User-Agent': 'DiscoVinylApp/1.0'
            }
        });
        return true;
    } catch (error) {
        return false;
    }
}

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
                if (metadata.releaseId) {
                    try {
                        // Check if cover art exists first
                        const hasCoverArt = await checkCoverArtExists(metadata.releaseId);

                        if (hasCoverArt) {
                            // Generate the cover art URL and download it
                            const coverArtUrl = `https://coverartarchive.org/release/${metadata.releaseId}/front`;
                            const base64Data = await imageSearchService.downloadImageAsBase64(coverArtUrl);
                            const optimizedBase64 = await imageSearchService.optimizeBase64Image(base64Data);

                            return {
                                ...metadata,
                                coverArtUrl: optimizedBase64,
                                hasCoverArt: true
                            };
                        } else {
                            // No cover art available
                            return {
                                ...metadata,
                                hasCoverArt: false
                            };
                        }
                    } catch (error) {
                        console.error('Error processing cover art for release:', metadata.releaseId, error);
                        // Return metadata without cover art on error
                        return {
                            ...metadata,
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
                if (metadata.releaseId) {
                    try {
                        // Check if cover art exists first
                        const hasCoverArt = await checkCoverArtExists(metadata.releaseId);

                        if (hasCoverArt) {
                            // Generate the cover art URL and download it
                            const coverArtUrl = `https://coverartarchive.org/release/${metadata.releaseId}/front`;
                            const base64Data = await imageSearchService.downloadImageAsBase64(coverArtUrl);
                            const optimizedBase64 = await imageSearchService.optimizeBase64Image(base64Data);

                            return {
                                ...metadata,
                                coverArtUrl: optimizedBase64,
                                hasCoverArt: true
                            };
                        } else {
                            // No cover art available
                            return {
                                ...metadata,
                                hasCoverArt: false
                            };
                        }
                    } catch (error) {
                        console.error('Error processing cover art for release:', metadata.releaseId, error);
                        // Return metadata without cover art on error
                        return {
                            ...metadata,
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

// Search by album name
export const searchByAlbum = async (req: Request, res: Response): Promise<void> => {
    try {
        const { album, limit = 5 } = req.query;

        if (!album || typeof album !== 'string') {
            serverErrorResponse(res, 'Album parameter is required');
            return;
        }

        console.log('🔍 Searching by album:', album);

        const results = await musicbrainzService.searchByAlbum(album, parseInt(limit as string));

        // For each result, check if cover art exists
        const resultsWithCoverArt = await Promise.all(
            results.map(async (metadata) => {
                if (metadata.releaseId) {
                    try {
                        // Check if cover art exists first
                        const hasCoverArt = await checkCoverArtExists(metadata.releaseId);

                        if (hasCoverArt) {
                            // Generate the cover art URL and download it
                            const coverArtUrl = `https://coverartarchive.org/release/${metadata.releaseId}/front`;
                            const base64Data = await imageSearchService.downloadImageAsBase64(coverArtUrl);
                            const optimizedBase64 = await imageSearchService.optimizeBase64Image(base64Data);

                            return {
                                ...metadata,
                                coverArtUrl: optimizedBase64,
                                hasCoverArt: true
                            };
                        } else {
                            // No cover art available
                            return {
                                ...metadata,
                                hasCoverArt: false
                            };
                        }
                    } catch (error) {
                        console.error('Error processing cover art for release:', metadata.releaseId, error);
                        // Return metadata without cover art on error
                        return {
                            ...metadata,
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
        console.error('Error searching by album:', error);
        serverErrorResponse(res, 'Failed to search by album');
    }
};

// Search by artist and album separately
export const searchByArtistAndAlbum = async (req: Request, res: Response): Promise<void> => {
    try {
        const { artist, album, limit = 5 } = req.query;

        if (!artist || typeof artist !== 'string') {
            serverErrorResponse(res, 'Artist parameter is required');
            return;
        }

        if (!album || typeof album !== 'string') {
            serverErrorResponse(res, 'Album parameter is required');
            return;
        }

        console.log('🔍 Searching by artist and album:', { artist, album });

        const results = await musicbrainzService.searchByArtistAndAlbum(artist, album, parseInt(limit as string));

        // For each result, check if cover art exists
        const resultsWithCoverArt = await Promise.all(
            results.map(async (metadata) => {
                if (metadata.releaseId) {
                    try {
                        // Check if cover art exists first
                        const hasCoverArt = await checkCoverArtExists(metadata.releaseId);

                        if (hasCoverArt) {
                            // Generate the cover art URL and download it
                            const coverArtUrl = `https://coverartarchive.org/release/${metadata.releaseId}/front`;
                            const base64Data = await imageSearchService.downloadImageAsBase64(coverArtUrl);
                            const optimizedBase64 = await imageSearchService.optimizeBase64Image(base64Data);

                            return {
                                ...metadata,
                                coverArtUrl: optimizedBase64,
                                hasCoverArt: true
                            };
                        } else {
                            // No cover art available
                            return {
                                ...metadata,
                                hasCoverArt: false
                            };
                        }
                    } catch (error) {
                        console.error('Error processing cover art for release:', metadata.releaseId, error);
                        // Return metadata without cover art on error
                        return {
                            ...metadata,
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
        console.error('Error searching by artist and album:', error);
        serverErrorResponse(res, 'Failed to search by artist and album');
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
        if (metadata.releaseId) {
            try {
                // Check if cover art exists first
                hasCoverArt = await checkCoverArtExists(metadata.releaseId);

                if (hasCoverArt) {
                    // Generate the cover art URL and download it
                    const coverArtUrl = `https://coverartarchive.org/release/${metadata.releaseId}/front`;
                    const base64Data = await imageSearchService.downloadImageAsBase64(coverArtUrl);
                    optimizedCoverArt = await imageSearchService.optimizeBase64Image(base64Data);
                }
            } catch (error) {
                console.error('Error processing cover art for release:', metadata.releaseId, error);
                hasCoverArt = false;
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
