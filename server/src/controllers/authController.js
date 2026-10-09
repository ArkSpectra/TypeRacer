import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

export async function register(req, res) {
    try {
        const { username, email, password, avatar } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
        }

        if (username.trim().length < 3) {
            return res.status(400).json({ success: false, message: 'Username minimal 3 karakter' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password minimal 6 karakter' });
        }

        // Check if username or email already exists
        const existingUsers = await query(
            'SELECT id, username, email FROM users WHERE username = ? OR email = ? LIMIT 1',
            [username.trim(), email.trim()]
        );

        if (existingUsers.length > 0) {
            const existing = existingUsers[0];
            if (existing.username.toLowerCase() === username.trim().toLowerCase()) {
                return res.status(400).json({ success: false, message: 'Username sudah digunakan' });
            }
            if (existing.email.toLowerCase() === email.trim().toLowerCase()) {
                return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const userAvatar = avatar || 'car-red';

        const result = await query(
            `INSERT INTO users (username, email, password, avatar) VALUES (?, ?, ?, ?)`,
            [username.trim(), email.trim(), hashedPassword, userAvatar]
        );

        const newUserId = result.insertId;

        // Generate JWT token
        const token = jwt.sign(
            { id: newUserId, username: username.trim(), email: email.trim() },
            process.env.JWT_SECRET || 'super_secret_typeracer_jwt_key_2026_!@#$',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil!',
            token,
            user: {
                id: newUserId,
                username: username.trim(),
                email: email.trim(),
                avatar: userAvatar,
                totalRaces: 0,
                totalWins: 0,
                bestWpm: 0,
                avgWpm: 0,
                avgAccuracy: 0
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server saat registrasi' });
    }
}

export async function login(req, res) {
    try {
        const { identifier, password } = req.body; // identifier can be email or username

        if (!identifier || !password) {
            return res.status(400).json({ success: false, message: 'Email/Username dan password wajib diisi' });
        }

        const users = await query(
            `SELECT id, username, email, password, avatar, total_races, total_wins, best_wpm, avg_wpm, avg_accuracy 
             FROM users 
             WHERE username = ? OR email = ? LIMIT 1`,
            [identifier.trim(), identifier.trim()]
        );

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Username/Email atau password salah' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Username/Email atau password salah' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            process.env.JWT_SECRET || 'super_secret_typeracer_jwt_key_2026_!@#$',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            success: true,
            message: 'Login berhasil!',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar: user.avatar || 'car-red',
                totalRaces: user.total_races || 0,
                totalWins: user.total_wins || 0,
                bestWpm: parseFloat(user.best_wpm || 0),
                avgWpm: parseFloat(user.avg_wpm || 0),
                avgAccuracy: parseFloat(user.avg_accuracy || 0)
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server saat login' });
    }
}

export async function getMe(req, res) {
    try {
        const users = await query(
            `SELECT id, username, email, avatar, total_races, total_wins, best_wpm, avg_wpm, avg_accuracy, created_at 
             FROM users WHERE id = ? LIMIT 1`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        const user = users[0];
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar: user.avatar || 'car-red',
                totalRaces: user.total_races || 0,
                totalWins: user.total_wins || 0,
                bestWpm: parseFloat(user.best_wpm || 0),
                avgWpm: parseFloat(user.avg_wpm || 0),
                avgAccuracy: parseFloat(user.avg_accuracy || 0),
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data profil' });
    }
}

export async function updateAvatar(req, res) {
    try {
        const { avatar } = req.body;
        if (!avatar) {
            return res.status(400).json({ success: false, message: 'Avatar wajib dipilih' });
        }

        await query('UPDATE users SET avatar = ? WHERE id = ?', [avatar, req.user.id]);

        res.json({
            success: true,
            message: 'Avatar berhasil diubah',
            avatar
        });
    } catch (error) {
        console.error('Update avatar error:', error);
        res.status(500).json({ success: false, message: 'Gagal mengubah avatar' });
    }
}
