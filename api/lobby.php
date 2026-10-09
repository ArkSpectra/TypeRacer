<?php
require_once 'db_connect.php';

$action = $_GET['action'] ?? 'list';
$data = getJsonInput();
$now = time();

// Auto cleanup rooms inactive for > 15 minutes or with 0 players
$pdo->query("DELETE FROM rooms WHERE updated_at < ($now - 900)");
$pdo->query("DELETE FROM room_players WHERE last_active < ($now - 60)");

// 1. LIST PUBLIC ROOMS
if ($action === 'list') {
    $stmt = $pdo->query("
        SELECT r.id, r.name, r.is_private, r.max_players, r.language, r.difficulty, r.status, r.host_name,
               COUNT(p.id) as player_count
        FROM rooms r
        LEFT JOIN room_players p ON r.id = p.room_id
        WHERE r.is_private = 0
        GROUP BY r.id
        ORDER BY r.created_at DESC
        LIMIT 30
    ");
    $rooms = $stmt->fetchAll();
    sendResponse(true, ['rooms' => $rooms]);
}

// 2. CREATE ROOM
else if ($action === 'create') {
    $user = getAuthUser($pdo);
    $playerToken = trim($data['player_token'] ?? bin2hex(random_bytes(16)));
    $username = $user ? $user['username'] : trim($data['username'] ?? 'Pembalap_' . substr($playerToken, 0, 4));
    $avatar = $user ? $user['avatar'] : ($data['avatar'] ?? 'car-red');
    $userId = $user ? $user['id'] : null;

    $roomName = trim($data['name'] ?? "Lobby $username");
    $isPrivate = !empty($data['is_private']) ? 1 : 0;
    $pin = !empty($data['pin']) ? trim($data['pin']) : null;
    $maxPlayers = min(max(intval($data['max_players'] ?? 40), 2), 40);
    $language = in_array($data['language'] ?? '', ['id', 'en']) ? $data['language'] : 'id';
    $difficulty = in_array($data['difficulty'] ?? '', ['easy', 'medium', 'hard']) ? $data['difficulty'] : 'medium';

    // Generate unique 6-character room code
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $code = '';
    do {
        $code = '';
        for ($i = 0; $i < 6; $i++) {
            $code .= $chars[random_int(0, strlen($chars) - 1)];
        }
        $check = $pdo->prepare("SELECT id FROM rooms WHERE id = ?");
        $check->execute([$code]);
    } while ($check->fetch());

    // Select initial text
    $textStmt = $pdo->prepare("SELECT * FROM typing_texts WHERE language = ? AND difficulty = ? ORDER BY RAND() LIMIT 1");
    $textStmt->execute([$language, $difficulty]);
    $text = $textStmt->fetch();

    if (!$text) {
        $text = [
            'id' => 1,
            'content' => 'Keberhasilan bukanlah akhir, kegagalan bukanlah kehancuran fatal: keberanian untuk terus melanjutkan yang paling berharga.',
            'source' => 'Winston Churchill'
        ];
    }

    // Insert Room
    $stmt = $pdo->prepare("
        INSERT INTO rooms (id, name, is_private, pin, max_players, language, difficulty, status, host_id, host_name, text_id, text_content, text_source, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'waiting', ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $code, $roomName, $isPrivate, $pin, $maxPlayers, $language, $difficulty,
        $playerToken, $username, $text['id'], $text['content'], $text['source'], $now, $now
    ]);

    // Insert Host Player
    $playerStmt = $pdo->prepare("
        INSERT INTO room_players (room_id, player_token, user_id, username, avatar, is_host, is_ready, progress, wpm, accuracy, last_active)
        VALUES (?, ?, ?, ?, ?, 1, 1, 0, 0, 100, ?)
    ");
    $playerStmt->execute([$code, $playerToken, $userId, $username, $avatar, $now]);

    sendResponse(true, [
        'room_code' => $code,
        'player_token' => $playerToken
    ], 'Room berhasil dibuat');
}

// 3. JOIN ROOM
else if ($action === 'join') {
    $code = strtoupper(trim($data['code'] ?? ''));
    $pin = trim($data['pin'] ?? '');
    $playerToken = trim($data['player_token'] ?? bin2hex(random_bytes(16)));
    $user = getAuthUser($pdo);
    $username = $user ? $user['username'] : trim($data['username'] ?? 'Pembalap_' . substr($playerToken, 0, 4));
    $avatar = $user ? $user['avatar'] : ($data['avatar'] ?? 'car-blue');
    $userId = $user ? $user['id'] : null;

    $stmt = $pdo->prepare("SELECT * FROM rooms WHERE id = ?");
    $stmt->execute([$code]);
    $room = $stmt->fetch();

    if (!$room) {
        sendResponse(false, [], 'Room tidak ditemukan');
    }

    if ($room['is_private'] && !empty($room['pin']) && $room['pin'] !== $pin) {
        sendResponse(false, [], 'PIN Room salah');
    }

    // Count current players
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM room_players WHERE room_id = ?");
    $countStmt->execute([$code]);
    $playerCount = $countStmt->fetchColumn();

    if ($playerCount >= $room['max_players']) {
        sendResponse(false, [], 'Room sudah penuh');
    }

    // Insert or update player in room
    $stmt = $pdo->prepare("
        INSERT INTO room_players (room_id, player_token, user_id, username, avatar, is_host, is_ready, progress, wpm, accuracy, last_active)
        VALUES (?, ?, ?, ?, ?, 0, 0, 0, 0, 100, ?)
        ON DUPLICATE KEY UPDATE username = VALUES(username), avatar = VALUES(avatar), last_active = VALUES(last_active)
    ");
    $stmt->execute([$code, $playerToken, $userId, $username, $avatar, $now]);

    // Update room timestamp
    $pdo->prepare("UPDATE rooms SET updated_at = ? WHERE id = ?")->execute([$now, $code]);

    sendResponse(true, [
        'room_code' => $code,
        'player_token' => $playerToken
    ], 'Berhasil bergabung ke room');
}

// 4. TOGGLE READY
else if ($action === 'toggle_ready') {
    $code = strtoupper(trim($data['code'] ?? ''));
    $playerToken = trim($data['player_token'] ?? '');

    $stmt = $pdo->prepare("UPDATE room_players SET is_ready = 1 - is_ready, last_active = ? WHERE room_id = ? AND player_token = ?");
    $stmt->execute([$now, $code, $playerToken]);

    sendResponse(true, [], 'Status ready diubah');
}

// 5. CHANGE AVATAR
else if ($action === 'change_avatar') {
    $code = strtoupper(trim($data['code'] ?? ''));
    $playerToken = trim($data['player_token'] ?? '');
    $avatar = $data['avatar'] ?? 'car-red';

    $stmt = $pdo->prepare("UPDATE room_players SET avatar = ?, last_active = ? WHERE room_id = ? AND player_token = ?");
    $stmt->execute([$avatar, $now, $code, $playerToken]);

    sendResponse(true, ['avatar' => $avatar], 'Avatar diubah');
}

// 6. LEAVE ROOM
else if ($action === 'leave') {
    $code = strtoupper(trim($data['code'] ?? ''));
    $playerToken = trim($data['player_token'] ?? '');

    $pdo->prepare("DELETE FROM room_players WHERE room_id = ? AND player_token = ?")->execute([$code, $playerToken]);

    // Check remaining players
    $stmt = $pdo->prepare("SELECT * FROM room_players WHERE room_id = ? ORDER BY id ASC");
    $stmt->execute([$code]);
    $remaining = $stmt->fetchAll();

    if (empty($remaining)) {
        $pdo->prepare("DELETE FROM rooms WHERE id = ?")->execute([$code]);
        $pdo->prepare("DELETE FROM room_messages WHERE room_id = ?")->execute([$code]);
    } else {
        // If host left, promote the next player
        $hasHost = false;
        foreach ($remaining as $p) {
            if ($p['is_host']) { $hasHost = true; break; }
        }
        if (!$hasHost) {
            $nextHost = $remaining[0];
            $pdo->prepare("UPDATE room_players SET is_host = 1, is_ready = 1 WHERE id = ?")->execute([$nextHost['id']]);
            $pdo->prepare("UPDATE rooms SET host_id = ?, host_name = ? WHERE id = ?")->execute([$nextHost['player_token'], $nextHost['username'], $code]);
        }
    }

    sendResponse(true, [], 'Berhasil keluar dari room');
}

sendResponse(false, [], 'Aksi tidak valid');
