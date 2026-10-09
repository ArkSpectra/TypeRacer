// ============================================================
// TypeRacer Main App Orchestrator & State Management
// ============================================================

window.currentUser = null;

// Screen Router
window.showScreen = function(screenId) {
    document.querySelectorAll('.app-screen').forEach(el => el.style.display = 'none');
    const target = document.getElementById(screenId);
    if (target) target.style.display = 'block';

    // Update active nav
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const activeNav = document.querySelector(`[data-screen="${screenId}"]`);
    if (activeNav) activeNav.classList.add('active');

    if (screenId === 'lobby-screen') {
        lobbyManager.startLobbyPolling();
    } else {
        lobbyManager.stopLobbyPolling();
    }

    if (screenId === 'leaderboard-screen') {
        loadLeaderboard();
    } else if (screenId === 'profile-screen') {
        loadProfile();
    } else if (screenId === 'practice-screen') {
        initPracticeMode();
    }
};

// Check Existing Auth Token
async function checkAuth() {
    const token = localStorage.getItem('typeracer_auth_token');
    if (!token) {
        updateAuthNav(null);
        return;
    }

    try {
        const res = await fetch(`api/auth.php?action=me&token=${token}`);
        const data = await res.json();
        if (data.success) {
            window.currentUser = data.user;
            updateAuthNav(data.user);
        } else {
            logout();
        }
    } catch (err) {
        logout();
    }
}

function updateAuthNav(user) {
    const group = document.getElementById('auth-nav-container');
    if (!group) return;

    if (user) {
        group.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; background: #0f172a; padding: 4px 12px; border-radius: 12px; border: 1px solid #1e293b; cursor: pointer;" onclick="window.showScreen('profile-screen')">
                ${getCarSVG(user.avatar || 'car-red', 28, 14)}
                <div style="text-align: left;">
                    <div style="font-size: 12px; font-weight: 700; color: #fff;">${escapeHtml(user.username)}</div>
                    <div style="font-size: 10px; color: #38bdf8; font-family: 'JetBrains Mono', monospace;">Best: ${user.best_wpm} WPM</div>
                </div>
            </div>
            <button class="btn btn-danger" style="padding: 6px 10px; font-size: 12px;" onclick="logout()" title="Logout">Keluar</button>
        `;
    } else {
        group.innerHTML = `
            <button class="btn btn-slate" style="padding: 8px 14px; font-size: 12px;" onclick="showAuthModal('login')">Masuk</button>
            <button class="btn btn-primary" style="padding: 8px 14px; font-size: 12px;" onclick="showAuthModal('register')">Daftar</button>
        `;
    }
}

function logout() {
    localStorage.removeItem('typeracer_auth_token');
    window.currentUser = null;
    updateAuthNav(null);
    window.showScreen('home-screen');
}

// ============================================================
// MODAL CONTROLLERS (Auth, Create Room, PIN, Podium)
// ============================================================

window.showAuthModal = function(mode = 'login') {
    const modal = document.getElementById('auth-modal');
    const title = document.getElementById('auth-modal-title');
    const emailGroup = document.getElementById('auth-email-group');
    const submitBtn = document.getElementById('auth-submit-btn');
    const switchText = document.getElementById('auth-switch-text');
    const avatarGroup = document.getElementById('auth-avatar-group');

    modal.dataset.mode = mode;
    modal.style.display = 'flex';

    if (mode === 'login') {
        title.textContent = 'Masuk ke TypeRacer';
        emailGroup.style.display = 'none';
        avatarGroup.style.display = 'none';
        submitBtn.textContent = 'Masuk Sekarang';
        switchText.innerHTML = `Belum punya akun? <a href="javascript:void(0)" onclick="showAuthModal('register')" style="color: #38bdf8; font-weight: 700;">Daftar di sini</a>`;
    } else {
        title.textContent = 'Daftar Akun Pembalap';
        emailGroup.style.display = 'block';
        avatarGroup.style.display = 'block';
        submitBtn.textContent = 'Daftar Akun';
        switchText.innerHTML = `Sudah punya akun? <a href="javascript:void(0)" onclick="showAuthModal('login')" style="color: #38bdf8; font-weight: 700;">Masuk di sini</a>`;
        renderAvatarSelector('register-avatar-grid', 'car-red');
    }
};

window.closeAuthModal = function() {
    document.getElementById('auth-modal').style.display = 'none';
};

window.handleAuthSubmit = async function(e) {
    e.preventDefault();
    const mode = document.getElementById('auth-modal').dataset.mode;
    const identifier = document.getElementById('auth-username-input').value.trim();
    const email = document.getElementById('auth-email-input').value.trim();
    const password = document.getElementById('auth-password-input').value;
    const avatar = document.querySelector('input[name="selected-avatar"]:checked')?.value || 'car-red';

    const endpoint = mode === 'register' ? 'api/auth.php?action=register' : 'api/auth.php?action=login';
    const payload = mode === 'register' 
        ? { username: identifier, email, password, avatar }
        : { identifier, password };

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            localStorage.setItem('typeracer_auth_token', data.token);
            window.currentUser = data.user;
            updateAuthNav(data.user);
            closeAuthModal();
            window.showScreen('lobby-screen');
        } else {
            alert(data.message || 'Gagal autentikasi');
        }
    } catch (err) {
        alert('Terjadi kesalahan jaringan');
    }
};

function renderAvatarSelector(containerId, defaultVal = 'car-red') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = Object.keys(CAR_COLORS).map(key => `
        <label style="cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 6px; border-radius: 10px; background: #070b14; border: 1px solid #1e293b;">
            <input type="radio" name="selected-avatar" value="${key}" ${key === defaultVal ? 'checked' : ''} style="display: none;">
            ${getCarSVG(key, 38, 18)}
            <span style="font-size: 9px; color: #94a3b8;">${CAR_COLORS[key].name.split(' ')[0]}</span>
        </label>
    `).join('');
}

// Create Room Modal
window.showCreateRoomModal = function() {
    document.getElementById('create-room-modal').style.display = 'flex';
};
window.closeCreateRoomModal = function() {
    document.getElementById('create-room-modal').style.display = 'none';
};

window.handleCreateRoomSubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('cr-name').value.trim();
    const maxPlayers = document.getElementById('cr-max-players').value;
    const language = document.getElementById('cr-lang').value;
    const difficulty = document.getElementById('cr-diff').value;
    const isPrivate = document.getElementById('cr-is-private').checked;
    const pin = document.getElementById('cr-pin').value.trim();

    lobbyManager.createRoom({
        name, max_players: maxPlayers, language, difficulty, is_private: isPrivate, pin
    });
    closeCreateRoomModal();
};

// Podium Modal
window.showPodiumModal = function(players) {
    const modal = document.getElementById('podium-modal');
    const list = document.getElementById('podium-results-list');
    modal.style.display = 'flex';

    list.innerHTML = players.map((p, index) => {
        const rank = index + 1;
        const isMe = p.player_token === lobbyManager.playerToken;

        return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-radius: 14px; background: ${isMe ? 'rgba(56, 189, 248, 0.12)' : '#070b14'}; border: 1px solid ${isMe ? 'rgba(56, 189, 248, 0.4)' : '#1e293b'}; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 800; color: ${rank === 1 ? '#fbbf24' : rank === 2 ? '#e2e8f0' : '#d97706'};">
                        #${rank}
                    </div>
                    ${getCarSVG(p.avatar || 'car-red', 38, 18)}
                    <div>
                        <div style="font-weight: 700; font-size: 13px; color: #fff;">
                            ${escapeHtml(p.username)} ${isMe ? '<span style="color: #38bdf8;">(Kamu)</span>' : ''}
                        </div>
                        <div style="font-size: 10px; color: #64748b;">Waktu: ${p.finish_time || '0.00'}s</div>
                    </div>
                </div>
                <div style="text-align: right; font-family: 'JetBrains Mono', monospace;">
                    <div style="font-size: 15px; font-weight: 800; color: #38bdf8;">${Math.round(p.wpm || 0)} WPM</div>
                    <div style="font-size: 11px; color: #10b981;">${Math.round(p.accuracy || 100)}%</div>
                </div>
            </div>
        `;
    }).join('');

    // Confetti effect
    if (typeof confetti === 'function') {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
};

