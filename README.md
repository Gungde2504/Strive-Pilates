# 🏋️ Strive Pilates Bali — Sistem Booking Kelas Pilates

Sistem informasi booking kelas pilates berbasis web dengan payment gateway Midtrans dan notifikasi WhatsApp otomatis.

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React.js 19 + Vite 6 + Tailwind CSS |
| Backend | Laravel 13 (PHP 8.3+) |
| Database | MySQL 8.0 |
| Database GUI | phpMyAdmin (dev only) |
| Payment | Midtrans Snap API |
| Notifikasi WA | Fonnte API |
| Queue | Redis + Laravel Queue |
| Deployment | Docker Compose (8 containers) |

## 📁 Struktur Folder

```
strive-pilates/
├── docker-compose.yml          # 8 container config
├── .env.example                # Template environment variables
├── setup.sh                    # Script setup otomatis
├── docker/
│   ├── nginx/
│   │   └── default.conf        # Nginx reverse proxy config
│   └── mysql/
│       └── init.sql            # Initial SQL setup
├── backend/                    # Laravel 13 project
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Api/        # Shared controllers
│   │   │   │   ├── Admin/      # Admin controllers
│   │   │   │   ├── Owner/      # Owner controllers
│   │   │   │   ├── Instructor/ # Instructor controllers
│   │   │   │   └── Member/     # Member controllers
│   │   │   ├── Middleware/     # Role middleware dll
│   │   │   └── Requests/       # Form Request validation
│   │   ├── Models/             # Eloquent models
│   │   ├── Services/           # Business logic
│   │   ├── Jobs/               # Queue jobs (WA notification)
│   │   ├── Events/             # Laravel events
│   │   ├── Listeners/          # Event listeners
│   │   └── Policies/           # Authorization policies
│   ├── database/
│   │   ├── migrations/         # 21 tabel migrasi
│   │   ├── seeders/            # Data awal (Owner, kelas, jadwal)
│   │   └── factories/          # Factory untuk testing
│   └── routes/
│       └── api.php             # API routes
└── frontend/                   # React 19 + Vite
    ├── Dockerfile
    ├── vite.config.js
    ├── tailwind.config.js      # Bronze Luxe design tokens
    ├── package.json
    └── src/
        ├── App.jsx             # Router + Splash screen
        ├── main.jsx            # Entry point
        ├── index.css           # Tailwind + custom utilities
        ├── components/
        │   ├── ui/             # Shared UI components
        │   ├── guards/         # AuthGuard, RoleGuard, GuestGuard
        │   ├── modals/         # Reusable modal components
        │   ├── forms/          # Reusable form components
        │   ├── charts/         # Chart components (recharts)
        │   ├── public/         # Public page components
        │   └── dashboard/      # Dashboard shared components
        ├── pages/
        │   ├── public/         # Home, About, Classes, Schedule
        │   ├── auth/           # Login, Register, ForgotPassword
        │   ├── member/         # Member dashboard & pages
        │   ├── instructor/     # Instructor dashboard & pages
        │   ├── admin/          # Admin dashboard & CMS pages
        │   └── owner/          # Owner dashboard & reports
        ├── layouts/
        │   ├── PublicLayout.jsx
        │   ├── AuthLayout.jsx
        │   └── dashboard/      # Layout per role
        ├── stores/
        │   └── authStore.js    # Zustand auth store
        ├── services/
        │   └── api.js          # Axios API service
        ├── hooks/              # Custom React hooks
        ├── utils/              # Helper functions
        └── assets/             # Images, icons, fonts
```

## 🚀 Setup & Installation

### Prerequisites
- Docker Desktop (sudah include Docker Compose)
- Node.js 20+ dan npm
- PHP 8.3+ dan Composer
- Git

### Langkah Setup

**1. Clone / download project**
```bash
git clone <repo-url> strive-pilates
cd strive-pilates
```

**2. Jalankan setup script (otomatis)**
```bash
chmod +x setup.sh
./setup.sh
```

**ATAU setup manual:**

```bash
# Install Laravel
composer create-project laravel/laravel:^13.0 backend

# Install React
npm create vite@latest frontend -- --template react
cd frontend && npm install && cd ..

# Install semua packages (lihat setup.sh)
```

**3. Setup environment variables**
```bash
cp .env.example .env
# Edit .env — isi DB password, Midtrans key, Fonnte token
```

**4. Jalankan Docker**
```bash
# Development (dengan phpMyAdmin)
docker compose --profile dev up -d

# Production (tanpa phpMyAdmin)
docker compose up -d

# Cek status
docker compose ps
```

**5. Buka di browser**
| Service | URL |
|---|---|
| Frontend React | http://localhost:3000 |
| API Laravel | http://localhost:8000 |
| phpMyAdmin | http://localhost:8080 |

---

## 🔑 Akun Default (Setelah Seeder)

| Role | Email | Password |
|---|---|---|
| Owner | owner@strivepilates.bali | password |
| Admin | admin@strivepilates.bali | password |
| Instruktur | instruktur@strivepilates.bali | password |
| Member | member@strivepilates.bali | password |

---

## 📋 Docker Commands

```bash
# Start semua container
docker compose --profile dev up -d

# Stop semua container
docker compose down

# Lihat log real-time
docker compose logs -f laravel-api
docker compose logs -f laravel-queue

# Masuk ke container Laravel
docker compose exec laravel-api bash

# Run artisan command dari luar container
docker compose exec laravel-api php artisan migrate
docker compose exec laravel-api php artisan db:seed
docker compose exec laravel-api php artisan route:list

# Rebuild container setelah ubah Dockerfile
docker compose build --no-cache laravel-api
docker compose up -d laravel-api

# Reset database
docker compose exec laravel-api php artisan migrate:fresh --seed
```

---

## 🧪 Testing Acceptance Criteria

```bash
# Jalankan semua test
docker compose exec laravel-api php artisan test

# Test spesifik
docker compose exec laravel-api php artisan test --filter=BookingTest
```

---

## 📱 Midtrans Setup

1. Daftar di https://midtrans.com
2. Masuk ke Sandbox Dashboard
3. Copy Server Key dan Client Key ke .env
4. Untuk testing: gunakan nomor kartu test Midtrans
5. Sebelum go-live: ganti ke Production key

---

## 📲 Fonnte WhatsApp Setup

1. Daftar di https://fonnte.com
2. Hubungkan nomor WhatsApp
3. Copy token ke .env (FONNTE_TOKEN)
4. Isi nomor sender (FONNTE_SENDER)
5. Paket Free untuk development, Regular Rp 66.000/bln untuk production

---

## 🔐 Security Checklist (Sebelum Go-Live)

- [ ] Ganti semua password default di .env
- [ ] Midtrans key diganti ke Production
- [ ] phpMyAdmin container disabled di production
- [ ] HTTPS aktif dengan SSL certificate
- [ ] APP_DEBUG=false di production
- [ ] APP_ENV=production di production

---

## 📚 Dokumentasi

| Dokumen | File |
|---|---|
| Analisis Sistem v7 | Analisis_Sistem_v7.docx |
| PRD v2.0 (UI + Security) | PRD_Strive_Pilates_v2.docx |
| UI Style Guide Publik | UI_Style_Guide_Strive_Pilates.docx |
| UI Style Guide Dashboard | UI_Style_Guide_Dashboard.docx |
| Stitch Prompt Guide Publik | Stitch_Prompt_Guide_Strive_Pilates.docx |
| Stitch Prompt Dashboard | Stitch_Dashboard_[ROLE]_Strive_Pilates.docx |

---


