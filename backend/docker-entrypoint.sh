#!/bin/bash
set -e

echo "🚀 Starting Strive Pilates API..."

# Wait for MySQL
echo "⏳ Waiting for MySQL..."
until php -r "new PDO('mysql:host=${DB_HOST};dbname=${DB_DATABASE}', '${DB_USERNAME}', '${DB_PASSWORD}');" 2>/dev/null; do
    echo "   MySQL not ready yet, retrying in 3s..."
    sleep 3
done
echo "✅ MySQL is ready!"

# Run migrations only
echo "🗄️  Running database migrations..."
php artisan migrate --force

# Storage link
echo "🔗 Creating storage symlink..."
php artisan storage:link --force 2>/dev/null || true

# Clear cache
echo "⚙️  Clearing cache..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

echo "✅ Strive Pilates API ready!"

exec "$@"