import jwt, { SignOptions } from 'jsonwebtoken';
import { Request, Response } from 'express';
import { User, ApiError, VinylFilters } from '../types';
import config from '../config';

// JWT utilities
export const generateToken = (user: User): string => {
    const payload = {
        id: user.id,
        email: user.email,
        googleId: user.googleId
    };

    const options: SignOptions = {
        expiresIn: '7d' // Use a fixed value for now
    };

    return jwt.sign(payload, config.jwtSecret, options);
};

export const verifyToken = (token: string): any => {
    try {
        return jwt.verify(token, config.jwtSecret);
    } catch (error) {
        throw new Error('Invalid token');
    }
};

// Response utilities
export const successResponse = (res: Response, data: any, statusCode: number = 200): void => {
    res.status(statusCode).json({
        success: true,
        data
    });
};

export const errorResponse = (res: Response, error: ApiError, statusCode: number = 400): void => {
    res.status(statusCode).json({
        success: false,
        ...error
    });
};

export const notFoundResponse = (res: Response, message: string = 'Resource not found'): void => {
    errorResponse(res, {
        error: 'Not Found',
        message
    }, 404);
};

export const unauthorizedResponse = (res: Response, message: string = 'Unauthorized'): void => {
    errorResponse(res, {
        error: 'Unauthorized',
        message
    }, 401);
};

export const forbiddenResponse = (res: Response, message: string = 'Forbidden'): void => {
    errorResponse(res, {
        error: 'Forbidden',
        message
    }, 403);
};

export const serverErrorResponse = (res: Response, message: string = 'Internal server error'): void => {
    errorResponse(res, {
        error: 'Internal Server Error',
        message
    }, 500);
};

// Validation utilities
export const validatePagination = (filters: VinylFilters): { page: number; limit: number } => {
    const page = Math.max(1, parseInt(filters.page?.toString() || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(filters.limit?.toString() || '20', 10)));

    return { page, limit };
};

export const sanitizeString = (str: string): string => {
    return str.trim().replace(/[<>]/g, '');
};

// Date utilities
export const formatDate = (date: Date): string => {
    return date.toISOString();
};

export const parseDate = (dateString: string): Date => {
    return new Date(dateString);
};

// ID generation
export const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Request utilities
export const getAuthToken = (req: Request): string | null => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
};

// Google Sheets utilities
export const formatGoogleSheetsRange = (sheetName: string = 'Vinyl_Collection'): string => {
    // Try different formats for sheet names with spaces
    const ranges = [
        `'${sheetName}'!A:K`, // Quoted sheet name with column range
        `${sheetName}!A:K`,   // Unquoted sheet name with column range
        'A:K',                // Just column range (default sheet)
        'Sheet1!A:K',         // Common default sheet name
        'Sheet1',             // Just the sheet name
        sheetName,            // Just the provided sheet name
    ];

    return ranges[0]; // Return the first format, the service will try others if this fails
};

// Alternative range formats for different sheet structures
export const formatGoogleSheetsRangeAlternative = (sheetName: string = 'Vinyl_Collection'): string => {
    // For tables, sometimes you need to use the table name instead of cell range
    // This is a fallback option
    return `${sheetName}`; // Just the sheet name, let Google Sheets figure out the range
};

export const formatGoogleSheetsRangeWithTable = (tableName: string): string => {
    // For named tables, use the table name directly
    return tableName;
};

export const parseGoogleSheetsRow = (row: any[]): any => {
    // Parse price with improved handling
    const rawPrice = row[5];
    let parsedPrice = 0;

    if (rawPrice !== null && rawPrice !== undefined && rawPrice !== '') {
        // Try to parse as number, handling various formats
        const priceStr = rawPrice.toString().trim();

        // Remove currency symbols and commas
        const cleanPrice = priceStr.replace(/[$€£¥,]/g, '');

        const numPrice = parseFloat(cleanPrice);
        if (!isNaN(numPrice)) {
            parsedPrice = numPrice;
        }
    }

    return {
        artistName: row[0] || '',
        albumName: row[1] || '',
        year: row[2] ? parseInt(row[2].toString(), 10) || 0 : 0,
        format: row[3] || 'Vinyl',
        genre: row[4] || '',
        price: parsedPrice,
        owner: row[6] || '',
        status: row[7] || 'Owned',
        notes: row[8] || '',
        createdAt: row[9] ? new Date(row[9]) : new Date(),
        updatedAt: row[10] ? new Date(row[10]) : new Date()
    };
};

export const formatGoogleSheetsRowData = (record: any): any[] => {
    return [
        record.artistName,
        record.albumName,
        record.year,
        record.format,
        record.genre,
        record.price,
        record.owner,
        record.status,
        record.notes || '',
        record.createdAt ? formatDate(record.createdAt) : formatDate(new Date()),
        record.updatedAt ? formatDate(record.updatedAt) : formatDate(new Date())
    ];
};
