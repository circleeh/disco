"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOwners = exports.getGenres = exports.getArtists = void 0;
const utils_1 = require("../utils");
const googleSheets_1 = __importDefault(require("../services/googleSheets"));
// Get all unique artist names
const getArtists = async (req, res) => {
    try {
        const artists = await googleSheets_1.default.getUniqueValues('artistName');
        (0, utils_1.successResponse)(res, artists);
    }
    catch (error) {
        console.error('Error getting artists:', error);
        (0, utils_1.serverErrorResponse)(res, 'Failed to fetch artists');
    }
};
exports.getArtists = getArtists;
// Get all unique genres
const getGenres = async (req, res) => {
    try {
        const genres = await googleSheets_1.default.getUniqueValues('genre');
        (0, utils_1.successResponse)(res, genres);
    }
    catch (error) {
        console.error('Error getting genres:', error);
        (0, utils_1.serverErrorResponse)(res, 'Failed to fetch genres');
    }
};
exports.getGenres = getGenres;
// Get all unique owners
const getOwners = async (req, res) => {
    try {
        const owners = await googleSheets_1.default.getUniqueValues('owner');
        (0, utils_1.successResponse)(res, owners);
    }
    catch (error) {
        console.error('Error getting owners:', error);
        (0, utils_1.serverErrorResponse)(res, 'Failed to fetch owners');
    }
};
exports.getOwners = getOwners;
//# sourceMappingURL=metadata.js.map