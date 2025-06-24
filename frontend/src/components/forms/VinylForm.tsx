import React, { useState } from 'react';
import ImageSearchModal from '../ui/ImageSearchModal';
import MetadataSearchModal from '../ui/MetadataSearchModal';

interface AlbumMetadata {
    artistName: string;
    albumName: string;
    year: number;
    coverArtUrl?: string;
    label?: string;
    format?: string;
    hasCoverArt: boolean;
}

interface VinylFormData {
    artistName: string;
    albumName: string;
    year: number;
    format: 'LP' | 'EP' | '7" Single' | '10" Single' | '12" Single' | '10" EP' | '12" EP' | '12" LP';
    genre: string;
    price: number;
    owner: string;
    status: 'Owned' | 'Wanted' | 'Borrowed' | 'Loaned' | 'Re-purchase Necessary';
    coverArt?: string; // Base64 encoded image
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
    format: 'LP',
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
            format: initial.format || 'LP',
            genre: initial.genre || '',
            price: initial.price || 0,
            owner: initial.owner || '',
            status: initial.status || 'Owned',
            coverArt: initial.coverArt || '',
            notes: initial.notes || '',
        })
    });
    const [error, setError] = useState<string | null>(null);
    const [showImageSearch, setShowImageSearch] = useState(false);
    const [showMetadataSearch, setShowMetadataSearch] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent form submission if modals are open
        if (showImageSearch || showMetadataSearch) {
            return;
        }

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

    const handleImageSelect = (base64Data: string) => {
        setForm(prev => ({ ...prev, coverArt: base64Data }));
    };

    const handleRemoveCoverArt = () => {
        setForm(prev => ({ ...prev, coverArt: '' }));
    };

    const handleMetadataSelect = (metadata: AlbumMetadata) => {
        setForm(prev => ({
            ...prev,
            artistName: metadata.artistName,
            albumName: metadata.albumName,
            year: metadata.year,
            format: (metadata.format as any) || 'LP',
            notes: metadata.label ? `Label: ${metadata.label}` : prev.notes
        }));

        // If the metadata has cover art, download it
        if (metadata.hasCoverArt && metadata.coverArtUrl) {
            // Convert the cover art URL to base64
            fetch(metadata.coverArtUrl)
                .then(response => response.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64data = reader.result as string;
                        setForm(prev => ({ ...prev, coverArt: base64data }));
                    };
                    reader.readAsDataURL(blob);
                })
                .catch(error => {
                    console.error('Error downloading cover art:', error);
                });
        }
    };

    const getSearchQuery = () => {
        return `${form.artistName} ${form.albumName}`.trim();
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                {/* Metadata Search Button */}
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={() => setShowMetadataSearch(true)}
                        className="px-6 py-2 bg-midcentury-mustard text-white rounded-lg hover:bg-midcentury-burntOrange flex items-center gap-2"
                    >
                        🔍 Search MusicBrainz for Album Info
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-midcentury-charcoal mb-1">
                            Artist Name *
                        </label>
                        <input
                            type="text"
                            value={form.artistName}
                            onChange={(e) => handleChange('artistName', e.target.value)}
                            className="w-full px-3 py-2 border border-midcentury-walnut rounded focus:ring-1 focus:ring-midcentury-mustard focus:border-midcentury-mustard"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-midcentury-charcoal mb-1">
                            Album Name *
                        </label>
                        <input
                            type="text"
                            value={form.albumName}
                            onChange={(e) => handleChange('albumName', e.target.value)}
                            className="w-full px-3 py-2 border border-midcentury-walnut rounded focus:ring-1 focus:ring-midcentury-mustard focus:border-midcentury-mustard"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-midcentury-charcoal mb-1">
                            Year
                        </label>
                        <input
                            type="number"
                            value={form.year}
                            onChange={(e) => handleChange('year', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-midcentury-walnut rounded focus:ring-1 focus:ring-midcentury-mustard focus:border-midcentury-mustard"
                            min="1900"
                            max={new Date().getFullYear() + 1}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-midcentury-charcoal mb-1">
                            Format
                        </label>
                        <select
                            value={form.format}
                            onChange={(e) => handleChange('format', e.target.value)}
                            className="w-full px-3 py-2 border border-midcentury-walnut rounded focus:ring-1 focus:ring-midcentury-mustard focus:border-midcentury-mustard"
                        >
                            <option value="LP">LP</option>
                            <option value="EP">EP</option>
                            <option value='7" Single'>7" Single</option>
                            <option value='10" Single'>10" Single</option>
                            <option value='12" Single'>12" Single</option>
                            <option value='10" EP'>10" EP</option>
                            <option value='12" EP'>12" EP</option>
                            <option value='12" LP'>12" LP</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-midcentury-charcoal mb-1">
                            Genre
                        </label>
                        <input
                            type="text"
                            value={form.genre}
                            onChange={(e) => handleChange('genre', e.target.value)}
                            className="w-full px-3 py-2 border border-midcentury-walnut rounded focus:ring-1 focus:ring-midcentury-mustard focus:border-midcentury-mustard"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-midcentury-charcoal mb-1">
                            Price ($)
                        </label>
                        <input
                            type="number"
                            value={form.price}
                            onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-midcentury-walnut rounded focus:ring-1 focus:ring-midcentury-mustard focus:border-midcentury-mustard"
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-midcentury-charcoal mb-1">
                            Owner
                        </label>
                        <input
                            type="text"
                            value={form.owner}
                            onChange={(e) => handleChange('owner', e.target.value)}
                            className="w-full px-3 py-2 border border-midcentury-walnut rounded focus:ring-1 focus:ring-midcentury-mustard focus:border-midcentury-mustard"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-midcentury-charcoal mb-1">
                            Status
                        </label>
                        <select
                            value={form.status}
                            onChange={(e) => handleChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-midcentury-walnut rounded focus:ring-1 focus:ring-midcentury-mustard focus:border-midcentury-mustard"
                        >
                            <option value="Owned">Owned</option>
                            <option value="Wanted">Wanted</option>
                            <option value="Borrowed">Borrowed</option>
                            <option value="Loaned">Loaned</option>
                            <option value="Re-purchase Necessary">Re-purchase Necessary</option>
                        </select>
                    </div>
                </div>

                {/* Cover Art Section */}
                <div>
                    <label className="block text-sm font-medium text-midcentury-charcoal mb-2">
                        Cover Art
                    </label>
                    <div className="space-y-3">
                        {form.coverArt ? (
                            <div className="flex items-start space-x-3">
                                <div className="w-32 h-32 bg-midcentury-cream rounded-lg overflow-hidden border border-midcentury-walnut">
                                    <img
                                        src={form.coverArt}
                                        alt="Album Cover"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowImageSearch(true)}
                                        className="px-3 py-1 text-sm bg-midcentury-mustard text-white rounded hover:bg-midcentury-burntOrange"
                                    >
                                        Change Cover
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleRemoveCoverArt}
                                        className="px-3 py-1 text-sm bg-white text-midcentury-charcoal border border-midcentury-walnut rounded hover:bg-midcentury-cream"
                                    >
                                        Remove Cover
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <div className="w-32 h-32 bg-midcentury-cream rounded-lg border-2 border-dashed border-midcentury-walnut flex items-center justify-center">
                                    <span className="text-midcentury-olive text-sm text-center">No Cover</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowImageSearch(true)}
                                    className="px-4 py-2 bg-midcentury-mustard text-white rounded hover:bg-midcentury-burntOrange"
                                >
                                    Search Cover Art
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-midcentury-charcoal mb-1">
                        Notes
                    </label>
                    <textarea
                        value={form.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-midcentury-walnut rounded focus:ring-1 focus:ring-midcentury-mustard focus:border-midcentury-mustard"
                    />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-midcentury-charcoal bg-white border border-midcentury-walnut rounded hover:bg-midcentury-cream"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-midcentury-mustard text-white rounded hover:bg-midcentury-burntOrange disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? (initial ? 'Updating...' : 'Adding...') : (initial ? 'Update' : 'Add')}
                    </button>
                </div>
            </form>

            {/* Image Search Modal - Outside the form to prevent form submission */}
            <ImageSearchModal
                isOpen={showImageSearch}
                onClose={() => setShowImageSearch(false)}
                onImageSelect={handleImageSelect}
                searchQuery={getSearchQuery()}
            />

            {/* Metadata Search Modal - Outside the form to prevent form submission */}
            <MetadataSearchModal
                isOpen={showMetadataSearch}
                onClose={() => setShowMetadataSearch(false)}
                onSelect={handleMetadataSelect}
            />
        </div>
    );
};

export default VinylForm;
