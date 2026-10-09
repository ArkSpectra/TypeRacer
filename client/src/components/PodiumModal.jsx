import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Medal, RotateCcw, LogOut, Award, Flame, CheckCircle2 } from 'lucide-react';
import CarIcon from './CarIcon';

export default function PodiumModal({
    results = [],
    currentSocketId = null,
    isHost = false,
    onRematch = () => {},
    onLeave = () => {}
}) {
    useEffect(() => {
        // Trigger celebratory confetti
        const end = Date.now() + 2.5 * 1000;
        const colors = ['#38bdf8', '#fbbf24', '#34d399', '#f43f5e'];

        (function frame() {
            confetti({
                particleCount: 4,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 4,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }, []);

    const winner = results[0];
    const isMeWinner = winner && winner.socketId === currentSocketId;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                {/* Glow background accent */}
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

                {/* Header Banner */}
                <div className="text-center mb-6 relative">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3 shadow-lg shadow-amber-500/10">
                        <Trophy className="w-8 h-8 animate-bounce-short" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-sky-400">
                        {isMeWinner ? "🏆 Kamu Juara 1! Selamat!" : "🏁 Balapan Selesai!"}
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Berikut adalah rekapitulasi waktu & kecepatan para pembalap
                    </p>
                </div>

                {/* Podium Cards / Results Table */}
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 mb-6">
                    {results.map((player, index) => {
                        const rank = index + 1;
                        const isMe = player.socketId === currentSocketId;

                        let rankBadgeClass = 'bg-slate-800 text-slate-400';
                        let borderClass = 'border-slate-800';

                        if (rank === 1) {
                            rankBadgeClass = 'bg-amber-400/20 text-amber-400 border border-amber-400/30';
                            borderClass = 'border-amber-500/40 bg-amber-500/5';
                        } else if (rank === 2) {
                            rankBadgeClass = 'bg-slate-300/20 text-slate-200 border border-slate-300/30';
                            borderClass = 'border-slate-500/30';
                        } else if (rank === 3) {
                            rankBadgeClass = 'bg-amber-700/20 text-amber-600 border border-amber-700/30';
                            borderClass = 'border-amber-700/30';
                        }

                        return (
                            <div
                                key={player.socketId || index}
                                className={`flex items-center justify-between p-3.5 rounded-2xl border ${borderClass} ${
                                    isMe ? 'ring-2 ring-sky-500/50 bg-sky-950/30' : 'bg-slate-950/50'
                                } transition-all`}
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center font-mono text-sm ${rankBadgeClass}`}>
                                        #{rank}
                                    </div>
                                    <CarIcon type={player.avatar || 'car-red'} className="w-10 h-5" />
                                    <div>
                                        <div className="text-sm font-bold text-white flex items-center gap-2">
                                            {player.username}
                                            {isMe && (
                                                <span className="text-[10px] bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded">
                                                    Kamu
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            Waktu: <span className="text-slate-200 font-mono font-medium">{player.finishTime || '0.00'}s</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-right font-mono">
                                    <div>
                                        <div className="text-xs text-slate-400 uppercase text-[10px]">Speed</div>
                                        <div className="text-base font-extrabold text-sky-400">
                                            {Math.round(player.wpm || 0)} <span className="text-xs font-sans text-slate-400">WPM</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-400 uppercase text-[10px]">Akurasi</div>
                                        <div className="text-base font-extrabold text-emerald-400">
                                            {Math.round(player.accuracy || 100)}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center gap-3 justify-end pt-2 border-t border-slate-800">
                    <button
                        onClick={onLeave}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-sm transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Keluar ke Lobby
                    </button>

                    {isHost ? (
                        <button
                            onClick={onRematch}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Main Lagi (Rematch)
                        </button>
                    ) : (
                        <div className="text-xs text-slate-500 font-medium px-2 italic">
                            Menunggu Host untuk main lagi...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
