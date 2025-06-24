import React, { useState } from 'react';

interface AlbumFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentFilters: {
        artist?: string;
        albumName?: string;
        genre?: string;
        year?: string;
        status?: string;
        owner?: string;
    };
    onApply: (filters: any) => void;
}

const statuses = [
    'Owned',
    'Wanted',
    'Borrowed',
    'Loaned',
    'Re-purchase Necessary',
];

const AlbumFilterModal: React.FC<AlbumFilterModalProps> = ({ isOpen, onClose, currentFilters, onApply }) => {
    const [filters, setFilters] = useState(currentFilters);

    React.useEffect(() => {
        setFilters(currentFilters);
    }, [currentFilters, isOpen]);

    const handleApply = () => {
        // Always send all filter fields, even if empty
        onApply(filters);
        onClose();
    };

    const handleClear = () => {
        setFilters({});
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                <h2 className="text-lg font-bold mb-4 text-midcentury-charcoal">Filter Records</h2>
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        handleApply();
                    }}
                    className="space-y-4"
                >
                    <div>
                        <label className="block text-sm font-medium mb-1">Artist</label>
                        <input
                            type="text"
                            className="w-full border border-midcentury-walnut rounded px-3 py-2"
                            value={filters.artist || ''}
                            onChange={e => setFilters(f => ({ ...f, artist: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Album</label>
                        <input
                            type="text"
                            className="w-full border border-midcentury-walnut rounded px-3 py-2"
                            value={filters.albumName || ''}
                            onChange={e => setFilters(f => ({ ...f, albumName: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Genre</label>
                        <input
                            type="text"
                            className="w-full border border-midcentury-walnut rounded px-3 py-2"
                            value={filters.genre || ''}
                            onChange={e => setFilters(f => ({ ...f, genre: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Year</label>
                        <input
                            type="number"
                            className="w-full border border-midcentury-walnut rounded px-3 py-2"
                            value={filters.year || ''}
                            onChange={e => setFilters(f => ({ ...f, year: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Owner</label>
                        <input
                            type="text"
                            className="w-full border border-midcentury-walnut rounded px-3 py-2"
                            value={filters.owner || ''}
                            onChange={e => setFilters(f => ({ ...f, owner: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                            className="w-full border border-midcentury-walnut rounded px-3 py-2"
                            value={filters.status || ''}
                            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                        >
                            <option value="">Any</option>
                            {statuses.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 mt-6 border-t pt-4">
                        <button
                            type="button"
                            className="px-4 py-2 rounded bg-white text-midcentury-charcoal border border-midcentury-walnut hover:bg-midcentury-olive hover:text-white focus:bg-midcentury-olive focus:text-white active:bg-midcentury-olive active:text-white transition-colors font-semibold shadow-sm"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 rounded bg-white text-midcentury-charcoal border border-midcentury-walnut hover:bg-midcentury-olive hover:text-white focus:bg-midcentury-olive focus:text-white active:bg-midcentury-olive active:text-white transition-colors font-semibold shadow-sm"
                            onClick={handleClear}
                        >
                            Clear All
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded bg-midcentury-mustard text-white border border-midcentury-walnut hover:bg-midcentury-burntOrange hover:text-white focus:bg-midcentury-burntOrange focus:text-white active:bg-midcentury-burntOrange active:text-white transition-colors font-semibold shadow-sm"
                            style={{ backgroundColor: 'var(--midcentury-mustard, #eab308)' }}
                        >
                            Apply
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AlbumFilterModal;
