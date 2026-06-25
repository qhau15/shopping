<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Collection extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'cover_image_path', 'is_active', 'sort_order'];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function getCoverUrlAttribute(): ?string
    {
        return $this->cover_image_path
            ? '/storage/' . $this->cover_image_path
            : null;
    }
}
