import React from 'react';
import { VinylRecord } from '../../types/vinyl';

interface VinylCardProps {
    record: VinylRecord;
    isFavorite?: boolean;
    isPlaying?: boolean;
    onFavoriteToggle?: (id: string) => void;
    onPlayClick?: (id: string) => void;
    onEditClick?: (record: VinylRecord) => void;
}

const VinylCard: React.FC<VinylCardProps> = ({
    record,
    isFavorite = false,
    isPlaying = false,
    onFavoriteToggle,
    onPlayClick,
    onEditClick,
}) => {
    return (
        <div className="bg-white rounded-xl shadow border border-midcentury-walnut flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
            {/* Album Cover */}
            <div className="relative h-48 flex items-center justify-center bg-midcentury-cream">
                {record.coverArt ? (
                    <img
                        src={record.coverArt}
                        alt={`${record.albumName} by ${record.artistName}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                        }}
                    />
                ) : null}
                {/* Placeholder image - shown when no cover art or image fails to load */}
                <div className={`w-full h-full flex items-center justify-center ${record.coverArt ? 'hidden' : ''}`}>
                    <svg className="w-20 h-20 text-midcentury-olive opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" fill="none" />
                        <rect x="18" y="18" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                </div>
                {/* Play Icon Overlay */}
                {isPlaying && (
                    <button
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-30 transition"
                        onClick={() => onPlayClick && onPlayClick(record.id)}
                        aria-label="Play"
                    >
                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <polygon points="5,3 19,12 5,21" />
                        </svg>
                    </button>
                )}
            </div>
            {/* Card Content */}
            <div className="flex-1 flex flex-col p-4 gap-1">
                <div className="flex items-center justify-between">
                    <h2 className="font-bold text-midcentury-charcoal text-lg truncate" title={record.albumName}>{record.albumName}</h2>
                    <div className="flex items-center gap-1">
                        {/* Edit Button */}
                        <button
                            className="text-midcentury-olive hover:text-midcentury-burntOrange p-1"
                            onClick={() => onEditClick && onEditClick(record)}
                            aria-label="Edit record"
                            title="Edit record"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        {/* Favorite Button */}
                        <button
                            className="text-midcentury-olive hover:text-midcentury-burntOrange p-1"
                            onClick={() => onFavoriteToggle && onFavoriteToggle(record.id)}
                            aria-label={isFavorite ? 'Unfavorite' : 'Favorite'}
                            title={isFavorite ? 'Unfavorite' : 'Favorite'}
                        >
                            {isFavorite ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
                <div className="text-midcentury-olive text-sm truncate" title={record.artistName}>{record.artistName}</div>
                <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-midcentury-charcoal text-xs uppercase">{record.genre}</span>
                    <span className="text-midcentury-olive text-xs">{record.year}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <span className="px-2 py-0.5 rounded-full bg-midcentury-cream border border-midcentury-walnut text-xs font-semibold">{record.status}</span>
                    <span className="text-midcentury-olive text-xs">{record.owner}</span>
                    <span className="font-bold text-midcentury-charcoal text-base">${record.price.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

export default VinylCard;
