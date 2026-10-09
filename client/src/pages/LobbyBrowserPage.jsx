import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Users, Lock, Unlock, RefreshCw, KeyRound, ArrowRight, Play, AlertCircle, Sparkles } from 'lucide-react';
import CarIcon from '../components/CarIcon';

export default function LobbyBrowserPage() {
    const { roomsList, createRoom, joinRoom, currentRoom, joinError, refreshRooms, setJoinError } = useSocket();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Modal state for creating room
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [pin, setPin] = useState('');
    const [maxPlayers, setMaxPlayers] = useState(6);
    const [language, setLanguage] = useState('id');
    const [difficulty, setDifficulty] = useState('medium');

    // Direct PIN join state
    const [directCode, setDirectCode] = useState('');
    const [directPin, setDirectPin] = useState('');
    const [selectedPrivateRoom, setSelectedPrivateRoom] = useState(null);
    const [privateInputPin, setPrivateInputPin] = useState('');

    useEffect(() => {
        refreshRooms();
    }, []);

    // Redirect to race room if joined
    useEffect(() => {
        if (currentRoom) {
            navigate(`/race/${currentRoom.code}`);
        }
    }, [currentRoom, navigate]);

    const handleCreateRoom = (e) => {
        e.preventDefault();
        createRoom({
            name: roomName.trim() || `Lobby ${user?.username || 'Pembalap'}`,
            isPrivate,
            pin: isPrivate ? pin.trim() : '',
            maxPlayers: parseInt(maxPlayers, 10),
            language,
            difficulty
        });
        setShowCreateModal(false);
    };

    const handleJoinClick = (room) => {
        if (room.isPrivate) {
            setSelectedPrivateRoom(room);
        } else {
            joinRoom(room.code);
        }
    };

    const handleJoinPrivateSubmit = (e) => {
        e.preventDefault();
        if (selectedPrivateRoom) {
            joinRoom(selectedPrivateRoom.code, privateInputPin);
            setSelectedPrivateRoom(null);
            setPrivateInputPin('');
        }
    };

    const handleDirectCodeSubmit = (e) => {
        e.preventDefault();
        if (!directCode.trim()) return;
        joinRoom(directCode.trim().toUpperCase(), directPin.trim());
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header & Quick Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                        <Users className="w-8 h-8 text-sky-400" />
                        Multiplayer Lobby
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Pilih lobby yang tersedia, gabung menggunakan kode room, atau buat arena balapanmu sendiri!
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={refreshRooms}
                        title="Segarkan Daftar Room"
                        className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-sky-500/25 transition-all hover:scale-105"
                    >
                        <Plus className="w-5 h-5 stroke-[2.5]" />
                        Buat Lobby Baru
                    </button>
                </div>
            </div>

            {/* Error banner */}
            {joinError && (
                <div className="flex items-center justify-between p-4 mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        <span>{joinError}</span>
                    </div>
                    <button onClick={() => setJoinError(null)} className="text-xs hover:underline">
                        Tutup
                    </button>
                </div>
            )}

            {/* Direct Join via Room Code Card */}
            <div className="mb-8 p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                <form onSubmit={handleDirectCodeSubmit} className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex-1 w-full flex items-center gap-2 bg-slate-950 px-4 py-3 rounded-2xl border border-slate-700/60">
                        <KeyRound className="w-4 h-4 text-sky-400" />
                        <input
                            type="text"
                            value={directCode}
                            onChange={(e) => setDirectCode(e.target.value.toUpperCase())}
                            placeholder="Punya Kode Room? (Contoh: ABC123)"
                            maxLength={6}
                            className="bg-transparent text-white font-mono text-sm w-full outline-none uppercase placeholder:normal-case placeholder:text-slate-500"
                        />
                    </div>
                    <div className="w-full sm:w-48 flex items-center gap-2 bg-slate-950 px-4 py-3 rounded-2xl border border-slate-700/60">
                        <Lock className="w-4 h-4 text-slate-500" />
                        <input
                            type="password"
                            value={directPin}
                            onChange={(e) => setDirectPin(e.target.value)}
                            placeholder="PIN (Jika privat)"
                            maxLength={8}
                            className="bg-transparent text-white text-sm w-full outline-none placeholder:text-slate-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-md shadow-sky-500/20 transition-all"
                    >
                        Gabung Kode
                    </button>
                </form>
            </div>

            {/* Public Rooms List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                    <span>Daftar Room Publik ({roomsList.length})</span>
                    <span>Status</span>
                </div>

                {roomsList.length === 0 ? (
                    <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/30 border border-slate-800/60">
                        <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-slate-300">Belum Ada Lobby Aktif</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            Jadilah yang pertama membuat lobby dan ajak teman-temanmu bertanding!
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-4 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all"
                        >
                            Buat Room Sekarang
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {roomsList.map((room) => {
                            const isFull = room.playerCount >= room.maxPlayers;
                            const isRacing = room.status === 'racing' || room.status === 'countdown';

                            return (
                                <div
                                    key={room.code}
                                    className="p-5 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/50 transition-all shadow-xl flex flex-col justify-between group"
                                >
                                    <div>
                                        {/* Room Top Badges */}
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-mono font-bold text-xs bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-sky-400">
                                                #{room.code}
                                            </span>

                                            <div className="flex items-center gap-2">
                                                {isRacing ? (
                                                    <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20 animate-pulse">
                                                        Sedang Balapan
                                                    </span>
                                                ) : isFull ? (
                                                    <span className="text-[11px] font-bold text-rose-400 bg-rose-400/10 px-2.5 py-0.5 rounded-full border border-rose-400/20">
                                                        Penuh
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/20">
                                                        Menunggu
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Room Name & Host */}
                                        <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors truncate">
                                            {room.name}
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Host: <span className="text-slate-300 font-semibold">{room.hostName}</span>
                                        </p>

                                        {/* Meta badges */}
                                        <div className="flex items-center gap-2 mt-4 text-[11px] font-medium">
                                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                                {room.language === 'id' ? '🇮🇩 Indonesia' : '🇬🇧 English'}
                                            </span>
                                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize">
                                                {room.difficulty}
                                            </span>
                                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {room.playerCount}/{room.maxPlayers}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="mt-5 pt-4 border-t border-slate-800/80">
                                        <button
                                            onClick={() => handleJoinClick(room)}
                                            disabled={isFull || isRacing}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-sky-500 text-slate-200 hover:text-white font-bold text-xs transition-all disabled:opacity-40 disabled:pointer-events-none"
                                        >
                                            <Play className="w-3.5 h-3.5 fill-current" />
                                            Masuk Room
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal: Create Room */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
                        <h2 className="text-xl font-extrabold text-white mb-1">Buat Lobby Balapan Baru</h2>
                        <p className="text-xs text-slate-400 mb-6">Atur preferensi arena dan undang temanmu</p>

                        <form onSubmit={handleCreateRoom} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                    Nama Lobby
                                </label>
                                <input
                                    type="text"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    placeholder={`Lobby ${user?.username || 'Pembalap'}`}
                                    maxLength={30}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                        Bahasa Teks
                                    </label>
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
                                    >
                                        <option value="id">🇮🇩 Bahasa Indonesia</option>
                                        <option value="en">🇬🇧 English</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                        Maks Pemain
                                    </label>
                                    <select
                                        value={maxPlayers}
                                        onChange={(e) => setMaxPlayers(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
                                    >
                                        <option value={2}>2 Pemain (1 vs 1)</option>
                                        <option value={4}>4 Pemain</option>
                                        <option value={8}>8 Pemain</option>
                                        <option value={12}>12 Pemain</option>
                                        <option value={20}>20 Pemain</option>
                                        <option value={30}>30 Pemain</option>
                                        <option value={40}>40 Pemain (Mega Race)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Private Room Toggle */}
                            <div className="pt-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isPrivate}
                                        onChange={(e) => setIsPrivate(e.target.checked)}
                                        className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 bg-slate-950 border-slate-700"
                                    />
                                    <span className="text-xs font-semibold text-slate-300">
                                        Kamar Privat (Memerlukan PIN untuk masuk)
                                    </span>
                                </label>

                                {isPrivate && (
                                    <div className="mt-3">
                                        <input
                                            type="password"
                                            required={isPrivate}
                                            value={pin}
                                            onChange={(e) => setPin(e.target.value)}
                                            placeholder="Buat 4-6 digit PIN"
                                            maxLength={8}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-lg shadow-sky-500/25"
                                >
                                    Buat Room
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Private Room PIN Entry */}
            {selectedPrivateRoom && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                            <Lock className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Masukkan PIN Room</h3>
                        <p className="text-xs text-slate-400 mt-1 mb-4">
                            Room <strong>#{selectedPrivateRoom.code}</strong> dikunci dengan PIN privat.
                        </p>

                        <form onSubmit={handleJoinPrivateSubmit} className="space-y-4">
                            <input
                                type="password"
                                required
                                autoFocus
                                value={privateInputPin}
                                onChange={(e) => setPrivateInputPin(e.target.value)}
                                placeholder="Masukkan PIN"
                                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500 text-center tracking-widest text-lg"
                            />

                            <div className="flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedPrivateRoom(null)}
                                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-md shadow-sky-500/20"
                                >
                                    Masuk
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
