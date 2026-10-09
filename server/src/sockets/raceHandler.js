import { query } from '../config/db.js';
import { getRandomText } from '../controllers/textController.js';

// In-memory active rooms store
const rooms = new Map();

// Helper to generate a random 6-character room code
function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Fetch a random text snippet for the race
async function fetchRaceText(language = 'id', difficulty = 'medium') {
    try {
        let sql = 'SELECT * FROM typing_texts WHERE 1=1';
        const params = [];
        if (language && language !== 'all') {
            sql += ' AND language = ?';
            params.push(language);
        }
        if (difficulty && difficulty !== 'all') {
            sql += ' AND difficulty = ?';
            params.push(difficulty);
        }
        sql += ' ORDER BY RAND() LIMIT 1';

        const rows = await query(sql, params);
        if (rows && rows.length > 0) {
            return rows[0];
        }
    } catch (err) {
        console.warn('Could not query database for text, using default text.');
    }

    // Default fallback text
    return {
        id: 1,
        content: 'Keberhasilan bukanlah akhir, kegagalan bukanlah kehancuran fatal: keberanian untuk terus melanjutkan yang paling berharga.',
        source: 'Winston Churchill',
        language: 'id',
        difficulty: 'easy'
    };
}

// Get public summary of rooms for the lobby browser
function getPublicRoomsList() {
    const list = [];
    for (const [code, room] of rooms.entries()) {
        if (!room.isPrivate) {
            list.push({
                code: room.code,
                name: room.name,
                status: room.status,
                playerCount: room.players.size,
                maxPlayers: room.maxPlayers,
                language: room.language,
                difficulty: room.difficulty,
                hostName: room.hostName
            });
        }
    }
    return list;
}

