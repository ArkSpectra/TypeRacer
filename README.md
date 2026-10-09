# 🏎️ TypeRacer Multiplayer Arena

Aplikasi game balapan ketik multiplayer real-time berbasis **React (Vite)**, **Node.js (Express + Socket.IO)**, dan **MySQL / phpMyAdmin**.

---

## 🚀 Fitur Utama

1. **Sistem Autentikasi & Akun**:
   - Registrasi & Login dengan enkripsi password (`bcrypt`).
   - Token JWT untuk sesi yang aman.
   - Pilihan avatar & warna mobil balap kustom (Crimson Fury, Azure Bolt, Emerald Viper, dsb).
2. **Multiplayer Lobby & Kamar Balapan**:
   - **Daftar Lobby Publik**: Melihat status lobby live (menunggu / sedang balapan), jumlah pemain, bahasa, & tingkat kesulitan.
   - **Kamar Privat dengan PIN**: Buat room khusus dengan kode PIN untuk bermain bersama teman.
   - **Gabung Cepat (Direct Join)**: Masuk ke room mana saja langsung menggunakan 6-digit Kode Room.
   - **Host Controls & Status Ready**: Pemain dapat menandai status siap, dan Host dapat memulai balapan ketika semua sudah siap.
   - **Lobby & In-Game Chat**: Obrolan real-time dengan pemain lain.
3. **Gameplay & Mekanisme Balapan Modern**:
   - **Mode Santai**: Mengetik tanpa terblokir saat melakukan kesalahan (karakter salah ditandai merah dan mengurangi skor akurasi).
   - **Lintasan Balap Real-Time**: Pergerakan mobil setiap pemain terupdate secara langsung via WebSocket.
   - **Hitung Mundur Sinkron**: Hitung mundur 5 detik serentak sebelum balapan dimulai.
   - **Live Telemetri**: Menampilkan WPM (*Words Per Minute*), CPM (*Characters Per Minute*), dan persentase Akurasi secara langsung.
4. **Papan Skor & Riwayat Balapan**:
   - **Podium Juara & Hasil Balapan**: Rekapitulasi peringkat 1, 2, 3 dengan animasi selebrasi *confetti*.
   - **Global Leaderboard**: Peringkat pemain terbaik berdasarkan WPM tertinggi, total kemenangan, dan total balapan.
   - **Profil Pengguna**: Riwayat balapan lengkap dan statistik karir.
5. **Mode Latihan Solo**:
   - Latihan mandiri melawan **AI Ghost Bot** dengan berbagai tingkat kesulitan (Mudah, Sedang, Sulit) dan pilihan bahasa (Indonesia / English).

---

## 🛠️ Panduan Instalasi & Menjalankan Aplikasi

### 1. Import Database ke phpMyAdmin / MySQL
1. Buka **phpMyAdmin** Anda (misalnya via XAMPP di `http://localhost/phpmyadmin`).
2. Buat database baru bernama: `typeracer_db` (atau biarkan skrip membuatkannya otomatis).
3. Klik menu **Import** di phpMyAdmin, pilih file:
   ```
   server/schema.sql
   ```
4. Klik **Go / Kirim** untuk menjalankan skrip. Database beserta tabel `users`, `typing_texts`, `races`, dan `race_participants` akan langsung terbuat dan terisi sample teks pengetikan.

> **Tips:** Anda juga dapat mengedit konfigurasi koneksi MySQL di file `server/.env` jika menggunakan username/password database yang berbeda.

---

### 2. Menjalankan Backend (`server`)
Buka terminal baru di folder `server`:
```bash
cd server
npm install
npm run dev
```
Server akan berjalan di: `http://localhost:5000`

---

### 3. Menjalankan Frontend (`client`)
Buka terminal baru di folder `client`:
```bash
cd client
npm install
npm run dev
```
Buka browser Anda di: `http://localhost:5173`

---

## 📁 Struktur Direktori
```
TypeRacer/
├── client/
│   ├── src/
│   │   ├── components/      # RaceTrack, TypingEngine, CarIcon, PodiumModal, LobbyChat, Navbar
│   │   ├── context/         # AuthContext, SocketContext
│   │   ├── pages/           # HomePage, LoginPage, RegisterPage, LobbyBrowserPage, RaceRoomPage, PracticePage, LeaderboardPage, ProfilePage
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/          # db.js (MySQL connection pool)
│   │   ├── controllers/     # authController, statsController, textController
│   │   ├── middlewares/     # auth.js (JWT)
│   │   ├── routes/          # authRoutes, statsRoutes, textRoutes
│   │   ├── sockets/         # raceHandler.js (Socket.IO multiplayer engine)
│   │   └── server.js        # Express app & Socket server entry
│   ├── schema.sql           # Schema SQL siap import ke phpMyAdmin
│   ├── .env.example
│   └── package.json
└── README.md
```
