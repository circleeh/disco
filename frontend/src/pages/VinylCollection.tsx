import React, { useEffect, useState } from 'react';
import { fetchVinylRecords, VinylFilters, createVinylRecord, updateVinylRecord } from '../services/vinyl';
import { VinylRecord } from '../types/vinyl';
import VinylForm from '../components/forms/VinylForm';

const VinylCollection: React.FC = () => {
    const [records, setRecords] = useState<VinylRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [editingRecord, setEditingRecord] = useState<VinylRecord | null>(null);
    const [saving, setSaving] = useState(false);

    // Pagination state
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50, // Increased limit to show more records
        total: 0,
        totalPages: 0,
    });

    // Filter state
    const [filters, setFilters] = useState<VinylFilters>({
        page: 1,
        limit: 50, // Increased limit to show more records
        sortBy: 'artistName',
        sortOrder: 'asc',
    });

    const loadRecords = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchVinylRecords(filters);
            console.log('📋 Fetched records:', response.records);
            setRecords(response.records);
            setPagination(response.pagination);
        } catch (error) {
            console.error('❌ Error loading records:', error);
            setError('Failed to load vinyl records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRecords();
    }, [filters]);

    const handleFilterChange = (key: keyof VinylFilters, value: any) => {
        setFilters(prev => {
            const newFilters = { ...prev };

            // If the value is empty, remove the key entirely instead of setting it to empty string
            if (value === '' || value === null || value === undefined) {
                delete newFilters[key];
            } else {
                newFilters[key] = value;
            }

            // Reset to first page when filters change
            newFilters.page = 1;

            return newFilters;
        });
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({
            ...prev,
            page: newPage,
        }));
    };

    const clearFilters = () => {
        setFilters({
            page: 1,
            limit: 50,
            sortBy: 'artistName',
            sortOrder: 'asc',
        });
    };

    const handleAdd = async (data: any) => {
        setSaving(true);
        try {
            await createVinylRecord(data);
            setShowAdd(false);
            loadRecords();
        } catch {
            alert('Failed to add record.');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = async (data: any) => {
        if (!editingRecord) return;
        setSaving(true);
        try {
            await updateVinylRecord(editingRecord.id, data);
            setEditingRecord(null);
            loadRecords();
        } catch {
            alert('Failed to update record.');
        } finally {
            setSaving(false);
        }
    };

    const handleEditClick = (record: VinylRecord) => {
        setEditingRecord(record);
        setShowAdd(false);
    };

    const handleCancelEdit = () => {
        setEditingRecord(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Owned': return 'bg-green-100 text-green-800';
            case 'Wanted': return 'bg-yellow-100 text-yellow-800';
            case 'Borrowed': return 'bg-blue-100 text-blue-800';
            case 'Loaned': return 'bg-purple-100 text-purple-800';
            case 'Re-purchase Necessary': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-midcentury-charcoal" style={{ fontFamily: 'Avenir, sans-serif' }}>My Vinyl Collection</h1>
                        <p className="text-midcentury-olive mt-1">
                            {pagination.total} {pagination.total === 1 ? 'record' : 'records'}
                            {pagination.totalPages > 1 && ` • Page ${pagination.page} of ${pagination.totalPages}`}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAdd(true)}
                        className="px-4 py-2 bg-midcentury-mustard text-white rounded-lg hover:bg-midcentury-burntOrange transition-colors"
                    >
                        Add Record
                    </button>
                </div>
            </div>

            {/* Simple Filters */}
            <div className="mb-6 bg-midcentury-cream rounded-lg border border-midcentury-walnut p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-midcentury-charcoal mb-1">
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Artist or album..."
                            value={filters.search || ''}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full px-3 py-2 border border-midcentury-walnut rounded-md focus:outline-none focus:ring-2 focus:ring-midcentury-mustard"
                        />
                    </div>

                    {/* Sort */}
                    <div>
                        <label className="block text-sm font-medium text-midcentury-charcoal mb-1">
                            Sort by
                        </label>
                        <select
                            value={`${filters.sortBy}-${filters.sortOrder}`}
                            onChange={(e) => {
                                const [sortBy, sortOrder] = e.target.value.split('-');
                                handleFilterChange('sortBy', sortBy);
                                handleFilterChange('sortOrder', sortOrder);
                            }}
                            className="w-full px-3 py-2 border border-midcentury-walnut rounded-md focus:outline-none focus:ring-2 focus:ring-midcentury-mustard"
                        >
                            <option value="artistName-asc">Artist (A-Z)</option>
                            <option value="artistName-desc">Artist (Z-A)</option>
                            <option value="albumName-asc">Album (A-Z)</option>
                            <option value="albumName-desc">Album (Z-A)</option>
                            <option value="year-asc">Year (Oldest)</option>
                            <option value="year-desc">Year (Newest)</option>
                            <option value="price-asc">Price (Low-High)</option>
                            <option value="price-desc">Price (High-Low)</option>
                        </select>
                    </div>

                    {/* Clear Filters */}
                    <div className="flex items-end">
                        <button
                            onClick={clearFilters}
                            className="w-full px-4 py-2 text-sm text-midcentury-olive hover:text-midcentury-charcoal border border-midcentury-olive rounded-md hover:bg-midcentury-olive hover:text-white transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Add/Edit Form */}
            {(showAdd || editingRecord) && (
                <div className="mb-8 bg-midcentury-cream rounded-lg border border-midcentury-walnut p-6">
                    <h3 className="text-lg font-semibold mb-4 text-midcentury-charcoal">
                        {editingRecord ? 'Edit Record' : 'Add New Record'}
                    </h3>
                    <VinylForm
                        initial={editingRecord || undefined}
                        onSubmit={editingRecord ? handleEdit : handleAdd}
                        onCancel={editingRecord ? handleCancelEdit : () => setShowAdd(false)}
                        loading={saving}
                    />
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-midcentury-mustard"></div>
                    <p className="text-midcentury-charcoal mt-2">Loading...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && records.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-midcentury-charcoal mb-4">No records found.</p>
                    <button
                        onClick={() => setShowAdd(true)}
                        className="px-4 py-2 bg-midcentury-mustard text-white rounded-lg hover:bg-midcentury-burntOrange"
                    >
                        Add Your First Record
                    </button>
                </div>
            )}

            {/* Records Grid */}
            {!loading && !error && records.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {records.map((record) => (
                            <div
                                key={record.id}
                                className="bg-midcentury-cream rounded-lg border border-midcentury-walnut p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-midcentury-charcoal mb-1">
                                            {record.artistName || 'Unknown Artist'}
                                        </h3>
                                        <h4 className="text-midcentury-olive text-sm">
                                            {record.albumName || 'Unknown Album'}
                                        </h4>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(record.status || 'Unknown')}`}>
                                        {record.status || 'Unknown'}
                                    </span>
                                </div>

                                <div className="space-y-1 text-sm text-midcentury-charcoal mb-3">
                                    <div>{record.year || 'Unknown Year'} • {record.format || 'Vinyl'}</div>
                                    <div>{record.genre || 'Unknown Genre'}</div>
                                    <div>Owner: {record.owner || 'Unknown'}</div>
                                    <div>Price: {(() => {
                                        const price = record.price;

                                        // Handle null/undefined/empty values
                                        if (price === null || price === undefined || price === 0) {
                                            return 'Not specified';
                                        }

                                        // Handle numeric prices
                                        if (typeof price === 'number' && !isNaN(price)) {
                                            return `$${price.toFixed(2)}`;
                                        }

                                        return 'Not specified';
                                    })()}</div>
                                </div>

                                {record.notes && (
                                    <div className="text-xs text-midcentury-olive mb-3 border-t pt-2">
                                        {record.notes}
                                    </div>
                                )}

                                <button
                                    onClick={() => handleEditClick(record)}
                                    className="w-full text-sm text-midcentury-burntOrange hover:text-midcentury-charcoal font-medium py-2 border-t border-gray-100"
                                    disabled={editingRecord?.id === record.id}
                                >
                                    Edit
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="mt-8 flex items-center justify-center gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                                className="px-3 py-2 text-sm border border-midcentury-walnut rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-midcentury-walnut hover:text-white transition-colors"
                            >
                                Previous
                            </button>

                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`px-3 py-2 text-sm border rounded-md transition-colors ${pageNum === pagination.page
                                            ? 'bg-midcentury-mustard text-white border-midcentury-mustard'
                                            : 'border-midcentury-walnut hover:bg-midcentury-walnut hover:text-white'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page >= pagination.totalPages}
                                className="px-3 py-2 text-sm border border-midcentury-walnut rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-midcentury-walnut hover:text-white transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default VinylCollection;
