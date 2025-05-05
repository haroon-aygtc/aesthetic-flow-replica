<?php

namespace App\Http\Controllers;

use App\Models\AIModel;
use App\Models\ModelUsageLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ModelAnalyticsController extends Controller
{
    /**
     * Get analytics data for models.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function getModelAnalytics(Request $request)
    {
        try {
            $period = $request->input('period', 'month');
            $startDate = $this->getStartDateForPeriod($period);

            $analytics = ModelUsageLog::select(
                'model_id',
                DB::raw('COUNT(*) as total_requests'),
                DB::raw('SUM(tokens_input) as total_input_tokens'),
                DB::raw('SUM(tokens_output) as total_output_tokens'),
                DB::raw('AVG(response_time) as avg_response_time'),
                DB::raw('AVG(confidence_score) as avg_confidence_score'),
                DB::raw('SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_requests'),
                DB::raw('SUM(CASE WHEN fallback_used = 1 THEN 1 ELSE 0 END) as fallback_requests')
            )
            ->when($startDate, function($query) use ($startDate) {
                return $query->where('created_at', '>=', $startDate);
            })
            ->groupBy('model_id')
            ->get();

            // Fetch model information to include names
            $models = AIModel::whereIn('id', $analytics->pluck('model_id'))->get()->keyBy('id');

            $formattedData = $analytics->map(function($item) use ($models) {
                $model = $models[$item->model_id] ?? null;
                return [
                    'model_id' => $item->model_id,
                    'model_name' => $model ? $model->name : 'Unknown',
                    'provider' => $model ? $model->provider : 'Unknown',
                    'total_requests' => $item->total_requests,
                    'total_input_tokens' => $item->total_input_tokens,
                    'total_output_tokens' => $item->total_output_tokens,
                    'avg_response_time' => round($item->avg_response_time, 3),
                    'avg_confidence_score' => round($item->avg_confidence_score, 2),
                    'success_rate' => $item->total_requests > 0
                        ? round(($item->successful_requests / $item->total_requests) * 100, 2)
                        : 0,
                    'fallback_rate' => $item->total_requests > 0
                        ? round(($item->fallback_requests / $item->total_requests) * 100, 2)
                        : 0,
                ];
            });

            return response()->json([
                'data' => $formattedData,
                'period' => $period,
                'success' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch model analytics: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch model analytics',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Get analytics for a specific model.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $modelId
     * @return \Illuminate\Http\Response
     */
    public function getModelDetailedAnalytics(Request $request, $modelId)
    {
        try {
            $model = AIModel::findOrFail($modelId);
            $period = $request->input('period', 'month');
            $startDate = $this->getStartDateForPeriod($period);
            $groupBy = $request->input('group_by', 'day');

            $query = ModelUsageLog::where('model_id', $modelId)
                ->when($startDate, function($query) use ($startDate) {
                    return $query->where('created_at', '>=', $startDate);
                });

            // Group by time period
            if ($groupBy === 'day') {
                $query->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('COUNT(*) as total_requests'),
                    DB::raw('SUM(tokens_input) as total_input_tokens'),
                    DB::raw('SUM(tokens_output) as total_output_tokens'),
                    DB::raw('AVG(response_time) as avg_response_time'),
                    DB::raw('AVG(confidence_score) as avg_confidence_score'),
                    DB::raw('SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_requests'),
                    DB::raw('SUM(CASE WHEN fallback_used = 1 THEN 1 ELSE 0 END) as fallback_requests')
                )
                ->groupBy('date')
                ->orderBy('date');
            } elseif ($groupBy === 'query_type') {
                $query->select(
                    'query_type',
                    DB::raw('COUNT(*) as total_requests'),
                    DB::raw('SUM(tokens_input) as total_input_tokens'),
                    DB::raw('SUM(tokens_output) as total_output_tokens'),
                    DB::raw('AVG(response_time) as avg_response_time'),
                    DB::raw('AVG(confidence_score) as avg_confidence_score'),
                    DB::raw('SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_requests'),
                    DB::raw('SUM(CASE WHEN fallback_used = 1 THEN 1 ELSE 0 END) as fallback_requests')
                )
                ->groupBy('query_type')
                ->orderBy('total_requests', 'desc');
            } elseif ($groupBy === 'use_case') {
                $query->select(
                    'use_case',
                    DB::raw('COUNT(*) as total_requests'),
                    DB::raw('SUM(tokens_input) as total_input_tokens'),
                    DB::raw('SUM(tokens_output) as total_output_tokens'),
                    DB::raw('AVG(response_time) as avg_response_time'),
                    DB::raw('AVG(confidence_score) as avg_confidence_score'),
                    DB::raw('SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_requests'),
                    DB::raw('SUM(CASE WHEN fallback_used = 1 THEN 1 ELSE 0 END) as fallback_requests')
                )
                ->groupBy('use_case')
                ->orderBy('total_requests', 'desc');
            } else {
                // Default to hourly
                $query->select(
                    DB::raw('HOUR(created_at) as hour'),
                    DB::raw('COUNT(*) as total_requests'),
                    DB::raw('SUM(tokens_input) as total_input_tokens'),
                    DB::raw('SUM(tokens_output) as total_output_tokens'),
                    DB::raw('AVG(response_time) as avg_response_time'),
                    DB::raw('AVG(confidence_score) as avg_confidence_score'),
                    DB::raw('SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_requests'),
                    DB::raw('SUM(CASE WHEN fallback_used = 1 THEN 1 ELSE 0 END) as fallback_requests')
                )
                ->groupBy('hour')
                ->orderBy('hour');
            }

            $analytics = $query->get();

            return response()->json([
                'model' => [
                    'id' => $model->id,
                    'name' => $model->name,
                    'provider' => $model->provider
                ],
                'analytics' => $analytics,
                'group_by' => $groupBy,
                'period' => $period,
                'success' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch model detailed analytics: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch model detailed analytics',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Get error logs for a model.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $modelId
     * @return \Illuminate\Http\Response
     */
    public function getModelErrorLogs(Request $request, $modelId)
    {
        try {
            $model = AIModel::findOrFail($modelId);
            $period = $request->input('period', 'month');
            $startDate = $this->getStartDateForPeriod($period);
            $limit = $request->input('limit', 100);

            $logs = ModelUsageLog::where('model_id', $modelId)
                ->where('success', false)
                ->when($startDate, function($query) use ($startDate) {
                    return $query->where('created_at', '>=', $startDate);
                })
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get();

            return response()->json([
                'model' => [
                    'id' => $model->id,
                    'name' => $model->name,
                    'provider' => $model->provider
                ],
                'error_logs' => $logs,
                'period' => $period,
                'success' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch model error logs: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch model error logs',
                'error' => $e->getMessage(),
                'success' => false
            ], 500);
        }
    }

    /**
     * Get start date based on period.
     *
     * @param  string  $period
     * @return \Carbon\Carbon|null
     */
    private function getStartDateForPeriod($period)
    {
        switch ($period) {
            case 'day':
                return now()->subDay();
            case 'week':
                return now()->subWeek();
            case 'month':
                return now()->subMonth();
            case 'quarter':
                return now()->subMonths(3);
            case 'year':
                return now()->subYear();
            case 'all':
                return null;
            default:
                return now()->subMonth();
        }
    }
}