window.closePodiumModal = function() {
    document.getElementById('podium-modal').style.display = 'none';
};

// ============================================================
// LEADERBOARD & PROFILE
// ============================================================

async function loadLeaderboard(sortBy = 'best_wpm') {
    const tbody = document.getElementById('leaderboard-tbody');
    if (!tbody) return;

    try {
        const res = await fetch(`api/leaderboard.php?sort_by=${sortBy}`);
        const data = await res.json();
        if (data.success) {
            tbody.innerHTML = (data.leaderboard || []).map((p, idx) => `
                <tr style="border-bottom: 1px solid #1e293b;">
                    <td style="padding: 12px 16px; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: ${idx === 0 ? '#fbbf24' : '#94a3b8'};">#${idx + 1}</td>
                    <td style="padding: 12px 16px; display: flex; align-items: center; gap: 10px; font-weight: 700; color: #fff;">
                        ${getCarSVG(p.avatar || 'car-red', 30, 15)}
                        ${escapeHtml(p.username)}
                    </td>
                    <td style="padding: 12px 16px; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #38bdf8;">${Math.round(p.best_wpm)}</td>
                    <td style="padding: 12px 16px; text-align: right; font-family: 'JetBrains Mono', monospace; color: #cbd5e1;">${Math.round(p.avg_wpm)}</td>
                    <td style="padding: 12px 16px; text-align: right; font-family: 'JetBrains Mono', monospace; color: #34d399;">${Math.round(p.avg_accuracy)}%</td>
                    <td style="padding: 12px 16px; text-align: right; font-family: 'JetBrains Mono', monospace; color: #fbbf24;">${p.total_wins} / ${p.total_races}</td>
                </tr>
            `).join('');
        }
    } catch (err) {}
}

