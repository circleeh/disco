import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import VinylCollection from './pages/VinylCollection';

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
                                <VinylCollection showAdd={showAdd} setShowAdd={setShowAdd} />
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
