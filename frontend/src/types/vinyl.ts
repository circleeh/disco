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
    createdAt: string;
    updatedAt: string;
}

// Type for records that might have null values from Google Sheets
export interface VinylRecordWithNulls {
    id: string;
    artistName: string | null;
    albumName: string | null;
    year: number | null;
    format: 'Vinyl' | 'CD' | 'Cassette' | 'Digital' | null;
    genre: string | null;
    price: number | null;
    owner: string | null;
    status: 'Owned' | 'Wanted' | 'Borrowed' | 'Loaned' | 'Re-purchase Necessary' | null;
    notes?: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}
