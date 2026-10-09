import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, AlertCircle, ArrowRight, Check } from 'lucide-react';
import CarIcon, { AVAILABLE_CARS } from '../components/CarIcon';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('car-red');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            setError('Password minimal 6 karakter');
            return;
        }
        setLoading(true);
        try {
            await register(username, email, password, selectedAvatar);
            navigate('/lobby');
        } catch (err) {
            setError(err.message || 'Registrasi gagal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-8">
            <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
                {/* Header */}
                <div className="text-center mb-6 relative">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/10">
                        <UserPlus className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-white">Buat Akun Pembalap</h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Daftar gratis dan bersaing di puncak leaderboard
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
                            Username
                        </label>
                        <div className="relative">
                            <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                required
                                minLength={3}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Contoh: SpeedDemon"
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nama@email.com"
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
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Minimal 6 karakter"
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    {/* Choose Car Avatar */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                            Pilih Mobil Perdana
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {AVAILABLE_CARS.map((car) => {
                                const isSelected = selectedAvatar === car.id;
                                return (
                                    <button
                                        type="button"
                                        key={car.id}
                                        onClick={() => setSelectedAvatar(car.id)}
                                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all relative ${
                                            isSelected
                                                ? 'border-sky-400 bg-sky-500/10 ring-2 ring-sky-400/40 shadow-lg'
                                                : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                                        }`}
                                    >
                                        <CarIcon type={car.id} className="w-10 h-5" />
                                        <span className="text-[10px] text-slate-400 truncate w-full text-center font-medium">
                                            {car.name.split(' ')[0]}
                                        </span>
                                        {isSelected && (
                                            <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-sky-400 text-black flex items-center justify-center">
                                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Mendaftarkan...' : 'Daftar Akun'}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                <div className="text-center mt-6 text-xs text-slate-400">
                    Sudah punya akun?{' '}
                    <Link to="/login" className="font-semibold text-sky-400 hover:text-sky-300 underline underline-offset-4">
                        Masuk di sini
                    </Link>
                </div>
            </div>
        </div>
    );
}
