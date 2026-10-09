<?php
// ============================================================
// Database Connection & Helper Functions for TypeRacer
// ============================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$host = 'localhost';
$dbname = 'codr8681_TypeRacer';
$username = 'codr8681_Adhya';
$password = 'R?CXMfLM6?IQX]Rd';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Koneksi Database Gagal: ' . $e->getMessage()
    ]);
    exit;
}

// JSON Output Helper
function sendResponse($success, $data = [], $message = '') {
    echo json_encode(array_merge([
        'success' => $success,
        'message' => $message
    ], $data));
    exit;
}

// Get JSON POST payload
function getJsonInput() {
    $input = file_get_contents('php://input');
    return json_decode($input, true) ?: $_POST;
}

// Simple Session / Token Verification Helper
function getAuthUser($pdo) {
    $headers = getallheaders();
    $token = null;
    if (isset($headers['Authorization'])) {
        $matches = [];
        if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
            $token = $matches[1];
        }
    }
    
    if (!$token && isset($_REQUEST['token'])) {
        $token = $_REQUEST['token'];
    }

    if (!$token) return null;

    // Decode token: base64_encode("$userId:$username:$hash")
    $decoded = base64_decode($token);
    if (!$decoded) return null;

    $parts = explode(':', $decoded);
    if (count($parts) < 2) return null;

    $userId = intval($parts[0]);
    $stmt = $pdo->prepare("SELECT id, username, email, avatar, total_races, total_wins, best_wpm, avg_wpm, avg_accuracy FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    return $stmt->fetch() ?: null;
}
