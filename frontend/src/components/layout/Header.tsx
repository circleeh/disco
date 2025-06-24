import React from 'react';
import { useAuth } from '../../stores/AuthContext';

const Header: React.FC = () => {
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
                                className="px-4 py-2 bg-midcentury-mustard text-white rounded-lg hover:bg-midcentury-burntOrange transition-colors"
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
