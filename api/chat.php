<?php
require_once 'db_connect.php';

$action = $_GET['action'] ?? 'get';
$data = getJsonInput();
$now = time();

// 1. SEND MESSAGE
if ($action === 'send') {
    $code = strtoupper(trim($data['code'] ?? ''));
    $playerToken = trim($data['player_token'] ?? '');
    $message = trim($data['message'] ?? '');

    if (empty($code) || empty($message)) {
        sendResponse(false, [], 'Pesan tidak boleh kosong');
    }

    // Get sender info from room_players
    $stmt = $pdo->prepare("SELECT username, avatar FROM room_players WHERE room_id = ? AND player_token = ?");
    $stmt->execute([$code, $playerToken]);
    $sender = $stmt->fetch();

    $username = $sender ? $sender['username'] : 'Pembalap';
    $avatar = $sender ? $sender['avatar'] : 'car-red';

    $insertStmt = $pdo->prepare("INSERT INTO room_messages (room_id, username, avatar, message, created_at) VALUES (?, ?, ?, ?, ?)");
    $insertStmt->execute([$code, $username, $avatar, mb_substr($message, 0, 200), $now]);

    sendResponse(true, [], 'Pesan terkirim');
}

// 2. GET RECENT MESSAGES
else if ($action === 'get') {
    $code = strtoupper(trim($_GET['code'] ?? ''));
    $since = intval($_GET['since'] ?? 0);

    $stmt = $pdo->prepare("
        SELECT id, username, avatar, message, created_at
        FROM room_messages 
        WHERE room_id = ? AND created_at >= ?
        ORDER BY id ASC
        LIMIT 40
    ");
    $stmt->execute([$code, $since]);
    $messages = $stmt->fetchAll();

    sendResponse(true, [
        'messages' => $messages,
        'server_time' => $now
    ]);
}

sendResponse(false, [], 'Aksi tidak valid');
