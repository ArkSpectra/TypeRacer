-- ============================================================
-- TypeRacer Database Schema (Optimized for Pure PHP + MySQL)
-- Database Name: codr8681_TypeRacer
-- ============================================================

USE `codr8681_TypeRacer`;

-- 1. Users Table (Permanent User Accounts)
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `avatar` VARCHAR(30) DEFAULT 'car-red',
    `total_races` INT DEFAULT 0,
    `total_wins` INT DEFAULT 0,
    `best_wpm` FLOAT DEFAULT 0.0,
    `avg_wpm` FLOAT DEFAULT 0.0,
    `avg_accuracy` FLOAT DEFAULT 0.0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_username` (`username`),
    INDEX `idx_best_wpm` (`best_wpm`),
    INDEX `idx_total_wins` (`total_wins`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Typing Texts Library (Passages)
CREATE TABLE IF NOT EXISTS `typing_texts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `content` TEXT NOT NULL,
    `source` VARCHAR(100) DEFAULT 'Unknown',
    `language` VARCHAR(10) DEFAULT 'id',
    `difficulty` ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    `length` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Active Rooms Table
CREATE TABLE IF NOT EXISTS `rooms` (
    `id` VARCHAR(10) PRIMARY KEY, -- Room Code (e.g. RACE40)
    `name` VARCHAR(100) NOT NULL,
    `is_private` TINYINT(1) DEFAULT 0,
    `pin` VARCHAR(20) DEFAULT NULL,
    `max_players` INT DEFAULT 40,
    `language` VARCHAR(10) DEFAULT 'id',
    `difficulty` VARCHAR(15) DEFAULT 'medium',
    `status` ENUM('waiting', 'countdown', 'racing', 'finished') DEFAULT 'waiting',
    `host_id` VARCHAR(100) NOT NULL,
    `host_name` VARCHAR(50) NOT NULL,
    `text_id` INT NULL,
    `text_content` TEXT NULL,
    `text_source` VARCHAR(100) NULL,
    `start_time` BIGINT DEFAULT 0, -- Timestamp in ms when race starts
    `created_at` INT NOT NULL,
    `updated_at` INT NOT NULL,
    INDEX `idx_status` (`status`),
    INDEX `idx_updated_at` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Active Room Players (Supports up to 40 players per room)
CREATE TABLE IF NOT EXISTS `room_players` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `room_id` VARCHAR(10) NOT NULL,
    `player_token` VARCHAR(100) NOT NULL, -- Session / User unique token
    `user_id` INT NULL,
    `username` VARCHAR(50) NOT NULL,
    `avatar` VARCHAR(30) DEFAULT 'car-red',
    `is_host` TINYINT(1) DEFAULT 0,
    `is_ready` TINYINT(1) DEFAULT 0,
    `progress` FLOAT DEFAULT 0.0,
    `wpm` FLOAT DEFAULT 0.0,
    `accuracy` FLOAT DEFAULT 100.0,
    `rank_pos` INT DEFAULT NULL,
    `finish_time` FLOAT DEFAULT 0.0,
    `last_active` INT NOT NULL,
    UNIQUE KEY `uk_room_player` (`room_id`, `player_token`),
    INDEX `idx_room_id` (`room_id`),
    INDEX `idx_last_active` (`last_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. In-Game & Lobby Chat Messages
CREATE TABLE IF NOT EXISTS `room_messages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `room_id` VARCHAR(10) NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `avatar` VARCHAR(30) DEFAULT 'car-red',
    `message` VARCHAR(255) NOT NULL,
    `created_at` INT NOT NULL,
    INDEX `idx_room_msg` (`room_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Match History (Permanent Records)
CREATE TABLE IF NOT EXISTS `race_history` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `room_id` VARCHAR(10) NOT NULL,
    `room_name` VARCHAR(100) NOT NULL,
    `user_id` INT NOT NULL,
    `rank_position` INT NOT NULL,
    `wpm` FLOAT NOT NULL,
    `accuracy` FLOAT NOT NULL,
    `time_taken_seconds` FLOAT NOT NULL,
    `total_racers` INT NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Seed Sample Texts (Bahasa Indonesia & English)
-- ============================================================
INSERT INTO `typing_texts` (`content`, `source`, `language`, `difficulty`, `length`) VALUES
('Keberhasilan bukanlah akhir, kegagalan bukanlah kehancuran fatal: keberanian untuk terus melanjutkan yang paling berharga.', 'Winston Churchill (Terjemahan)', 'id', 'easy', 113),
('Teknologi akan berkembang dengan sangat cepat dan mereka yang tidak mau belajar akan tertinggal di belakang zaman yang serba modern.', 'Anonim', 'id', 'easy', 123),
('Pendidikan adalah senjata paling mematikan di dunia, karena dengan pendidikan Anda dapat mengubah dunia dengan pemikiran yang matang dan terarah.', 'Nelson Mandela (Terjemahan)', 'id', 'medium', 147),
('Setiap impian besar selalu dimulai dengan seorang pemimpi. Jangan pernah lupa bahwa kamu memiliki kekuatan dan kesabaran untuk meraih bintang.', 'Harriet Tubman (Terjemahan)', 'id', 'medium', 145),
('Dalam dunia pengembangan perangkat lunak, kode yang bersih dan terstruktur jauh lebih mudah dipahami dibandingkan kode yang rumit tanpa dokumentasi.', 'Clean Code Principle', 'id', 'hard', 152),
('The quick brown fox jumps over the lazy dog while the autumn wind gently blows through the trees.', 'Pangram Classic', 'en', 'easy', 98),
('Success is not final, failure is not fatal: it is the courage to continue that counts in the grand scheme of life.', 'Winston Churchill', 'en', 'easy', 114),
('To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.', 'Ralph Waldo Emerson', 'en', 'medium', 113),
('Programming is not just about writing code; it is about solving complex problems and creating solutions that make lives easier.', 'Developer Wisdom', 'en', 'medium', 128),
('Premature optimization is the root of all evil in programming. Write clear algorithms first and optimize only when necessary.', 'Donald Knuth', 'en', 'hard', 123);
