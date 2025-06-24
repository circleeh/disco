import { Request, Response } from 'express';
import { User, ApiError, VinylFilters } from '../types';
export declare const generateToken: (user: User) => string;
export declare const verifyToken: (token: string) => any;
export declare const successResponse: (res: Response, data: any, statusCode?: number) => void;
export declare const errorResponse: (res: Response, error: ApiError, statusCode?: number) => void;
export declare const notFoundResponse: (res: Response, message?: string) => void;
export declare const unauthorizedResponse: (res: Response, message?: string) => void;
export declare const forbiddenResponse: (res: Response, message?: string) => void;
export declare const serverErrorResponse: (res: Response, message?: string) => void;
export declare const validatePagination: (filters: VinylFilters) => {
    page: number;
    limit: number;
};
export declare const sanitizeString: (str: string) => string;
export declare const formatDate: (date: Date) => string;
export declare const parseDate: (dateString: string) => Date;
export declare const generateId: () => string;
export declare const getAuthToken: (req: Request) => string | null;
export declare const formatGoogleSheetsRange: (sheetName?: string) => string;
export declare const parseGoogleSheetsRow: (row: any[]) => any;
export declare const formatGoogleSheetsRow: (record: any) => any[];
//# sourceMappingURL=index.d.ts.map