import axios from 'axios';

export interface AlbumMetadata {
    artistName: string;
    albumName: string;
    year: number;
    coverArtUrl?: string;
    label?: string;
    format?: string;
    hasCoverArt: boolean;
}

export interface MetadataSearchResponse {
    results: AlbumMetadata[];
    total: number;
}

// Search for album metadata using the general search endpoint
export const searchAlbumMetadata = async (query: string, limit: number = 10): Promise<MetadataSearchResponse> => {
    const response = await axios.get(`/api/metadata/search?query=${encodeURIComponent(query)}&limit=${limit}`, {
        withCredentials: true
    });
    return response.data.data;
};

// Search by artist name only
export const searchByArtist = async (artist: string, limit: number = 10): Promise<MetadataSearchResponse> => {
    const response = await axios.get(`/api/metadata/artist/${encodeURIComponent(artist)}?limit=${limit}`, {
        withCredentials: true
    });
    return response.data.data;
};

// Search by album name only
export const searchByAlbum = async (album: string, limit: number = 10): Promise<MetadataSearchResponse> => {
    const response = await axios.get(`/api/metadata/album?album=${encodeURIComponent(album)}&limit=${limit}`, {
        withCredentials: true
    });
    return response.data.data;
};

// Search by artist and album separately
export const searchByArtistAndAlbum = async (artist: string, album: string, limit: number = 10): Promise<MetadataSearchResponse> => {
    const response = await axios.get(`/api/metadata/artist-album?artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&limit=${limit}`, {
        withCredentials: true
    });
    return response.data.data;
};
