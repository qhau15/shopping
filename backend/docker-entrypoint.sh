#!/bin/sh

if [ -n "$DB_HOST" ]; then
  echo "Running migrations..."
  php artisan migrate --force || true
  echo "Seeding..."
  php artisan db:seed --class=DatabaseSeeder --force 2>/dev/null || true
fi

php artisan storage:link --force 2>/dev/null || true

echo "Starting PHP server on port ${PORT:-8080}..."
exec php artisan serve --host=0.0.0.0 --port="${PORT:-8080}"
