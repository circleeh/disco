import React, { useEffect, useState } from 'react';
import { fetchVinylRecords, VinylFilters, createVinylRecord, updateVinylRecord } from '../services/vinyl';
import { VinylRecord } from '../types/vinyl';
import VinylCard from '../components/vinyl/VinylCard';
import VinylListItem from '../components/vinyl/VinylListItem';
import VinylForm from '../components/forms/VinylForm';
import EditVinylModal from '../components/ui/EditVinylModal';
import CollectionControls from '../components/ui/CollectionControls';
import AlbumFilterModal from '../components/ui/AlbumFilterModal';
import { useAuth } from '../stores/AuthContext';

interface VinylCollectionProps {
    showAdd: boolean;
    setShowAdd: React.Dispatch<React.SetStateAction<boolean>>;
}

const VinylCollection: React.FC<VinylCollectionProps> = ({ showAdd, setShowAdd }) => {
    const { user } = useAuth();
    const [records, setRecords] = useState<VinylRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const [filterModalOpen, setFilterModalOpen] = useState(false);

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

    const handleAdd = async (data: any) => {
        if (!user) {
            alert('You must be logged in to add records.');
            return;
        }
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
        if (!user) {
            alert('You must be logged in to edit records.');
            return;
        }
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
        if (!user) {
            alert('You must be logged in to edit records.');
            return;
        }
        setEditingRecord(record);
        setShowAdd(false);
    };

    const handleCancelEdit = () => {
        setEditingRecord(null);
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-midcentury-charcoal" style={{ fontFamily: 'Avenir, sans-serif' }}>
                            {user ? 'My Vinyl Collection' : 'Vinyl Collection'}
                        </h1>
                        <p className="text-midcentury-olive mt-1">
                            {pagination.total} {pagination.total === 1 ? 'record' : 'records'}
                            {pagination.totalPages > 1 && ` • Page ${pagination.page} of ${pagination.totalPages}`}
                            {!user && (
                                <span className="ml-2 text-sm text-midcentury-burntOrange">
                                    (Login to add or edit records)
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Controls Row */}
            <CollectionControls
                searchValue={filters.search || ''}
                onSearchChange={val => handleFilterChange('search', val)}
                onFilterClick={() => setFilterModalOpen(true)}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            <AlbumFilterModal
                isOpen={filterModalOpen}
                onClose={() => setFilterModalOpen(false)}
                currentFilters={filters}
                onApply={newFilters => setFilters({ ...newFilters, page: 1, limit: filters.limit, sortBy: filters.sortBy, sortOrder: filters.sortOrder })}
            />

            {/* Add Form - only for adding new records */}
            {showAdd && (
                <div className="mb-8 bg-midcentury-cream rounded-lg border border-midcentury-walnut p-6">
                    <h3 className="text-lg font-semibold mb-4 text-midcentury-charcoal">
                        Add New Record
                    </h3>
                    <VinylForm
                        onSubmit={handleAdd}
                        onCancel={() => setShowAdd(false)}
                        loading={saving}
                    />
                </div>
            )}

            {/* Edit Modal */}
            <EditVinylModal
                isOpen={!!editingRecord}
                onClose={handleCancelEdit}
                record={editingRecord}
                onSubmit={handleEdit}
                loading={saving}
            />

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

            {/* Records Display */}
            {!loading && !error && records.length > 0 && (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                            {records.map(record => (
                                <VinylCard
                                    key={record.id}
                                    record={record}
                                    isPlaying={false}
                                    onPlayClick={() => { }}
                                    onEditClick={user ? handleEditClick : undefined}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4 mb-8">
                            {records.map(record => (
                                <VinylListItem
                                    key={record.id}
                                    record={record}
                                    onEditClick={user ? handleEditClick : undefined}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Empty State */}
            {!loading && !error && records.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-midcentury-charcoal mb-4">No records found.</p>
                </div>
            )}
        </div>
    );
};

export default VinylCollection;
