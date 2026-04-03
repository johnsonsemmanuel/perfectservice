<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\AuditService;
use App\Models\AuditLog;
use Symfony\Component\HttpFoundation\Response;

/**
 * SECURITY: Role-based access middleware.
 * Usage: ->middleware('role:manager') or ->middleware('role:manager,cash_officer')
 */
class CheckRole
{
    public function __construct(
        private AuditService $auditService,
    ) {
    }

    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!$user->role) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'No role assigned.'], 403);
            }
            return redirect('/dashboard');
        }

        if (!in_array($user->role->name, $roles)) {
            // Log unauthorized attempt
            $this->auditService->logUnauthorizedAttempt(
                $request->method() . ' ' . $request->path(),
                'route'
            );

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'You do not have permission to perform this action.',
                ], 403);
            }

            // For Inertia/web requests, redirect back to dashboard
            return redirect('/dashboard');
        }

        return $next($request);
    }
}
