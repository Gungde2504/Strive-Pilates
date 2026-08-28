<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Testimonial;
use App\Models\Faq;
use App\Models\Gallery;
use App\Models\SiteSetting;

class CmsController extends Controller
{
    public function banners()
    {
        return response()->json([
            'success' => true,
            'data' => Banner::where('is_active', true)->orderBy('sort_order')->get(),
        ]);
    }

    public function testimonials()
    {
        return response()->json([
            'success' => true,
            'data' => Testimonial::where('is_visible', true)->orderBy('sort_order')->orderByDesc('created_at')->limit(10)->get(),
        ]);
    }

    public function faqs()
    {
        return response()->json([
            'success' => true,
            'data' => Faq::where('is_active', true)->orderBy('sort_order')->get(),
        ]);
    }

    public function gallery()
    {
        return response()->json([
            'success' => true,
            'data' => Gallery::where('is_active', true)->orderBy('sort_order')->get(),
        ]);
    }

    public function settings()
    {
        return response()->json([
            'success' => true,
            'data' => SiteSetting::all()->pluck('value', 'key'),
        ]);
    }
}
