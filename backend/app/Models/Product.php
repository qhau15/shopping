<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'name', 'description', 'price', 'discount_price',
        'fb_link', 'is_active', 'sort_order',
        'category_id', 'collection_id',
    ];

    protected $casts = [
        'price' => 'integer',
        'discount_price' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'category_id' => 'integer',
        'collection_id' => 'integer',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function collection(): BelongsTo
    {
        return $this->belongsTo(Collection::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function sizes(): HasMany
    {
        return $this->hasMany(ProductSize::class)->orderBy('sort_order');
    }

    public function getPrimaryImageAttribute(): ?ProductImage
    {
        return $this->images->firstWhere('is_primary', true) ?? $this->images->first();
    }

    public function getDiscountPercentAttribute(): ?int
    {
        if ($this->discount_price && $this->price > 0) {
            return (int) round(($this->price - $this->discount_price) / $this->price * 100);
        }
        return null;
    }
}
