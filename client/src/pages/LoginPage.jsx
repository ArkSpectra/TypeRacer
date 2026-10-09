import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(identifier, password);
            navigate('/lobby');
        } catch (err) {
            setError(err.message || 'Login gagal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
                {/* Glow Header */}
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

                <div className="text-center mb-8 relative">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-sky-500/10">
                        <LogIn className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-white">Selamat Datang Kembali</h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Masuk untuk menyimpan riwayat balapan & statistik WPM
                    </p>
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-3.5 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                            Username / Email
                        </label>
                        <div className="relative">
                            <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                required
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder="Masukkan username atau email"
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Masukkan password"
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Memproses...' : 'Masuk Sekarang'}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                <div className="text-center mt-6 text-xs text-slate-400">
                    Belum punya akun?{' '}
                    <Link to="/register" className="font-semibold text-sky-400 hover:text-sky-300 underline underline-offset-4">
                        Daftar di sini
                    </Link>
                </div>
            </div>
        </div>
    );
}
