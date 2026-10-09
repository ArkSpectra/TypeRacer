import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LobbyBrowserPage from './pages/LobbyBrowserPage';
import RaceRoomPage from './pages/RaceRoomPage';
import PracticePage from './pages/PracticePage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <BrowserRouter>
                    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
                        <Navbar />
                        <main className="flex-1">
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/register" element={<RegisterPage />} />
                                <Route path="/lobby" element={<LobbyBrowserPage />} />
                                <Route path="/race/:code" element={<RaceRoomPage />} />
                                <Route path="/practice" element={<PracticePage />} />
                                <Route path="/leaderboard" element={<LeaderboardPage />} />
                                <Route path="/profile" element={<ProfilePage />} />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </main>
                        <footer className="py-6 border-t border-slate-900 text-center text-xs text-slate-500">
                            TypeRacer Multiplayer &copy; {new Date().getFullYear()} — Adu Kecepatan Ketik Real-Time
                        </footer>
                    </div>
                </BrowserRouter>
            </SocketProvider>
        </AuthProvider>
    );
}
