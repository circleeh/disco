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

class GoogleSheetsService {
    private sheets;
    private spreadsheetId: string;

    constructor() {
        this.spreadsheetId = config.googleSheetsId;

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

    // Get all records with filtering and pagination
    async getRecords(filters: VinylFilters): Promise<VinylListResponse> {
        const rangesToTry = [
            formatGoogleSheetsRange(),
            formatGoogleSheetsRangeAlternative(),
            formatGoogleSheetsRangeWithTable('Vinyl Collection'),
            'A:K', // Fallback to just column range
        ];

        for (const range of rangesToTry) {
            try {
                console.log('📊 Trying Google Sheets range:', range);

                const response = await this.sheets.spreadsheets.values.get({
                    spreadsheetId: this.spreadsheetId,
                    range,
                });

                console.log('📋 Google Sheets response:', {
                    hasValues: !!response.data.values,
                    rowCount: response.data.values?.length || 0,
                    firstRow: response.data.values?.[0]
                });

                const rows = response.data.values || [];

                // If no data, try next range
                if (rows.length === 0) {
                    console.log('📭 No data found with range:', range);
                    continue;
                }

                // Skip header row and map data
                let records = rows.slice(1).map((row, index) => ({
                    id: generateId(),
                    ...parseGoogleSheetsRow(row),
                }));

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
                console.log(`❌ Failed with range "${range}":`, (error as Error).message);
                // Continue to next range
                continue;
            }
        }

        // If all ranges failed, throw error
        console.error('❌ All Google Sheets ranges failed');
        throw new Error('Failed to fetch records from any range');
    }

    // Get a single record by ID (using row index)
    async getRecordById(id: string): Promise<VinylRecord | null> {
        try {
            const range = formatGoogleSheetsRange();
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range,
            });

            const rows = response.data.values || [];
            const recordIndex = rows.findIndex((row, index) => {
                if (index === 0) return false; // Skip header
                const record = parseGoogleSheetsRow(row);
                return record.artistName + record.albumName + record.year === id;
            });

            if (recordIndex === -1) return null;

            const row = rows[recordIndex];
            return {
                id,
                ...parseGoogleSheetsRow(row),
            };
        } catch (error) {
            console.error('Error fetching record from Google Sheets:', error);
            throw new Error('Failed to fetch record');
        }
    }

    // Create a new record
    async createRecord(record: Omit<VinylRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<VinylRecord> {
        try {
            const newRecord: VinylRecord = {
                ...record,
                id: generateId(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const row = formatGoogleSheetsRowData(newRecord);

            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: formatGoogleSheetsRange(),
                valueInputOption: 'RAW',
                requestBody: {
                    values: [row],
                },
            });

            return newRecord;
        } catch (error) {
            console.error('Error creating record in Google Sheets:', error);
            throw new Error('Failed to create record');
        }
    }

    // Update an existing record
    async updateRecord(id: string, updates: Partial<VinylRecord>): Promise<VinylRecord | null> {
        try {
            const range = formatGoogleSheetsRange();
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range,
            });

            const rows = response.data.values || [];
            const recordIndex = rows.findIndex((row, index) => {
                if (index === 0) return false; // Skip header
                const record = parseGoogleSheetsRow(row);
                return record.artistName + record.albumName + record.year === id;
            });

            if (recordIndex === -1) return null;

            const existingRecord = parseGoogleSheetsRow(rows[recordIndex]);
            const updatedRecord = {
                ...existingRecord,
                ...updates,
                id,
                updatedAt: new Date(),
            };

            const row = formatGoogleSheetsRowData(updatedRecord);

            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: `${formatGoogleSheetsRange().split('!')[0]}!A${recordIndex + 1}:K${recordIndex + 1}`,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [row],
                },
            });

            return updatedRecord as VinylRecord;
        } catch (error) {
            console.error('Error updating record in Google Sheets:', error);
            throw new Error('Failed to update record');
        }
    }

    // Delete a record
    async deleteRecord(id: string): Promise<boolean> {
        try {
            const range = formatGoogleSheetsRange();
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range,
            });

            const rows = response.data.values || [];
            const recordIndex = rows.findIndex((row, index) => {
                if (index === 0) return false; // Skip header
                const record = parseGoogleSheetsRow(row);
                return record.artistName + record.albumName + record.year === id;
            });

            if (recordIndex === -1) return false;

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

            return true;
        } catch (error) {
            console.error('Error deleting record from Google Sheets:', error);
            throw new Error('Failed to delete record');
        }
    }

    // Get collection statistics
    async getStats(): Promise<VinylStats> {
        try {
            const range = formatGoogleSheetsRange();
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range,
            });

            const rows = response.data.values || [];
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
            console.error('Error fetching stats from Google Sheets:', error);
            throw new Error('Failed to fetch statistics');
        }
    }

    // Get unique values for dropdowns
    async getUniqueValues(field: 'artistName' | 'genre' | 'owner'): Promise<string[]> {
        try {
            const range = formatGoogleSheetsRange();
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range,
            });

            const rows = response.data.values || [];
            const records = rows.slice(1).map(row => parseGoogleSheetsRow(row));

            const uniqueValues = [...new Set(records.map(record => record[field]).filter(Boolean))];
            return uniqueValues.sort();
        } catch (error) {
            console.error(`Error fetching unique ${field} values from Google Sheets:`, error);
            throw new Error(`Failed to fetch unique ${field} values`);
        }
    }

    // Private helper methods
    private applyFilters(records: VinylRecord[], filters: VinylFilters): VinylRecord[] {
        return records.filter(record => {
            if (filters.artist && !record.artistName.toLowerCase().includes(filters.artist.toLowerCase())) {
                return false;
            }
            if (filters.genre && record.genre !== filters.genre) {
                return false;
            }
            if (filters.status && record.status !== filters.status) {
                return false;
            }
            if (filters.owner && record.owner !== filters.owner) {
                return false;
            }
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                const searchableText = `${record.artistName} ${record.albumName}`.toLowerCase();
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
