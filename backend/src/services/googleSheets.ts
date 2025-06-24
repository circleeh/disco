import { google } from 'googleapis';
import { VinylRecord, VinylFilters, VinylListResponse, VinylStats } from '../types';
import config from '../config';
import {
    formatGoogleSheetsRange,
    formatGoogleSheetsRangeAlternative,
    formatGoogleSheetsRangeWithTable,
    parseGoogleSheetsRow,
    formatGoogleSheetsRowData,
    generateId
} from '../utils';

interface CacheEntry {
    data: any[][];
    timestamp: number;
    range: string;
}

class GoogleSheetsService {
    private sheets;
    private spreadsheetId: string;
    private cache: Map<string, CacheEntry> = new Map();
    private cacheTTL: number;
    private lastCacheInvalidation: number = 0;
    private cacheInvalidationInterval: number;
    private successfulRange: string | null = null; // Cache the successful range format

    constructor() {
        this.spreadsheetId = config.googleSheetsId;

        // Initialize cache settings from config
        this.cacheTTL = config.cacheTTL;
        this.cacheInvalidationInterval = config.cacheInvalidationInterval;

        // Initialize Google Sheets API
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: config.googleServiceAccountEmail,
                private_key: config.googlePrivateKey,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        this.sheets = google.sheets({ version: 'v4', auth });
    }

