import axios from 'axios';
import { VinylRecord } from '../types/vinyl';

export interface VinylListResponse {
    records: VinylRecord[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface VinylFilters {
    page?: number;
    limit?: number;
    artist?: string;
    genre?: string;
    status?: string;
    owner?: string;
    search?: string;
    sortBy?: 'artistName' | 'albumName' | 'year' | 'price';
    sortOrder?: 'asc' | 'desc';
}

export async function fetchVinylRecords(filters: VinylFilters = {}): Promise<VinylListResponse> {
    // Clean up empty filter parameters to avoid sending empty strings
    const cleanParams: any = { ...filters };

    // Remove empty string values
    Object.keys(cleanParams).forEach(key => {
        if (cleanParams[key] === '' || cleanParams[key] === null || cleanParams[key] === undefined) {
            delete cleanParams[key];
        }
    });

    const res = await axios.get('/api/vinyl', {
        params: cleanParams,
        withCredentials: true,
    });
    return res.data.data || res.data;
}

export async function createVinylRecord(data: Omit<VinylRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const res = await axios.post('/api/vinyl', data, { withCredentials: true });
    return res.data.data || res.data;
}

export async function updateVinylRecord(id: string, data: Partial<VinylRecord>) {
    const res = await axios.put(`/api/vinyl/${id}`, data, { withCredentials: true });
    return res.data.data || res.data;
}

// Metadata functions for filter dropdowns
export async function fetchGenres(): Promise<string[]> {
    const res = await axios.get('/api/metadata/genres', { withCredentials: true });
    return res.data.data || res.data;
}

export async function fetchArtists(): Promise<string[]> {
    const res = await axios.get('/api/metadata/artists', { withCredentials: true });
    return res.data.data || res.data;
}

export async function fetchOwners(): Promise<string[]> {
    const res = await axios.get('/api/metadata/owners', { withCredentials: true });
    return res.data.data || res.data;
}
