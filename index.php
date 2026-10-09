<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TypeRacer Arena - Adu Kecepatan Ketik Real-Time</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Canvas Confetti -->
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.4/dist/confetti.browser.min.js"></script>
    
    <!-- App Custom Stylesheet -->
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

    <!-- ================= NAVBAR ================= -->
    <header class="navbar">
        <div class="container navbar-inner">
            <a href="javascript:void(0)" onclick="window.showScreen('home-screen')" class="brand-logo">
                <div class="brand-icon">🏎️</div>
                <div class="brand-title">TYPE<span>RACER</span></div>
            </a>

            <nav class="nav-links">
                <button class="nav-btn" data-screen="lobby-screen" onclick="window.showScreen('lobby-screen')">
                    🎮 Multiplayer Lobby
                </button>
                <button class="nav-btn" data-screen="practice-screen" onclick="window.showScreen('practice-screen')">
                    ⌨️ Latihan Solo
                </button>
                <button class="nav-btn" data-screen="leaderboard-screen" onclick="window.showScreen('leaderboard-screen')">
                    🏆 Leaderboard
                </button>
            </nav>

            <div class="auth-nav-group" id="auth-nav-container">
                <!-- Injected via app.js -->
            </div>
        </div>
    </header>

    <!-- ================= MAIN CONTAINER ================= -->
    <main class="main-content">
        <div class="container">

            <!-- 1. HOME SCREEN -->
            <section id="home-screen" class="app-screen" style="display: block;">
                <div style="text-align: center; padding: 40px 16px; max-width: 800px; margin: 0 auto;">
                    <div style="display: inline-block; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; font-size: 11px; font-weight: 800; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px;">
                        ⚡ Real-Time Multiplayer Typing Arena (Hingga 40 Pemain)
                    </div>
                    <h1 style="font-size: 48px; font-weight: 900; line-height: 1.15; margin-bottom: 16px; letter-spacing: -1px;">
                        ADU KECEPATAN KETIK <br>
                        <span style="background: linear-gradient(135deg, #38bdf8, #818cf8, #fbbf24); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                            DI LINTASAN BALAP
                        </span>
                    </h1>
                    <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                        Tantang hingga 40 pemain dalam satu room, buat lobby privat bersama teman, atau uji kecepatan WPM Anda melawan AI Ghost Bot!
                    </p>
                    <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
                        <button class="btn btn-primary" style="padding: 14px 28px; font-size: 15px;" onclick="window.showScreen('lobby-screen')">
                            🎮 Masuk Multiplayer Lobby
                        </button>
                        <button class="btn btn-slate" style="padding: 14px 28px; font-size: 15px;" onclick="window.showScreen('practice-screen')">
                            ⌨️ Latihan Solo (AI Bot)
                        </button>
                    </div>
                </div>
            </section>

            <!-- 2. LOBBY BROWSER SCREEN -->
            <section id="lobby-screen" class="app-screen" style="display: none;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
                    <div>
                        <h2 style="font-size: 26px; font-weight: 800;">Multiplayer Lobby</h2>
                        <p style="color: #94a3b8; font-size: 13px; margin-top: 2px;">Pilih lobby yang tersedia atau buat arena balapan baru!</p>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-slate" onclick="lobbyManager.fetchLobbies()">🔄 Segarkan</button>
                        <button class="btn btn-primary" onclick="showCreateRoomModal()">➕ Buat Lobby Baru</button>
                    </div>
                </div>

                <!-- Direct Join via Code -->
                <div class="card" style="margin-bottom: 24px; padding: 16px 20px;">
                    <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                        <span style="font-size: 12px; font-weight: 700; color: #94a3b8;">🔑 Punya Kode Room?</span>
                        <input type="text" id="direct-code-input" class="form-control" style="width: 140px; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; font-weight: 800;" placeholder="Contoh: AB12" maxlength="6">
                        <input type="password" id="direct-pin-input" class="form-control" style="width: 140px;" placeholder="PIN (Jika privat)" maxlength="8">
                        <button class="btn btn-primary" onclick="lobbyManager.joinRoom(document.getElementById('direct-code-input').value, document.getElementById('direct-pin-input').value)">Gabung</button>
                    </div>
                </div>

                <!-- Lobbies Grid List -->
                <div id="lobby-list-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
                    <!-- Injected via lobby_manager.js -->
                </div>
            </section>

            <!-- 3. RACE ROOM SCREEN (Active Room) -->
            <section id="race-room-screen" class="app-screen" style="display: none;">
                <!-- Room Header -->
                <div class="card" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 16px 24px; flex-wrap: wrap; gap: 12px;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <h2 id="room-title-text" style="font-size: 20px; font-weight: 800;">Lobby Arena</h2>
                            <span id="room-code-badge" style="font-family: 'JetBrains Mono', monospace; background: #070b14; color: #38bdf8; padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 800; border: 1px solid #1e293b;">#CODE</span>
                        </div>
                        <p id="room-meta-info" style="color: #94a3b8; font-size: 12px; margin-top: 2px;">Host: Pembalap • ID • 1/40 Pemain</p>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <button id="player-ready-btn" class="btn btn-emerald" onclick="lobbyManager.toggleReady()">✅ Siap (Ready)</button>
                        <button id="host-start-btn" class="btn btn-primary" style="display: none;" onclick="lobbyManager.startRace()">🏎️ Mulai Balapan!</button>
                        <button class="btn btn-danger" onclick="lobbyManager.leaveRoom()">🚪 Keluar</button>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
                    <!-- Left: Multi-lane Track & Typing Arena -->
                    <div>
                        <!-- 40-Lane Race Track (Always Visible) -->
                        <div class="track-container" id="multiplayer-track-lanes" style="margin-bottom: 20px;">
                            <!-- Injected via lobby_manager.js -->
                        </div>

                        <!-- Typing Arena (Active during Race) -->
                        <div id="typing-arena-container" class="card" style="display: none;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-family: 'JetBrains Mono', monospace;">
                                <div style="font-size: 13px; color: #94a3b8;">Speed: <strong id="race-wpm-live" style="color: #38bdf8; font-size: 18px;">0</strong> WPM</div>
                                <div style="font-size: 13px; color: #94a3b8;">Akurasi: <strong id="race-acc-live" style="color: #34d399; font-size: 18px;">100%</strong></div>
                            </div>
                            <div id="race-text-box" class="typing-box"></div>
                            <input type="text" id="race-input-box" class="typing-input" placeholder="Ketik kalimat di atas di sini..." autocomplete="off">
                        </div>

                        <!-- Waiting Room Players Grid (Active in Lobby) -->
                        <div id="waiting-lobby-container" class="card">
                            <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: #94a3b8; margin-bottom: 14px;">
                                👥 Pemain di Room (Menunggu Host Memulai)
                            </h3>
                            <div id="waiting-players-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
                                <!-- Injected via lobby_manager.js -->
                            </div>
                        </div>
                    </div>

                    <!-- Right: Lobby Chat -->
                    <div>
                        <div class="chat-container">
                            <div style="padding: 12px 16px; background: #070b14; border-bottom: 1px solid #1e293b; font-weight: 700; font-size: 12px; color: #94a3b8;">
                                💬 Room Chat
                            </div>
                            <div id="chat-messages-box" class="chat-messages">
                                <!-- Chat bubbles -->
                            </div>
                            <form id="room-chat-form" style="padding: 10px; background: #070b14; border-top: 1px solid #1e293b; display: flex; gap: 8px;">
                                <input type="text" id="room-chat-input" class="form-control" style="padding: 8px 12px; font-size: 12px;" placeholder="Tulis pesan..." maxlength="150">
                                <button type="submit" class="btn btn-primary" style="padding: 8px 14px; font-size: 12px;">Kirim</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 4. PRACTICE SCREEN (Solo vs AI Bot) -->
            <section id="practice-screen" class="app-screen" style="display: none;">
                <div class="card" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 16px 24px; flex-wrap: wrap; gap: 12px;">
                    <div>
                        <h2 style="font-size: 22px; font-weight: 800;">Latihan Solo & AI Duel</h2>
                        <p style="color: #94a3b8; font-size: 12px; margin-top: 2px;">Uji kecepatanmu melawan AI Ghost Bot sebelum bertarung di multiplayer!</p>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <select id="practice-lang-select" class="form-control" style="width: 140px; padding: 8px 12px; font-size: 12px;" onchange="loadPracticeText()">
                            <option value="id">🇮🇩 Indonesia</option>
                            <option value="en">🇬🇧 English</option>
                        </select>
                        <select id="practice-diff-select" class="form-control" style="width: 120px; padding: 8px 12px; font-size: 12px;" onchange="loadPracticeText()">
                            <option value="easy">Mudah</option>
                            <option value="medium" selected>Sedang</option>
                            <option value="hard">Sulit</option>
                        </select>
                        <button class="btn btn-slate" onclick="loadPracticeText()">🔄 Ganti Teks</button>
                    </div>
                </div>

                <!-- Solo Race Track -->
                <div class="track-container" style="margin-bottom: 20px;">
                    <div class="lane-item my-lane">
                        <div class="lane-header">
                            <div class="lane-name"><span>🏎️ Kamu</span></div>
                            <div class="lane-stats">Speed: <strong id="practice-wpm-stat">0</strong> WPM • Akurasi: <strong id="practice-acc-stat">100%</strong></div>
                        </div>
                        <div class="road-surface">
                            <div class="road-centerline"></div>
                            <div class="finish-line"></div>
                            <div id="solo-user-car" class="car-runner my-car">
                                <script>document.write(getCarSVG('car-red', 46, 22));</script>
                            </div>
                        </div>
                    </div>

                    <div class="lane-item">
                        <div class="lane-header">
                            <div class="lane-name"><span>🤖 AI Ghost Bot</span></div>
                            <div class="lane-stats">Speed: <strong>70</strong> WPM</div>
                        </div>
                        <div class="road-surface">
                            <div class="road-centerline"></div>
                            <div class="finish-line"></div>
                            <div id="solo-bot-car" class="car-runner">
                                <script>document.write(getCarSVG('car-cyan', 46, 22));</script>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Practice Typing Engine -->
                <div class="card">
                    <div id="practice-text-box" class="typing-box"></div>
                    <input type="text" id="practice-input-box" class="typing-input" placeholder="Mulai mengetik kalimat di atas..." autocomplete="off">
                </div>
            </section>

            <!-- 5. LEADERBOARD SCREEN -->
            <section id="leaderboard-screen" class="app-screen" style="display: none;">
                <div class="card" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 16px 24px; flex-wrap: wrap; gap: 12px;">
                    <div>
                        <h2 style="font-size: 24px; font-weight: 800;">🏆 Papan Peringkat Global</h2>
                        <p style="color: #94a3b8; font-size: 12px;">Para juru ketik tercepat di arena TypeRacer</p>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-primary" style="padding: 8px 14px; font-size: 12px;" onclick="loadLeaderboard('best_wpm')">WPM Tertinggi</button>
                        <button class="btn btn-slate" style="padding: 8px 14px; font-size: 12px;" onclick="loadLeaderboard('total_wins')">Total Menang</button>
                    </div>
                </div>

                <div class="card" style="padding: 0; overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
                        <thead>
                            <tr style="background: #070b14; color: #64748b; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #1e293b;">
                                <th style="padding: 12px 16px;">Rank</th>
                                <th style="padding: 12px 16px;">Pembalap</th>
                                <th style="padding: 12px 16px; text-align: right;">Best WPM</th>
                                <th style="padding: 12px 16px; text-align: right;">Avg WPM</th>
                                <th style="padding: 12px 16px; text-align: right;">Akurasi</th>
                                <th style="padding: 12px 16px; text-align: right;">Menang / Balapan</th>
                            </tr>
                        </thead>
                        <tbody id="leaderboard-tbody">
                            <!-- Injected via app.js -->
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- 6. PROFILE SCREEN -->
            <section id="profile-screen" class="app-screen" style="display: none;">
                <div class="card" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 24px; flex-wrap: wrap; gap: 16px;">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <div id="profile-car-preview" style="background: #070b14; padding: 12px; border-radius: 16px; border: 1px solid #1e293b;"></div>
                        <div>
                            <h2 id="profile-username" style="font-size: 24px; font-weight: 800;">Username</h2>
                            <p id="profile-email" style="color: #94a3b8; font-size: 12px;">email@domain.com</p>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; font-family: 'JetBrains Mono', monospace;">Rekor Terbaik</div>
                        <div style="font-size: 32px; font-weight: 900; font-family: 'JetBrains Mono', monospace; color: #38bdf8;">
                            <span id="profile-best-wpm">0</span> <span style="font-size: 14px; color: #94a3b8;">WPM</span>
                        </div>
                    </div>
                </div>

                <!-- Stats Grid -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
                    <div class="card" style="padding: 16px;">
                        <div style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Total Balapan</div>
                        <div id="profile-total-races" style="font-size: 24px; font-weight: 900; font-family: 'JetBrains Mono', monospace; color: #fff; margin-top: 4px;">0</div>
                    </div>
                    <div class="card" style="padding: 16px;">
                        <div style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Total Menang</div>
                        <div id="profile-total-wins" style="font-size: 24px; font-weight: 900; font-family: 'JetBrains Mono', monospace; color: #fbbf24; margin-top: 4px;">0</div>
                    </div>
                    <div class="card" style="padding: 16px;">
                        <div style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Rata-rata WPM</div>
                        <div id="profile-avg-wpm" style="font-size: 24px; font-weight: 900; font-family: 'JetBrains Mono', monospace; color: #38bdf8; margin-top: 4px;">0</div>
                    </div>
                    <div class="card" style="padding: 16px;">
                        <div style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Rata-rata Akurasi</div>
                        <div id="profile-avg-acc" style="font-size: 24px; font-weight: 900; font-family: 'JetBrains Mono', monospace; color: #34d399; margin-top: 4px;">0%</div>
                    </div>
                </div>

                <!-- Match History -->
                <div class="card" style="padding: 0; overflow-x: auto;">
                    <div style="padding: 16px; font-weight: 800; font-size: 14px; border-bottom: 1px solid #1e293b;">
                        📜 Riwayat Balapan Terakhir
                    </div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
                        <thead>
                            <tr style="background: #070b14; color: #64748b; font-size: 10px; text-transform: uppercase; border-bottom: 1px solid #1e293b;">
                                <th style="padding: 10px 14px;">Room</th>
                                <th style="padding: 10px 14px; text-align: center;">Posisi</th>
                                <th style="padding: 10px 14px; text-align: right;">Speed</th>
                                <th style="padding: 10px 14px; text-align: right;">Akurasi</th>
                                <th style="padding: 10px 14px; text-align: right;">Waktu</th>
                            </tr>
                        </thead>
                        <tbody id="profile-history-tbody">
                            <!-- Injected via app.js -->
                        </tbody>
                    </table>
                </div>
            </section>

        </div>
    </main>

    <!-- ================= MODALS & OVERLAYS ================= -->

    <!-- COUNTDOWN OVERLAY -->
    <div id="countdown-overlay" class="countdown-overlay" style="display: none;">
        <div id="countdown-display-number" class="countdown-number">3</div>
        <p style="font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; margin-top: 16px;">
            Bersiap di garis start!
        </p>
    </div>

    <!-- AUTH MODAL -->
    <div id="auth-modal" class="modal-backdrop" style="display: none;">
        <div class="modal-dialog">
            <h2 id="auth-modal-title" style="font-size: 22px; font-weight: 800; margin-bottom: 4px;">Masuk ke TypeRacer</h2>
            <p style="color: #94a3b8; font-size: 12px; margin-bottom: 20px;">Simpan statistik balapan dan rekor WPM Anda</p>
            <form onsubmit="handleAuthSubmit(event)">
                <div class="form-group">
                    <label class="form-label">Username / Email</label>
                    <input type="text" id="auth-username-input" class="form-control" required placeholder="Masukkan username">
                </div>
                <div class="form-group" id="auth-email-group" style="display: none;">
                    <label class="form-label">Email</label>
                    <input type="email" id="auth-email-input" class="form-control" placeholder="nama@email.com">
                </div>
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" id="auth-password-input" class="form-control" required placeholder="Masukkan password">
                </div>
                <div class="form-group" id="auth-avatar-group" style="display: none;">
                    <label class="form-label">Pilih Warna Mobil Perdana</label>
                    <div id="register-avatar-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px;">
                    <button type="button" class="btn btn-slate" onclick="closeAuthModal()">Batal</button>
                    <button type="submit" id="auth-submit-btn" class="btn btn-primary">Masuk</button>
                </div>
            </form>
            <div id="auth-switch-text" style="text-align: center; margin-top: 16px; font-size: 12px; color: #94a3b8;"></div>
        </div>
    </div>

    <!-- CREATE ROOM MODAL -->
    <div id="create-room-modal" class="modal-backdrop" style="display: none;">
        <div class="modal-dialog">
            <h2 style="font-size: 22px; font-weight: 800; margin-bottom: 4px;">Buat Lobby Balapan Baru</h2>
            <p style="color: #94a3b8; font-size: 12px; margin-bottom: 20px;">Atur preferensi kapasitas hingga 40 pemain!</p>
            <form onsubmit="handleCreateRoomSubmit(event)">
                <div class="form-group">
                    <label class="form-label">Nama Lobby</label>
                    <input type="text" id="cr-name" class="form-control" placeholder="Contoh: Arena Balap 40 Pemain" maxlength="30">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div class="form-group">
                        <label class="form-label">Maksimal Pemain</label>
                        <select id="cr-max-players" class="form-control">
                            <option value="2">2 Pemain (1 vs 1)</option>
                            <option value="4">4 Pemain</option>
                            <option value="8">8 Pemain</option>
                            <option value="12">12 Pemain</option>
                            <option value="20">20 Pemain</option>
                            <option value="40" selected>40 Pemain (Mega Race)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Bahasa Teks</label>
                        <select id="cr-lang" class="form-control">
                            <option value="id">🇮🇩 Indonesia</option>
                            <option value="en">🇬🇧 English</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Tingkat Kesulitan</label>
                    <select id="cr-diff" class="form-control">
                        <option value="easy">Mudah</option>
                        <option value="medium" selected>Sedang</option>
                        <option value="hard">Sulit</option>
                    </select>
                </div>
                <div class="form-group" style="padding-top: 8px;">
                    <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
                        <input type="checkbox" id="cr-is-private" onchange="document.getElementById('cr-pin-group').style.display = this.checked ? 'block' : 'none'">
                        <span>Kamar Privat (Memerlukan PIN)</span>
                    </label>
                </div>
                <div class="form-group" id="cr-pin-group" style="display: none;">
                    <label class="form-label">PIN Kamar</label>
                    <input type="password" id="cr-pin" class="form-control" placeholder="Masukkan 4-6 digit PIN" maxlength="8">
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px;">
                    <button type="button" class="btn btn-slate" onclick="closeCreateRoomModal()">Batal</button>
                    <button type="submit" class="btn btn-primary">Buat Room Sekarang</button>
                </div>
            </form>
        </div>
    </div>

    <!-- PODIUM MODAL -->
    <div id="podium-modal" class="modal-backdrop" style="display: none;">
        <div class="modal-dialog">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 40px; margin-bottom: 8px;">🏆</div>
                <h2 style="font-size: 26px; font-weight: 900; background: linear-gradient(135deg, #fbbf24, #38bdf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                    Balapan Selesai!
                </h2>
                <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Berikut rekapitulasi waktu & kecepatan pembalap</p>
            </div>
            <div id="podium-results-list" style="max-height: 280px; overflow-y: auto; margin-bottom: 20px;">
                <!-- Podium rows -->
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid #1e293b; padding-top: 16px;">
                <button class="btn btn-slate" onclick="lobbyManager.leaveRoom()">Keluar ke Lobby</button>
                <button class="btn btn-primary" onclick="closePodiumModal(); lobbyManager.syncRoom();">Tutup</button>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="assets/js/car_svg.js"></script>
    <script src="assets/js/race_engine.js"></script>
    <script src="assets/js/lobby_manager.js"></script>
    <script src="assets/js/app.js"></script>
</body>
</html>
