import React from 'react';
import CarIcon from './CarIcon';
import { Trophy, CheckCircle, Flame } from 'lucide-react';

export default function RaceTrack({ players = [], currentSocketId = null }) {
    // Sort players so current user appears first or in order
    const sortedPlayers = [...players].sort((a, b) => {
        if (a.socketId === currentSocketId) return -1;
        if (b.socketId === currentSocketId) return 1;
        return (b.progress || 0) - (a.progress || 0);
    });

    return (
        <div className="w-full bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-2xl relative overflow-hidden backdrop-blur-md">
            {/* Track Header */}
            <div className="flex items-center justify-between mb-3 px-2">
                <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Lintasan Balap Real-Time ({players.length} Pemain)
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    LIVE TELEMETRY
                </div>
            </div>

            {/* Racing Lanes */}
            <div className="space-y-3">
                {sortedPlayers.map((player, index) => {
                    const isMe = player.socketId === currentSocketId;
                    const progress = Math.min(Math.max(player.progress || 0, 0), 100);
                    const isWinner = player.rank === 1;

                    return (
                        <div
                            key={player.socketId || index}
                            className={`relative rounded-xl p-3 border transition-all ${
                                isMe
                                    ? 'bg-sky-950/40 border-sky-500/50 shadow-lg shadow-sky-500/10'
                                    : 'bg-slate-950/60 border-slate-800/80'
                            }`}
                        >
                            {/* Lane Info Header */}
                            <div className="flex items-center justify-between mb-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`font-semibold px-2 py-0.5 rounded-md ${
                                            isMe
                                                ? 'bg-sky-500 text-white font-bold'
                                                : 'bg-slate-800 text-slate-300'
                                        }`}
                                    >
                                        {player.username} {isMe && '(Kamu)'}
                                    </span>
                                    {player.rank && (
                                        <span className="flex items-center gap-1 font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                                            <Trophy className="w-3 h-3" />
                                            Juara #{player.rank}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 font-mono">
                                    <span className="text-slate-400">
                                        WPM: <strong className="text-sky-400 font-bold">{Math.round(player.wpm || 0)}</strong>
                                    </span>
                                    <span className="text-slate-400">
                                        Akurasi: <strong className="text-emerald-400 font-bold">{Math.round(player.accuracy || 100)}%</strong>
                                    </span>
                                    <span className="text-slate-500 font-semibold">
                                        {Math.round(progress)}%
                                    </span>
                                </div>
                            </div>

                            {/* Road Canvas */}
                            <div className="relative h-12 bg-slate-900 rounded-lg border border-slate-800/80 overflow-hidden flex items-center px-4 track-pattern">
                                {/* Asphalt centerline */}
                                <div className="absolute top-1/2 left-0 right-0 h-[2px] border-b border-dashed border-slate-700/60 -translate-y-1/2" />

                                {/* Finish Line */}
                                <div className="absolute right-0 top-0 bottom-0 w-8 finish-line-pattern opacity-80 border-l-2 border-white shadow-lg flex items-center justify-center">
                                    <span className="text-[9px] font-extrabold text-black bg-white/90 px-1 py-0.5 rounded font-mono shadow">
                                        FINISH
                                    </span>
                                </div>

                                {/* Moving Car & Trail Container */}
                                <div
                                    className="absolute left-3 transition-all duration-300 ease-out flex items-center z-10"
                                    style={{
                                        // 0% -> 0px offset, 100% -> calc(100% - 90px)
                                        width: `calc(100% - 70px)`,
                                        transform: `translateX(${progress * 0.9}%)`,
                                    }}
                                >
                                    <div className="relative group">
                                        <CarIcon
                                            type={player.avatar || 'car-red'}
                                            className={`w-14 h-7 ${isMe ? 'scale-110 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]' : ''}`}
                                        />

                                        {/* Speed bubble above car */}
                                        {player.wpm > 0 && (
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-sky-300 border border-sky-500/30 text-[10px] font-mono px-1.5 py-0.2 rounded whitespace-nowrap shadow">
                                                {Math.round(player.wpm)} WPM
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