// Save completed race data into MySQL database
async function saveRaceResults(room) {
    try {
        const raceId = room.code;
        const winner = Array.from(room.players.values()).find(p => p.rank === 1);
        const winnerUserId = winner && winner.userId ? winner.userId : null;
        const textId = room.text && room.text.id ? room.text.id : null;
        const totalPlayers = room.players.size;

        // 1. Insert into races table
        await query(
            `INSERT INTO races (id, room_name, text_id, winner_id, total_players) VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE winner_id = VALUES(winner_id), total_players = VALUES(total_players)`,
            [raceId, room.name, textId, winnerUserId, totalPlayers]
        );

        // 2. Insert into race_participants & update user stats
        for (const player of room.players.values()) {
            if (player.userId) {
                // Record participant
                await query(
                    `INSERT INTO race_participants (race_id, user_id, rank_position, wpm, accuracy, time_taken_seconds)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [raceId, player.userId, player.rank || totalPlayers, player.wpm || 0, player.accuracy || 0, player.finishTime || 0]
                );

                // Update aggregate stats for registered users
                const isWinner = player.rank === 1;
                await query(
                    `UPDATE users 
                     SET total_races = total_races + 1,
                         total_wins = total_wins + ?,
                         best_wpm = GREATEST(best_wpm, ?),
                         avg_wpm = ROUND((avg_wpm * total_races + ?) / (total_races + 1), 1),
                         avg_accuracy = ROUND((avg_accuracy * total_races + ?) / (total_races + 1), 1)
                     WHERE id = ?`,
                    [isWinner ? 1 : 0, player.wpm || 0, player.wpm || 0, player.accuracy || 0, player.userId]
                );
            }
        }
        console.log(`[Race] Results saved to database for room ${room.code}`);
    } catch (err) {
        console.error('Error saving race results to DB:', err.message);
    }
}

export function setupRaceSocket(io) {
    io.on('connection', (socket) => {
        console.log(`⚡ [Socket Connected] ${socket.id}`);

        // Send current public rooms list on request
        socket.on('get_rooms', () => {
            socket.emit('rooms_list', getPublicRoomsList());
        });

        // 1. Create a Room
        socket.on('create_room', async (data) => {
            const { name, isPrivate, pin, maxPlayers = 6, language = 'id', difficulty = 'medium', user } = data;

            let code = generateRoomCode();
            while (rooms.has(code)) {
                code = generateRoomCode();
            }

            const initialText = await fetchRaceText(language, difficulty);

            const room = {
                code,
                name: name || `Lobby ${code}`,
                isPrivate: Boolean(isPrivate),
                pin: pin || '',
                maxPlayers: Math.min(Math.max(parseInt(maxPlayers, 10) || 6, 2), 50),
                language,
                difficulty,
                status: 'waiting', // waiting | countdown | racing | finished
                hostId: socket.id,
                hostName: user?.username || 'Guest Host',
                text: initialText,
                startTime: null,
                countdownTimer: null,
                players: new Map(),
                chatMessages: []
            };

            // Add host as first player
            const hostPlayer = {
                socketId: socket.id,
                userId: user?.id || null,
                username: user?.username || `Pembalap_${socket.id.substring(0, 4)}`,
                avatar: user?.avatar || 'car-red',
                isHost: true,
                isReady: true,
                progress: 0,
                wpm: 0,
                accuracy: 100,
                hasFinished: false,
                finishTime: 0,
                rank: null
            };

            room.players.set(socket.id, hostPlayer);
            rooms.set(code, room);

            socket.join(code);
            socket.currentRoom = code;

            socket.emit('room_created', {
                code,
                room: serializeRoom(room)
            });

            io.emit('rooms_list', getPublicRoomsList());
            console.log(`Room created: ${code} by ${hostPlayer.username}`);
        });

        // 2. Join an existing Room
        socket.on('join_room', (data) => {
            const { code, pin, user } = data;
            const roomCode = (code || '').toUpperCase().trim();
            const room = rooms.get(roomCode);

            if (!room) {
                return socket.emit('join_error', { message: 'Room tidak ditemukan' });
            }

            if (room.isPrivate && room.pin && room.pin !== pin) {
                return socket.emit('join_error', { message: 'PIN Room salah' });
            }

            if (room.players.size >= room.maxPlayers) {
                return socket.emit('join_error', { message: 'Room sudah penuh' });
            }

            if (room.status === 'racing') {
                return socket.emit('join_error', { message: 'Balapan sedang berlangsung' });
            }

            // Add player
            const player = {
                socketId: socket.id,
                userId: user?.id || null,
                username: user?.username || `Pembalap_${socket.id.substring(0, 4)}`,
                avatar: user?.avatar || 'car-blue',
                isHost: false,
                isReady: false,
                progress: 0,
                wpm: 0,
                accuracy: 100,
                hasFinished: false,
                finishTime: 0,
                rank: null
            };

            room.players.set(socket.id, player);
            socket.join(roomCode);
            socket.currentRoom = roomCode;

            // Notify everyone in the room
            io.to(roomCode).emit('room_updated', serializeRoom(room));
            io.emit('rooms_list', getPublicRoomsList());

            socket.emit('join_success', { code: roomCode, room: serializeRoom(room) });
            console.log(`Player ${player.username} joined room ${roomCode}`);
        });

        // 3. Toggle Ready Status
        socket.on('toggle_ready', () => {
            const roomCode = socket.currentRoom;
            if (!roomCode) return;
            const room = rooms.get(roomCode);
            if (!room || room.status !== 'waiting') return;

            const player = room.players.get(socket.id);
            if (player) {
                player.isReady = !player.isReady;
                io.to(roomCode).emit('room_updated', serializeRoom(room));
            }
        });

        // 4. Change Car Color / Avatar
        socket.on('change_avatar', (avatar) => {
            const roomCode = socket.currentRoom;
            if (!roomCode) return;
            const room = rooms.get(roomCode);
            if (!room) return;

            const player = room.players.get(socket.id);
            if (player) {
                player.avatar = avatar;
                io.to(roomCode).emit('room_updated', serializeRoom(room));
            }
        });

        // 5. Host Starts Race
        socket.on('start_race', async () => {
            const roomCode = socket.currentRoom;
            if (!roomCode) return;
            const room = rooms.get(roomCode);
            if (!room || room.hostId !== socket.id || room.status !== 'waiting') return;

            // Fetch fresh text for this match
            room.text = await fetchRaceText(room.language, room.difficulty);
            room.status = 'countdown';

            // Reset all players race progress
            for (const player of room.players.values()) {
                player.progress = 0;
                player.wpm = 0;
                player.accuracy = 100;
                player.hasFinished = false;
                player.finishTime = 0;
                player.rank = null;
            }

            io.to(roomCode).emit('room_updated', serializeRoom(room));

            // 5 second countdown
            let count = 5;
            io.to(roomCode).emit('countdown_tick', { count });

            const countdownInterval = setInterval(() => {
                count--;
                if (count > 0) {
                    io.to(roomCode).emit('countdown_tick', { count });
                } else {
                    clearInterval(countdownInterval);
                    room.status = 'racing';
                    room.startTime = Date.now();
                    io.to(roomCode).emit('race_started', {
                        startTime: room.startTime,
                        text: room.text
                    });
                    io.to(roomCode).emit('room_updated', serializeRoom(room));
                    io.emit('rooms_list', getPublicRoomsList());
                }
            }, 1000);
        });

        // 6. Typing Progress Update
        socket.on('update_progress', (data) => {
            const roomCode = socket.currentRoom;
            if (!roomCode) return;
            const room = rooms.get(roomCode);
            if (!room || room.status !== 'racing') return;

            const player = room.players.get(socket.id);
            if (!player || player.hasFinished) return;

            const { progress, wpm, accuracy } = data;
            player.progress = Math.min(Math.max(parseFloat(progress) || 0, 0), 100);
            player.wpm = Math.max(parseFloat(wpm) || 0, 0);
            player.accuracy = Math.min(Math.max(parseFloat(accuracy) || 0, 0), 100);

            // Broadcast real-time progress to everyone in room
            socket.to(roomCode).emit('player_progress', {
                socketId: socket.id,
                progress: player.progress,
                wpm: player.wpm,
                accuracy: player.accuracy
            });

            // If player completed 100%
            if (player.progress >= 100) {
                player.hasFinished = true;
                player.finishTime = ((Date.now() - room.startTime) / 1000).toFixed(2);

                // Calculate rank
                const finishedCount = Array.from(room.players.values()).filter(p => p.hasFinished).length;
                player.rank = finishedCount;

                io.to(roomCode).emit('player_finished', {
                    socketId: socket.id,
                    username: player.username,
                    rank: player.rank,
                    wpm: player.wpm,
                    accuracy: player.accuracy,
                    finishTime: player.finishTime
                });

                // Check if all players have finished
                const allFinished = Array.from(room.players.values()).every(p => p.hasFinished);
                if (allFinished) {
                    finishRace(roomCode);
                }
            }
        });

        // 7. Rematch / Reset Race to Lobby
        socket.on('reset_race', () => {
            const roomCode = socket.currentRoom;
            if (!roomCode) return;
            const room = rooms.get(roomCode);
            if (!room || room.hostId !== socket.id) return;

            room.status = 'waiting';
            for (const player of room.players.values()) {
                player.isReady = player.isHost;
                player.progress = 0;
                player.wpm = 0;
                player.accuracy = 100;
                player.hasFinished = false;
                player.finishTime = 0;
                player.rank = null;
            }

            io.to(roomCode).emit('room_updated', serializeRoom(room));
            io.emit('rooms_list', getPublicRoomsList());
        });

        // 8. Chat Message
        socket.on('send_chat', (message) => {
            const roomCode = socket.currentRoom;
            if (!roomCode || !message || !message.trim()) return;
            const room = rooms.get(roomCode);
            if (!room) return;

            const player = room.players.get(socket.id);
            const chatObj = {
                id: Date.now() + Math.random().toString(),
                sender: player ? player.username : 'Anon',
                avatar: player ? player.avatar : 'car-red',
                text: message.trim().substring(0, 200),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            room.chatMessages.push(chatObj);
            if (room.chatMessages.length > 50) room.chatMessages.shift();

            io.to(roomCode).emit('new_chat', chatObj);
        });

        // 9. Leave Room / Disconnect
        const handleLeave = () => {
            const roomCode = socket.currentRoom;
            if (!roomCode) return;
            const room = rooms.get(roomCode);
            if (!room) return;

            const leavingPlayer = room.players.get(socket.id);
            room.players.delete(socket.id);
            socket.leave(roomCode);
            socket.currentRoom = null;

            if (room.players.size === 0) {
                // Delete empty room
                rooms.delete(roomCode);
                console.log(`Room ${roomCode} deleted (empty)`);
            } else {
                // If host left, assign new host to first remaining player
                if (room.hostId === socket.id) {
                    const nextPlayer = room.players.values().next().value;
                    if (nextPlayer) {
                        nextPlayer.isHost = true;
                        nextPlayer.isReady = true;
                        room.hostId = nextPlayer.socketId;
                        room.hostName = nextPlayer.username;
                    }
                }
                io.to(roomCode).emit('room_updated', serializeRoom(room));
                io.to(roomCode).emit('player_left', {
                    username: leavingPlayer ? leavingPlayer.username : 'Pemain'
                });
            }

            io.emit('rooms_list', getPublicRoomsList());
        };

        socket.on('leave_room', handleLeave);
        socket.on('disconnect', handleLeave);
    });

    function finishRace(roomCode) {
        const room = rooms.get(roomCode);
        if (!room) return;
        room.status = 'finished';
        io.to(roomCode).emit('race_finished', {
            results: Array.from(room.players.values()).sort((a, b) => (a.rank || 99) - (b.rank || 99))
        });
        saveRaceResults(room);
        io.to(roomCode).emit('room_updated', serializeRoom(room));
        io.emit('rooms_list', getPublicRoomsList());
    }
}

// Helper to convert Room Map to JSON-friendly object
function serializeRoom(room) {
    return {
        code: room.code,
        name: room.name,
        isPrivate: room.isPrivate,
        maxPlayers: room.maxPlayers,
        language: room.language,
        difficulty: room.difficulty,
        status: room.status,
        hostId: room.hostId,
        hostName: room.hostName,
        text: room.text,
        players: Array.from(room.players.values()),
        chatMessages: room.chatMessages
    };
}
