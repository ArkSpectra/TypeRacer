<?php
require_once 'db_connect.php';

$sortBy = $_GET['sort_by'] ?? 'best_wpm';
$limit = min(max(intval($_GET['limit'] ?? 50), 1), 100);

$orderBy = "ORDER BY best_wpm DESC, total_wins DESC";
if ($sortBy === 'total_wins') {
    $orderBy = "ORDER BY total_wins DESC, best_wpm DESC";
} else if ($sortBy === 'total_races') {
    $orderBy = "ORDER BY total_races DESC, best_wpm DESC";
}

$stmt = $pdo->query("
    SELECT id, username, avatar, total_races, total_wins, best_wpm, avg_wpm, avg_accuracy,
           CASE WHEN total_races > 0 THEN ROUND((total_wins / total_races) * 100, 1) ELSE 0 END AS win_rate
    FROM users 
    WHERE total_races > 0
    $orderBy
    LIMIT $limit
");

$leaderboard = $stmt->fetchAll();

sendResponse(true, [
    'leaderboard' => $leaderboard
]);
