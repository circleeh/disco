import React, { useState, useEffect, useCallback } from 'react';
import { searchAlbumCovers, downloadImageAsBase64, ImageSearchResult } from '../../services/imageSearch';

interface ImageSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImageSelect: (base64Data: string) => void;
    searchQuery?: string;
}

const ImageSearchModal: React.FC<ImageSearchModalProps> = ({
    isOpen,
    onClose,
    onImageSelect,
    searchQuery = ''
}) => {
    const [query, setQuery] = useState(searchQuery);
    const [results, setResults] = useState<ImageSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);

    // Debounced search function
    const debouncedSearch = useCallback(
        (() => {
            let timeoutId: NodeJS.Timeout;
            return (searchTerm: string) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    if (searchTerm.trim()) {
                        handleSearch(searchTerm);
                    }
                }, 500);
            };
        })(),
        []
    );

    // Only set initial query when modal opens, don't auto-search
    useEffect(() => {
        if (isOpen) {
            setQuery(searchQuery);
            setResults([]);
            setError(null);
        }
    }, [isOpen, searchQuery]);

    const handleSearch = async (searchTerm: string) => {
        if (!searchTerm.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            console.log('🔍 Searching for album covers:', searchTerm);
            const searchResults = await searchAlbumCovers(searchTerm, 12);
            console.log('📋 Search results:', searchResults);
            setResults(searchResults);
        } catch (err: any) {
            console.error('❌ Image search error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to search for images';
            setError(`Search failed: ${errorMessage}`);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleImageClick = async (imageUrl: string) => {
        setDownloading(true);
        try {
            const base64Data = await downloadImageAsBase64(imageUrl);
            onImageSelect(base64Data);
            onClose();
        } catch (err) {
            setError('Failed to download image');
            console.error('Image download error:', err);
        } finally {
            setDownloading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(query);
    };

    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value;
        setQuery(newQuery);
        debouncedSearch(newQuery);
    };

    const handleClose = () => {
        setQuery('');
        setResults([]);
        setError(null);
        setDownloading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-midcentury-charcoal">Search Album Covers</h2>
                    <button
                        onClick={handleClose}
                        className="text-midcentury-charcoal hover:text-midcentury-burntOrange"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm">
                    <p><strong>Note:</strong> We search for album cover artwork using MusicBrainz. Type to search automatically, or click the search button.</p>
                </div>

                <form onSubmit={handleSubmit} className="mb-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={query}
                            onChange={handleQueryChange}
                            placeholder="Search for album covers (e.g., 'Kraftwerk Autobahn')"
                            className="flex-1 px-3 py-2 border border-midcentury-walnut rounded focus:ring-1 focus:ring-midcentury-mustard focus:border-midcentury-mustard"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-midcentury-mustard text-white rounded hover:bg-midcentury-burntOrange disabled:opacity-50"
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800">
                        {error}
                    </div>
                )}

                {downloading && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800">
                        Downloading image...
                    </div>
                )}

                <div className="overflow-y-auto max-h-96">
                    {results.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {results.map((result, index) => (
                                <div
                                    key={index}
                                    className="cursor-pointer group"
                                    onClick={() => handleImageClick(result.url)}
                                >
                                    <div className="aspect-square bg-midcentury-cream rounded-lg overflow-hidden border border-midcentury-walnut group-hover:border-midcentury-mustard transition-colors">
                                        <img
                                            src={result.url}
                                            alt={result.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                target.nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                        {/* Fallback placeholder */}
                                        <div className="hidden w-full h-full flex items-center justify-center bg-midcentury-cream">
                                            <span className="text-xs text-midcentury-olive text-center">No Image</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-midcentury-charcoal mt-1 truncate">
                                        {result.title}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : loading ? (
                        <div className="text-center py-8 text-midcentury-charcoal">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-midcentury-mustard mb-2"></div>
                            <p>Searching for album covers...</p>
                        </div>
                    ) : results.length === 0 && query && !loading ? (
                        <div className="text-center py-8 text-midcentury-charcoal">
                            No images found for "{query}"
                        </div>
                    ) : (
                        <div className="text-center py-8 text-midcentury-charcoal">
                            Enter an album name to search for cover art
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageSearchModal;
