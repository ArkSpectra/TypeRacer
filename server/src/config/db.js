import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'typeracer_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true
});

// Helper query function
export async function query(sql, params = []) {
    try {
        const [rows, fields] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Database query error:', error.message);
        throw error;
    }
}

// Test database connection
export async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log(`✅ [Database] Connected successfully to MySQL (${process.env.DB_NAME || 'typeracer_db'})`);
        connection.release();
        return true;
    } catch (error) {
        console.warn(`⚠️ [Database] Could not connect to MySQL: ${error.message}`);
        console.warn('💡 Tip: Ensure MySQL server (e.g., XAMPP, phpMyAdmin, or MySQL Server) is running and database exists.');
        return false;
    }
}

export default pool;
