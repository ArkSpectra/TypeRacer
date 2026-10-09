import { query } from '../config/db.js';

// Fallback texts in case database query is not available or empty
const fallbackTexts = [
    {
        id: 1,
        content: 'Keberhasilan bukanlah akhir, kegagalan bukanlah kehancuran fatal: keberanian untuk terus melanjutkan yang paling berharga.',
        source: 'Winston Churchill (Terjemahan)',
        language: 'id',
        difficulty: 'easy'
    },
    {
        id: 2,
        content: 'Teknologi akan berkembang dengan sangat cepat dan mereka yang tidak mau belajar akan tertinggal di belakang zaman yang serba modern.',
        source: 'Anonim',
        language: 'id',
        difficulty: 'easy'
    },
    {
        id: 3,
        content: 'Pendidikan adalah senjata paling mematikan di dunia, karena dengan pendidikan Anda dapat mengubah dunia dengan pemikiran yang matang dan terarah.',
        source: 'Nelson Mandela (Terjemahan)',
        language: 'id',
        difficulty: 'medium'
    },
    {
        id: 4,
        content: 'The quick brown fox jumps over the lazy dog while the autumn wind gently blows through the trees.',
        source: 'Pangram Classic',
        language: 'en',
        difficulty: 'easy'
    },
    {
        id: 5,
        content: 'Programming is not just about writing code; it is about solving complex problems and creating solutions that make lives easier.',
        source: 'Developer Wisdom',
        language: 'en',
        difficulty: 'medium'
    }
];

export async function getRandomText(req, res) {
    try {
        const { language, difficulty } = req.query;

        let sql = 'SELECT * FROM typing_texts WHERE 1=1';
        const params = [];

        if (language) {
            sql += ' AND language = ?';
            params.push(language);
        }

        if (difficulty) {
            sql += ' AND difficulty = ?';
            params.push(difficulty);
        }

        sql += ' ORDER BY RAND() LIMIT 1';

        const rows = await query(sql, params);

        if (rows.length > 0) {
            return res.json({ success: true, text: rows[0] });
        }

        // Filter fallback texts
        let filtered = fallbackTexts;
        if (language) filtered = filtered.filter(t => t.language === language);
        if (difficulty) filtered = filtered.filter(t => t.difficulty === difficulty);
        if (filtered.length === 0) filtered = fallbackTexts;

        const randomFallback = filtered[Math.floor(Math.random() * filtered.length)];
        res.json({ success: true, text: randomFallback });
    } catch (error) {
        console.error('Get random text error:', error);
        const randomFallback = fallbackTexts[Math.floor(Math.random() * fallbackTexts.length)];
        res.json({ success: true, text: randomFallback });
    }
}

export async function getAllTexts(req, res) {
    try {
        const rows = await query('SELECT * FROM typing_texts ORDER BY id DESC');
        res.json({ success: true, texts: rows.length > 0 ? rows : fallbackTexts });
    } catch (error) {
        res.json({ success: true, texts: fallbackTexts });
    }
}
