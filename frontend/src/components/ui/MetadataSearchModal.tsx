import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AlbumMetadata {
    artistName: string;
    albumName: string;
    year: number;
    coverArtUrl?: string;
    label?: string;
    format?: string;
    hasCoverArt: boolean;
}

interface MetadataSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (metadata: AlbumMetadata) => void;
}

const MetadataSearchModal: React.FC<MetadataSearchModalProps> = ({ isOpen, onClose, onSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<AlbumMetadata[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchMetadata = async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`/api/metadata/search?query=${encodeURIComponent(searchQuery)}&limit=10`, {
                withCredentials: true
            });

            setResults(response.data.data.results || []);
        } catch (error) {
            console.error('Error searching metadata:', error);
            setError('Failed to search for album metadata');
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchMetadata(query);
    };

    const handleSelect = (metadata: AlbumMetadata) => {
        onSelect(metadata);
        onClose();
    };

    const handleClose = () => {
        setQuery('');
        setResults([]);
        setError(null);
        onClose();
    };

    // Auto-search when query changes (with debounce)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (query.trim()) {
                searchMetadata(query);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [query]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-midcentury-charcoal">
                        Search Album Metadata
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-midcentury-olive hover:text-midcentury-charcoal"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSearch} className="mb-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search for artist and album (e.g., 'Ramones Self Titled')"
                            className="flex-1 px-3 py-2 border border-midcentury-walnut rounded focus:ring-1 focus:ring-midcentury-mustard focus:border-midcentury-mustard"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-midcentury-mustard text-white rounded hover:bg-midcentury-burntOrange"
                            disabled={loading}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto">
                    {loading && (
                        <div className="text-center py-8">
                            <p className="text-midcentury-olive">Searching...</p>
                        </div>
                    )}

                    {!loading && results.length === 0 && query && (
                        <div className="text-center py-8">
                            <p className="text-midcentury-olive">No albums found</p>
                        </div>
                    )}

                    {!loading && results.length > 0 && (
                        <div className="grid gap-4">
                            {results.map((metadata, index) => (
                                <div
                                    key={index}
                                    className="border border-midcentury-walnut rounded-lg p-4 hover:bg-midcentury-cream cursor-pointer"
                                    onClick={() => handleSelect(metadata)}
                                >
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 bg-midcentury-cream rounded overflow-hidden border border-midcentury-walnut flex-shrink-0">
                                            {metadata.hasCoverArt && metadata.coverArtUrl ? (
                                                <img
                                                    src={metadata.coverArtUrl}
                                                    alt="Album Cover"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="text-xs text-midcentury-olive text-center">No Cover</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-midcentury-charcoal">
                                                {metadata.albumName}
                                            </h3>
                                            <p className="text-midcentury-olive">{metadata.artistName}</p>
                                            <div className="flex gap-4 mt-2 text-sm text-midcentury-olive">
                                                <span>{metadata.year}</span>
                                                {metadata.format && <span>{metadata.format}</span>}
                                                {metadata.label && <span>{metadata.label}</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelect(metadata);
                                                }}
                                                className="px-3 py-1 bg-midcentury-mustard text-white rounded text-sm hover:bg-midcentury-burntOrange"
                                            >
                                                Select
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-midcentury-walnut">
                    <p className="text-sm text-midcentury-olive text-center">
                        Powered by MusicBrainz • Select an album to auto-fill the form
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MetadataSearchModal;
