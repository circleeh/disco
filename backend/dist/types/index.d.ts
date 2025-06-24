export interface User {
    id: string;
    email: string;
    name: string;
    picture?: string;
    googleId: string;
}
export interface VinylRecord {
    id: string;
    artistName: string;
    albumName: string;
    year: number;
    format: 'Vinyl' | 'CD' | 'Cassette' | 'Digital';
    genre: string;
    price: number;
    owner: string;
    status: 'Owned' | 'Wanted' | 'Borrowed' | 'Loaned' | 'Re-purchase Necessary';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export interface VinylListResponse {
    records: VinylRecord[];
    pagination: Pagination;
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
export interface VinylStats {
    totalRecords: number;
    totalValue: number;
    byStatus: Record<string, number>;
    byFormat: Record<string, number>;
    byGenre: Record<string, number>;
    averagePrice: number;
    mostExpensive: {
        id: string;
        artistName: string;
        albumName: string;
        price: number;
    };
}
export interface AuthResponse {
    success: boolean;
    user?: User;
    token?: string;
    message?: string;
}
export interface ApiError {
    error: string;
    message: string;
    details?: Array<{
        field: string;
        message: string;
    }>;
}
export interface GoogleSheetsConfig {
    spreadsheetId: string;
    range: string;
    serviceAccountEmail: string;
    privateKey: string;
}
export interface AuthenticatedRequest extends Request {
    user?: User;
}
export interface Config {
    port: number;
    nodeEnv: string;
    googleClientId: string;
    googleClientSecret: string;
    googleCallbackUrl: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    googleSheetsId: string;
    googleServiceAccountEmail: string;
    googlePrivateKey: string;
    sessionSecret: string;
    frontendUrl: string;
}
//# sourceMappingURL=index.d.ts.map