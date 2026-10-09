import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TypingEngine from '../components/TypingEngine';
import RaceTrack from '../components/RaceTrack';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
import { RotateCcw, Keyboard, Trophy, Zap, Target, Award, Sparkles } from 'lucide-react';

export default function PracticePage() {
    const { user } = useAuth();
    const [textData, setTextData] = useState(null);
    const [language, setLanguage] = useState('id');
    const [difficulty, setDifficulty] = useState('medium');
    const [loading, setLoading] = useState(true);

    // Solo test progress
    const [myProgress, setMyProgress] = useState(0);
    const [myWpm, setMyWpm] = useState(0);
    const [myAcc, setMyAcc] = useState(100);

    // AI Bot simulation
    const [botProgress, setBotProgress] = useState(0);
    const [botWpm, setBotWpm] = useState(65);
    const [finishedResult, setFinishedResult] = useState(null);

    const fetchText = async () => {
        setLoading(true);
        setFinishedResult(null);
        setMyProgress(0);
        setMyWpm(0);
        setMyAcc(100);
        setBotProgress(0);

        try {
            const res = await axios.get(`${API_URL}/texts/random?language=${language}&difficulty=${difficulty}`);
            if (res.data.success) {
                setTextData(res.data.text);
            }
        } catch (err) {
            setTextData({
                content: 'Keberhasilan bukanlah akhir, kegagalan bukanlah kehancuran fatal: keberanian untuk terus melanjutkan yang paling berharga.',
                source: 'Winston Churchill',
                language: 'id',
                difficulty: 'easy'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchText();
    }, [language, difficulty]);

    // Simulate AI Ghost Bot progressing
    useEffect(() => {
        let botInterval;
        if (myProgress > 0 && myProgress < 100 && !finishedResult) {
            const botTargetSpeed = difficulty === 'easy' ? 45 : difficulty === 'medium' ? 70 : 95;
            setBotWpm(botTargetSpeed);
            botInterval = setInterval(() => {
                setBotProgress(prev => {
                    const next = prev + (botTargetSpeed / 12);
                    return next >= 100 ? 100 : next;
                });
            }, 500);
        }
        return () => clearInterval(botInterval);
    }, [myProgress, finishedResult, difficulty]);

    const handleFinish = (result) => {
        setFinishedResult(result);
    };

    const dummyPlayers = [
        {
            socketId: 'me',
            username: user?.username || 'Kamu',
            avatar: user?.avatar || 'car-red',
            progress: myProgress,
            wpm: myWpm,
            accuracy: myAcc,
            rank: finishedResult ? (myProgress >= 100 && myProgress >= botProgress ? 1 : 2) : null
        },
        {
            socketId: 'bot-1',
            username: '🏎️ AI Ghost Bot',
            avatar: 'car-cyan',
            progress: botProgress,
            wpm: botWpm,
            accuracy: 98,
            rank: botProgress >= 100 ? (botProgress > myProgress ? 1 : 2) : null
        }
    ];

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header & Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
                <div>
                    <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
                        <Keyboard className="w-7 h-7 text-sky-400" />
                        Latihan Solo & Uji Kecepatan
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Asah jarimu dengan bertanding melawan AI Ghost Bot sebelum bertarung di Multiplayer!
                    </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                    >
                        <option value="id">🇮🇩 Bahasa Indonesia</option>
                        <option value="en">🇬🇧 English</option>
                    </select>

                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-500"
                    >
                        <option value="easy">Mudah</option>
                        <option value="medium">Sedang</option>
                        <option value="hard">Sulit</option>
                    </select>

                    <button
                        onClick={fetchText}
                        title="Teks Baru"
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Race Track */}
            <RaceTrack players={dummyPlayers} currentSocketId="me" />

            {/* Typing Arena */}
            {!loading && textData && (
                <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
                    <TypingEngine
                        text={textData.content}
                        source={textData.source}
                        disabled={false}
                        onProgress={(prog, wpm, acc) => {
                            setMyProgress(prog);
                            setMyWpm(wpm);
                            setMyAcc(acc);
                        }}
                        onFinish={handleFinish}
                    />
                </div>
            )}

            {/* Solo Finished Result Card */}
            {finishedResult && (
                <div className="p-6 rounded-3xl bg-slate-900 border border-sky-500/40 shadow-2xl animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Award className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Latihan Selesai!</h3>
                            <p className="text-xs text-slate-400">
                                Waktu tempuh: <strong className="text-slate-200">{finishedResult.timeSeconds} detik</strong>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 font-mono">
                        <div>
                            <div className="text-[10px] text-slate-400 uppercase">Speed</div>
                            <div className="text-xl font-black text-sky-400">{finishedResult.wpm} WPM</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-slate-400 uppercase">Akurasi</div>
                            <div className="text-xl font-black text-emerald-400">{finishedResult.accuracy}%</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-slate-400 uppercase">CPM</div>
                            <div className="text-xl font-black text-indigo-400">{finishedResult.cpm}</div>
                        </div>
                    </div>

                    <button
                        onClick={fetchText}
                        className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all"
                    >
                        Coba Teks Lain
                    </button>
                </div>
            )}
        </div>
    );
}
