# 🏎️ TypeRacer Multiplayer Arena (Pure PHP + MySQL)

Game balapan ketik multiplayer real-time berbasis **PHP Native (PDO)**, **MySQL**, dan **JavaScript (Single Page App)** yang dioptimalkan untuk performa tinggi hingga **40 pemain per room** di shared hosting cPanel tanpa memerlukan Node.js atau server eksternal.

---

## 📁 Struktur Direktori Bersih
```text
TypeRacer/
├── api/
│   ├── db_connect.php       # Koneksi database ke codr8681_TypeRacer
│   ├── auth.php             # Registrasi & Login akun pembalap
│   ├── lobby.php            # Manajemen room & kapasitas hingga 40 pemain
│   ├── start_race.php       # Hitung mundur 5 detik sinkron oleh Host
│   ├── sync_race.php        # API Sinkronisasi Berkecepatan Tinggi (Single Roundtrip)
│   ├── chat.php             # Fitur pesan chat di dalam room
│   ├── leaderboard.php      # Papan peringkat global (Top WPM & Win Rate)
│   ├── get_text.php         # Bank teks kalimat & kutipan
│   └── profile.php          # Statistik karir & riwayat pertandingan
├── assets/
│   ├── css/
│   │   └── style.css        # Desain dark arcade racing modern & animasi halus
│   └── js/
│       ├── car_svg.js       # Generator 8 warna mobil balap SVG
│       ├── race_engine.js   # Typing Engine Mode Santai & Dead Reckoning
│       ├── lobby_manager.js # Pengatur sinkronisasi multi-jalur 40 pemain
│       └── app.js           # Router layar, autentikasi, & duel AI Bot
├── index.php                # Tampilan utama web game
├── schema.sql               # File SQL untuk phpMyAdmin
├── .htaccess                # Optimasi kompresi GZIP server cPanel
└── README.md                # Dokumentasi proyek
```

---

## 🚀 Cara Upload ke Hosting cPanel (`codewar.my.id/TypeRacer`)

### 1. Import Database ke phpMyAdmin
1. Buka **phpMyAdmin** di cPanel Anda.
2. Pilih database **`codr8681_TypeRacer`**.
3. Klik tab **Import** -> pilih file `schema.sql` -> klik **Go / Kirim**.

### 2. Upload File ke File Manager cPanel
1. Buka **File Manager** cPanel -> masuk ke folder **`public_html`**.
2. Buat folder bernama **`TypeRacer`** di dalam `public_html`.
3. Masuk ke `public_html/TypeRacer` dan upload semua file dari repositori ini (`index.php`, `.htaccess`, folder `api/`, dan folder `assets/`).

### 3. Selesai & Mainkan!
Buka browser dan akses:
👉 **`https://codewar.my.id/TypeRacer`**
