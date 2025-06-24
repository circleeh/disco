import React from 'react';
import { useAuth } from '../../stores/AuthContext';

const Header: React.FC = () => {
    const { user, loading, login, logout } = useAuth();

    return (
        <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold text-gray-900">Disco</h1>
                        <span className="ml-2 text-sm text-gray-600">Vinyl Collection</span>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        {loading ? (
                            <span className="text-sm text-gray-500">Loading...</span>
                        ) : user ? (
                            <div className="flex items-center space-x-3">
                                {user.picture && (
                                    <img
                                        src={user.picture}
                                        alt={user.name}
                                        className="w-8 h-8 rounded-full"
                                    />
                                )}
                                <span className="text-sm font-medium text-gray-900">{user.name}</span>
                                <button
                                    onClick={logout}
                                    className="text-sm text-gray-600 hover:text-gray-900"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={login}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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