    /**
     * Get cached data or fetch from Google Sheets API
     */
    private async getCachedOrFetchData(range: string): Promise<any[][]> {
        const cacheKey = `${this.spreadsheetId}:${range}`;
        const now = Date.now();

        // Check if cache is disabled
        if (!config.enableCache) {
            console.log('🌐 Cache disabled, fetching fresh data from Google Sheets for range:', range);
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range,
            });
            return response.data.values || [];
        }

        // Check if we need to invalidate cache periodically
        if (now - this.lastCacheInvalidation > this.cacheInvalidationInterval) {
            console.log('🔄 Invalidating cache due to time interval');
            this.cache.clear();
            this.successfulRange = null; // Reset successful range on invalidation
            this.lastCacheInvalidation = now;
        }

        // Check if we have valid cached data
        const cached = this.cache.get(cacheKey);
        if (cached && (now - cached.timestamp) < this.cacheTTL) {
            console.log('📋 Using cached data for range:', range);
            return cached.data;
        }

        // Fetch fresh data from Google Sheets
        console.log('🌐 Fetching fresh data from Google Sheets for range:', range);
        const response = await this.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadsheetId,
            range,
        });

        const data = response.data.values || [];

        // Cache the data
        this.cache.set(cacheKey, {
            data,
            timestamp: now,
            range
        });

        console.log('💾 Cached data for range:', range, 'Rows:', data.length);
        return data;
    }

    /**
     * Invalidate cache for all ranges
     */
    private invalidateCache(): void {
        console.log('🗑️ Invalidating all cached data');
        this.cache.clear();
        this.successfulRange = null; // Reset successful range on invalidation
        this.lastCacheInvalidation = Date.now();
    }

    /**
     * Invalidate cache for specific range
     */
    private invalidateCacheForRange(range: string): void {
        const cacheKey = `${this.spreadsheetId}:${range}`;
        this.cache.delete(cacheKey);
        console.log('🗑️ Invalidated cache for range:', range);
    }

    /**
     * Public method to invalidate all cache
     */
    public async invalidateAllCache(): Promise<void> {
        this.invalidateCache();
    }

    /**
     * Public method to get cache status
     */
    public async getCacheStatus(): Promise<{
        enabled: boolean;
        cacheSize: number;
        cacheTTL: number;
        cacheInvalidationInterval: number;
        lastInvalidation: number;
        successfulRange: string | null;
    }> {
        return {
            enabled: config.enableCache,
            cacheSize: this.cache.size,
            cacheTTL: this.cacheTTL,
            cacheInvalidationInterval: this.cacheInvalidationInterval,
            lastInvalidation: this.lastCacheInvalidation,
            successfulRange: this.successfulRange
        };
    }

    /**
     * Get data with intelligent range format caching
     */
    private async getDataWithIntelligentRange(rangesToTry: string[]): Promise<any[][]> {
        const now = Date.now();

        // Check if cache is disabled
        if (!config.enableCache) {
            // If cache is disabled, try ranges in order without caching
            for (const range of rangesToTry) {
                try {
                    console.log('🌐 Cache disabled, trying range:', range);
                    const response = await this.sheets.spreadsheets.values.get({
                        spreadsheetId: this.spreadsheetId,
                        range,
                    });
                    const data = response.data.values || [];
                    if (data.length > 0) {
                        console.log('✅ Found data with range:', range);
                        return data;
                    }
                } catch (error) {
                    console.log(`❌ Failed with range "${range}":`, (error as Error).message);
                    continue;
                }
            }
            throw new Error('Failed to fetch data from any range');
        }

        // Check if we need to invalidate cache periodically
        if (now - this.lastCacheInvalidation > this.cacheInvalidationInterval) {
            console.log('🔄 Invalidating cache due to time interval');
            this.cache.clear();
            this.successfulRange = null;
            this.lastCacheInvalidation = now;
        }

        // If we have a successful range cached, try it first
        if (this.successfulRange) {
            const cacheKey = `${this.spreadsheetId}:${this.successfulRange}`;
            const cached = this.cache.get(cacheKey);

            if (cached && (now - cached.timestamp) < this.cacheTTL) {
                console.log('📋 Using cached data for successful range:', this.successfulRange);
                return cached.data;
            }

            // Try the successful range again
            try {
                console.log('🔄 Trying cached successful range:', this.successfulRange);
                const response = await this.sheets.spreadsheets.values.get({
                    spreadsheetId: this.spreadsheetId,
                    range: this.successfulRange,
                });
                const data = response.data.values || [];
                if (data.length > 0) {
                    // Update cache
                    this.cache.set(cacheKey, {
                        data,
                        timestamp: now,
                        range: this.successfulRange
                    });
                    console.log('💾 Updated cache for successful range:', this.successfulRange);
                    return data;
                }
            } catch (error) {
                console.log(`❌ Cached successful range failed:`, (error as Error).message);
                this.successfulRange = null; // Reset if it no longer works
            }
        }

        // Try ranges in order, caching the first successful one
        for (const range of rangesToTry) {
            try {
                console.log('📊 Trying Google Sheets range:', range);
                const response = await this.sheets.spreadsheets.values.get({
                    spreadsheetId: this.spreadsheetId,
                    range,
                });
                const data = response.data.values || [];

                if (data.length > 0) {
                    // Cache the successful range
                    this.successfulRange = range;
                    const cacheKey = `${this.spreadsheetId}:${range}`;
                    this.cache.set(cacheKey, {
                        data,
                        timestamp: now,
                        range
                    });
                    console.log('✅ Found and cached successful range:', range, 'Rows:', data.length);
                    return data;
                }
            } catch (error) {
                console.log(`❌ Failed with range "${range}":`, (error as Error).message);
                continue;
            }
        }

        throw new Error('Failed to fetch data from any range');
    }

    // Get all records with filtering and pagination
    async getRecords(filters: VinylFilters): Promise<VinylListResponse> {
        const rangesToTry = [
            formatGoogleSheetsRange(),
            formatGoogleSheetsRangeAlternative(),
            formatGoogleSheetsRangeWithTable('Vinyl_Collection'),
            'A:K', // Fallback to just column range
        ];

        try {
            console.log('📊 Trying Google Sheets ranges with intelligent caching');

            const rows = await this.getDataWithIntelligentRange(rangesToTry);

            console.log('📋 Google Sheets response:', {
                hasValues: !!rows,
                rowCount: rows.length,
                firstRow: rows[0]
            });

            // If no data, throw error
            if (rows.length === 0) {
                console.log('📭 No data found with any range');
                throw new Error('No data found in Google Sheets');
            }

            // Skip header row and map data
            let records = rows.slice(1).map((row, index) => {
                const parsedRecord = parseGoogleSheetsRow(row);
                // Generate a consistent ID based on the record data
                const recordId = `${parsedRecord.artistName}-${parsedRecord.albumName}-${parsedRecord.year}`;
                return {
                    id: recordId,
                    ...parsedRecord,
                };
            });

            console.log('📝 Parsed records:', records.length);

            // Apply filters
            records = this.applyFilters(records, filters);

            // Apply sorting
            if (filters.sortBy) {
                records = this.sortRecords(records, filters.sortBy, filters.sortOrder || 'asc');
            }

            // Apply pagination
            const { page, limit } = this.validatePagination(filters);
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedRecords = records.slice(startIndex, endIndex);

            return {
                records: paginatedRecords,
                pagination: {
                    page,
                    limit,
                    total: records.length,
                    totalPages: Math.ceil(records.length / limit),
                },
            };
        } catch (error) {
            console.error('❌ Failed to fetch records:', (error as Error).message);
            throw new Error('Failed to fetch records from Google Sheets');
        }
    }

    // Get a single record by ID (using row index)
    async getRecordById(id: string): Promise<VinylRecord | null> {
        // Try multiple range formats like in getRecords
        const rangeFormats = [
            "'Vinyl Collection'!A:L",  // Quoted sheet name with spaces
            "Vinyl Collection!A:L",    // Unquoted sheet name with spaces
            "'Vinyl_Collection'!A:L",  // Quoted sheet name with underscore
            "Vinyl_Collection!A:L",    // Unquoted sheet name with underscore
            "Sheet1!A:L",             // Common default sheet name
            "A:L",                    // Just column range (default sheet)
        ];

        try {
            console.log(`🔄 Trying to get record by ID with intelligent caching`);

            const rows = await this.getDataWithIntelligentRange(rangeFormats);

            // If no data, return null
            if (rows.length === 0) {
                console.log('📭 No data found with any range');
                return null;
            }

            const recordIndex = rows.findIndex((row, index) => {
                if (index === 0) return false; // Skip header
                const record = parseGoogleSheetsRow(row);
                // Use the same ID generation logic as getRecords
                const recordId = `${record.artistName}-${record.albumName}-${record.year}`;
                return recordId === id;
            });

            if (recordIndex === -1) {
                console.log('❌ Record not found');
                return null;
            }

            const row = rows[recordIndex];
            console.log('✅ Successfully found record');
            return {
                id,
                ...parseGoogleSheetsRow(row),
            };
        } catch (error) {
            console.log(`❌ Failed to get record by ID:`, (error as Error).message);
            return null;
        }
    }

    // Create a new record
    async createRecord(record: Omit<VinylRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<VinylRecord> {
        // Try multiple range formats like in getRecords
        const rangeFormats = [
            "'Vinyl Collection'!A:L",  // Quoted sheet name with spaces
            "Vinyl Collection!A:L",    // Unquoted sheet name with spaces
            "'Vinyl_Collection'!A:L",  // Quoted sheet name with underscore
            "Vinyl_Collection!A:L",    // Unquoted sheet name with underscore
            "Sheet1!A:L",             // Common default sheet name
            "A:L",                    // Just column range (default sheet)
        ];

        for (const range of rangeFormats) {
            try {
                console.log(`🔄 Trying to create record with range: "${range}"`);

                const newRecord: VinylRecord = {
                    ...record,
                    id: `${record.artistName}-${record.albumName}-${record.year}`,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                const row = formatGoogleSheetsRowData(newRecord);

                await this.sheets.spreadsheets.values.append({
                    spreadsheetId: this.spreadsheetId,
                    range,
                    valueInputOption: 'RAW',
                    insertDataOption: 'INSERT_ROWS',
                    requestBody: {
                        values: [row],
                    },
                });

                // Invalidate cache after successful creation
                this.invalidateCache();

                console.log('✅ Successfully created record with range:', range);
                return newRecord;
            } catch (error) {
                console.log(`❌ Failed to create record with range "${range}":`, (error as Error).message);
                // Continue to next range
                continue;
            }
        }

        // If all ranges failed, throw error
        console.error('❌ All Google Sheets ranges failed for createRecord');
        throw new Error('Failed to create record in any range');
    }

    // Update an existing record
    async updateRecord(id: string, updates: Partial<VinylRecord>): Promise<VinylRecord | null> {
        // Try multiple range formats like in getRecords
        const rangeFormats = [
            "'Vinyl Collection'!A:L",  // Quoted sheet name with spaces
            "Vinyl Collection!A:L",    // Unquoted sheet name with spaces
            "'Vinyl_Collection'!A:L",  // Quoted sheet name with underscore
            "Vinyl_Collection!A:L",    // Unquoted sheet name with underscore
            "Sheet1!A:L",             // Common default sheet name
            "A:L",                    // Just column range (default sheet)
        ];

        try {
            console.log(`🔄 Trying to update record with intelligent caching`);

            const rows = await this.getDataWithIntelligentRange(rangeFormats);

            // If no data, throw error
            if (rows.length === 0) {
                console.log('📭 No data found with any range');
                throw new Error('No data found in Google Sheets');
            }

            const recordIndex = rows.findIndex((row, index) => {
                if (index === 0) return false; // Skip header
                const record = parseGoogleSheetsRow(row);
                // Use the same ID generation logic as getRecords
                const recordId = `${record.artistName}-${record.albumName}-${record.year}`;
                return recordId === id;
            });

            if (recordIndex === -1) {
                console.log('❌ Record not found');
                throw new Error('Record not found');
            }

            const existingRecord = parseGoogleSheetsRow(rows[recordIndex]);
            const updatedRecord = {
                ...existingRecord,
                ...updates,
                id,
                updatedAt: new Date(),
            };

            const row = formatGoogleSheetsRowData(updatedRecord);

            // Try multiple sheet names for the update operation
            const sheetNames = ['Sheet1', 'Vinyl Collection', 'Vinyl_Collection'];
            let updateSuccess = false;

            for (const sheetName of sheetNames) {
                try {
                    const updateRange = `${sheetName}!A${recordIndex + 1}:L${recordIndex + 1}`;
                    console.log(`📝 Trying update range: ${updateRange}`);

                    await this.sheets.spreadsheets.values.update({
                        spreadsheetId: this.spreadsheetId,
                        range: updateRange,
                        valueInputOption: 'RAW',
                        requestBody: {
                            values: [row],
                        },
                    });

                    console.log('✅ Successfully updated record with sheet:', sheetName);
                    updateSuccess = true;
                    break;
                } catch (updateError) {
                    console.log(`❌ Failed to update with sheet "${sheetName}":`, (updateError as Error).message);
                    // Continue to next sheet name
                    continue;
                }
            }

            if (!updateSuccess) {
                throw new Error('Failed to update record with any sheet name');
            }

            // Invalidate cache after successful update
            this.invalidateCache();

            console.log('✅ Successfully updated record');
            return updatedRecord as VinylRecord;
        } catch (error) {
            console.log(`❌ Failed to update record:`, (error as Error).message);
            throw new Error('Failed to update record in Google Sheets');
        }
    }

    // Delete a record
    async deleteRecord(id: string): Promise<boolean> {
        // Try multiple range formats like in getRecords
        const rangeFormats = [
            "'Vinyl Collection'!A:L",  // Quoted sheet name with spaces
            "Vinyl Collection!A:L",    // Unquoted sheet name with spaces
            "'Vinyl_Collection'!A:L",  // Quoted sheet name with underscore
            "Vinyl_Collection!A:L",    // Unquoted sheet name with underscore
            "Sheet1!A:L",             // Common default sheet name
            "A:L",                    // Just column range (default sheet)
        ];

        try {
            console.log(`🔄 Trying to delete record with intelligent caching`);

            const rows = await this.getDataWithIntelligentRange(rangeFormats);

            // If no data, throw error
            if (rows.length === 0) {
                console.log('📭 No data found with any range');
                throw new Error('No data found in Google Sheets');
            }

            const recordIndex = rows.findIndex((row, index) => {
                if (index === 0) return false; // Skip header
                const record = parseGoogleSheetsRow(row);
                // Use the same ID generation logic as getRecords
                const recordId = `${record.artistName}-${record.albumName}-${record.year}`;
                return recordId === id;
            });

            if (recordIndex === -1) {
                console.log('❌ Record not found');
                throw new Error('Record not found');
            }

            // Delete the row
            await this.sheets.spreadsheets.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                requestBody: {
                    requests: [
                        {
                            deleteDimension: {
                                range: {
                                    sheetId: 0, // Assuming first sheet
                                    dimension: 'ROWS',
                                    startIndex: recordIndex,
                                    endIndex: recordIndex + 1,
                                },
                            },
                        },
                    ],
                },
            });

            // Invalidate cache after successful deletion
            this.invalidateCache();

            console.log('✅ Successfully deleted record');
            return true;
        } catch (error) {
            console.log(`❌ Failed to delete record:`, (error as Error).message);
            throw new Error('Failed to delete record from Google Sheets');
        }
    }

    // Get collection statistics
    async getStats(): Promise<VinylStats> {
        // Try multiple range formats like in getRecords
        const rangeFormats = [
            "'Vinyl Collection'!A:L",  // Quoted sheet name with spaces
            "Vinyl Collection!A:L",    // Unquoted sheet name with spaces
            "'Vinyl_Collection'!A:L",  // Quoted sheet name with underscore
            "Vinyl_Collection!A:L",    // Unquoted sheet name with underscore
            "Sheet1!A:L",             // Common default sheet name
            "A:L",                    // Just column range (default sheet)
        ];

        try {
            console.log(`🔄 Trying to get stats with intelligent caching`);

            const rows = await this.getDataWithIntelligentRange(rangeFormats);

            // If no data, throw error
            if (rows.length === 0) {
                console.log('📭 No data found with any range');
                throw new Error('No data found in Google Sheets');
            }

            const records = rows.slice(1).map(row => parseGoogleSheetsRow(row));

            const totalRecords = records.length;
            const totalValue = records.reduce((sum, record) => sum + (record.price || 0), 0);
            const averagePrice = totalRecords > 0 ? totalValue / totalRecords : 0;

            // Group by status
            const byStatus: Record<string, number> = {};
            records.forEach(record => {
                byStatus[record.status] = (byStatus[record.status] || 0) + 1;
            });

            // Group by format
            const byFormat: Record<string, number> = {};
            records.forEach(record => {
                byFormat[record.format] = (byFormat[record.format] || 0) + 1;
            });

            // Group by genre
            const byGenre: Record<string, number> = {};
            records.forEach(record => {
                byGenre[record.genre] = (byGenre[record.genre] || 0) + 1;
            });

            // Find most expensive record
            const mostExpensive = records.reduce((max, record) =>
                (record.price || 0) > (max.price || 0) ? record : max,
                { price: 0, artistName: '', albumName: '', id: '' }
            );

            console.log('✅ Successfully got stats');
            return {
                totalRecords,
                totalValue,
                byStatus,
                byFormat,
                byGenre,
                averagePrice,
                mostExpensive: {
                    id: mostExpensive.id || '',
                    artistName: mostExpensive.artistName || '',
                    albumName: mostExpensive.albumName || '',
                    price: mostExpensive.price || 0,
                },
            };
        } catch (error) {
            console.log(`❌ Failed to get stats:`, (error as Error).message);
            throw new Error('Failed to fetch statistics from Google Sheets');
        }
    }

    // Get unique values for dropdowns
    async getUniqueValues(field: 'artistName' | 'genre' | 'owner'): Promise<string[]> {
        // Try multiple range formats like in getRecords
        const rangeFormats = [
            "'Vinyl Collection'!A:L",  // Quoted sheet name with spaces
            "Vinyl Collection!A:L",    // Unquoted sheet name with spaces
            "'Vinyl_Collection'!A:L",  // Quoted sheet name with underscore
            "Vinyl_Collection!A:L",    // Unquoted sheet name with underscore
            "Sheet1!A:L",             // Common default sheet name
            "A:L",                    // Just column range (default sheet)
        ];

        try {
            console.log(`🔄 Trying to get unique values for ${field} with intelligent caching`);

            const rows = await this.getDataWithIntelligentRange(rangeFormats);

            // If no data, throw error
            if (rows.length === 0) {
                console.log('📭 No data found with any range');
                throw new Error('No data found in Google Sheets');
            }

            const records = rows.slice(1).map(row => parseGoogleSheetsRow(row));
            const uniqueValues = [...new Set(records.map(record => record[field]).filter(Boolean))];

            console.log('✅ Successfully got unique values');
            return uniqueValues.sort();
        } catch (error) {
            console.log(`❌ Failed to get unique values:`, (error as Error).message);
            throw new Error(`Failed to fetch unique ${field} values from Google Sheets`);
        }
    }

    // Private helper methods
    private applyFilters(records: VinylRecord[], filters: VinylFilters): VinylRecord[] {
        return records.filter(record => {
            // Fuzzy (case-insensitive substring) filtering for text fields
            if (filters.artist && !record.artistName.toLowerCase().includes(filters.artist.toLowerCase())) {
                return false;
            }
            if (filters.albumName && !record.albumName.toLowerCase().includes(filters.albumName.toLowerCase())) {
                return false;
            }
            if (filters.genre && !record.genre.toLowerCase().includes(filters.genre.toLowerCase())) {
                return false;
            }
            if (filters.owner && !record.owner.toLowerCase().includes(filters.owner.toLowerCase())) {
                return false;
            }
            if (filters.notes && record.notes && !record.notes.toLowerCase().includes(filters.notes.toLowerCase())) {
                return false;
            }
            if (filters.status && record.status !== filters.status) {
                return false;
            }
            if (filters.year && record.year !== Number(filters.year)) {
                return false;
            }
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                const searchableText = `
                    ${record.artistName}
                    ${record.albumName}
                    ${record.genre}
                    ${record.owner}
                    ${record.notes || ''}
                `.toLowerCase();
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }
            return true;
        });
    }

    private sortRecords(records: VinylRecord[], sortBy: string, sortOrder: 'asc' | 'desc'): VinylRecord[] {
        return records.sort((a, b) => {
            let aValue = a[sortBy as keyof VinylRecord];
            let bValue = b[sortBy as keyof VinylRecord];

            // Handle undefined values
            if (aValue === undefined) aValue = '';
            if (bValue === undefined) bValue = '';

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = (bValue as string).toLowerCase();
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }

    private validatePagination(filters: VinylFilters): { page: number; limit: number } {
        const page = Math.max(1, parseInt(filters.page?.toString() || '1', 10));
        const limit = Math.min(100, Math.max(1, parseInt(filters.limit?.toString() || '20', 10)));
        return { page, limit };
    }
}

export default new GoogleSheetsService();
