import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Zap, Target, Clock, CheckCircle } from 'lucide-react';

export default function TypingEngine({
    text = '',
    source = '',
    disabled = false,
    startTime = null,
    onProgress = () => {},
    onFinish = () => {}
}) {
    const [userInput, setUserInput] = useState('');
    const [wpm, setWpm] = useState(0);
    const [cpm, setCpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [hasStarted, setHasStarted] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const inputRef = useRef(null);
    const raceStartTimeRef = useRef(null);
    const timerIntervalRef = useRef(null);

    // Auto-focus when enabled
    useEffect(() => {
        if (!disabled && inputRef.current) {
            inputRef.current.focus();
        }
    }, [disabled]);

    // Handle external start time (from multiplayer countdown)
    useEffect(() => {
        if (startTime && !disabled) {
            raceStartTimeRef.current = startTime;
            setHasStarted(true);
        }
    }, [startTime, disabled]);

    // Reset state when text changes
    useEffect(() => {
        setUserInput('');
        setWpm(0);
        setCpm(0);
        setAccuracy(100);
        setIsCompleted(false);
        setHasStarted(false);
        raceStartTimeRef.current = null;
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }, [text]);

    // Live telemetry interval (updates WPM continuously)
    useEffect(() => {
        if (hasStarted && !isCompleted) {
            timerIntervalRef.current = setInterval(() => {
                calculateStats(userInput);
            }, 500);
        }
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, [hasStarted, isCompleted, userInput]);

    const calculateStats = (inputStr) => {
        if (!raceStartTimeRef.current || inputStr.length === 0) return;

        const timeElapsedSeconds = Math.max((Date.now() - raceStartTimeRef.current) / 1000, 0.5);
        const timeElapsedMinutes = timeElapsedSeconds / 60;

        let correctChars = 0;
        let totalTyped = inputStr.length;

        for (let i = 0; i < inputStr.length; i++) {
            if (i < text.length && inputStr[i] === text[i]) {
                correctChars++;
            }
        }

        // Standard WPM formula: (correct characters / 5) / minutes
        const currentWpm = Math.round((correctChars / 5) / timeElapsedMinutes) || 0;
        const currentCpm = Math.round(correctChars / timeElapsedMinutes) || 0;
        const currentAcc = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;
        const progress = Math.min(Math.round((inputStr.length / text.length) * 100), 100);

        setWpm(currentWpm);
        setCpm(currentCpm);
        setAccuracy(currentAcc);

        onProgress(progress, currentWpm, currentAcc);

        // Check if finished
        if (inputStr.length >= text.length && !isCompleted) {
            setIsCompleted(true);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            onFinish({
                wpm: currentWpm,
                cpm: currentCpm,
                accuracy: currentAcc,
                timeSeconds: timeElapsedSeconds.toFixed(2)
            });
        }
    };

    const handleInputChange = (e) => {
        if (disabled || isCompleted) return;

        const val = e.target.value;

        // If typing started without external timer (e.g. solo practice mode)
        if (!hasStarted) {
            raceStartTimeRef.current = Date.now();
            setHasStarted(true);
        }

        // Mode Santai: Allow user to type freely up to max length of text
        if (val.length <= text.length) {
            setUserInput(val);
            calculateStats(val);
        }
    };

    const handleContainerClick = () => {
        if (!disabled && inputRef.current) {
            inputRef.current.focus();
        }
    };

    // Render characters with rich feedback
    const renderTextDisplay = () => {
        const chars = text.split('');
        return (
            <div
                onClick={handleContainerClick}
                className="font-mono text-lg md:text-xl leading-relaxed tracking-wide select-none p-6 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner min-h-[140px] cursor-text transition-all"
            >
                {chars.map((char, index) => {
                    let charClass = 'text-slate-500'; // Default untyped
                    const userChar = userInput[index];

                    if (index < userInput.length) {
                        if (userChar === char) {
                            charClass = 'text-emerald-400 font-semibold bg-emerald-500/10 rounded-sm';
                        } else {
                            // Incorrect character in Mode Santai
                            charClass = 'text-rose-400 bg-rose-500/30 underline decoration-rose-500 decoration-2 rounded-sm';
                        }
                    }

                    const isCursor = index === userInput.length;

                    return (
                        <span key={index} className={`relative ${charClass}`}>
                            {isCursor && !disabled && (
                                <span className="absolute -left-[1px] top-0 bottom-0 w-[2px] bg-sky-400 animate-pulse-fast shadow-[0_0_8px_#38bdf8]" />
                            )}
                            {char}
                        </span>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="w-full space-y-4">
            {/* Live Stats Bar */}
            <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                        <Zap className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Speed</div>
                        <div className="text-xl font-bold font-mono text-sky-400">
                            {wpm} <span className="text-xs text-slate-400 font-sans font-normal">WPM</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                        <Target className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Akurasi</div>
                        <div className="text-xl font-bold font-mono text-emerald-400">
                            {accuracy}<span className="text-xs font-sans font-normal">%</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Karakter</div>
                        <div className="text-xl font-bold font-mono text-indigo-300">
                            {userInput.length} / {text.length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Target Text Display */}
            {renderTextDisplay()}

            {source && (
                <div className="text-right text-xs text-slate-500 italic pr-2">
                    — {source}
                </div>
            )}

            {/* Hidden / Transparent Real Input */}
            <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                disabled={disabled || isCompleted}
                autoFocus
                placeholder={disabled ? "Tunggu hitung mundur..." : "Ketik di sini atau klik teks di atas..."}
                className="w-full px-5 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-white font-mono text-base outline-none transition-all placeholder:text-slate-600 disabled:opacity-50"
            />
        </div>
    );
}
