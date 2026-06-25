<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['images', 'sizes', 'category:id,name,icon', 'collection:id,name'])
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderByDesc('created_at');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        if ($request->filled('collection_id')) {
            $query->where('collection_id', $request->integer('collection_id'));
        }

        $products = $query->get()->each->append('discount_percent');

        return response()->json($products);
    }

    public function show(int $id)
    {
        $product = Product::with(['images', 'sizes', 'category:id,name,icon', 'collection:id,name'])
            ->where('is_active', true)
            ->findOrFail($id);

        $product->append('discount_percent');

        return response()->json($product);
    }
}
