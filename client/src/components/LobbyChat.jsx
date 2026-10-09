import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import CarIcon from './CarIcon';

export default function LobbyChat({ messages = [], onSendMessage = () => {} }) {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        onSendMessage(input.trim());
        setInput('');
    };

    return (
        <div className="flex flex-col h-full bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            {/* Chat Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-950/40">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Lobby Chat
                </span>
            </div>

            {/* Messages Log */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[160px] max-h-[260px]">
                {messages.length === 0 ? (
                    <div className="text-xs text-center text-slate-500 py-6">
                        Belum ada pesan. Mulai obrolan dengan pemain lain!
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div key={msg.id || index} className="flex items-start gap-2.5 text-xs">
                            <CarIcon type={msg.avatar || 'car-red'} className="w-6 h-3 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 bg-slate-950/60 rounded-xl px-3 py-2 border border-slate-800/80">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="font-bold text-sky-400">{msg.sender}</span>
                                    <span className="text-[10px] text-slate-500 font-mono">{msg.time}</span>
                                </div>
                                <p className="text-slate-200 leading-relaxed break-words">{msg.text}</p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSubmit} className="p-3 bg-slate-950/80 border-t border-slate-800 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Tulis pesan..."
                    maxLength={150}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button
                    type="submit"
                    className="p-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white transition-all shadow-md shadow-sky-500/20"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}
