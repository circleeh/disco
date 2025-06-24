import React, { useState } from 'react';

interface VinylFormData {
    artistName: string;
    albumName: string;
    year: number;
    format: 'Vinyl' | 'CD' | 'Cassette' | 'Digital';
    genre: string;
    price: number;
    owner: string;
    status: 'Owned' | 'Wanted' | 'Borrowed' | 'Loaned' | 'Re-purchase Necessary';
    notes?: string;
}

interface VinylFormProps {
    initial?: VinylFormData;
    onSubmit: (data: VinylFormData) => void;
    onCancel: () => void;
    loading?: boolean;
}

const initialForm: VinylFormData = {
    artistName: '',
    albumName: '',
    year: new Date().getFullYear(),
    format: 'Vinyl',
    genre: '',
    price: 0,
    owner: '',
    status: 'Owned',
    notes: '',
};

const VinylForm: React.FC<VinylFormProps> = ({ initial, onSubmit, onCancel, loading }) => {
    const [form, setForm] = useState({
        ...initialForm,
        ...(initial && {
            artistName: initial.artistName || '',
            albumName: initial.albumName || '',
            year: initial.year || new Date().getFullYear(),
            format: initial.format || 'Vinyl',
            genre: initial.genre || '',
            price: initial.price || 0,
            owner: initial.owner || '',
            status: initial.status || 'Owned',
            notes: initial.notes || '',
        })
    });
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!form.artistName.trim()) {
            setError('Artist name is required');
            return;
        }

        if (!form.albumName.trim()) {
            setError('Album name is required');
            return;
        }

        onSubmit(form);
    };

    const handleChange = (field: keyof VinylFormData, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Artist Name *
                    </label>
                    <input
                        type="text"
                        value={form.artistName}
                        onChange={(e) => handleChange('artistName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Album Name *
                    </label>
                    <input
                        type="text"
                        value={form.albumName}
                        onChange={(e) => handleChange('albumName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year
                    </label>
                    <input
                        type="number"
                        value={form.year}
                        onChange={(e) => handleChange('year', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Format
                    </label>
                    <select
                        value={form.format}
                        onChange={(e) => handleChange('format', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="Vinyl">Vinyl</option>
                        <option value="CD">CD</option>
                        <option value="Cassette">Cassette</option>
                        <option value="Digital">Digital</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Genre
                    </label>
                    <input
                        type="text"
                        value={form.genre}
                        onChange={(e) => handleChange('genre', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price ($)
                    </label>
                    <input
                        type="number"
                        value={form.price}
                        onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        min="0"
                        step="0.01"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Owner
                    </label>
                    <input
                        type="text"
                        value={form.owner}
                        onChange={(e) => handleChange('owner', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                    </label>
                    <select
                        value={form.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="Owned">Owned</option>
                        <option value="Wanted">Wanted</option>
                        <option value="Borrowed">Borrowed</option>
                        <option value="Loaned">Loaned</option>
                        <option value="Re-purchase Necessary">Re-purchase Necessary</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                </label>
                <textarea
                    value={form.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? (initial ? 'Updating...' : 'Adding...') : (initial ? 'Update' : 'Add')}
                </button>
            </div>
        </form>
    );
};

export default VinylForm;
