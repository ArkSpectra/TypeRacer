// ============================================================
// Lobby & 40-Player Multiplayer Sync Manager
// ============================================================

class LobbyManager {
    constructor() {
        this.currentRoom = null;
        this.playerToken = localStorage.getItem('typeracer_player_token') || this.generateToken();
        localStorage.setItem('typeracer_player_token', this.playerToken);

        this.lobbyPollInterval = null;
        this.roomSyncInterval = null;
        this.chatPollInterval = null;

        this.isHost = false;
        this.isReady = false;
        this.localProgress = 0;
        this.localWpm = 0;
        this.localAcc = 100;
        this.hasTriggeredFinish = false;
    }

    generateToken() {
        return 'pl_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    }

    // 1. Fetch Public Lobbies
    async fetchLobbies() {
        try {
            const res = await fetch('api/lobby.php?action=list');
            const data = await res.json();
            if (data.success) {
                this.renderLobbiesList(data.rooms || []);
            }
        } catch (err) {
            console.warn('Gagal memuat lobby:', err);
        }
    }

    startLobbyPolling() {
        this.fetchLobbies();
        if (this.lobbyPollInterval) clearInterval(this.lobbyPollInterval);
        this.lobbyPollInterval = setInterval(() => this.fetchLobbies(), 3000);
    }

    stopLobbyPolling() {
        if (this.lobbyPollInterval) clearInterval(this.lobbyPollInterval);
    }

    renderLobbiesList(rooms) {
        const container = document.getElementById('lobby-list-container');
        if (!container) return;

        if (rooms.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 48px; background: rgba(15, 23, 42, 0.4); border-radius: 20px; border: 1px dashed #334155;">
                    <div style="font-size: 32px; margin-bottom: 8px;">🏁</div>
                    <div style="font-weight: 700; color: #cbd5e1; font-size: 16px;">Belum Ada Lobby Aktif</div>
                    <p style="color: #64748b; font-size: 12px; margin-top: 4px;">Buat room baru dan jadilah host pertama untuk bertanding!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = rooms.map(room => {
            const isFull = room.player_count >= room.max_players;
            const isRacing = room.status === 'racing' || room.status === 'countdown';

            let statusBadge = `<span style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); font-size: 11px; padding: 3px 8px; border-radius: 8px; font-weight: 700;">Menunggu</span>`;
            if (isRacing) {
                statusBadge = `<span style="background: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.3); font-size: 11px; padding: 3px 8px; border-radius: 8px; font-weight: 700;">Sedang Balapan</span>`;
            } else if (isFull) {
                statusBadge = `<span style="background: rgba(244, 63, 94, 0.15); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.3); font-size: 11px; padding: 3px 8px; border-radius: 8px; font-weight: 700;">Penuh</span>`;
            }

            return `
                <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; padding: 20px;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 800; background: #070b14; padding: 4px 8px; border-radius: 6px; color: #38bdf8; border: 1px solid #1e293b;">
                                #${room.id}
                            </span>
                            ${statusBadge}
                        </div>
                        <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${escapeHtml(room.name)}
                        </h3>
                        <p style="font-size: 11px; color: #94a3b8; margin-bottom: 14px;">
                            Host: <strong style="color: #e2e8f0;">${escapeHtml(room.host_name)}</strong>
                        </p>
                        <div style="display: flex; gap: 6px; font-size: 11px; font-weight: 600; flex-wrap: wrap;">
                            <span style="background: #090e1a; padding: 3px 8px; border-radius: 6px; border: 1px solid #1e293b;">
                                ${room.language === 'id' ? '🇮🇩 Indonesia' : '🇬🇧 English'}
                            </span>
                            <span style="background: #090e1a; padding: 3px 8px; border-radius: 6px; border: 1px solid #1e293b; text-transform: capitalize;">
                                ${room.difficulty}
                            </span>
                            <span style="background: #090e1a; padding: 3px 8px; border-radius: 6px; border: 1px solid #1e293b; color: #38bdf8;">
                                👥 ${room.player_count}/${room.max_players} Pemain
                            </span>
                        </div>
                    </div>
                    <div style="margin-top: 20px; padding-top: 14px; border-top: 1px solid #1e293b;">
                        <button class="btn btn-slate" style="width: 100%;" onclick="lobbyManager.joinRoom('${room.id}')" ${isFull || isRacing ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''}>
                            🏎️ Masuk Room
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 2. Create Room
    async createRoom(formData) {
        try {
            const user = window.currentUser;
            const token = localStorage.getItem('typeracer_auth_token') || '';
            const username = user ? user.username : (formData.username || 'Pembalap');
            const avatar = user ? user.avatar : (formData.avatar || 'car-red');

            const res = await fetch('api/lobby.php?action=create', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    player_token: this.playerToken,
                    token: token,
                    username: username,
                    avatar: avatar
                })
            });
            const data = await res.json();
            if (data.success) {
                this.enterRoom(data.room_code);
            } else {
                alert(data.message || 'Gagal membuat room');
            }
        } catch (err) {
            alert('Terjadi kesalahan jaringan');
        }
    }

    // 3. Join Room
    async joinRoom(code, pin = '') {
        try {
            const user = window.currentUser;
            const token = localStorage.getItem('typeracer_auth_token') || '';
            const username = user ? user.username : 'Pembalap';
            const avatar = user ? user.avatar : 'car-blue';

            const res = await fetch('api/lobby.php?action=join', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    code: code.toUpperCase().trim(),
                    pin: pin,
                    player_token: this.playerToken,
                    token: token,
                    username: username,
                    avatar: avatar
                })
            });
            const data = await res.json();
            if (data.success) {
                this.enterRoom(data.room_code);
            } else {
                alert(data.message || 'Gagal bergabung ke room');
            }
        } catch (err) {
            alert('Terjadi kesalahan jaringan');
        }
    }

    // 4. Enter Room UI & Start Active Sync Loop
    enterRoom(code) {
        this.currentRoom = code;
        this.stopLobbyPolling();
        window.showScreen('race-room-screen');
        this.hasTriggeredFinish = false;
        this.localProgress = 0;
        this.localWpm = 0;
        this.localAcc = 100;

        // Start Room Sync
        this.syncRoom();
        if (this.roomSyncInterval) clearInterval(this.roomSyncInterval);
        this.roomSyncInterval = setInterval(() => this.syncRoom(), 1500); // High-performance 1.5s interval

        // Start Chat Sync
        this.startChatSync();
    }

    // 5. High Performance Sync Loop (Single Roundtrip)
    async syncRoom() {
        if (!this.currentRoom) return;

        try {
            const payload = {
                code: this.currentRoom,
                player_token: this.playerToken
            };

            // If race is active, attach local telemetry
            if (raceEngine.startTime) {
                payload.progress = this.localProgress;
                payload.wpm = this.localWpm;
                payload.accuracy = this.localAcc;
            }

            const res = await fetch('api/sync_race.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!data.success) {
                if (data.room_deleted) {
                    alert('Room telah ditutup oleh Host.');
                    this.leaveRoom();
                }
                return;
            }

            this.processRoomState(data.room, data.players, data.server_time);
        } catch (err) {
            console.warn('Sync error:', err);
        }
    }

    processRoomState(room, players, serverTime) {
        // Check Host state
        this.isHost = (room.host_id === this.playerToken);
        const myPlayer = players.find(p => p.player_token === this.playerToken);
        this.isReady = myPlayer ? !!myPlayer.is_ready : false;

        // Update Room Header
        document.getElementById('room-title-text').textContent = room.name;
        document.getElementById('room-code-badge').textContent = room.code;
        document.getElementById('room-meta-info').textContent = `Host: ${room.host_name} • ${room.language === 'id' ? '🇮🇩 Indonesia' : '🇬🇧 English'} • ${players.length}/${room.max_players} Pemain`;

        // Host controls
        const startBtn = document.getElementById('host-start-btn');
        if (startBtn) {
            startBtn.style.display = this.isHost && room.status === 'waiting' ? 'inline-flex' : 'none';
        }

        const readyBtn = document.getElementById('player-ready-btn');
        if (readyBtn) {
            readyBtn.style.display = room.status === 'waiting' ? 'inline-flex' : 'none';
            readyBtn.textContent = this.isReady ? '❌ Batal Siap' : '✅ Siap (Ready)';
            readyBtn.className = this.isReady ? 'btn btn-slate' : 'btn btn-emerald';
        }

        // Render Multi-lane Race Track (Supports up to 40 players)
        this.renderMultiLanes(players, room.status);

        // Handle Status Transitions
        const countdownOverlay = document.getElementById('countdown-overlay');
        const typingArena = document.getElementById('typing-arena-container');
        const waitingLobbyArea = document.getElementById('waiting-lobby-container');

        if (room.status === 'countdown') {
            waitingLobbyArea.style.display = 'none';
            typingArena.style.display = 'block';
            countdownOverlay.style.display = 'flex';

            const countdownNum = document.getElementById('countdown-display-number');
            countdownNum.textContent = room.countdown_sec > 0 ? room.countdown_sec : 'GO!';

            // Initialize text into typing engine
            if (raceEngine.targetText !== room.text.content) {
                raceEngine.setText(room.text.content, room.text.source);
            }
        } else if (room.status === 'racing') {
            countdownOverlay.style.display = 'none';
            waitingLobbyArea.style.display = 'none';
            typingArena.style.display = 'block';

            if (raceEngine.targetText !== room.text.content) {
                raceEngine.setText(room.text.content, room.text.source);
            }

            if (!raceEngine.startTime) {
                raceEngine.start(room.start_time);
            }
        } else if (room.status === 'finished') {
            countdownOverlay.style.display = 'none';
            if (!this.hasTriggeredFinish) {
                this.hasTriggeredFinish = true;
                window.showPodiumModal(players);
            }
        } else if (room.status === 'waiting') {
            countdownOverlay.style.display = 'none';
            waitingLobbyArea.style.display = 'block';
            typingArena.style.display = 'none';
            this.renderWaitingLobbyPlayers(players);
        }
    }

    // Render Multi-Lane Track with Smooth CSS Interpolation
    renderMultiLanes(players, roomStatus) {
        const container = document.getElementById('multiplayer-track-lanes');
        if (!container) return;

        container.innerHTML = players.map(p => {
            const isMe = (p.player_token === this.playerToken);
            const progress = isMe ? this.localProgress : Math.min(Math.max(p.progress || 0, 0), 100);
            const wpm = isMe ? this.localWpm : Math.round(p.wpm || 0);
            const acc = isMe ? this.localAcc : Math.round(p.accuracy || 100);

            let rankBadge = '';
            if (p.rank_pos) {
                rankBadge = `<span style="background: rgba(251, 191, 36, 0.2); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.4); font-size: 10px; padding: 2px 6px; border-radius: 6px; font-weight: 800;">🏆 Juara #${p.rank_pos}</span>`;
            }

            return `
                <div class="lane-item ${isMe ? 'my-lane' : ''}">
                    <div class="lane-header">
                        <div class="lane-name">
                            <span>${escapeHtml(p.username)} ${isMe ? '<strong style="color: #38bdf8;">(Kamu)</strong>' : ''}</span>
                            ${rankBadge}
                        </div>
                        <div class="lane-stats">
                            WPM: <strong>${wpm}</strong> • Akurasi: <strong>${acc}%</strong> • ${Math.round(progress)}%
                        </div>
                    </div>
                    <div class="road-surface">
                        <div class="road-centerline"></div>
                        <div class="finish-line"></div>
                        <div class="car-runner ${isMe ? 'my-car' : ''}" style="transform: translateX(${progress * 0.9}%);">
                            ${getCarSVG(p.avatar || 'car-red', 46, 22)}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderWaitingLobbyPlayers(players) {
        const grid = document.getElementById('waiting-players-grid');
        if (!grid) return;

        grid.innerHTML = players.map(p => {
            const isMe = (p.player_token === this.playerToken);
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-radius: 14px; background: ${isMe ? 'rgba(56, 189, 248, 0.1)' : '#070b14'}; border: 1px solid ${isMe ? 'rgba(56, 189, 248, 0.4)' : '#1e293b'};">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        ${getCarSVG(p.avatar || 'car-red', 38, 18)}
                        <div>
                            <div style="font-weight: 700; font-size: 13px; color: #fff;">
                                ${escapeHtml(p.username)} ${p.is_host ? '👑' : ''} ${isMe ? '<span style="color: #38bdf8; font-size: 11px;">(Kamu)</span>' : ''}
                            </div>
                            <div style="font-size: 10px; color: #64748b;">${p.is_host ? 'Room Host' : 'Pembalap'}</div>
                        </div>
                    </div>
                    <div>
                        ${p.is_ready ? `<span style="color: #34d399; font-weight: 700; font-size: 11px;">✅ Siap</span>` : `<span style="color: #64748b; font-size: 11px;">Menunggu</span>`}
                    </div>
                </div>
            `;
        }).join('');

        // Render Car Color Picker in Lobby
        const colorPickerContainer = document.getElementById('waiting-lobby-color-picker');
        if (colorPickerContainer && !colorPickerContainer.hasChildNodes()) {
            const myPlayer = players.find(p => p.player_token === this.playerToken);
            const myAvatar = myPlayer ? myPlayer.avatar : 'car-red';
            colorPickerContainer.innerHTML = Object.keys(CAR_COLORS).map(key => `
                <button type="button" onclick="lobbyManager.changeAvatar('${key}')" style="cursor: pointer; padding: 6px; border-radius: 10px; background: ${key === myAvatar ? 'rgba(56, 189, 248, 0.2)' : '#070b14'}; border: 1px solid ${key === myAvatar ? '#38bdf8' : '#1e293b'}; display: flex; align-items: center; justify-content: center;">
                    ${getCarSVG(key, 36, 18)}
                </button>
            `).join('');
        }
    }

    // Change Avatar in Room
    async changeAvatar(avatar) {
        if (!this.currentRoom) return;
        try {
            const token = localStorage.getItem('typeracer_auth_token') || '';
            await fetch('api/lobby.php?action=change_avatar', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    code: this.currentRoom,
                    player_token: this.playerToken,
                    avatar: avatar,
                    token: token
                })
            });
            if (window.currentUser) {
                window.currentUser.avatar = avatar;
            }
            // Clear color picker cache to re-highlight
            const cp = document.getElementById('waiting-lobby-color-picker');
            if (cp) cp.innerHTML = '';
            this.syncRoom();
        } catch (err) {}
    }

    // Toggle Ready
    async toggleReady() {
        if (!this.currentRoom) return;
        try {
            await fetch('api/lobby.php?action=toggle_ready', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: this.currentRoom,
                    player_token: this.playerToken
                })
            });
            this.syncRoom();
        } catch (err) {}
    }

    // Start Race (Host)
    async startRace() {
        if (!this.currentRoom || !this.isHost) return;
        try {
            const res = await fetch('api/start_race.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: this.currentRoom,
                    player_token: this.playerToken
                })
            });
            const data = await res.json();
            if (data.success) {
                this.syncRoom();
            } else {
                alert(data.message || 'Gagal memulai balapan');
            }
        } catch (err) {}
    }

    // Leave Room
    async leaveRoom() {
        if (this.currentRoom) {
            try {
                await fetch('api/lobby.php?action=leave', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code: this.currentRoom,
                        player_token: this.playerToken
                    })
                });
            } catch (err) {}
        }
        if (this.roomSyncInterval) clearInterval(this.roomSyncInterval);
        if (this.chatPollInterval) clearInterval(this.chatPollInterval);
        this.currentRoom = null;
        window.closePodiumModal();
        window.showScreen('lobby-screen');
        this.startLobbyPolling();
    }

    // Chat Sync
    startChatSync() {
        this.fetchChat();
        if (this.chatPollInterval) clearInterval(this.chatPollInterval);
        this.chatPollInterval = setInterval(() => this.fetchChat(), 2500);
    }

    async fetchChat() {
        if (!this.currentRoom) return;
        try {
            const res = await fetch(`api/chat.php?action=get&code=${this.currentRoom}`);
            const data = await res.json();
            if (data.success) {
                const box = document.getElementById('chat-messages-box');
                if (box) {
                    box.innerHTML = (data.messages || []).map(m => `
                        <div class="chat-bubble">
                            <div class="sender">${escapeHtml(m.username)}</div>
                            <div style="color: #e2e8f0;">${escapeHtml(m.message)}</div>
                        </div>
                    `).join('');
                    box.scrollTop = box.scrollHeight;
                }
            }
        } catch (err) {}
    }

    async sendChat(msg) {
        if (!this.currentRoom || !msg.trim()) return;
        try {
            await fetch('api/chat.php?action=send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: this.currentRoom,
                    player_token: this.playerToken,
                    message: msg
                })
            });
            this.fetchChat();
        } catch (err) {}
    }
}

const lobbyManager = new LobbyManager();
