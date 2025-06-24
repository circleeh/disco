"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
const config_1 = __importDefault(require("../config"));
const utils_1 = require("../utils");
class GoogleSheetsService {
    constructor() {
        this.spreadsheetId = config_1.default.googleSheetsId;
        // Initialize Google Sheets API
        const auth = new googleapis_1.google.auth.GoogleAuth({
            credentials: {
                client_email: config_1.default.googleServiceAccountEmail,
                private_key: config_1.default.googlePrivateKey,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        this.sheets = googleapis_1.google.sheets({ version: 'v4', auth });
    }
    // Get all records with filtering and pagination
    async getRecords(filters) {
        try {
            const range = (0, utils_1.formatGoogleSheetsRange)();
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range,
            });
            const rows = response.data.values || [];
            let records = rows.slice(1).map((row, index) => ({
                id: (0, utils_1.generateId)(),
                ...(0, utils_1.parseGoogleSheetsRow)(row),
            }));
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
        }
        catch (error) {
            console.error('Error fetching records from Google Sheets:', error);
            throw new Error('Failed to fetch records');
        }
    }
    // Get a single record by ID (using row index)
    async getRecordById(id) {
        try {
            const range = (0, utils_1.formatGoogleSheetsRange)();
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range,
            });
            const rows = response.data.values || [];
            const recordIndex = rows.findIndex((row, index) => {
                if (index === 0)
                    return false; // Skip header
                const record = (0, utils_1.parseGoogleSheetsRow)(row);
                return record.artistName + record.albumName + record.year === id;
            });
            if (recordIndex === -1)
                return null;
            const row = rows[recordIndex];
            return {
                id,
                ...(0, utils_1.parseGoogleSheetsRow)(row),
            };
        }
        catch (error) {
            console.error('Error fetching record from Google Sheets:', error);
            throw new Error('Failed to fetch record');
        }
    }
    // Create a new record
    async createRecord(record) {
        try {
            const newRecord = {
                ...record,
                id: (0, utils_1.generateId)(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const row = (0, utils_1.formatGoogleSheetsRow)(newRecord);
            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: (0, utils_1.formatGoogleSheetsRange)(),
                valueInputOption: 'RAW',
                requestBody: {
                    values: [row],
                },
            });
            return newRecord;
        }
        catch (error) {
            console.error('Error creating record in Google Sheets:', error);
            throw new Error('Failed to create record');
        }
    }
    // Update an existing record
    async updateRecord(id, updates) {
        try {
            const range = (0, utils_1.formatGoogleSheetsRange)();
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range,
            });
            const rows = response.data.values || [];
            const recordIndex = rows.findIndex((row, index) => {
                if (index === 0)
                    return false; // Skip header
                const record = (0, utils_1.parseGoogleSheetsRow)(row);
                return record.artistName + record.albumName + record.year === id;
            });
            if (recordIndex === -1)
                return null;
            const existingRecord = (0, utils_1.parseGoogleSheetsRow)(rows[recordIndex]);
            const updatedRecord = {
                ...existingRecord,
                ...updates,
                id,
                updatedAt: new Date(),
            };
            const row = (0, utils_1.formatGoogleSheetsRow)(updatedRecord);
            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: `${(0, utils_1.formatGoogleSheetsRange)().split('!')[0]}!A${recordIndex + 1}:K${recordIndex + 1}`,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [row],
                },
            });
            return updatedRecord;
        }
        catch (error) {
            console.error('Error updating record in Google Sheets:', error);
            throw new Error('Failed to update record');
        }
    }
    // Delete a record
    async deleteRecord(id) {
        try {
            const range = (0, utils_1.formatGoogleSheetsRange)();
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range,
            });
            const rows = response.data.values || [];
            const recordIndex = rows.findIndex((row, index) => {
                if (index === 0)
                    return false; // Skip header
                const record = (0, utils_1.parseGoogleSheetsRow)(row);
                return record.artistName + record.albumName + record.year === id;
            });
            if (recordIndex === -1)
                return false;
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
        }
        catch (error) {
            console.error('Error deleting record from Google Sheets:', error);
            throw new Error('Failed to delete record');
        }
    }
    // Get collection statistics
    async getStats() {
        try {
            const range = (0, utils_1.formatGoogleSheetsRange)();
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range,
            });
            const rows = response.data.values || [];
            const records = rows.slice(1).map(row => (0, utils_1.parseGoogleSheetsRow)(row));
            const totalRecords = records.length;
            const totalValue = records.reduce((sum, record) => sum + (record.price || 0), 0);
            const averagePrice = totalRecords > 0 ? totalValue / totalRecords : 0;
            // Group by status
            const byStatus = {};
            records.forEach(record => {
                byStatus[record.status] = (byStatus[record.status] || 0) + 1;
            });
            // Group by format
            const byFormat = {};
            records.forEach(record => {
                byFormat[record.format] = (byFormat[record.format] || 0) + 1;
            });
            // Group by genre
            const byGenre = {};
            records.forEach(record => {
                byGenre[record.genre] = (byGenre[record.genre] || 0) + 1;
            });
            // Find most expensive record
            const mostExpensive = records.reduce((max, record) => (record.price || 0) > (max.price || 0) ? record : max, { price: 0, artistName: '', albumName: '', id: '' });
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
        }
        catch (error) {
            console.error('Error fetching stats from Google Sheets:', error);
            throw new Error('Failed to fetch statistics');
        }
    }
    // Get unique values for dropdowns
    async getUniqueValues(field) {
        try {
            const range = (0, utils_1.formatGoogleSheetsRange)();
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range,
            });
            const rows = response.data.values || [];
            const records = rows.slice(1).map(row => (0, utils_1.parseGoogleSheetsRow)(row));
            const uniqueValues = [...new Set(records.map(record => record[field]).filter(Boolean))];
            return uniqueValues.sort();
        }
        catch (error) {
            console.error(`Error fetching unique ${field} values from Google Sheets:`, error);
            throw new Error(`Failed to fetch unique ${field} values`);
        }
    }
    // Private helper methods
    applyFilters(records, filters) {
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
    sortRecords(records, sortBy, sortOrder) {
        return records.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];
            // Handle undefined values
            if (aValue === undefined)
                aValue = '';
            if (bValue === undefined)
                bValue = '';
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            if (aValue < bValue)
                return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue)
                return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }
    validatePagination(filters) {
        const page = Math.max(1, parseInt(filters.page?.toString() || '1', 10));
        const limit = Math.min(100, Math.max(1, parseInt(filters.limit?.toString() || '20', 10)));
        return { page, limit };
    }
}
exports.default = new GoogleSheetsService();
//# sourceMappingURL=googleSheets.js.map