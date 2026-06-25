<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CollectionController;
use App\Http\Controllers\Admin;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/banners', [BannerController::class, 'index']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/collections', [CollectionController::class, 'index']);

// Auth
Route::post('/admin/login', [AuthController::class, 'login']);

// Admin routes
Route::middleware('admin.auth')->prefix('admin')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Products
    Route::get('/products', [Admin\ProductController::class, 'index']);
    Route::post('/products', [Admin\ProductController::class, 'store']);
    Route::get('/products/{id}', [Admin\ProductController::class, 'show']);
    Route::put('/products/{id}', [Admin\ProductController::class, 'update']);
    Route::delete('/products/{id}', [Admin\ProductController::class, 'destroy']);
    Route::post('/products/{id}/toggle', [Admin\ProductController::class, 'toggle']);
    Route::post('/products/{id}/images', [Admin\ProductController::class, 'uploadImage']);
    Route::delete('/images/{imageId}', [Admin\ProductController::class, 'deleteImage']);
    Route::post('/images/{imageId}/primary', [Admin\ProductController::class, 'setPrimaryImage']);

    // Banners
    Route::get('/banners', [Admin\BannerController::class, 'index']);
    Route::post('/banners', [Admin\BannerController::class, 'store']);
    Route::delete('/banners/{id}', [Admin\BannerController::class, 'destroy']);
    Route::post('/banners/{id}/toggle', [Admin\BannerController::class, 'toggle']);

    // Categories
    Route::get('/categories', [Admin\CategoryController::class, 'index']);
    Route::post('/categories', [Admin\CategoryController::class, 'store']);
    Route::put('/categories/{id}', [Admin\CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [Admin\CategoryController::class, 'destroy']);

    // Collections
    Route::get('/collections', [Admin\CollectionController::class, 'index']);
    Route::post('/collections', [Admin\CollectionController::class, 'store']);
    Route::match(['PUT', 'POST'], '/collections/{id}', [Admin\CollectionController::class, 'update']);
    Route::delete('/collections/{id}', [Admin\CollectionController::class, 'destroy']);
    Route::post('/collections/{id}/toggle', [Admin\CollectionController::class, 'toggle']);
});
