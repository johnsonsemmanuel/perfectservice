<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(
        private AuditService $auditService,
    ) {
    }

    /**
     * Login and issue Sanctum token.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = \App\Models\User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Account is deactivated. Contact your manager.',
            ], 403);
        }

        // Revoke all existing tokens for this user
        $user->tokens()->delete();

        $token = $user->createToken('pos-token')->plainTextToken;

        $this->auditService->log(
            AuditLog::ACTION_LOGIN,
            'user',
            $user->id,
        );

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->name,
                'role_display' => $user->role->display_name,
                'permissions' => $user->role->permissions,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Logout and revoke current token.
     */
    public function logout(Request $request): JsonResponse
    {
        $this->auditService->log(
            AuditLog::ACTION_LOGOUT,
            'user',
            Auth::id(),
        );

        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    /**
     * Get current authenticated user profile.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('role');

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role->name,
            'role_display' => $user->role->display_name,
            'permissions' => $user->role->permissions,
        ]);
    }
}
