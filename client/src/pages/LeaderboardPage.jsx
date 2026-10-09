import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import { Trophy, Medal, Award, Flame, Zap, Target, Users } from 'lucide-react';
import CarIcon from '../components/CarIcon';

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [sortBy, setSortBy] = useState('best_wpm');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaderboard() {
            setLoading(true);
            try {
                const res = await axios.get(`${API_URL}/stats/leaderboard?sortBy=${sortBy}`);
                if (res.data.success) {
                    setLeaderboard(res.data.leaderboard);
                }
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchLeaderboard();
    }, [sortBy]);

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
                <div>
                    <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-amber-400" />
                        Papan Peringkat Global
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Peringkat para juru ketik tercepat di arena TypeRacer
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                    <button
                        onClick={() => setSortBy('best_wpm')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            sortBy === 'best_wpm'
                                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        WPM Tertinggi
                    </button>
                    <button
                        onClick={() => setSortBy('total_wins')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            sortBy === 'total_wins'
                                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Total Menang
                    </button>
                    <button
                        onClick={() => setSortBy('total_races')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            sortBy === 'total_races'
                                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Paling Aktif
                    </button>
                </div>
            </div>

            {/* Leaderboard Table Card */}
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-md">
                {loading ? (
                    <div className="text-center py-16 text-xs text-slate-500">
                        Memuat data peringkat...
                    </div>
                ) : leaderboard.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-slate-300">Belum Ada Catatan Balapan</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Selesaikan balapan multiplayer untuk mencatatkan rekor pertamamu!
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                                <tr>
                                    <th className="py-4 px-6">Rank</th>
                                    <th className="py-4 px-6">Pembalap</th>
                                    <th className="py-4 px-6 text-right font-mono">Best WPM</th>
                                    <th className="py-4 px-6 text-right font-mono">Avg WPM</th>
                                    <th className="py-4 px-6 text-right font-mono">Akurasi</th>
                                    <th className="py-4 px-6 text-right font-mono">Balapan / Menang</th>
                                    <th className="py-4 px-6 text-right font-mono">Win Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 font-sans">
                                {leaderboard.map((player, index) => {
                                    const rank = index + 1;
                                    let rankColor = 'text-slate-400';
                                    let rankBg = 'bg-slate-800';

                                    if (rank === 1) {
                                        rankColor = 'text-amber-400';
                                        rankBg = 'bg-amber-400/20 border border-amber-400/30';
                                    } else if (rank === 2) {
                                        rankColor = 'text-slate-200';
                                        rankBg = 'bg-slate-300/20 border border-slate-300/30';
                                    } else if (rank === 3) {
                                        rankColor = 'text-amber-600';
                                        rankBg = 'bg-amber-700/20 border border-amber-700/30';
                                    }

                                    return (
                                        <tr key={player.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="py-4 px-6">
                                                <span className={`w-8 h-8 rounded-xl font-bold font-mono text-xs flex items-center justify-center ${rankColor} ${rankBg}`}>
                                                    #{rank}
                                                </span>
                                            </td>

                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <CarIcon type={player.avatar || 'car-red'} className="w-8 h-4" />
                                                    <span className="font-bold text-white text-sm">
                                                        {player.username}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="py-4 px-6 text-right font-mono font-extrabold text-sky-400 text-base">
                                                {Math.round(player.best_wpm)}
                                            </td>

                                            <td className="py-4 px-6 text-right font-mono text-slate-300">
                                                {Math.round(player.avg_wpm)}
                                            </td>

                                            <td className="py-4 px-6 text-right font-mono text-emerald-400">
                                                {Math.round(player.avg_accuracy)}%
                                            </td>

                                            <td className="py-4 px-6 text-right font-mono text-slate-400">
                                                <span className="text-slate-200 font-semibold">{player.total_races}</span> / <span className="text-amber-400 font-semibold">{player.total_wins}</span>
                                            </td>

                                            <td className="py-4 px-6 text-right font-mono font-bold text-amber-400">
                                                {player.win_rate}%
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
