<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductSize;
use App\Services\ImageService;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(private ImageService $imageService) {}

    public function index()
    {
        $products = Product::with([
            'images' => fn($q) => $q->where('is_primary', true),
            'category:id,name',
            'collection:id,name',
        ])
            ->orderBy('sort_order')
            ->orderByDesc('created_at')
            ->get()
            ->append('discount_percent');

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|integer|min:0',
            'discount_price' => 'nullable|integer|min:0',
            'fb_link' => 'nullable|url|max:500',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'category_id' => 'nullable|exists:categories,id',
            'collection_id' => 'nullable|exists:collections,id',
            'sizes' => 'array',
            'sizes.*.size_label' => 'required|string|max:20',
            'sizes.*.quantity' => 'integer|min:0',
            'sizes.*.is_available' => 'boolean',
        ]);

        $product = Product::create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'price' => $data['price'],
            'discount_price' => $data['discount_price'] ?? null,
            'fb_link' => $data['fb_link'] ?? null,
            'is_active' => $data['is_active'] ?? true,
            'sort_order' => $data['sort_order'] ?? 0,
            'category_id' => $data['category_id'] ?? null,
            'collection_id' => $data['collection_id'] ?? null,
        ]);

        if (!empty($data['sizes'])) {
            foreach ($data['sizes'] as $i => $size) {
                ProductSize::create([
                    'product_id' => $product->id,
                    'size_label' => $size['size_label'],
                    'quantity' => $size['quantity'] ?? 0,
                    'is_available' => $size['is_available'] ?? true,
                    'sort_order' => $i,
                ]);
            }
        }

        return response()->json($product->load(['images', 'sizes', 'category', 'collection']), 201);
    }

    public function show(int $id)
    {
        $product = Product::with(['images', 'sizes', 'category', 'collection'])->findOrFail($id);
        $product->append('discount_percent');
        return response()->json($product);
    }

    public function update(Request $request, int $id)
    {
        $product = Product::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|integer|min:0',
            'discount_price' => 'nullable|integer|min:0',
            'fb_link' => 'nullable|url|max:500',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'category_id' => 'nullable|exists:categories,id',
            'collection_id' => 'nullable|exists:collections,id',
            'sizes' => 'array',
            'sizes.*.size_label' => 'required|string|max:20',
            'sizes.*.quantity' => 'integer|min:0',
            'sizes.*.is_available' => 'boolean',
        ]);

        $product->update(array_filter($data, fn($k) => !in_array($k, ['sizes']), ARRAY_FILTER_USE_KEY));

        if (isset($data['sizes'])) {
            $product->sizes()->delete();
            foreach ($data['sizes'] as $i => $size) {
                ProductSize::create([
                    'product_id' => $product->id,
                    'size_label' => $size['size_label'],
                    'quantity' => $size['quantity'] ?? 0,
                    'is_available' => $size['is_available'] ?? true,
                    'sort_order' => $i,
                ]);
            }
        }

        return response()->json(
            $product->fresh(['images', 'sizes', 'category', 'collection'])->append('discount_percent')
        );
    }

    public function destroy(int $id)
    {
        $product = Product::with('images')->findOrFail($id);

        foreach ($product->images as $image) {
            $this->imageService->delete($image->path, $image->thumb_path);
        }

        $product->delete();

        return response()->json(['message' => 'Đã xóa sản phẩm']);
    }

    public function toggle(int $id)
    {
        $product = Product::findOrFail($id);
        $product->update(['is_active' => !$product->is_active]);
        return response()->json(['is_active' => $product->is_active]);
    }

    public function uploadImage(Request $request, int $id)
    {
        $request->validate([
            'image' => 'required|image|max:10240',
            'is_primary' => 'boolean',
        ]);

        $product = Product::findOrFail($id);
        $isPrimary = $request->boolean('is_primary', $product->images()->count() === 0);

        if ($isPrimary) {
            $product->images()->update(['is_primary' => false]);
        }

        $paths = $this->imageService->store($request->file('image'), "products/{$id}");
        $sortOrder = $product->images()->max('sort_order') + 1;

        $image = ProductImage::create([
            'product_id' => $id,
            'path' => $paths['path'],
            'thumb_path' => $paths['thumb_path'],
            'is_primary' => $isPrimary,
            'sort_order' => $sortOrder,
        ]);

        return response()->json($image, 201);
    }

    public function deleteImage(int $imageId)
    {
        $image = ProductImage::findOrFail($imageId);
        $this->imageService->delete($image->path, $image->thumb_path);

        if ($image->is_primary) {
            $next = ProductImage::where('product_id', $image->product_id)
                ->where('id', '!=', $imageId)
                ->first();
            $next?->update(['is_primary' => true]);
        }

        $image->delete();

        return response()->json(['message' => 'Đã xóa ảnh']);
    }

    public function setPrimaryImage(int $imageId)
    {
        $image = ProductImage::findOrFail($imageId);
        ProductImage::where('product_id', $image->product_id)->update(['is_primary' => false]);
        $image->update(['is_primary' => true]);
        return response()->json(['message' => 'Đã đặt ảnh chính']);
    }
}
