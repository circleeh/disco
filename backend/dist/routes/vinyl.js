"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vinylController = __importStar(require("../controllers/vinyl"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// Apply authentication to all vinyl routes
router.use(auth_1.authenticateToken);
// GET /api/vinyl - Get all records with filtering and pagination
router.get('/', validation_1.validateVinylFilters, vinylController.getRecords);
// GET /api/vinyl/:id - Get a single record
router.get('/:id', vinylController.getRecordById);
// POST /api/vinyl - Create a new record
router.post('/', validation_1.validateVinylRecord, vinylController.createRecord);
// PUT /api/vinyl/:id - Update an existing record
router.put('/:id', validation_1.validateVinylUpdate, vinylController.updateRecord);
// DELETE /api/vinyl/:id - Delete a record
router.delete('/:id', vinylController.deleteRecord);
// GET /api/vinyl/stats - Get collection statistics
router.get('/stats', vinylController.getStats);
exports.default = router;
//# sourceMappingURL=vinyl.js.map