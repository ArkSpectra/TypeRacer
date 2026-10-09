import { query } from '../config/db.js';

export async function getLeaderboard(req, res) {
    try {
        const { sortBy = 'best_wpm', limit = 50 } = req.query;

        let orderByClause = 'ORDER BY best_wpm DESC, total_wins DESC';
        if (sortBy === 'total_wins') {
            orderByClause = 'ORDER BY total_wins DESC, best_wpm DESC';
        } else if (sortBy === 'total_races') {
            orderByClause = 'ORDER BY total_races DESC, best_wpm DESC';
        }

        const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);

        const leaderboard = await query(
            `SELECT id, username, avatar, total_races, total_wins, best_wpm, avg_wpm, avg_accuracy,
                    CASE WHEN total_races > 0 THEN ROUND((total_wins / total_races) * 100, 1) ELSE 0 END AS win_rate
             FROM users 
             WHERE total_races > 0
             ${orderByClause}
             LIMIT ${safeLimit}`
        );

        res.json({
            success: true,
            leaderboard
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data leaderboard' });
    }
}

export async function getUserStats(req, res) {
    try {
        const { userId } = req.params;

        const users = await query(
            `SELECT id, username, avatar, total_races, total_wins, best_wpm, avg_wpm, avg_accuracy, created_at 
             FROM users WHERE id = ? LIMIT 1`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        const user = users[0];

        // Fetch recent match history
        const history = await query(
            `SELECT rp.id, rp.race_id, rp.rank_position, rp.wpm, rp.accuracy, rp.time_taken_seconds, rp.created_at,
                    r.room_name, r.total_players
             FROM race_participants rp
             JOIN races r ON rp.race_id = r.id
             WHERE rp.user_id = ?
             ORDER BY rp.created_at DESC
             LIMIT 15`,
            [userId]
        );

        res.json({
            success: true,
            stats: {
                ...user,
                winRate: user.total_races > 0 ? ((user.total_wins / user.total_races) * 100).toFixed(1) : 0,
                history
            }
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil statistik pemain' });
    }
}
