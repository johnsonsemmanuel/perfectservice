<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::with('role')
            ->orderBy('name')
            ->get();

        return response()->json($users);
    }

    public function roles(): JsonResponse
    {
        $roles = Role::all();
        return response()->json($roles);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role_id' => 'required|exists:roles,id',
            'pin' => 'nullable|string|size:4',
            'is_active' => 'boolean',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'], // Hashed by cast
            'role_id' => $validated['role_id'],
            'pin' => $validated['pin'] ?? null, // Hashed by cast if provided
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user->load('role'),
        ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => [
                'email',
                Rule::unique('users')->ignore($user->id),
            ],
            'password' => 'nullable|string|min:6',
            'role_id' => 'exists:roles,id',
            'pin' => 'nullable|string|size:4',
            'is_active' => 'boolean',
        ]);

        $otherFields = array_filter($validated, fn($k) => !in_array($k, ['password', 'pin']), ARRAY_FILTER_USE_KEY);
        $user->fill($otherFields);

        if (isset($validated['password'])) {
            $user->password = $validated['password'];
        }

        if (isset($validated['pin'])) {
            $user->pin = $validated['pin'];
        }

        $user->save();

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user->load('role'),
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Cannot delete yourself'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}
