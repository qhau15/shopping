<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;

class ImageService
{
    public function store(UploadedFile $file, string $folder): array
    {
        $filename = Str::uuid() . '.jpg';
        $thumbFilename = 'thumb_' . $filename;

        $fullPath = $folder . '/' . $filename;
        $thumbPath = $folder . '/' . $thumbFilename;

        $fullDisk = Storage::disk('public')->path($fullPath);
        $thumbDisk = Storage::disk('public')->path($thumbPath);

        Storage::disk('public')->makeDirectory($folder);

        // Full image: max 1200px
        Image::read($file->path())
            ->scaleDown(width: 1200, height: 1200)
            ->toJpeg(80)
            ->save($fullDisk);

        // Thumbnail: max 500px
        Image::read($file->path())
            ->scaleDown(width: 500, height: 500)
            ->toJpeg(75)
            ->save($thumbDisk);

        return [
            'path' => $fullPath,
            'thumb_path' => $thumbPath,
        ];
    }

    public function delete(string $path, ?string $thumbPath = null): void
    {
        $files = array_values(array_filter([$path, $thumbPath]));
        Storage::disk('public')->delete($files);
    }
}
