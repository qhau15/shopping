<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductImage extends Model
{
    protected $fillable = ['product_id', 'path', 'thumb_path', 'is_primary', 'sort_order'];

    protected $casts = ['is_primary' => 'boolean'];

    protected $appends = ['url', 'thumb_url'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getUrlAttribute(): string
    {
        return \Illuminate\Support\Facades\Storage::disk('public')->url($this->path);
    }

    public function getThumbUrlAttribute(): string
    {
        return \Illuminate\Support\Facades\Storage::disk('public')->url($this->thumb_path);
    }
}
