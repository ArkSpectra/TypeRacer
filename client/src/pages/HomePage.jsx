import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, Gamepad2, Keyboard, Trophy, ShieldCheck, Zap, Users, ArrowRight } from 'lucide-react';
import CarIcon from '../components/CarIcon';

export default function HomePage() {
    const { isAuthenticated, user } = useAuth();

    return (
        <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            {/* Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-4xl w-full text-center space-y-8 relative z-10">
                {/* Hero Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-xl backdrop-blur-md">
                    <span className="flex h-2 w-2 rounded-full bg-sky-400 animate-ping" />
                    <span className="text-xs font-semibold text-slate-300">
                        ⚡ Real-time Multiplayer Typing Race
                    </span>
                </div>

                {/* Main Heading */}
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
                    ADU KECEPATAN KETIK <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-amber-300">
                        DI LINTASAN BALAP
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed">
                    Tantang temanmu secara langsung, buat room privat atau gabung ke lobby publik. Uji WPM dan akurasimu dengan mode santai modern.
                </p>

                {/* Animated Racing Showcase */}
                <div className="max-w-xl mx-auto p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-md">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2 px-2">
                        <span>LINTASAN DEMO</span>
                        <span className="text-emerald-400">120 WPM</span>
                    </div>
                    <div className="relative h-12 bg-slate-950 rounded-xl border border-slate-800 flex items-center px-4 overflow-hidden track-pattern">
                        <div className="absolute right-0 top-0 bottom-0 w-6 finish-line-pattern opacity-70" />
                        <div className="flex items-center gap-4 animate-pulse">
                            <CarIcon type="car-red" className="w-12 h-6" />
                            <CarIcon type="car-blue" className="w-12 h-6 ml-12" />
                            <CarIcon type="car-emerald" className="w-12 h-6 ml-8" />
                        </div>
                    </div>
                </div>

                {/* Primary CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Link
                        to="/lobby"
                        className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-base shadow-xl shadow-sky-500/25 transition-all hover:scale-105 active:scale-95"
                    >
                        <Gamepad2 className="w-5 h-5" />
                        Masuk Multiplayer Lobby
                        <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                        to="/practice"
                        className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white font-bold text-base transition-all hover:scale-105"
                    >
                        <Keyboard className="w-5 h-5 text-sky-400" />
                        Mode Latihan Solo
                    </Link>
                </div>

                {/* Feature Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 text-left">
                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-3">
                            <Users className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-white text-sm mb-1">Room Privat & Publik</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Buat lobby dengan kode PIN khusus untuk teman-temanmu atau gabung ke room publik kapan saja.
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                            <Zap className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-white text-sm mb-1">Mode Santai Modern</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Ketik tanpa hambatan! Kesalahan karakter tidak mengunci input, menjaga alur kecepatan ketikanmu.
                        </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                            <Trophy className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-white text-sm mb-1">Global Leaderboard</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Raih WPM tertinggi, menangkan balapan, dan ukir namamu di peringkat teratas papan skor global.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
