#!/bin/sh

if [ -n "$DB_HOST" ]; then
  echo "Running migrations..."
  php artisan migrate --force || echo "Migration failed, continuing..."
  echo "Seeding admin..."
  php artisan db:seed --class=DatabaseSeeder --force 2>/dev/null || true
else
  echo "DB_HOST not set, skipping migrations"
fi

php artisan storage:link --force 2>/dev/null || true

exec "$@"
