<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SystemSetting::query();

        if ($request->has('group')) {
            $query->byGroup($request->group);
        }

        return response()->json($query->get());
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'required',
        ]);

        $errors = [];

        foreach ($request->settings as $setting) {
            try {
                SystemSetting::setValue($setting['key'], $setting['value']);
            } catch (\RuntimeException $e) {
                $errors[] = $e->getMessage();
            }
        }

        if (!empty($errors)) {
            return response()->json([
                'message' => 'Some settings could not be updated.',
                'errors' => $errors,
            ], 422);
        }

        return response()->json(['message' => 'Settings updated successfully.']);
    }

    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => 'required|image|max:2048', // 2MB Max
        ]);

        $path = $request->file('logo')->store('company', 'public');

        // Update setting
        SystemSetting::setValue('company_logo', '/storage/' . $path);

        return response()->json([
            'message' => 'Logo uploaded successfully.',
            'path' => '/storage/' . $path
        ]);
    }
}
