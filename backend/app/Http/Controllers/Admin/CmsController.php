<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Testimonial;
use App\Models\Faq;
use App\Models\Gallery;
use App\Models\SiteSetting;
use Illuminate\Http\Request;

class CmsController extends Controller
{
    // BANNER
    public function bannerIndex()
    {
        return response()->json(['success' => true, 'data' => Banner::orderBy('sort_order')->get()]);
    }

    public function bannerStore(Request $r)
    {
        $d = $r->validate([
            'title'       => 'nullable|string',
            'description' => 'nullable|string',
            'photo'       => 'required|string',
            'cta_text'    => 'nullable|string',
            'cta_link'    => 'nullable|string',
            'is_active'   => 'boolean',
            'sort_order'  => 'integer',
        ]);
        $d['created_by'] = $r->user()->id;
        return response()->json(['success' => true, 'data' => Banner::create($d)], 201);
    }

    public function bannerUpdate(Request $r, $id)
    {
        $b = Banner::findOrFail($id);
        $b->update($r->validate([
            'title'       => 'nullable|string',
            'description' => 'nullable|string',
            'photo'       => 'sometimes|string',
            'cta_text'    => 'nullable|string',
            'cta_link'    => 'nullable|string',
            'is_active'   => 'boolean',
            'sort_order'  => 'integer',
        ]));
        return response()->json(['success' => true, 'data' => $b->fresh()]);
    }

    public function bannerDestroy($id)
    {
        Banner::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Banner dihapus.']);
    }

    // TESTIMONI
    public function testimonialIndex()
    {
        return response()->json(['success' => true, 'data' => Testimonial::orderBy('sort_order')->orderByDesc('created_at')->get()]);
    }

    public function testimonialStore(Request $r)
    {
        $d = $r->validate([
            'member_name' => 'required|string',
            'content'     => 'required|string',
            'rating'      => 'integer|min:1|max:5',
            'photo'       => 'nullable|string',
            'is_visible'  => 'boolean',
            'sort_order'  => 'integer',
        ]);
        return response()->json(['success' => true, 'data' => Testimonial::create($d)], 201);
    }

    public function testimonialUpdate(Request $r, $id)
    {
        $t = Testimonial::findOrFail($id);
        $t->update($r->validate([
            'member_name' => 'sometimes|string',
            'content'     => 'sometimes|string',
            'rating'      => 'integer|min:1|max:5',
            'photo'       => 'nullable|string',
            'is_visible'  => 'boolean',
            'sort_order'  => 'integer',
        ]));
        return response()->json(['success' => true, 'data' => $t->fresh()]);
    }

    public function testimonialDestroy($id)
    {
        Testimonial::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Testimoni dihapus.']);
    }

    // FAQ
    public function faqIndex()
    {
        return response()->json(['success' => true, 'data' => Faq::orderBy('sort_order')->get()]);
    }

    public function faqStore(Request $r)
    {
        $d = $r->validate([
            'question'   => 'required|string',
            'answer'     => 'required|string',
            'category'   => 'nullable|string',
            'sort_order' => 'integer',
            'is_active'  => 'boolean',
        ]);
        return response()->json(['success' => true, 'data' => Faq::create($d)], 201);
    }

    public function faqUpdate(Request $r, $id)
    {
        $f = Faq::findOrFail($id);
        $f->update($r->validate([
            'question'   => 'sometimes|string',
            'answer'     => 'sometimes|string',
            'category'   => 'nullable|string',
            'sort_order' => 'integer',
            'is_active'  => 'boolean',
        ]));
        return response()->json(['success' => true, 'data' => $f->fresh()]);
    }

    public function faqDestroy($id)
    {
        Faq::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'FAQ dihapus.']);
    }

    // GALERI
    public function galleryIndex()
    {
        return response()->json(['success' => true, 'data' => Gallery::orderBy('sort_order')->get()]);
    }

    public function galleryStore(Request $r)
    {
        $d = $r->validate([
            'photo'      => 'required|string',
            'caption'    => 'nullable|string',
            'category'   => 'nullable|in:studio,class,event',
            'sort_order' => 'integer',
            'is_active'  => 'boolean',
        ]);
        $d['created_by'] = $r->user()->id;
        return response()->json(['success' => true, 'data' => Gallery::create($d)], 201);
    }

    public function galleryDestroy($id)
    {
        Gallery::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Foto dihapus.']);
    }

    // SETTINGS
    public function settingsIndex()
    {
        return response()->json(['success' => true, 'data' => SiteSetting::all()->pluck('value', 'key')]);
    }

    public function settingsUpdate(Request $r)
    {
        $r->validate(['settings' => 'required|array']);
        foreach ($r->settings as $key => $value) {
            SiteSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
        return response()->json(['success' => true, 'message' => 'Pengaturan berhasil disimpan.']);
    }
}
