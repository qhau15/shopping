#!/bin/sh

echo "Running migrations..."
php artisan migrate --force || echo "Migration skipped (DB not ready)"

echo "Seeding admin (first run only)..."
php artisan db:seed --class=DatabaseSeeder --force 2>/dev/null || true

echo "Linking storage..."
php artisan storage:link --force 2>/dev/null || true

exec "$@"
