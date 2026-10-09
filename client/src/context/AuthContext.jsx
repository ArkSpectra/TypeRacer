import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('typeracer_token') || null);
    const [loading, setLoading] = useState(true);

    // Setup axios authorization header
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }

    // Load logged in user on mount
    useEffect(() => {
        async function fetchUser() {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get(`${API_URL}/auth/me`);
                if (res.data.success) {
                    setUser(res.data.user);
                }
            } catch (err) {
                console.error('Session expired or invalid token');
                logout();
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, [token]);

    const login = async (identifier, password) => {
        const res = await axios.post(`${API_URL}/auth/login`, { identifier, password });
        if (res.data.success) {
            localStorage.setItem('typeracer_token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user);
            return res.data;
        }
        throw new Error(res.data.message || 'Login gagal');
    };

    const register = async (username, email, password, avatar) => {
        const res = await axios.post(`${API_URL}/auth/register`, { username, email, password, avatar });
        if (res.data.success) {
            localStorage.setItem('typeracer_token', res.data.token);
            setToken(res.data.token);
            setUser(res.data.user);
            return res.data;
        }
        throw new Error(res.data.message || 'Registrasi gagal');
    };

    const logout = () => {
        localStorage.removeItem('typeracer_token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    const updateAvatar = async (avatar) => {
        const res = await axios.put(`${API_URL}/auth/avatar`, { avatar });
        if (res.data.success) {
            setUser(prev => prev ? { ...prev, avatar } : prev);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateAvatar, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
