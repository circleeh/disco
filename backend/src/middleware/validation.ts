import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { errorResponse } from '../utils';

// Vinyl record validation schema
const vinylRecordSchema = Joi.object({
    artistName: Joi.string().required().min(1).max(255),
    albumName: Joi.string().required().min(1).max(255),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1),
    format: Joi.string().valid('Vinyl', 'CD', 'Cassette', 'Digital').required(),
    genre: Joi.string().required().min(1).max(100),
    price: Joi.number().positive().precision(2),
    owner: Joi.string().required().min(1).max(100),
    status: Joi.string().valid('Owned', 'Wanted', 'Borrowed', 'Loaned', 'Re-purchase Necessary').required(),
    notes: Joi.string().max(1000).allow('').optional(),
});

// Vinyl filters validation schema
const vinylFiltersSchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    artist: Joi.string().max(255).optional(),
    genre: Joi.string().max(100).optional(),
    status: Joi.string().valid('Owned', 'Wanted', 'Borrowed', 'Loaned', 'Re-purchase Necessary').optional(),
    owner: Joi.string().max(100).optional(),
    search: Joi.string().max(255).optional(),
    sortBy: Joi.string().valid('artistName', 'albumName', 'year', 'price').optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional(),
});

// Validation middleware factory
const validate = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        console.log('🔍 Validating request body:', req.body);

        const { error, value } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            console.log('❌ Validation failed:', error.details);
            const details = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));

            errorResponse(res, {
                error: 'Validation Error',
                message: 'Invalid input data',
                details,
            }, 400);
            return;
        }

        console.log('✅ Validation passed');
        // Replace request body with validated data
        req.body = value;
        next();
    };
};

// Query validation middleware factory
const validateQuery = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error, value } = schema.validate(req.query, { abortEarly: false });

        if (error) {
            const details = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));

            errorResponse(res, {
                error: 'Validation Error',
                message: 'Invalid query parameters',
                details,
            }, 400);
            return;
        }

        // Replace request query with validated data
        req.query = value;
        next();
    };
};

// Export validation middlewares
export const validateVinylRecord = validate(vinylRecordSchema);
export const validateVinylFilters = validateQuery(vinylFiltersSchema);

// Partial update validation (all fields optional)
export const validateVinylUpdate = validate(
    Joi.object({
        artistName: Joi.string().min(1).max(255).optional(),
        albumName: Joi.string().min(1).max(255).optional(),
        year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).optional(),
        format: Joi.string().valid('Vinyl', 'CD', 'Cassette', 'Digital').optional(),
        genre: Joi.string().min(1).max(100).optional(),
        price: Joi.number().positive().precision(2).optional(),
        owner: Joi.string().min(1).max(100).optional(),
        status: Joi.string().valid('Owned', 'Wanted', 'Borrowed', 'Loaned', 'Re-purchase Necessary').optional(),
        notes: Joi.string().max(1000).allow('').optional(),
    })
);
