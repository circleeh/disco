import React from 'react';
import { useAuth } from '../../stores/AuthContext';

interface HeaderProps {
    onAddRecordClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddRecordClick }) => {
    const { user, loading, login, logout } = useAuth();

    return (
        <header className="bg-midcentury-cream border-b border-midcentury-walnut">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold text-midcentury-charcoal" style={{ fontFamily: 'Avenir, sans-serif' }}>Disco</h1>
                        <span className="ml-2 text-sm text-midcentury-olive">Vinyl Collection</span>
                    </div>

                    {/* Add Record Button - only show if logged in */}
                    {user && (
                        <button
                            className="flex items-center px-4 py-2 bg-midcentury-mustard text-white rounded-lg hover:bg-midcentury-burntOrange transition-colors font-semibold shadow-sm"
                            onClick={onAddRecordClick}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path>
                            </svg>
                            Add Record
                        </button>
                    )}

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        {loading ? (
                            <span className="text-sm text-midcentury-charcoal">Loading...</span>
                        ) : user ? (
                            <div className="flex items-center space-x-3">
                                {user.picture && (
                                    <img
                                        src={user.picture}
                                        alt={user.name}
                                        className="w-8 h-8 rounded-full"
                                    />
                                )}
                                <span className="text-sm font-medium text-midcentury-charcoal">{user.name}</span>
                                <button
                                    onClick={logout}
                                    className="text-sm text-midcentury-burntOrange hover:text-midcentury-charcoal"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={login}
                                className="px-4 py-2 border border-midcentury-walnut bg-white text-midcentury-charcoal rounded-lg hover:bg-midcentury-mustard hover:text-white transition-colors font-semibold shadow-sm"
                            >
                                Login with Google
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
