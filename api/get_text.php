<?php
require_once 'db_connect.php';

$language = $_GET['language'] ?? 'id';
$difficulty = $_GET['difficulty'] ?? 'medium';

$sql = "SELECT * FROM typing_texts WHERE 1=1";
$params = [];

if ($language && $language !== 'all') {
    $sql .= " AND language = ?";
    $params[] = $language;
}

if ($difficulty && $difficulty !== 'all') {
    $sql .= " AND difficulty = ?";
    $params[] = $difficulty;
}

$sql .= " ORDER BY RAND() LIMIT 1";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$text = $stmt->fetch();

if (!$text) {
    $text = [
        'id' => 1,
        'content' => 'Keberhasilan bukanlah akhir, kegagalan bukanlah kehancuran fatal: keberanian untuk terus melanjutkan yang paling berharga.',
        'source' => 'Winston Churchill',
        'language' => 'id',
        'difficulty' => 'easy'
    ];
}

sendResponse(true, [
    'text' => $text
]);
