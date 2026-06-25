<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Services\ImageService;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function __construct(private ImageService $imageService) {}

    public function index()
    {
        return response()->json(Banner::orderBy('type')->orderBy('sort_order')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:10240',
            'type' => 'in:slider,promo',
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'sort_order' => 'integer',
        ]);

        $type = $request->input('type', 'slider');
        $paths = $this->imageService->store($request->file('image'), "banners/{$type}");
        $sortOrder = Banner::where('type', $type)->max('sort_order') + 1;

        $banner = Banner::create([
            'type' => $type,
            'title' => $request->input('title'),
            'subtitle' => $request->input('subtitle'),
            'image_path' => $paths['path'],
            'is_active' => true,
            'sort_order' => $request->integer('sort_order', $sortOrder),
        ]);

        return response()->json($banner, 201);
    }

    public function destroy(int $id)
    {
        $banner = Banner::findOrFail($id);
        $this->imageService->delete($banner->image_path, $banner->image_path);
        $banner->delete();
        return response()->json(['message' => 'Đã xóa banner']);
    }

    public function toggle(int $id)
    {
        $banner = Banner::findOrFail($id);
        $banner->update(['is_active' => !$banner->is_active]);
        return response()->json(['is_active' => $banner->is_active]);
    }
}
