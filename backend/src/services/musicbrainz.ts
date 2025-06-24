import axios from 'axios';

interface MusicBrainzRelease {
    id: string;
    title: string;
    date: string;
    'artist-credit': Array<{
        name: string;
        artist: {
            name: string;
        };
    }>;
    'release-group': {
        title: string;
        'primary-type': string;
    };
    'label-info'?: Array<{
        label: {
            name: string;
        };
    }>;
}

interface AlbumMetadata {
    artistName: string;
    albumName: string;
    year: number;
    coverArtUrl?: string;
    genre?: string;
    label?: string;
    format?: string;
}

class MusicBrainzService {
    private readonly baseUrl: string;

    constructor() {
        this.baseUrl = 'https://musicbrainz.org/ws/2';
    }

    /**
     * Search for album metadata by artist and album name
     */
    async searchAlbumMetadata(query: string, limit: number = 5): Promise<AlbumMetadata[]> {
        try {
            console.log('🔍 Searching MusicBrainz for album metadata:', query);

            const response = await axios.get(`${this.baseUrl}/release`, {
                params: {
                    query: query,
                    fmt: 'json',
                    limit: limit
                },
                headers: {
                    'User-Agent': 'DiscoVinylApp/1.0'
                },
                timeout: 10000
            });

            const data = response.data as any;
            const results: AlbumMetadata[] = [];

            for (const release of data.releases || []) {
                const metadata = this.parseReleaseMetadata(release);
                if (metadata) {
                    results.push(metadata);
                }
            }

            return results;
        } catch (error) {
            console.error('Error searching MusicBrainz for metadata:', error);
            return [];
        }
    }

    /**
     * Search by artist name only
     */
    async searchByArtist(artistName: string, limit: number = 5): Promise<AlbumMetadata[]> {
        try {
            console.log('🔍 Searching MusicBrainz by artist:', artistName);

            const response = await axios.get(`${this.baseUrl}/release`, {
                params: {
                    query: `artist:${artistName}`,
                    fmt: 'json',
                    limit: limit
                },
                headers: {
                    'User-Agent': 'DiscoVinylApp/1.0'
                },
                timeout: 10000
            });

            const data = response.data as any;
            const results: AlbumMetadata[] = [];

            for (const release of data.releases || []) {
                const metadata = this.parseReleaseMetadata(release);
                if (metadata) {
                    results.push(metadata);
                }
            }

            return results;
        } catch (error) {
            console.error('Error searching MusicBrainz by artist:', error);
            return [];
        }
    }

    /**
     * Parse release data into our metadata format
     */
    private parseReleaseMetadata(release: MusicBrainzRelease): AlbumMetadata | null {
        try {
            // Extract artist name
            const artistName = release['artist-credit']?.[0]?.name ||
                release['artist-credit']?.[0]?.artist?.name ||
                'Unknown Artist';

            // Extract album name
            const albumName = release.title || release['release-group']?.title || 'Unknown Album';

            // Extract year from date
            let year = new Date().getFullYear();
            if (release.date) {
                const dateMatch = release.date.match(/^(\d{4})/);
                if (dateMatch) {
                    year = parseInt(dateMatch[1]);
                }
            }

            // Check if cover art exists
            let coverArtUrl: string | undefined;
            try {
                const coverUrl = `https://coverartarchive.org/release/${release.id}/front`;
                // We'll test this in the controller when needed
                coverArtUrl = coverUrl;
            } catch (error) {
                // No cover art available
            }

            // Extract label
            const label = release['label-info']?.[0]?.label?.name;

            // Determine format based on release group type
            let format = 'LP';
            if (release['release-group']?.['primary-type']) {
                const type = release['release-group']['primary-type'].toLowerCase();
                if (type === 'single') {
                    format = '7" Single';
                } else if (type === 'ep') {
                    format = 'EP';
                }
            }

            return {
                artistName,
                albumName,
                year,
                coverArtUrl,
                label,
                format
            };
        } catch (error) {
            console.error('Error parsing release metadata:', error);
            return null;
        }
    }

    /**
     * Get detailed metadata for a specific release
     */
    async getReleaseDetails(releaseId: string): Promise<AlbumMetadata | null> {
        try {
            const response = await axios.get(`${this.baseUrl}/release/${releaseId}`, {
                params: {
                    fmt: 'json',
                    inc: 'labels+genres'
                },
                headers: {
                    'User-Agent': 'DiscoVinylApp/1.0'
                },
                timeout: 10000
            });

            const release = response.data as MusicBrainzRelease;
            return this.parseReleaseMetadata(release);
        } catch (error) {
            console.error('Error getting release details:', error);
            return null;
        }
    }
}

export default new MusicBrainzService();
