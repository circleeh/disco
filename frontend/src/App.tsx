import React, { useState } from 'react';
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
        // Do not render a duplicate login message; Header handles login UI
        return null;
    }

    console.log('✅ User authenticated, rendering protected content');
    return <>{children}</>;
}

function App() {
    console.log('🚀 App component rendering');

    // Add Record modal state
    const [showAdd, setShowAdd] = useState(false);

    return (
        <div className="min-h-screen bg-midcentury-cream text-midcentury-charcoal font-sans">
            <Header onAddRecordClick={() => setShowAdd(true)} />
            <main className="py-8">
                <div className="px-4 sm:px-6 lg:px-8 rounded-lg shadow-lg bg-white/80 border border-midcentury-walnut">
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <VinylCollection showAdd={showAdd} setShowAdd={setShowAdd} />
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
