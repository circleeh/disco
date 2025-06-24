import { VinylRecord, VinylFilters, VinylListResponse, VinylStats } from '../types';
declare class GoogleSheetsService {
    private sheets;
    private spreadsheetId;
    constructor();
    getRecords(filters: VinylFilters): Promise<VinylListResponse>;
    getRecordById(id: string): Promise<VinylRecord | null>;
    createRecord(record: Omit<VinylRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<VinylRecord>;
    updateRecord(id: string, updates: Partial<VinylRecord>): Promise<VinylRecord | null>;
    deleteRecord(id: string): Promise<boolean>;
    getStats(): Promise<VinylStats>;
    getUniqueValues(field: 'artistName' | 'genre' | 'owner'): Promise<string[]>;
    private applyFilters;
    private sortRecords;
    private validatePagination;
}
declare const _default: GoogleSheetsService;
export default _default;
//# sourceMappingURL=googleSheets.d.ts.map