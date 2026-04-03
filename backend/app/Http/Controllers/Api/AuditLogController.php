<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::with('user');

        if ($request->has('action')) {
            $query->byAction($request->action);
        }

        if ($request->has('severity')) {
            $query->where('severity', $request->severity);
        }

        if ($request->has('entity_type')) {
            $query->where('entity_type', $request->entity_type);
        }

        if ($request->has('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('created_at', '<=', $request->date_to . ' 23:59:59');
        }

        $logs = $query->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 50));

        return response()->json($logs);
    }

    public function show(AuditLog $auditLog): JsonResponse
    {
        $auditLog->load('user');
        return response()->json($auditLog);
    }

    /**
     * Get audit history for a specific entity.
     */
    public function forEntity(string $entityType, int $entityId): JsonResponse
    {
        $logs = AuditLog::forEntity($entityType, $entityId)
            ->with('user')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($logs);
    }
}
