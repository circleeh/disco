import React, { useEffect, useState } from 'react';
import { fetchVinylRecords, VinylFilters, createVinylRecord, updateVinylRecord } from '../services/vinyl';
import { VinylRecord } from '../types/vinyl';
import VinylForm from '../components/forms/VinylForm';

const VinylCollection: React.FC = () => {
    const [records, setRecords] = useState<VinylRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters] = useState<VinylFilters>({});
    const [showAdd, setShowAdd] = useState(false);
    const [editingRecord, setEditingRecord] = useState<VinylRecord | null>(null);
    const [saving, setSaving] = useState(false);

    const loadRecords = () => {
        setLoading(true);
        setError(null);
        fetchVinylRecords(filters)
            .then((data) => {
                console.log('📋 Fetched records:', data.records);
                setRecords(data.records);
            })
            .catch((error) => {
                console.error('❌ Error loading records:', error);
                setError('Failed to load vinyl records.');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadRecords();
        // eslint-disable-next-line
    }, [filters]);

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
                            {records.length} {records.length === 1 ? 'record' : 'records'}
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
                                <div>Price: ${(record.price || 0).toFixed(2)}</div>
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
            )}
        </div>
    );
};

export default VinylCollection;
