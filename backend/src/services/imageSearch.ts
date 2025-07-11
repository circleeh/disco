import axios from 'axios';
import sharp from 'sharp';

interface ImageSearchResult {
    url: string;
    title: string;
    width: number;
    height: number;
}

interface ImageSearchResponse {
    results: ImageSearchResult[];
    total: number;
}

class ImageSearchService {
    private readonly musicbrainzBaseUrl: string;

    constructor() {
        this.musicbrainzBaseUrl = 'https://musicbrainz.org/ws/2';
    }

    /**
     * Search for album cover images using MusicBrainz
     */
    async searchAlbumCovers(query: string, limit: number = 10): Promise<ImageSearchResult[]> {
        try {
            console.log('🔍 Searching MusicBrainz for album covers:', query);
            const results = await this.searchMusicBrainz(query, limit);

            // Only return real results, no placeholders
            return results.slice(0, limit);
        } catch (error) {
            console.error('Error searching for album covers:', error);
            // Return empty array instead of fallback placeholders
            return [];
        }
    }

    /**
     * Search MusicBrainz for album covers (fuzzy)
     */
    private async searchMusicBrainz(query: string, limit: number): Promise<ImageSearchResult[]> {
        let results: ImageSearchResult[] = [];
        let artist = '';
        let album = '';

        // Try to split query into artist and album (very basic)
        const parts = query.split(' ');
        if (parts.length > 1) {
            artist = parts[0];
            album = parts.slice(1).join(' ');
        } else {
            artist = query;
        }

        // 1. Try full query
        try {
            console.log('🔍 MusicBrainz: full query:', query);
            results = await this._searchMusicBrainzRaw(query, limit);
        } catch (e) {
            console.error('❌ MusicBrainz full query error:', e);
        }

        // 2. If no results, try artist only
        if (results.length === 0 && artist) {
            try {
                console.log('🔍 MusicBrainz: artist only:', artist);
                results = await this._searchMusicBrainzRaw(artist, limit);
            } catch (e) {
                console.error('❌ MusicBrainz artist only error:', e);
            }
        }

        // 3. Return first N results with cover art
        return results.slice(0, limit);
    }

    private async _searchMusicBrainzRaw(query: string, limit: number): Promise<ImageSearchResult[]> {
        const response = await axios.get(`${this.musicbrainzBaseUrl}/release`, {
            params: {
                query: query,
                fmt: 'json',
                limit: limit * 2 // get more to filter for cover art
            },
            headers: {
                'User-Agent': 'DiscoVinylApp/1.0'
            },
            timeout: 10000
        });

        const data = response.data as any;
        const results: ImageSearchResult[] = [];

        for (const release of data.releases || []) {
            // Check if release has cover art by trying to access the cover art archive
            try {
                const coverUrl = `https://coverartarchive.org/release/${release.id}/front`;
                // Test if the cover art exists by making a HEAD request
                await axios.head(coverUrl, {
                    timeout: 5000,
                    headers: {
                        'User-Agent': 'DiscoVinylApp/1.0'
                    }
                });

                // If we get here, the cover art exists
                results.push({
                    url: coverUrl,
                    title: `${release.title} by ${release['artist-credit']?.[0]?.name || 'Unknown Artist'}`,
                    width: 300,
                    height: 300
                });
            } catch (error) {
                // Cover art doesn't exist for this release, skip it
                console.log(`No cover art for release: ${release.title}`);
            }

            if (results.length >= limit) break;
        }

        return results;
    }

    /**
     * Download image and convert to base64
     */
    async downloadImageAsBase64(imageUrl: string): Promise<string> {
        try {
            const response = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                timeout: 10000,
                headers: {
                    'User-Agent': 'DiscoVinylApp/1.0'
                }
            });

            const buffer = Buffer.from(response.data as ArrayBuffer);
            const contentType = response.headers['content-type'] || 'image/jpeg';

            return `data:${contentType};base64,${buffer.toString('base64')}`;
        } catch (error) {
            console.error('Error downloading image:', error);
            // Return a simple colored square as fallback
            return this.generateSimpleFallbackImage();
        }
    }

    /**
     * Generate a simple fallback image when download fails
     */
    private generateSimpleFallbackImage(): string {
        const svg = `
            <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                <rect width="200" height="200" fill="#cccccc"/>
                <text x="100" y="100" font-family="Arial, sans-serif" font-size="12"
                      fill="white" text-anchor="middle" dominant-baseline="middle">
                    No Image
                </text>
            </svg>
        `.trim();

        return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    }

    /**
     * Optimize base64 image by resizing to thumbnail and compressing
     */
    async optimizeBase64Image(base64Data: string, maxWidth: number = 200, maxHeight: number = 200): Promise<string> {
        try {
            // Extract the base64 data without the data URL prefix
            const base64Match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
            if (!base64Match) {
                console.log('Invalid base64 data format, returning original');
                return base64Data;
            }

            const mimeType = base64Match[1];
            const base64String = base64Match[2];

            // Convert base64 to buffer
            const buffer = Buffer.from(base64String, 'base64');

            // Resize and compress the image using Sharp
            const optimizedBuffer = await sharp(buffer)
                .resize(maxWidth, maxHeight, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({
                    quality: 80,
                    progressive: true
                })
                .toBuffer();

            // Convert back to base64
            const optimizedBase64 = optimizedBuffer.toString('base64');
            const optimizedDataUrl = `data:image/jpeg;base64,${optimizedBase64}`;

            console.log(`Image optimized: ${base64Data.length} -> ${optimizedDataUrl.length} characters`);

            return optimizedDataUrl;
        } catch (error) {
            console.error('Error optimizing image:', error);
            // Return original if optimization fails
            return base64Data;
        }
    }
}

export default new ImageSearchService();
