import React from 'react';
import { VinylRecord } from '../../types/vinyl';

interface VinylListItemProps {
    record: VinylRecord;
    isPlaying?: boolean;
    onPlayClick?: (id: string) => void;
    onEditClick?: (record: VinylRecord) => void;
}

const VinylListItem: React.FC<VinylListItemProps> = ({
    record,
    isPlaying = false,
    onPlayClick,
    onEditClick,
}) => {
    return (
        <div className="bg-white rounded-lg shadow border border-midcentury-walnut p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
                {/* Album Cover */}
                <div className="relative w-16 h-16 flex-shrink-0 bg-midcentury-cream rounded overflow-hidden">
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
                    {/* Placeholder image */}
                    <div className={`w-full h-full flex items-center justify-center ${record.coverArt ? 'hidden' : ''}`}>
                        <svg className="w-8 h-8 text-midcentury-olive opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 48 48">
                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" fill="none" />
                            <rect x="18" y="18" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                        </svg>
                    </div>
                </div>

                {/* Record Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-midcentury-charcoal text-lg truncate" title={record.albumName}>
                                {record.albumName}
                            </h3>
                            <p className="text-midcentury-olive text-sm truncate" title={record.artistName}>
                                {record.artistName}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                            {/* Edit Button - only show if onEditClick is provided */}
                            {onEditClick && (
                                <button
                                    className="text-midcentury-olive hover:text-midcentury-burntOrange p-1"
                                    onClick={() => onEditClick(record)}
                                    aria-label="Edit record"
                                    title="Edit record"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Additional Details */}
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                        <span className="text-midcentury-olive">{record.year}</span>
                        <span className="font-semibold text-midcentury-charcoal uppercase">{record.genre}</span>
                        <span className="px-2 py-0.5 rounded-full bg-midcentury-cream border border-midcentury-walnut text-xs font-semibold">
                            {record.status}
                        </span>
                        <span className="text-midcentury-olive">Owner: {record.owner}</span>
                        <span className="font-bold text-midcentury-charcoal">${record.price.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VinylListItem;
