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
    const params = { ...filters };
    const res = await axios.get('/api/vinyl', {
        params,
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
