import React from 'react';

const CAR_COLORS = {
    'car-red': { body: '#ef4444', spoiler: '#b91c1c', light: '#fecaca', name: 'Crimson Fury' },
    'car-blue': { body: '#3b82f6', spoiler: '#1d4ed8', light: '#bfdbfe', name: 'Azure Bolt' },
    'car-emerald': { body: '#10b981', spoiler: '#047857', light: '#a7f3d0', name: 'Emerald Viper' },
    'car-yellow': { body: '#eab308', spoiler: '#a16207', light: '#fef08a', name: 'Golden Thunder' },
    'car-purple': { body: '#a855f7', spoiler: '#7e22ce', light: '#e9d5ff', name: 'Shadow Phantom' },
    'car-pink': { body: '#ec4899', spoiler: '#be185d', light: '#fbcfe8', name: 'Neon Lotus' },
    'car-cyan': { body: '#06b6d4', spoiler: '#0e7490', light: '#a5f3fc', name: 'Cyber Wave' },
    'car-orange': { body: '#f97316', spoiler: '#c2410c', light: '#fed7aa', name: 'Blaze Runner' },
};

export const AVAILABLE_CARS = Object.keys(CAR_COLORS).map(key => ({
    id: key,
    ...CAR_COLORS[key]
}));

export default function CarIcon({ type = 'car-red', className = "w-12 h-6" }) {
    const config = CAR_COLORS[type] || CAR_COLORS['car-red'];

    return (
        <svg
            viewBox="0 0 100 45"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${className} drop-shadow-md transition-transform duration-200`}
        >
            {/* Spoiler */}
            <path d="M5 14H18L14 20H8L5 14Z" fill={config.spoiler} />
            <path d="M12 20V26H16V20H12Z" fill="#334155" />

            {/* Car Body Base */}
            <path
                d="M10 24C10 24 22 24 30 15C36 8 58 8 68 15C76 21 88 23 94 25C97 26 98 28 98 31C98 34 96 35 92 35H12C9 35 8 33 8 30C8 26 10 24 10 24Z"
                fill={config.body}
            />

            {/* Cabin / Windows */}
            <path
                d="M33 16C36 10 48 10 65 16L63 23H30L33 16Z"
                fill="#0f172a"
                stroke="#38bdf8"
                strokeWidth="1.5"
            />
            {/* Window Glass Glare */}
            <path d="M42 12L38 21H48L52 12H42Z" fill="#38bdf8" fillOpacity="0.3" />

            {/* Headlight */}
            <path d="M92 27L97 29L92 31V27Z" fill={config.light} className="animate-pulse" />
            <circle cx="94" cy="29" r="2" fill="#fff" />

            {/* Rear Tail Light */}
            <rect x="8" y="26" width="3" height="5" rx="1" fill="#ef4444" />

            {/* Front Wheel */}
            <circle cx="76" cy="35" r="9" fill="#090d16" stroke="#475569" strokeWidth="2.5" />
            <circle cx="76" cy="35" r="4" fill="#94a3b8" />
            <circle cx="76" cy="35" r="1.5" fill="#0f172a" />

            {/* Rear Wheel */}
            <circle cx="25" cy="35" r="9" fill="#090d16" stroke="#475569" strokeWidth="2.5" />
            <circle cx="25" cy="35" r="4" fill="#94a3b8" />
            <circle cx="25" cy="35" r="1.5" fill="#0f172a" />

            {/* Racing Decal Stripes */}
            <path d="M48 24H58L55 27H45L48 24Z" fill="#ffffff" fillOpacity="0.7" />
        </svg>
    );
}
