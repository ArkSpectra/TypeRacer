<?php
require_once 'db_connect.php';

$action = $_GET['action'] ?? 'me';
$data = getJsonInput();

// 1. REGISTER
if ($action === 'register') {
    $username = trim($data['username'] ?? '');
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $avatar = $data['avatar'] ?? 'car-red';

    if (empty($username) || empty($email) || empty($password)) {
        sendResponse(false, [], 'Semua field wajib diisi');
    }

    if (strlen($username) < 3) {
        sendResponse(false, [], 'Username minimal 3 karakter');
    }

    if (strlen($password) < 6) {
        sendResponse(false, [], 'Password minimal 6 karakter');
    }

    // Check unique
    $stmt = $pdo->prepare("SELECT id, username, email FROM users WHERE username = ? OR email = ? LIMIT 1");
    $stmt->execute([$username, $email]);
    $existing = $stmt->fetch();

    if ($existing) {
        if (strcasecmp($existing['username'], $username) === 0) {
            sendResponse(false, [], 'Username sudah digunakan');
        }
        if (strcasecmp($existing['email'], $email) === 0) {
            sendResponse(false, [], 'Email sudah terdaftar');
        }
    }

    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("INSERT INTO users (username, email, password, avatar) VALUES (?, ?, ?, ?)");
    $stmt->execute([$username, $email, $hashedPassword, $avatar]);
    $newId = $pdo->lastInsertId();

    $token = base64_encode("$newId:$username:" . bin2hex(random_bytes(8)));

    sendResponse(true, [
        'token' => $token,
        'user' => [
            'id' => $newId,
            'username' => $username,
            'email' => $email,
            'avatar' => $avatar,
            'total_races' => 0,
            'total_wins' => 0,
            'best_wpm' => 0,
            'avg_wpm' => 0,
            'avg_accuracy' => 0
        ]
    ], 'Registrasi berhasil');
}

// 2. LOGIN
else if ($action === 'login') {
    $identifier = trim($data['identifier'] ?? '');
    $password = $data['password'] ?? '';

    if (empty($identifier) || empty($password)) {
        sendResponse(false, [], 'Username/Email dan password wajib diisi');
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1");
    $stmt->execute([$identifier, $identifier]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        sendResponse(false, [], 'Username/Email atau password salah');
    }

    $token = base64_encode("{$user['id']}:{$user['username']}:" . bin2hex(random_bytes(8)));

    sendResponse(true, [
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'avatar' => $user['avatar'] ?: 'car-red',
            'total_races' => intval($user['total_races']),
            'total_wins' => intval($user['total_wins']),
            'best_wpm' => round(floatval($user['best_wpm']), 1),
            'avg_wpm' => round(floatval($user['avg_wpm']), 1),
            'avg_accuracy' => round(floatval($user['avg_accuracy']), 1)
        ]
    ], 'Login berhasil');
}

// 3. GET ME / CURRENT USER
else if ($action === 'me') {
    $user = getAuthUser($pdo);
    if (!$user) {
        sendResponse(false, [], 'Tidak ada sesi aktif');
    }

    sendResponse(true, [
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'avatar' => $user['avatar'] ?: 'car-red',
            'total_races' => intval($user['total_races']),
            'total_wins' => intval($user['total_wins']),
            'best_wpm' => round(floatval($user['best_wpm']), 1),
            'avg_wpm' => round(floatval($user['avg_wpm']), 1),
            'avg_accuracy' => round(floatval($user['avg_accuracy']), 1)
        ]
    ]);
}

// 4. UPDATE AVATAR
else if ($action === 'update_avatar') {
    $user = getAuthUser($pdo);
    if (!$user) {
        sendResponse(false, [], 'Silakan login terlebih dahulu');
    }

    $avatar = $data['avatar'] ?? 'car-red';
    $stmt = $pdo->prepare("UPDATE users SET avatar = ? WHERE id = ?");
    $stmt->execute([$avatar, $user['id']]);

    sendResponse(true, ['avatar' => $avatar], 'Avatar berhasil diperbarui');
}

sendResponse(false, [], 'Aksi tidak valid');
