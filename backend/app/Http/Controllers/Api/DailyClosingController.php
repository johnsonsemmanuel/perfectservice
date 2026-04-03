<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyClosing;
use App\Services\DailyClosingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DailyClosingController extends Controller
{
    public function __construct(
        private DailyClosingService $dailyClosingService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $query = DailyClosing::with('closedByUser');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->input('date') === 'today') {
            $query->where('closing_date', now()->toDateString());
        } elseif ($request->has('date')) {
            $query->where('closing_date', $request->date);
        }

        $closings = $query->orderByDesc('closing_date')
            ->paginate($request->integer('per_page', 30));

        return response()->json($closings);
    }

    /**
     * Generate a daily closing report (does not finalize).
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'nullable|date|before_or_equal:today',
        ]);

        $date = $request->date ? new \DateTime($request->date) : now();

        try {
            $closing = $this->dailyClosingService->generateClosing($date);
            return response()->json($closing, 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function show(DailyClosing $dailyClosing): JsonResponse
    {
        $dailyClosing->load('closedByUser');
        return response()->json($dailyClosing);
    }

    /**
     * Finalize closing with actual amounts.
     */
    public function finalize(Request $request, DailyClosing $dailyClosing): JsonResponse
    {
        $request->validate([
            'actual_cash' => 'required|numeric|min:0',
            'actual_momo' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        try {
            $closing = $this->dailyClosingService->finalize(
                $dailyClosing,
                $request->actual_cash,
                $request->actual_momo,
                $request->notes,
            );
            return response()->json($closing);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * Resolve a flagged closing.
     */
    public function resolve(Request $request, DailyClosing $dailyClosing): JsonResponse
    {
        $request->validate([
            'resolution' => 'required|string|min:10',
        ]);

        try {
            $closing = $this->dailyClosingService->resolve($dailyClosing, $request->resolution);
            return response()->json($closing);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
