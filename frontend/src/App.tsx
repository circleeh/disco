import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import { useAuth } from './stores/AuthContext';
import VinylCollection from './pages/VinylCollection';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    console.log('🔒 ProtectedRoute check:', { user: !!user, loading });

    if (loading) {
        console.log('⏳ Loading authentication state...');
        return <div className="text-center py-8">Loading...</div>;
    }

    if (!user) {
        console.log('❌ No user found, showing login message');
        return <div className="text-center py-8">Please log in to access this page.</div>;
    }

    console.log('✅ User authenticated, rendering protected content');
    return <>{children}</>;
}

function App() {
    console.log('🚀 App component rendering');

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="py-8">
                <div className="px-4 sm:px-6 lg:px-8">
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <VinylCollection />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
}

export default App;
