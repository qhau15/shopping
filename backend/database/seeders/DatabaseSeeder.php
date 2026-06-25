<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (Admin::count() === 0) {
            Admin::create([
                'email' => 'admin@shop.com',
                'password' => Hash::make('Admin@123'),
            ]);
            $this->command->info('Admin created: admin@shop.com / Admin@123');
        }

        if (Category::count() === 0) {
            $cats = [
                ['name' => 'Tops', 'icon' => '👚', 'sort_order' => 1],
                ['name' => 'Bottoms', 'icon' => '👖', 'sort_order' => 2],
                ['name' => 'Dresses', 'icon' => '👗', 'sort_order' => 3],
            ];
            foreach ($cats as $cat) {
                Category::create([
                    'name' => $cat['name'],
                    'slug' => Str::slug($cat['name']) . '-' . Str::random(4),
                    'icon' => $cat['icon'],
                    'is_active' => true,
                    'sort_order' => $cat['sort_order'],
                ]);
            }
            $this->command->info('Default categories seeded.');
        }
    }
}
