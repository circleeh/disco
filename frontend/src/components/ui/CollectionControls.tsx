import React from 'react';

interface CollectionControlsProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    onFilterClick: () => void;
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
}

const CollectionControls: React.FC<CollectionControlsProps> = ({
    searchValue,
    onSearchChange,
    onFilterClick,
    viewMode,
    onViewModeChange,
}) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white rounded-lg shadow px-4 py-3 border border-midcentury-walnut mb-8">
            {/* Search Bar */}
            <div className="flex items-center flex-1 bg-midcentury-cream rounded-md px-3 py-2 border border-midcentury-walnut">
                <svg className="w-5 h-5 text-midcentury-olive mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    className="w-full bg-transparent outline-none text-midcentury-charcoal placeholder-midcentury-olive"
                    placeholder="Search your collection..."
                    value={searchValue}
                    onChange={e => onSearchChange(e.target.value)}
                />
            </div>
            {/* Filter Button */}
            <button
                className="flex items-center justify-center px-3 py-2 bg-midcentury-cream border border-midcentury-walnut rounded-md hover:bg-midcentury-mustard hover:text-white transition-colors"
                onClick={onFilterClick}
                aria-label="Filter"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0013 13.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 017 17v-3.586a1 1 0 00-.293-.707L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                <span className="ml-2 hidden sm:inline">Filter</span>
            </button>
            {/* View Toggle Buttons */}
            <div className="flex items-center space-x-2">
                <button
                    className={`p-2 rounded-md border border-midcentury-walnut ${viewMode === 'grid' ? 'bg-midcentury-mustard text-white' : 'bg-midcentury-cream hover:bg-midcentury-mustard hover:text-white'}`}
                    onClick={() => onViewModeChange('grid')}
                    aria-label="Grid view"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                    </svg>
                </button>
                <button
                    className={`p-2 rounded-md border border-midcentury-walnut ${viewMode === 'list' ? 'bg-midcentury-mustard text-white' : 'bg-midcentury-cream hover:bg-midcentury-mustard hover:text-white'}`}
                    onClick={() => onViewModeChange('list')}
                    aria-label="List view"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="5" width="16" height="3" />
                        <rect x="4" y="10.5" width="16" height="3" />
                        <rect x="4" y="16" width="16" height="3" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default CollectionControls;
