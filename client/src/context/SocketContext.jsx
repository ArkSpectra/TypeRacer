import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SOCKET_URL } from '../config/api';

const SocketContext = createContext();

export function SocketProvider({ children }) {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [roomsList, setRoomsList] = useState([]);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [countdown, setCountdown] = useState(null);
    const [raceResults, setRaceResults] = useState(null);
    const [joinError, setJoinError] = useState(null);

    useEffect(() => {
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 10,
            reconnectionDelay: 1000
        });

        newSocket.on('connect', () => {
            console.log('⚡ Connected to TypeRacer Socket Server');
            setConnected(true);
            newSocket.emit('get_rooms');
        });

        newSocket.on('disconnect', () => {
            console.log('🔌 Disconnected from Socket Server');
            setConnected(false);
        });

        newSocket.on('rooms_list', (list) => {
            setRoomsList(list);
        });

        newSocket.on('room_created', ({ code, room }) => {
            setCurrentRoom(room);
            setJoinError(null);
        });

        newSocket.on('join_success', ({ code, room }) => {
            setCurrentRoom(room);
            setJoinError(null);
        });

        newSocket.on('join_error', (data) => {
            setJoinError(data.message);
        });

        newSocket.on('room_updated', (room) => {
            setCurrentRoom(room);
        });

        newSocket.on('countdown_tick', ({ count }) => {
            setCountdown(count);
            setRaceResults(null);
        });

        newSocket.on('race_started', ({ startTime, text }) => {
            setCountdown(0); // 0 means GO!
            setTimeout(() => setCountdown(null), 1000);
        });

        newSocket.on('player_progress', ({ socketId, progress, wpm, accuracy }) => {
            setCurrentRoom(prev => {
                if (!prev) return prev;
                const updatedPlayers = prev.players.map(p => {
                    if (p.socketId === socketId) {
                        return { ...p, progress, wpm, accuracy };
                    }
                    return p;
                });
                return { ...prev, players: updatedPlayers };
            });
        });

        newSocket.on('player_finished', (data) => {
            setCurrentRoom(prev => {
                if (!prev) return prev;
                const updatedPlayers = prev.players.map(p => {
                    if (p.socketId === data.socketId) {
                        return {
                            ...p,
                            hasFinished: true,
                            rank: data.rank,
                            wpm: data.wpm,
                            accuracy: data.accuracy,
                            finishTime: data.finishTime,
                            progress: 100
                        };
                    }
                    return p;
                });
                return { ...prev, players: updatedPlayers };
            });
        });

        newSocket.on('race_finished', ({ results }) => {
            setRaceResults(results);
        });

        newSocket.on('new_chat', (chat) => {
            setCurrentRoom(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    chatMessages: [...(prev.chatMessages || []), chat]
                };
            });
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    // Helper methods
    const createRoom = (roomConfig) => {
        if (socket) {
            setJoinError(null);
            socket.emit('create_room', { ...roomConfig, user });
        }
    };

    const joinRoom = (code, pin = '') => {
        if (socket) {
            setJoinError(null);
            socket.emit('join_room', { code, pin, user });
        }
    };

    const leaveRoom = () => {
        if (socket && currentRoom) {
            socket.emit('leave_room');
            setCurrentRoom(null);
            setCountdown(null);
            setRaceResults(null);
        }
    };

    const toggleReady = () => {
        if (socket && currentRoom) {
            socket.emit('toggle_ready');
        }
    };

    const startRace = () => {
        if (socket && currentRoom) {
            socket.emit('start_race');
        }
    };

    const updateProgress = (progress, wpm, accuracy) => {
        if (socket && currentRoom) {
            // Update local player state in currentRoom immediately
            setCurrentRoom(prev => {
                if (!prev) return prev;
                const updatedPlayers = prev.players.map(p => {
                    if (p.socketId === socket.id) {
                        return { ...p, progress, wpm, accuracy };
                    }
                    return p;
                });
                return { ...prev, players: updatedPlayers };
            });

            socket.emit('update_progress', { progress, wpm, accuracy });
        }
    };

    const resetRace = () => {
        if (socket && currentRoom) {
            socket.emit('reset_race');
            setRaceResults(null);
        }
    };

    const sendChat = (message) => {
        if (socket && currentRoom) {
            socket.emit('send_chat', message);
        }
    };

    const refreshRooms = () => {
        if (socket) {
            socket.emit('get_rooms');
        }
    };

    const changeAvatar = (avatar) => {
        if (socket && currentRoom) {
            socket.emit('change_avatar', avatar);
        }
    };

    return (
        <SocketContext.Provider value={{
            socket,
            connected,
            roomsList,
            currentRoom,
            countdown,
            raceResults,
            joinError,
            createRoom,
            joinRoom,
            leaveRoom,
            toggleReady,
            startRace,
            updateProgress,
            resetRace,
            sendChat,
            refreshRooms,
            changeAvatar,
            setJoinError
        }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}
