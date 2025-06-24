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
            formatGoogleSheetsRangeWithTable('Vinyl_Collection'),
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
        // Try multiple range formats like in getRecords
        const rangeFormats = [
            "'Vinyl Collection'!A:K",  // Quoted sheet name with spaces
            "Vinyl Collection!A:K",    // Unquoted sheet name with spaces
            "'Vinyl_Collection'!A:K",  // Quoted sheet name with underscore
            "Vinyl_Collection!A:K",    // Unquoted sheet name with underscore
            "Sheet1!A:K",             // Common default sheet name
            "A:K",                    // Just column range (default sheet)
        ];

        for (const range of rangeFormats) {
            try {
                console.log(`🔄 Trying to get record by ID with range: "${range}"`);

                const response = await this.sheets.spreadsheets.values.get({
                    spreadsheetId: this.spreadsheetId,
                    range,
                });

                const rows = response.data.values || [];

                // If no data, try next range
                if (rows.length === 0) {
                    console.log('📭 No data found with range:', range);
                    continue;
                }

                const recordIndex = rows.findIndex((row, index) => {
                    if (index === 0) return false; // Skip header
                    const record = parseGoogleSheetsRow(row);
                    // Use the same ID generation logic as getRecords
                    const recordId = `${record.artistName}-${record.albumName}-${record.year}`;
                    return recordId === id;
                });

                if (recordIndex === -1) {
                    console.log('❌ Record not found with range:', range);
                    continue;
                }

                const row = rows[recordIndex];
                console.log('✅ Successfully found record with range:', range);
                return {
                    id,
                    ...parseGoogleSheetsRow(row),
                };
            } catch (error) {
                console.log(`❌ Failed to get record by ID with range "${range}":`, (error as Error).message);
                // Continue to next range
                continue;
            }
        }

        // If all ranges failed, return null
        console.log('❌ All Google Sheets ranges failed for getRecordById');
        return null;
    }

    // Create a new record
    async createRecord(record: Omit<VinylRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<VinylRecord> {
        // Try multiple range formats like in getRecords
        const rangeFormats = [
            "'Vinyl Collection'!A:K",  // Quoted sheet name with spaces
            "Vinyl Collection!A:K",    // Unquoted sheet name with spaces
            "'Vinyl_Collection'!A:K",  // Quoted sheet name with underscore
            "Vinyl_Collection!A:K",    // Unquoted sheet name with underscore
            "Sheet1!A:K",             // Common default sheet name
            "A:K",                    // Just column range (default sheet)
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
                    requestBody: {
                        values: [row],
                    },
                });

                console.log('✅ Successfully created record with range:', range);
                return newRecord;
            } catch (error) {
                console.log(`❌ Failed to create record with range "${range}": `, (error as Error).message);
                // Continue to next range
                continue;
            }
        }

        // If all ranges failed, throw error
        console.error('❌ All Google Sheets ranges failed for create');
        throw new Error('Failed to create record from any range');
    }

    // Update an existing record
    async updateRecord(id: string, updates: Partial<VinylRecord>): Promise<VinylRecord | null> {
        // Try multiple range formats like in getRecords
        const rangeFormats = [
            "'Vinyl Collection'!A:K",  // Quoted sheet name with spaces
            "Vinyl Collection!A:K",    // Unquoted sheet name with spaces
            "'Vinyl_Collection'!A:K",  // Quoted sheet name with underscore
            "Vinyl_Collection!A:K",    // Unquoted sheet name with underscore
            "Sheet1!A:K",             // Common default sheet name
            "A:K",                    // Just column range (default sheet)
        ];

        for (const range of rangeFormats) {
            try {
                console.log(`🔄 Trying to update record with range: "${range}"`);

                const response = await this.sheets.spreadsheets.values.get({
                    spreadsheetId: this.spreadsheetId,
                    range,
                });

                const rows = response.data.values || [];

                // If no data, try next range
                if (rows.length === 0) {
                    console.log('📭 No data found with range:', range);
                    continue;
                }

                const recordIndex = rows.findIndex((row, index) => {
                    if (index === 0) return false; // Skip header
                    const record = parseGoogleSheetsRow(row);
                    // Use the same ID generation logic as getRecords
                    const recordId = `${record.artistName}-${record.albumName}-${record.year}`;
                    return recordId === id;
                });

                if (recordIndex === -1) {
                    console.log('❌ Record not found with range:', range);
                    continue;
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
                        const updateRange = `${sheetName}!A${recordIndex + 1}:K${recordIndex + 1}`;
                        console.log(`📝 Trying update range: ${updateRange} (from read range: ${range})`);

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

                console.log('✅ Successfully updated record with range:', range);
                return updatedRecord as VinylRecord;
            } catch (error) {
                console.log(`❌ Failed to update record with range "${range}": `, (error as Error).message);
                // Continue to next range
                continue;
            }
        }

        // If all ranges failed, throw error
        console.error('❌ All Google Sheets ranges failed for update');
        throw new Error('Failed to update record from any range');
    }

    // Delete a record
    async deleteRecord(id: string): Promise<boolean> {
        // Try multiple range formats like in getRecords
        const rangeFormats = [
            "'Vinyl Collection'!A:K",  // Quoted sheet name with spaces
            "Vinyl Collection!A:K",    // Unquoted sheet name with spaces
            "'Vinyl_Collection'!A:K",  // Quoted sheet name with underscore
            "Vinyl_Collection!A:K",    // Unquoted sheet name with underscore
            "Sheet1!A:K",             // Common default sheet name
            "A:K",                    // Just column range (default sheet)
        ];

        for (const range of rangeFormats) {
            try {
                console.log(`🔄 Trying to delete record with range: "${range}"`);

                const response = await this.sheets.spreadsheets.values.get({
                    spreadsheetId: this.spreadsheetId,
                    range,
                });

                const rows = response.data.values || [];

                // If no data, try next range
                if (rows.length === 0) {
                    console.log('📭 No data found with range:', range);
                    continue;
                }

                const recordIndex = rows.findIndex((row, index) => {
                    if (index === 0) return false; // Skip header
                    const record = parseGoogleSheetsRow(row);
                    // Use the same ID generation logic as getRecords
                    const recordId = `${record.artistName}-${record.albumName}-${record.year}`;
                    return recordId === id;
                });

                if (recordIndex === -1) {
                    console.log('❌ Record not found with range:', range);
                    continue;
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

                console.log('✅ Successfully deleted record with range:', range);
                return true;
            } catch (error) {
                console.log(`❌ Failed to delete record with range "${range}": `, (error as Error).message);
                // Continue to next range
                continue;
            }
        }

        // If all ranges failed, throw error
        console.error('❌ All Google Sheets ranges failed for delete');
        throw new Error('Failed to delete record from any range');
    }

    // Get collection statistics
    async getStats(): Promise<VinylStats> {
        // Try multiple range formats like in getRecords
        const rangeFormats = [
            "'Vinyl Collection'!A:K",  // Quoted sheet name with spaces
            "Vinyl Collection!A:K",    // Unquoted sheet name with spaces
            "'Vinyl_Collection'!A:K",  // Quoted sheet name with underscore
            "Vinyl_Collection!A:K",    // Unquoted sheet name with underscore
            "Sheet1!A:K",             // Common default sheet name
            "A:K",                    // Just column range (default sheet)
        ];

        for (const range of rangeFormats) {
            try {
                console.log(`🔄 Trying to get stats with range: "${range}"`);

                const response = await this.sheets.spreadsheets.values.get({
                    spreadsheetId: this.spreadsheetId,
                    range,
                });

                const rows = response.data.values || [];

                // If no data, try next range
                if (rows.length === 0) {
                    console.log('📭 No data found with range:', range);
                    continue;
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

                console.log('✅ Successfully got stats with range:', range);
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
                console.log(`❌ Failed to get stats with range "${range}": `, (error as Error).message);
                // Continue to next range
                continue;
            }
        }

        // If all ranges failed, throw error
        console.error('❌ All Google Sheets ranges failed for getStats');
        throw new Error('Failed to fetch statistics from any range');
    }

    // Get unique values for dropdowns
    async getUniqueValues(field: 'artistName' | 'genre' | 'owner'): Promise<string[]> {
        // Try multiple range formats like in getRecords
        const rangeFormats = [
            "'Vinyl Collection'!A:K",  // Quoted sheet name with spaces
            "Vinyl Collection!A:K",    // Unquoted sheet name with spaces
            "'Vinyl_Collection'!A:K",  // Quoted sheet name with underscore
            "Vinyl_Collection!A:K",    // Unquoted sheet name with underscore
            "Sheet1!A:K",             // Common default sheet name
            "A:K",                    // Just column range (default sheet)
        ];

        for (const range of rangeFormats) {
            try {
                console.log(`🔄 Trying to get unique values for ${field} with range: "${range}"`);

                const response = await this.sheets.spreadsheets.values.get({
                    spreadsheetId: this.spreadsheetId,
                    range,
                });

                const rows = response.data.values || [];

                // If no data, try next range
                if (rows.length === 0) {
                    console.log('📭 No data found with range:', range);
                    continue;
                }

                const records = rows.slice(1).map(row => parseGoogleSheetsRow(row));
                const uniqueValues = [...new Set(records.map(record => record[field]).filter(Boolean))];

                console.log('✅ Successfully got unique values with range:', range);
                return uniqueValues.sort();
            } catch (error) {
                console.log(`❌ Failed to get unique values with range "${range}": `, (error as Error).message);
                // Continue to next range
                continue;
            }
        }

        // If all ranges failed, throw error
        console.error('❌ All Google Sheets ranges failed for getUniqueValues');
        throw new Error(`Failed to fetch unique ${field} values from any range`);
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
                const searchableText = `${record.artistName} ${record.albumName} `.toLowerCase();
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
