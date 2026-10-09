import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import RaceTrack from '../components/RaceTrack';
import TypingEngine from '../components/TypingEngine';
import PodiumModal from '../components/PodiumModal';
import LobbyChat from '../components/LobbyChat';
import CarIcon, { AVAILABLE_CARS } from '../components/CarIcon';
import { Copy, Check, Crown, Play, LogOut, ShieldCheck, Flame, Users, Sparkles, CheckCircle2 } from 'lucide-react';

export default function RaceRoomPage() {
    const { code } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        socket,
        currentRoom,
        countdown,
        raceResults,
        leaveRoom,
        toggleReady,
        startRace,
        updateProgress,
        resetRace,
        sendChat,
        changeAvatar
    } = useSocket();

    const [copied, setCopied] = useState(false);
    const [selectedCar, setSelectedCar] = useState(user?.avatar || 'car-red');

    // If no room is active in socket, redirect back to lobby
    useEffect(() => {
        if (!currentRoom) {
            navigate('/lobby');
        }
    }, [currentRoom, navigate]);

    if (!currentRoom) {
        return null;
    }

    const isHost = currentRoom.hostId === socket?.id;
    const myPlayer = currentRoom.players.find(p => p.socketId === socket?.id);
    const isReady = myPlayer?.isReady || false;
    const isRacing = currentRoom.status === 'racing';
    const isCountdown = currentRoom.status === 'countdown';
    const isWaiting = currentRoom.status === 'waiting';

    const handleCopyCode = () => {
        navigator.clipboard.writeText(currentRoom.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCarSelect = (carId) => {
        setSelectedCar(carId);
        changeAvatar(carId);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
            {/* Top Bar: Room Header Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl mb-6 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        <Flame className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-extrabold text-white">{currentRoom.name}</h1>
                            {currentRoom.isPrivate && (
                                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-semibold">
                                    Privat
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-medium">
                            <span>Host: <strong className="text-slate-200">{currentRoom.hostName}</strong></span>
                            <span>•</span>
                            <span>{currentRoom.language === 'id' ? '🇮🇩 Bahasa Indonesia' : '🇬🇧 English'}</span>
                            <span>•</span>
                            <span>{currentRoom.players.length} / {currentRoom.maxPlayers} Pemain</span>
                        </div>
                    </div>
                </div>

                {/* Room Code Badge + Actions */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800">
                        <span className="text-xs text-slate-500 uppercase font-semibold">Kode:</span>
                        <span className="font-mono font-black text-sm text-sky-400 tracking-wider">
                            {currentRoom.code}
                        </span>
                        <button
                            onClick={handleCopyCode}
                            title="Salin Kode Room"
                            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>

                    <button
                        onClick={leaveRoom}
                        title="Keluar Room"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Keluar
                    </button>
                </div>
            </div>

            {/* Countdown Fullscreen Overlay */}
            {isCountdown && countdown !== null && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in pointer-events-none">
                    <div className="text-center">
                        <div className="text-8xl sm:text-9xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-br from-sky-400 via-amber-300 to-rose-500 animate-bounce">
                            {countdown === 0 ? 'GO!' : countdown}
                        </div>
                        <p className="text-lg font-bold text-slate-300 mt-4 tracking-widest uppercase font-mono">
                            Bersiap di garis start!
                        </p>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT AREA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left/Middle Column: Race Track & Typing Arena */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Realtime Race Track (Always Visible) */}
                    <RaceTrack players={currentRoom.players} currentSocketId={socket?.id} />

                    {/* Typing Arena (Active during Racing or Countdown) */}
                    {(isRacing || isCountdown) && (
                        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
                            <TypingEngine
                                text={currentRoom.text?.content || ''}
                                source={currentRoom.text?.source || ''}
                                disabled={!isRacing}
                                startTime={currentRoom.startTime}
                                onProgress={(progress, wpm, accuracy) => {
                                    updateProgress(progress, wpm, accuracy);
                                }}
                            />
                        </div>
                    )}

                    {/* Waiting Lobby View */}
                    {isWaiting && (
                        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md space-y-6">
                            {/* Players In Lobby Grid */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-sky-400" />
                                    Daftar Pemain di Room ({currentRoom.players.length}/{currentRoom.maxPlayers})
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {currentRoom.players.map((p) => {
                                        const isThisMe = p.socketId === socket?.id;
                                        return (
                                            <div
                                                key={p.socketId}
                                                className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                                                    isThisMe
                                                        ? 'bg-sky-950/30 border-sky-500/40 ring-1 ring-sky-500/20'
                                                        : 'bg-slate-950/60 border-slate-800'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <CarIcon type={p.avatar || 'car-red'} className="w-10 h-5" />
                                                    <div>
                                                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                                                            {p.username}
                                                            {p.isHost && (
                                                                <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" title="Host" />
                                                            )}
                                                            {isThisMe && (
                                                                <span className="text-[10px] text-sky-400 font-mono">(Kamu)</span>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-slate-500">
                                                            {p.isHost ? 'Room Master' : 'Challenger'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div>
                                                    {p.isReady ? (
                                                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            Ready
                                                        </span>
                                                    ) : (
                                                        <span className="text-[11px] font-medium text-slate-500 bg-slate-800/80 px-2.5 py-1 rounded-xl">
                                                            Menunggu
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Choose Car Color in Waiting Room */}
                            <div className="pt-4 border-t border-slate-800">
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                    Ganti Warna Mobil Balap
                                </label>
                                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                                    {AVAILABLE_CARS.map((car) => (
                                        <button
                                            key={car.id}
                                            onClick={() => handleCarSelect(car.id)}
                                            className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                                                selectedCar === car.id
                                                    ? 'border-sky-400 bg-sky-500/15 ring-2 ring-sky-400/30'
                                                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                                            }`}
                                        >
                                            <CarIcon type={car.id} className="w-9 h-4.5" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Lobby Control Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
                                <div className="text-xs text-slate-400">
                                    {isHost
                                        ? "Sebagai Host, tekan 'Mulai Balapan' saat semua pemain siap!"
                                        : "Tekan tombol 'Siap (Ready)' untuk memberi tahu Host!"}
                                </div>

                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={toggleReady}
                                        className={`flex-1 sm:flex-initial px-6 py-3 rounded-2xl text-xs font-bold transition-all shadow-lg ${
                                            isReady
                                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                                : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                                        }`}
                                    >
                                        {isReady ? 'Batal Siap' : 'Siap (Ready)'}
                                    </button>

                                    {isHost && (
                                        <button
                                            onClick={startRace}
                                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-sky-500/25 transition-all hover:scale-105 active:scale-95"
                                        >
                                            <Play className="w-4 h-4 fill-current" />
                                            Mulai Balapan!
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: In-game & Lobby Chat Panel */}
                <div className="lg:col-span-1">
                    <LobbyChat
                        messages={currentRoom.chatMessages || []}
                        onSendMessage={(msg) => sendChat(msg)}
                    />
                </div>
            </div>

            {/* Results & Podium Modal */}
            {raceResults && (
                <PodiumModal
                    results={raceResults}
                    currentSocketId={socket?.id}
                    isHost={isHost}
                    onRematch={resetRace}
                    onLeave={leaveRoom}
                />
            )}
        </div>
    );
}
