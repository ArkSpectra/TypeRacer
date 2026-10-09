<?php
require_once 'db_connect.php';

$user = getAuthUser($pdo);

if (!$user) {
    sendResponse(false, [], 'Silakan login terlebih dahulu');
}

// Fetch recent 15 match history
$stmt = $pdo->prepare("
    SELECT id, room_id, room_name, rank_position, wpm, accuracy, time_taken_seconds, total_racers, created_at
    FROM race_history 
    WHERE user_id = ?
    ORDER BY id DESC
    LIMIT 15
");
$stmt->execute([$user['id']]);
$history = $stmt->fetchAll();

$winRate = ($user['total_races'] > 0) ? round(($user['total_wins'] / $user['total_races']) * 100, 1) : 0;

sendResponse(true, [
    'profile' => [
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'avatar' => $user['avatar'] ?: 'car-red',
        'total_races' => intval($user['total_races']),
        'total_wins' => intval($user['total_wins']),
        'best_wpm' => round(floatval($user['best_wpm']), 1),
        'avg_wpm' => round(floatval($user['avg_wpm']), 1),
        'avg_accuracy' => round(floatval($user['avg_accuracy']), 1),
        'win_rate' => $winRate,
        'history' => $history
    ]
]);
