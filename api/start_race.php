<?php
require_once 'db_connect.php';

$data = getJsonInput();
$code = strtoupper(trim($data['code'] ?? ''));
$playerToken = trim($data['player_token'] ?? '');
$now = time();
$nowMs = round(microtime(true) * 1000);

$stmt = $pdo->prepare("SELECT * FROM rooms WHERE id = ?");
$stmt->execute([$code]);
$room = $stmt->fetch();

if (!$room) {
    sendResponse(false, [], 'Room tidak ditemukan');
}

if ($room['host_id'] !== $playerToken) {
    sendResponse(false, [], 'Hanya Host yang dapat memulai balapan');
}

// Fetch a new random text for this match
$textStmt = $pdo->prepare("SELECT * FROM typing_texts WHERE language = ? AND difficulty = ? ORDER BY RAND() LIMIT 1");
$textStmt->execute([$room['language'], $room['difficulty']]);
$text = $textStmt->fetch();

if (!$text) {
    $text = [
        'id' => 1,
        'content' => 'Keberhasilan bukanlah akhir, kegagalan bukanlah kehancuran fatal: keberanian untuk terus melanjutkan yang paling berharga.',
        'source' => 'Winston Churchill'
    ];
}

// Set start time to 5 seconds in the future (synchronized countdown)
$startTimeMs = $nowMs + 5000;

// Update room state
$pdo->prepare("
    UPDATE rooms 
    SET status = 'countdown', start_time = ?, text_id = ?, text_content = ?, text_source = ?, updated_at = ?
    WHERE id = ?
")->execute([$startTimeMs, $text['id'], $text['content'], $text['source'], $now, $code]);

// Reset all players in room
$pdo->prepare("
    UPDATE room_players 
    SET progress = 0, wpm = 0, accuracy = 100, rank_pos = NULL, finish_time = 0, last_active = ?
    WHERE room_id = ?
")->execute([$now, $code]);

sendResponse(true, [
    'start_time' => $startTimeMs,
    'text' => [
        'id' => $text['id'],
        'content' => $text['content'],
        'source' => $text['source']
    ]
], 'Balapan dimulai!');
