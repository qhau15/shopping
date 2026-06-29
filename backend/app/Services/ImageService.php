<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageService
{
    private ?Cloudinary $client = null;

    private function cloudinary(): Cloudinary
    {
        if (!$this->client) {
            $this->client = new Cloudinary([
                'cloud' => [
                    'cloud_name' => config('cloudinary.cloud_name'),
                    'api_key'    => config('cloudinary.api_key'),
                    'api_secret' => config('cloudinary.api_secret'),
                ],
                'url' => ['secure' => true],
            ]);
        }
        return $this->client;
    }

    public function store(UploadedFile $file, string $folder): array
    {
        $result = $this->cloudinary()->uploadApi()->upload($file->getRealPath(), [
            'folder'            => $folder,
            'transformation'    => ['width' => 1200, 'height' => 1200, 'crop' => 'limit', 'quality' => 80, 'fetch_format' => 'jpg'],
        ]);

        $fullUrl = $result['secure_url'];
        $thumbUrl = str_replace('/upload/', '/upload/w_500,h_500,c_limit,q_75/', $fullUrl);

        return [
            'path'       => $fullUrl,
            'thumb_path' => $thumbUrl,
        ];
    }

    public function delete(string $path, ?string $thumbPath = null): void
    {
        if (!str_starts_with($path, 'http')) {
            Storage::disk('public')->delete(array_values(array_filter([$path, $thumbPath])));
            return;
        }

        // Extract public_id from Cloudinary URL (no transformation in path)
        if (preg_match('/\/v\d+\/(.+)\.\w+$/', $path, $matches)) {
            $this->cloudinary()->uploadApi()->destroy($matches[1]);
        }
    }
}
