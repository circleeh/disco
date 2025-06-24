"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = exports.deleteRecord = exports.updateRecord = exports.createRecord = exports.getRecordById = exports.getRecords = void 0;
const utils_1 = require("../utils");
const googleSheets_1 = __importDefault(require("../services/googleSheets"));
// Get all vinyl records with filtering and pagination
const getRecords = async (req, res) => {
    try {
        const filters = req.query;
        const result = await googleSheets_1.default.getRecords(filters);
        (0, utils_1.successResponse)(res, result);
    }
    catch (error) {
        console.error('Error getting vinyl records:', error);
        (0, utils_1.serverErrorResponse)(res, 'Failed to fetch vinyl records');
    }
};
exports.getRecords = getRecords;
// Get a single vinyl record by ID
const getRecordById = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await googleSheets_1.default.getRecordById(id);
        if (!record) {
            (0, utils_1.notFoundResponse)(res, 'Vinyl record not found');
            return;
        }
        (0, utils_1.successResponse)(res, record);
    }
    catch (error) {
        console.error('Error getting vinyl record:', error);
        (0, utils_1.serverErrorResponse)(res, 'Failed to fetch vinyl record');
    }
};
exports.getRecordById = getRecordById;
// Create a new vinyl record
const createRecord = async (req, res) => {
    try {
        const recordData = req.body;
        const newRecord = await googleSheets_1.default.createRecord(recordData);
        (0, utils_1.successResponse)(res, newRecord, 201);
    }
    catch (error) {
        console.error('Error creating vinyl record:', error);
        (0, utils_1.serverErrorResponse)(res, 'Failed to create vinyl record');
    }
};
exports.createRecord = createRecord;
// Update an existing vinyl record
const updateRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const updatedRecord = await googleSheets_1.default.updateRecord(id, updates);
        if (!updatedRecord) {
            (0, utils_1.notFoundResponse)(res, 'Vinyl record not found');
            return;
        }
        (0, utils_1.successResponse)(res, updatedRecord);
    }
    catch (error) {
        console.error('Error updating vinyl record:', error);
        (0, utils_1.serverErrorResponse)(res, 'Failed to update vinyl record');
    }
};
exports.updateRecord = updateRecord;
// Delete a vinyl record
const deleteRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await googleSheets_1.default.deleteRecord(id);
        if (!deleted) {
            (0, utils_1.notFoundResponse)(res, 'Vinyl record not found');
            return;
        }
        (0, utils_1.successResponse)(res, { message: 'Record deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting vinyl record:', error);
        (0, utils_1.serverErrorResponse)(res, 'Failed to delete vinyl record');
    }
};
exports.deleteRecord = deleteRecord;
// Get collection statistics
const getStats = async (req, res) => {
    try {
        const stats = await googleSheets_1.default.getStats();
        (0, utils_1.successResponse)(res, stats);
    }
    catch (error) {
        console.error('Error getting collection stats:', error);
        (0, utils_1.serverErrorResponse)(res, 'Failed to fetch collection statistics');
    }
};
exports.getStats = getStats;
//# sourceMappingURL=vinyl.js.map