import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
import { User, Trophy, Zap, Target, Award, Calendar, Check, Flame, History } from 'lucide-react';
import CarIcon, { AVAILABLE_CARS } from '../components/CarIcon';

export default function ProfilePage() {
    const { user, updateAvatar } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCar, setSelectedCar] = useState(user?.avatar || 'car-red');
    const [savedMsg, setSavedMsg] = useState(false);

    useEffect(() => {
        if (user) {
            setSelectedCar(user.avatar || 'car-red');
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/stats/user/${user.id}`);
            if (res.data.success) {
                setStats(res.data.stats);
            }
        } catch (err) {
            console.error('Error fetching user stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCarSave = async (carId) => {
        setSelectedCar(carId);
        try {
            await updateAvatar(carId);
            setSavedMsg(true);
            setTimeout(() => setSavedMsg(false), 2000);
        } catch (err) {
            console.error('Error updating avatar:', err);
        }
    };

    if (!user) {
        return (
            <div className="text-center py-20">
                <p className="text-sm text-slate-400">Silakan login untuk melihat profil Anda.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header User Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="p-4 rounded-3xl bg-sky-500/10 border border-sky-500/20 shadow-xl">
                        <CarIcon type={selectedCar} className="w-16 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white">{user.username}</h1>
                        <p className="text-xs text-slate-400 mt-1">{user.email}</p>
                        <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Bergabung sejak: {new Date(user.createdAt || Date.now()).toLocaleDateString('id-ID')}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Rekor Terbaik</div>
                        <div className="text-3xl font-black font-mono text-sky-400">{Math.round(user.bestWpm || 0)} <span className="text-xs font-sans font-normal text-slate-400">WPM</span></div>
                    </div>
                </div>
            </div>

            {/* Career Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
                    <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Total Balapan</div>
                    <div className="text-2xl font-black font-mono text-white">{user.totalRaces || 0}</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
                    <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Total Menang</div>
                    <div className="text-2xl font-black font-mono text-amber-400">{user.totalWins || 0}</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
                    <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Rata-rata WPM</div>
                    <div className="text-2xl font-black font-mono text-sky-400">{Math.round(user.avgWpm || 0)}</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
                    <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Rata-rata Akurasi</div>
                    <div className="text-2xl font-black font-mono text-emerald-400">{Math.round(user.avgAccuracy || 0)}%</div>
                </div>
            </div>

            {/* Garage / Car Customizer */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Flame className="w-5 h-5 text-sky-400" />
                            Garasi Mobil Balap
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Pilih warna mobil balap yang akan ditampilkan saat kamu bertanding
                        </p>
                    </div>
                    {savedMsg && (
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20 animate-fade-in">
                            Tersimpan!
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {AVAILABLE_CARS.map((car) => {
                        const isSelected = selectedCar === car.id;
                        return (
                            <button
                                key={car.id}
                                onClick={() => handleCarSave(car.id)}
                                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all relative ${
                                    isSelected
                                        ? 'border-sky-400 bg-sky-500/10 ring-2 ring-sky-400/30'
                                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                                }`}
                            >
                                <CarIcon type={car.id} className="w-14 h-7" />
                                <span className="text-xs font-semibold text-slate-300">{car.name}</span>
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-sky-400 text-black flex items-center justify-center">
                                        <Check className="w-3 h-3 stroke-[3]" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Match History Table */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-sky-400" />
                    Riwayat Balapan Terakhir
                </h2>

                {loading ? (
                    <div className="text-center py-8 text-xs text-slate-500">Memuat riwayat...</div>
                ) : !stats?.history || stats.history.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500">
                        Belum ada riwayat balapan yang tercatat.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-950/80 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                                <tr>
                                    <th className="py-3 px-4">Room</th>
                                    <th className="py-3 px-4 text-center">Posisi</th>
                                    <th className="py-3 px-4 text-right font-mono">WPM</th>
                                    <th className="py-3 px-4 text-right font-mono">Akurasi</th>
                                    <th className="py-3 px-4 text-right font-mono">Waktu</th>
                                    <th className="py-3 px-4 text-right">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {stats.history.map((h) => (
                                    <tr key={h.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="py-3 px-4 font-semibold text-white">{h.room_name}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span
                                                className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                                                    h.rank_position === 1
                                                        ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                                                        : 'bg-slate-800 text-slate-300'
                                                }`}
                                            >
                                                #{h.rank_position}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono font-bold text-sky-400">
                                            {Math.round(h.wpm)}
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono text-emerald-400">
                                            {Math.round(h.accuracy)}%
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono text-slate-300">
                                            {h.time_taken_seconds}s
                                        </td>
                                        <td className="py-3 px-4 text-right text-xs text-slate-500">
                                            {new Date(h.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
