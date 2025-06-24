"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateVinylUpdate = exports.validateVinylFilters = exports.validateVinylRecord = void 0;
const joi_1 = __importDefault(require("joi"));
const utils_1 = require("../utils");
// Vinyl record validation schema
const vinylRecordSchema = joi_1.default.object({
    artistName: joi_1.default.string().required().min(1).max(255),
    albumName: joi_1.default.string().required().min(1).max(255),
    year: joi_1.default.number().integer().min(1900).max(new Date().getFullYear() + 1),
    format: joi_1.default.string().valid('Vinyl', 'CD', 'Cassette', 'Digital').required(),
    genre: joi_1.default.string().required().min(1).max(100),
    price: joi_1.default.number().positive().precision(2),
    owner: joi_1.default.string().required().min(1).max(100),
    status: joi_1.default.string().valid('Owned', 'Wanted', 'Borrowed', 'Loaned', 'Re-purchase Necessary').required(),
    notes: joi_1.default.string().max(1000).optional(),
});
// Vinyl filters validation schema
const vinylFiltersSchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).optional(),
    limit: joi_1.default.number().integer().min(1).max(100).optional(),
    artist: joi_1.default.string().max(255).optional(),
    genre: joi_1.default.string().max(100).optional(),
    status: joi_1.default.string().valid('Owned', 'Wanted', 'Borrowed', 'Loaned', 'Re-purchase Necessary').optional(),
    owner: joi_1.default.string().max(100).optional(),
    search: joi_1.default.string().max(255).optional(),
    sortBy: joi_1.default.string().valid('artistName', 'albumName', 'year', 'price').optional(),
    sortOrder: joi_1.default.string().valid('asc', 'desc').optional(),
});
// Validation middleware factory
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const details = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));
            (0, utils_1.errorResponse)(res, {
                error: 'Validation Error',
                message: 'Invalid input data',
                details,
            }, 400);
            return;
        }
        // Replace request body with validated data
        req.body = value;
        next();
    };
};
// Query validation middleware factory
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, { abortEarly: false });
        if (error) {
            const details = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));
            (0, utils_1.errorResponse)(res, {
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
exports.validateVinylRecord = validate(vinylRecordSchema);
exports.validateVinylFilters = validateQuery(vinylFiltersSchema);
// Partial update validation (all fields optional)
exports.validateVinylUpdate = validate(vinylRecordSchema.fork(Object.keys(vinylRecordSchema.describe().keys), (schema) => schema.optional()));
//# sourceMappingURL=validation.js.map