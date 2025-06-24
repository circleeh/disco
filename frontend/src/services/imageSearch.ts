import axios from 'axios';

export interface ImageSearchResult {
    url: string;
    title: string;
    width: number;
    height: number;
}

export interface ImageSearchResponse {
    results: ImageSearchResult[];
}

export interface DownloadImageResponse {
    base64Data: string;
    size: number;
}

export async function searchAlbumCovers(query: string, limit: number = 10): Promise<ImageSearchResult[]> {
    const res = await axios.get('/api/image-search/search', {
        params: { query, limit },
        withCredentials: true,
    });
    return res.data.data?.results || res.data.results || [];
}

export async function downloadImageAsBase64(imageUrl: string): Promise<string> {
    const res = await axios.post('/api/image-search/download',
        { imageUrl },
        { withCredentials: true }
    );
    return res.data.data?.base64Data || res.data.base64Data || '';
}
