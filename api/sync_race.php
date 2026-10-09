<?php
require_once 'db_connect.php';

$data = getJsonInput();
$code = strtoupper(trim($data['code'] ?? ''));
$playerToken = trim($data['player_token'] ?? '');
$progress = isset($data['progress']) ? min(max(floatval($data['progress']), 0), 100) : null;
$wpm = isset($data['wpm']) ? max(floatval($data['wpm']), 0) : null;
$accuracy = isset($data['accuracy']) ? min(max(floatval($data['accuracy']), 0), 100) : null;

$now = time();
$nowMs = round(microtime(true) * 1000);

if (empty($code)) {
    sendResponse(false, [], 'Kode room diperlukan');
}

// 1. Fetch Room Data
$stmt = $pdo->prepare("SELECT * FROM rooms WHERE id = ?");
$stmt->execute([$code]);
$room = $stmt->fetch();

if (!$room) {
    sendResponse(false, ['room_deleted' => true], 'Room tidak ditemukan atau telah ditutup');
}

// Check Countdown -> Transition to Racing
if ($room['status'] === 'countdown' && $room['start_time'] > 0 && $nowMs >= $room['start_time']) {
    $room['status'] = 'racing';
    $pdo->prepare("UPDATE rooms SET status = 'racing', updated_at = ? WHERE id = ?")->execute([$now, $code]);
}

// 2. Update Current Player's Telemetry if given
if ($playerToken && $progress !== null) {
    // Check if player just reached 100% (Finish Line)
    if ($progress >= 100 && $room['status'] === 'racing') {
        // Check if rank already assigned
        $pStmt = $pdo->prepare("SELECT rank_pos, user_id, username FROM room_players WHERE room_id = ? AND player_token = ?");
        $pStmt->execute([$code, $playerToken]);
        $currentP = $pStmt->fetch();

        if ($currentP && empty($currentP['rank_pos'])) {
            // Count already finished players
            $rankStmt = $pdo->prepare("SELECT COUNT(*) FROM room_players WHERE room_id = ? AND rank_pos IS NOT NULL");
            $rankStmt->execute([$code]);
            $rankPos = intval($rankStmt->fetchColumn()) + 1;

            $finishSeconds = max(round(($nowMs - $room['start_time']) / 1000, 2), 0.5);

            $updateStmt = $pdo->prepare("
                UPDATE room_players 
                SET progress = 100, wpm = ?, accuracy = ?, rank_pos = ?, finish_time = ?, last_active = ?
                WHERE room_id = ? AND player_token = ?
            ");
            $updateStmt->execute([$wpm, $accuracy, $rankPos, $finishSeconds, $now, $code, $playerToken]);

            // If registered user, record to race_history and update career stats
            if (!empty($currentP['user_id'])) {
                $uid = $currentP['user_id'];
                $isWinner = ($rankPos === 1) ? 1 : 0;

                // Total racers in room
                $totStmt = $pdo->prepare("SELECT COUNT(*) FROM room_players WHERE room_id = ?");
                $totStmt->execute([$code]);
                $totalRacers = intval($totStmt->fetchColumn()) ?: 1;

                // Save to race_history
                $histStmt = $pdo->prepare("
                    INSERT INTO race_history (room_id, room_name, user_id, rank_position, wpm, accuracy, time_taken_seconds, total_racers)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $histStmt->execute([$code, $room['name'], $uid, $rankPos, $wpm, $accuracy, $finishSeconds, $totalRacers]);

                // Update aggregate users stats
                $pdo->prepare("
                    UPDATE users 
                    SET total_races = total_races + 1,
                        total_wins = total_wins + ?,
                        best_wpm = GREATEST(best_wpm, ?),
                        avg_wpm = ROUND((avg_wpm * total_races + ?) / (total_races + 1), 1),
                        avg_accuracy = ROUND((avg_accuracy * total_races + ?) / (total_races + 1), 1)
                    WHERE id = ?
                ")->execute([$isWinner, $wpm, $wpm, $accuracy, $uid]);
            }
        }
    } else {
        // Normal progress update during race
        $stmt = $pdo->prepare("
            UPDATE room_players 
            SET progress = ?, wpm = ?, accuracy = ?, last_active = ?
            WHERE room_id = ? AND player_token = ?
        ");
        $stmt->execute([$progress, $wpm, $accuracy, $now, $code, $playerToken]);
    }
} else if ($playerToken) {
    // Keep alive ping
    $pdo->prepare("UPDATE room_players SET last_active = ? WHERE room_id = ? AND player_token = ?")->execute([$now, $code, $playerToken]);
}

// 3. Fetch All Players in the Room (Supports up to 40 players)
$playersStmt = $pdo->prepare("
    SELECT player_token, username, avatar, is_host, is_ready, progress, wpm, accuracy, rank_pos, finish_time
    FROM room_players 
    WHERE room_id = ? AND last_active >= (? - 30)
    ORDER BY (rank_pos IS NOT NULL) DESC, rank_pos ASC, progress DESC, id ASC
");
$playersStmt->execute([$code, $now]);
$players = $playersStmt->fetchAll();

// 4. Check if All Finished
if ($room['status'] === 'racing' && count($players) > 0) {
    $allFinished = true;
    foreach ($players as $p) {
        if (empty($p['rank_pos'])) {
            $allFinished = false;
            break;
        }
    }
    if ($allFinished) {
        $room['status'] = 'finished';
        $pdo->prepare("UPDATE rooms SET status = 'finished', updated_at = ? WHERE id = ?")->execute([$now, $code]);
    }
}

// Calculate countdown remaining seconds
$countdownSec = null;
if ($room['status'] === 'countdown' && $room['start_time'] > 0) {
    $diffMs = $room['start_time'] - $nowMs;
    $countdownSec = max(ceil($diffMs / 1000), 0);
}

sendResponse(true, [
    'server_time' => $nowMs,
    'room' => [
        'code' => $room['id'],
        'name' => $room['name'],
        'status' => $room['status'],
        'is_private' => (bool)$room['is_private'],
        'language' => $room['language'],
        'difficulty' => $room['difficulty'],
        'max_players' => intval($room['max_players']),
        'host_id' => $room['host_id'],
        'host_name' => $room['host_name'],
        'start_time' => $room['start_time'],
        'countdown_sec' => $countdownSec,
        'text' => [
            'id' => $room['text_id'],
            'content' => $room['text_content'],
            'source' => $room['text_source']
        ]
    ],
    'players' => $players
]);
