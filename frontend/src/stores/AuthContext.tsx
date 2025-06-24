import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthContextType, UserProfile } from '../types/auth';
import axios from 'axios';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Handle OAuth callback parameters
    const handleOAuthCallback = useCallback(() => {
        console.log('🔍 Checking for OAuth callback parameters...');
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const userData = urlParams.get('user');
        const success = urlParams.get('success');
        const error = urlParams.get('error');

        console.log('📋 URL Parameters:', { token: !!token, userData: !!userData, success, error });

        if (error) {
            console.error('❌ OAuth error:', error);
            setUser(null);
            setLoading(false);
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
        }

        if (success === 'true' && token && userData) {
            try {
                console.log('✅ Processing successful OAuth callback...');
                const user = JSON.parse(decodeURIComponent(userData));
                console.log('👤 User data:', user);

                // Store token in localStorage
                localStorage.setItem('auth_token', token);
                console.log('💾 Token stored in localStorage');

                // Set axios default authorization header
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                console.log('🔑 Authorization header set');

                setUser(user);
                setLoading(false);
                console.log('✅ Authentication state updated');

                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname);
                console.log('🧹 URL cleaned up');
            } catch (error) {
                console.error('❌ Error parsing user data:', error);
                setUser(null);
                setLoading(false);
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } else {
            console.log('🔍 No OAuth callback, checking for existing token...');
            // No OAuth callback, check for existing token
            const existingToken = localStorage.getItem('auth_token');
            if (existingToken) {
                console.log('🔑 Found existing token, setting up axios...');
                axios.defaults.headers.common['Authorization'] = `Bearer ${existingToken}`;
                fetchUser();
            } else {
                console.log('❌ No existing token found');
                setLoading(false);
            }
        }
    }, []);

    // Fetch user profile from backend
    const fetchUser = useCallback(async () => {
        console.log('🔄 Fetching user profile...');
        setLoading(true);
        try {
            const res = await axios.get('/api/auth/me', { withCredentials: true });
            console.log('✅ User profile fetched:', res.data);
            setUser(res.data.data || res.data);
        } catch (error) {
            console.error('❌ Error fetching user profile:', error);
            setUser(null);
            // Clear invalid token
            localStorage.removeItem('auth_token');
            delete axios.defaults.headers.common['Authorization'];
        } finally {
            setLoading(false);
        }
    }, []);

    // Google OAuth2 login
    const login = () => {
        console.log('🚀 Initiating Google OAuth login...');
        window.location.href = '/api/auth/google';
    };

    // Logout
    const logout = async () => {
        console.log('🚪 Logging out...');
        try {
            await axios.get('/api/auth/logout', { withCredentials: true });
        } catch (error) {
            console.error('❌ Logout error:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('auth_token');
            delete axios.defaults.headers.common['Authorization'];
            console.log('✅ Logout completed');
        }
    };

    useEffect(() => {
        console.log('🚀 AuthProvider mounted, handling OAuth callback...');
        handleOAuthCallback();
    }, [handleOAuthCallback]);

    console.log('🔍 Current auth state:', { user: !!user, loading });

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
