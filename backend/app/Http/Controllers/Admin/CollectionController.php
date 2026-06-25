<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CollectionController extends Controller
{
    public function __construct(private ImageService $imageService) {}

    public function index()
    {
        return response()->json(
            Collection::withCount('products')
                ->orderBy('sort_order')
                ->orderByDesc('created_at')
                ->get()
                ->append('cover_url')
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:200',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'cover_image' => 'nullable|image|max:10240',
        ]);

        $coverPath = null;
        if ($request->hasFile('cover_image')) {
            $paths = $this->imageService->store($request->file('cover_image'), 'collections');
            $coverPath = $paths['path'];
        }

        $collection = Collection::create([
            'name' => $data['name'],
            'slug' => Str::slug($data['name']) . '-' . Str::random(4),
            'description' => $data['description'] ?? null,
            'cover_image_path' => $coverPath,
            'is_active' => $data['is_active'] ?? true,
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        return response()->json($collection->append('cover_url'), 201);
    }

    public function update(Request $request, int $id)
    {
        $collection = Collection::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|string|max:200',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'cover_image' => 'nullable|image|max:10240',
        ]);

        if ($request->hasFile('cover_image')) {
            if ($collection->cover_image_path) {
                $this->imageService->delete($collection->cover_image_path, null);
            }
            $paths = $this->imageService->store($request->file('cover_image'), 'collections');
            $data['cover_image_path'] = $paths['path'];
        }

        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']) . '-' . Str::random(4);
        }

        unset($data['cover_image']);
        $collection->update($data);

        return response()->json($collection->fresh()->append('cover_url'));
    }

    public function destroy(int $id)
    {
        $collection = Collection::findOrFail($id);

        if ($collection->cover_image_path) {
            $this->imageService->delete($collection->cover_image_path, null);
        }

        $collection->products()->update(['collection_id' => null]);
        $collection->delete();

        return response()->json(['message' => 'Đã xóa bộ sưu tập']);
    }

    public function toggle(int $id)
    {
        $collection = Collection::findOrFail($id);
        $collection->update(['is_active' => !$collection->is_active]);
        return response()->json(['is_active' => $collection->is_active]);
    }
}
