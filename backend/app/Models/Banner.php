<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $fillable = ['type', 'title', 'subtitle', 'image_path', 'is_active', 'sort_order'];

    protected $casts = ['is_active' => 'boolean'];

    protected $appends = ['url'];

    public function getUrlAttribute(): string
    {
        return \Illuminate\Support\Facades\Storage::disk('public')->url($this->image_path);
    }
}
