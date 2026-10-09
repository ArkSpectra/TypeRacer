import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function initDatabase() {
    console.log('🚀 Initializing TypeRacer Database...');
    const host = process.env.DB_HOST || 'localhost';
    const port = parseInt(process.env.DB_PORT || '3306', 10);
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'typeracer_db';

    let connection;
    try {
        // Connect to MySQL server without specific DB first
        connection = await mysql.createConnection({
            host,
            port,
            user,
            password,
            multipleStatements: true
        });

        console.log(`Connected to MySQL server at ${host}:${port}`);

        const schemaPath = path.join(__dirname, '../../schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log(`Executing schema.sql on ${dbName}...`);
        await connection.query(schemaSql);

        console.log('🎉 Database and tables initialized successfully!');
        console.log('You can also view and manage these tables directly in phpMyAdmin.');
    } catch (error) {
        console.error('❌ Failed to initialize database:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

initDatabase();
