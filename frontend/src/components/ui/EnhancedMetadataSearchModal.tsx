import React, { useState, useEffect } from 'react';
import { AlbumMetadata, searchAlbumMetadata, searchByArtist, searchByAlbum, searchByArtistAndAlbum } from '../../services/metadata';

interface EnhancedMetadataSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (metadata: AlbumMetadata) => void;
}

type SearchMode = 'combined' | 'artist' | 'album' | 'separate';

const EnhancedMetadataSearchModal: React.FC<EnhancedMetadataSearchModalProps> = ({ isOpen, onClose, onSelect }) => {
    const [searchMode, setSearchMode] = useState<SearchMode>('combined');
    const [combinedQuery, setCombinedQuery] = useState('');
    const [artistQuery, setArtistQuery] = useState('');
    const [albumQuery, setAlbumQuery] = useState('');
    const [results, setResults] = useState<AlbumMetadata[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const performSearch = async () => {
        setLoading(true);
        setError(null);

        try {
            let searchResponse;

            switch (searchMode) {
                case 'combined':
                    if (!combinedQuery.trim()) {
                        setResults([]);
                        return;
                    }
                    searchResponse = await searchAlbumMetadata(combinedQuery, 10);
                    break;
                case 'artist':
                    if (!artistQuery.trim()) {
                        setResults([]);
                        return;
                    }
                    searchResponse = await searchByArtist(artistQuery, 10);
                    break;
                case 'album':
                    if (!albumQuery.trim()) {
                        setResults([]);
                        return;
                    }
                    searchResponse = await searchByAlbum(albumQuery, 10);
                    break;
                case 'separate':
                    if (!artistQuery.trim() || !albumQuery.trim()) {
                        setResults([]);
                        return;
                    }
                    searchResponse = await searchByArtistAndAlbum(artistQuery, albumQuery, 10);
                    break;
                default:
                    setResults([]);
                    return;
            }

            setResults(searchResponse.results || []);
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
        performSearch();
    };

    const handleSelect = (metadata: AlbumMetadata) => {
        onSelect(metadata);
        onClose();
    };

    const handleClose = () => {
        setCombinedQuery('');
        setArtistQuery('');
        setAlbumQuery('');
        setResults([]);
        setError(null);
        setSearchMode('combined');
        onClose();
    };

    // Auto-search when queries change (with debounce)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchMode === 'combined' && combinedQuery.trim()) {
                performSearch();
            } else if (searchMode === 'artist' && artistQuery.trim()) {
                performSearch();
            } else if (searchMode === 'album' && albumQuery.trim()) {
                performSearch();
            } else if (searchMode === 'separate' && artistQuery.trim() && albumQuery.trim()) {
                performSearch();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [combinedQuery, artistQuery, albumQuery, searchMode]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-midcentury-charcoal">
                        Enhanced Album Metadata Search
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-midcentury-olive hover:text-midcentury-charcoal"
                    >
                        ✕
                    </button>
                </div>

                {/* Search Mode Selector */}
                <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setSearchMode('combined')}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${searchMode === 'combined'
                                    ? 'bg-midcentury-mustard text-white'
                                    : 'bg-midcentury-cream text-midcentury-charcoal hover:bg-midcentury-walnut hover:text-white'
                                }`}
                        >
                            Combined Search
                        </button>
                        <button
                            type="button"
                            onClick={() => setSearchMode('artist')}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${searchMode === 'artist'
                                    ? 'bg-midcentury-mustard text-white'
                                    : 'bg-midcentury-cream text-midcentury-charcoal hover:bg-midcentury-walnut hover:text-white'
                                }`}
                        >
                            Artist Only
                        </button>
                        <button
                            type="button"
                            onClick={() => setSearchMode('album')}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${searchMode === 'album'
                                    ? 'bg-midcentury-mustard text-white'
                                    : 'bg-midcentury-cream text-midcentury-charcoal hover:bg-midcentury-walnut hover:text-white'
                                }`}
                        >
                            Album Only
                        </button>
                        <button
                            type="button"
                            onClick={() => setSearchMode('separate')}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${searchMode === 'separate'
                                    ? 'bg-midcentury-mustard text-white'
                                    : 'bg-midcentury-cream text-midcentury-charcoal hover:bg-midcentury-walnut hover:text-white'
                                }`}
                        >
                            Artist + Album
                        </button>
                    </div>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="mb-4">
                    {searchMode === 'combined' && (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={combinedQuery}
                                onChange={(e) => setCombinedQuery(e.target.value)}
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
                    )}

                    {searchMode === 'artist' && (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={artistQuery}
                                onChange={(e) => setArtistQuery(e.target.value)}
                                placeholder="Search by artist name (e.g., 'Black Flag')"
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
                    )}

                    {searchMode === 'album' && (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={albumQuery}
                                onChange={(e) => setAlbumQuery(e.target.value)}
                                placeholder="Search by album name (e.g., 'Damaged')"
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
                    )}

                    {searchMode === 'separate' && (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={artistQuery}
                                onChange={(e) => setArtistQuery(e.target.value)}
                                placeholder="Artist name (e.g., 'Black Flag')"
                                className="flex-1 px-3 py-2 border border-midcentury-walnut rounded focus:ring-1 focus:ring-midcentury-mustard focus:border-midcentury-mustard"
                            />
                            <input
                                type="text"
                                value={albumQuery}
                                onChange={(e) => setAlbumQuery(e.target.value)}
                                placeholder="Album name (e.g., 'Damaged')"
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
                    )}
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

                    {!loading && results.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-midcentury-olive">
                                {searchMode === 'combined' && combinedQuery && 'No albums found'}
                                {searchMode === 'artist' && artistQuery && 'No albums found for this artist'}
                                {searchMode === 'album' && albumQuery && 'No albums found with this name'}
                                {searchMode === 'separate' && artistQuery && albumQuery && 'No albums found for this artist and album combination'}
                                {!combinedQuery && !artistQuery && !albumQuery && 'Enter search terms to find albums'}
                            </p>
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
                    <p className="text-xs text-midcentury-olive text-center mt-1">
                        Use separate artist and album searches to avoid confusion with albums that share names
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EnhancedMetadataSearchModal;