async function loadProfile() {
    const token = localStorage.getItem('typeracer_auth_token');
    if (!token) return;

    try {
        const res = await fetch(`api/profile.php?token=${token}`);
        const data = await res.json();
        if (data.success) {
            const p = data.profile;
            document.getElementById('profile-username').textContent = p.username;
            document.getElementById('profile-email').textContent = p.email;
            document.getElementById('profile-best-wpm').textContent = Math.round(p.best_wpm);
            document.getElementById('profile-total-races').textContent = p.total_races;
            document.getElementById('profile-total-wins').textContent = p.total_wins;
            document.getElementById('profile-avg-wpm').textContent = Math.round(p.avg_wpm);
            document.getElementById('profile-avg-acc').textContent = Math.round(p.avg_accuracy) + '%';
            document.getElementById('profile-car-preview').innerHTML = getCarSVG(p.avatar || 'car-red', 60, 30);

            // Match History Table
            const tbody = document.getElementById('profile-history-tbody');
            tbody.innerHTML = (p.history || []).map(h => `
                <tr style="border-bottom: 1px solid #1e293b;">
                    <td style="padding: 10px 14px; color: #fff; font-weight: 600;">${escapeHtml(h.room_name)}</td>
                    <td style="padding: 10px 14px; text-align: center; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #fbbf24;">#${h.rank_position}</td>
                    <td style="padding: 10px 14px; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #38bdf8;">${Math.round(h.wpm)}</td>
                    <td style="padding: 10px 14px; text-align: right; font-family: 'JetBrains Mono', monospace; color: #34d399;">${Math.round(h.accuracy)}%</td>
                    <td style="padding: 10px 14px; text-align: right; font-family: 'JetBrains Mono', monospace; color: #cbd5e1;">${h.time_taken_seconds}s</td>
                </tr>
            `).join('');
        }
    } catch (err) {}
}

// ============================================================
// PRACTICE MODE (Solo vs AI Bot)
// ============================================================

let soloPracticeEngine = new RaceEngine();
let soloBotProgress = 0;
let soloBotInterval = null;

async function initPracticeMode() {
    soloPracticeEngine.init('practice-text-box', 'practice-input-box', 'practice-wpm-stat', 'practice-acc-stat');
    loadPracticeText();
}

async function loadPracticeText() {
    const lang = document.getElementById('practice-lang-select')?.value || 'id';
    const diff = document.getElementById('practice-diff-select')?.value || 'medium';

    if (soloBotInterval) clearInterval(soloBotInterval);
    soloBotProgress = 0;
    updateSoloTrack(0, 0);

    try {
        const res = await fetch(`api/get_text.php?language=${lang}&difficulty=${diff}`);
        const data = await res.json();
        if (data.success) {
            soloPracticeEngine.setText(data.text.content, data.text.source);
            soloPracticeEngine.start();

            soloPracticeEngine.onProgressChange = (prog, wpm, acc) => {
                if (prog > 0 && !soloBotInterval) {
                    const botSpeed = diff === 'easy' ? 45 : diff === 'medium' ? 70 : 95;
                    soloBotInterval = setInterval(() => {
                        soloBotProgress = Math.min(soloBotProgress + (botSpeed / 12), 100);
                        updateSoloTrack(prog, soloBotProgress);
                    }, 500);
                }
                updateSoloTrack(prog, soloBotProgress);
            };

            soloPracticeEngine.onFinish = (stats) => {
                if (soloBotInterval) clearInterval(soloBotInterval);
                if (typeof confetti === 'function') confetti({ particleCount: 50 });
                alert(`🏁 Latihan Selesai!\nKecepatan: ${stats.wpm} WPM\nAkurasi: ${stats.accuracy}%\nWaktu: ${stats.timeTakenSec} detik`);
            };
        }
    } catch (err) {}
}

function updateSoloTrack(userProg, botProg) {
    const userCar = document.getElementById('solo-user-car');
    const botCar = document.getElementById('solo-bot-car');
    if (userCar) userCar.style.transform = `translateX(${userProg * 0.9}%)`;
    if (botCar) botCar.style.transform = `translateX(${botProg * 0.9}%)`;
}

// ============================================================
// INITIALIZATION ON DOM READY
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    raceEngine.init('race-text-box', 'race-input-box', 'race-wpm-live', 'race-acc-live');

    raceEngine.onProgressChange = (prog, wpm, acc) => {
        lobbyManager.localProgress = prog;
        lobbyManager.localWpm = wpm;
        lobbyManager.localAcc = acc;
    };

    raceEngine.onFinish = (stats) => {
        lobbyManager.localProgress = 100;
        lobbyManager.localWpm = stats.wpm;
        lobbyManager.localAcc = stats.accuracy;
        lobbyManager.syncRoom();
    };

    // Chat submit listener
    const chatForm = document.getElementById('room-chat-form');
    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('room-chat-input');
            if (input && input.value.trim()) {
                lobbyManager.sendChat(input.value);
                input.value = '';
            }
        });
    }

    checkAuth();
    window.showScreen('home-screen');
});
