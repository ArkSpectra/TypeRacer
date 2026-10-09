import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, Trophy, User, LogIn, LogOut, Keyboard, Gamepad2, Shield } from 'lucide-react';
import CarIcon from './CarIcon';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Brand Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
                        <Flame className="w-5 h-5 text-white animate-pulse" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-extrabold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-200 to-white font-mono">
                            TYPE<span className="text-sky-400">RACER</span>
                        </span>
                        <span className="text-[10px] text-slate-400 tracking-widest uppercase font-semibold">
                            Multiplayer Arena
                        </span>
                    </div>
                </Link>

                {/* Nav Links */}
                <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800/60">
                    <Link
                        to="/lobby"
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                            isActive('/lobby')
                                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                        }`}
                    >
                        <Gamepad2 className="w-4 h-4" />
                        Multiplayer Lobby
                    </Link>

                    <Link
                        to="/practice"
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                            isActive('/practice')
                                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                        }`}
                    >
                        <Keyboard className="w-4 h-4" />
                        Latihan Solo
                    </Link>

                    <Link
                        to="/leaderboard"
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                            isActive('/leaderboard')
                                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                        }`}
                    >
                        <Trophy className="w-4 h-4 text-amber-400" />
                        Leaderboard
                    </Link>
                </nav>

                {/* User Status / Auth Buttons */}
                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <Link
                                to="/profile"
                                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors"
                            >
                                <CarIcon type={user?.avatar || 'car-red'} className="w-7 h-4" />
                                <div className="flex flex-col text-left">
                                    <span className="text-xs font-semibold text-white">{user?.username}</span>
                                    <span className="text-[10px] text-sky-400 font-mono font-medium">
                                        Best: {user?.bestWpm || 0} WPM
                                    </span>
                                </div>
                            </Link>

                            <button
                                onClick={logout}
                                title="Logout"
                                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                to="/login"
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                            >
                                <LogIn className="w-4 h-4" />
                                Masuk
                            </Link>
                            <Link
                                to="/register"
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/25 transition-all"
                            >
                                Daftar
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
