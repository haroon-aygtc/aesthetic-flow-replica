<?php

namespace App\Http\Controllers;

use App\Models\Widget;
use App\Models\WidgetAnalytics;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WidgetAnalyticsController extends Controller
{
    /**
     * Track a widget view or other analytics event.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function trackEvent(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'widget_id' => 'required|string|exists:widgets,widget_id',
            'event_type' => 'required|string|in:view,conversation_start,conversation_end,message_sent',
            'visitor_id' => 'nullable|string',
            'url' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $widget = Widget::where('widget_id', $request->widget_id)->first();

        if (!$widget) {
            return response()->json(['error' => 'Widget not found'], 404);
        }

        // Create analytics record
        $analytics = new WidgetAnalytics([
            'widget_id' => $widget->id,
            'event_type' => $request->event_type,
            'visitor_id' => $request->visitor_id,
            'url' => $request->url,
            'metadata' => $request->metadata,
            'ip_address' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
        ]);

        $analytics->save();

        return response()->json(['status' => 'success'], 201);
    }

    /**
     * Get analytics data for a widget.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function getAnalytics(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'widget_id' => 'required|integer|exists:widgets,id',
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date|after_or_equal:from_date',
            'group_by' => 'nullable|string|in:day,week,month,event_type,url',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Ensure widget belongs to authenticated user
        $widget = Widget::where('id', $request->widget_id)
                       ->where('user_id', $request->user()->id)
                       ->firstOrFail();

        // Build query
        $query = WidgetAnalytics::where('widget_id', $widget->id);

        // Apply date filters
        if ($request->from_date) {
            $query->where('created_at', '>=', $request->from_date);
        }

        if ($request->to_date) {
            $query->where('created_at', '<=', $request->to_date . ' 23:59:59');
        }

        // Apply grouping if requested
        if ($request->group_by) {
            switch ($request->group_by) {
                case 'day':
                    $analytics = $query
                        ->selectRaw('DATE(created_at) as date, event_type, COUNT(*) as count')
                        ->groupBy('date', 'event_type')
                        ->orderBy('date')
                        ->get();
                    break;

                case 'week':
                    $analytics = $query
                        ->selectRaw('YEARWEEK(created_at) as yearweek, event_type, COUNT(*) as count')
                        ->groupBy('yearweek', 'event_type')
                        ->orderBy('yearweek')
                        ->get();
                    break;

                case 'month':
                    $analytics = $query
                        ->selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, event_type, COUNT(*) as count')
                        ->groupBy('year', 'month', 'event_type')
                        ->orderBy('year')
                        ->orderBy('month')
                        ->get();
                    break;

                case 'event_type':
                    $analytics = $query
                        ->selectRaw('event_type, COUNT(*) as count')
                        ->groupBy('event_type')
                        ->get();
                    break;

                case 'url':
                    $analytics = $query
                        ->selectRaw('url, COUNT(*) as count')
                        ->groupBy('url')
                        ->orderByDesc('count')
                        ->limit(50)
                        ->get();
                    break;

                default:
                    $analytics = $query->paginate(50);
                    break;
            }
        } else {
            // No grouping, just paginate results
            $analytics = $query->paginate(50);
        }

        return response()->json($analytics);
    }

    /**
     * Get analytics summary for a widget.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function getSummary(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'widget_id' => 'required|integer|exists:widgets,id',
            'period' => 'nullable|string|in:day,week,month,all',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Ensure widget belongs to authenticated user
        $widget = Widget::where('id', $request->widget_id)
                       ->where('user_id', $request->user()->id)
                       ->firstOrFail();

        // Determine date filter based on period
        $startDate = null;

        switch ($request->period ?? 'month') {
            case 'day':
                $startDate = now()->subDay();
                break;

            case 'week':
                $startDate = now()->subWeek();
                break;

            case 'month':
                $startDate = now()->subMonth();
                break;

            case 'all':
            default:
                $startDate = null;
                break;
        }

        // Build query
        $query = WidgetAnalytics::where('widget_id', $widget->id);

        if ($startDate) {
            $query->where('created_at', '>=', $startDate);
        }

        // Get counts by event type
        $eventCounts = $query
            ->selectRaw('event_type, COUNT(*) as count')
            ->groupBy('event_type')
            ->pluck('count', 'event_type')
            ->toArray();

        // Calculate conversation metrics
        $totalViews = $eventCounts['view'] ?? 0;
        $totalConversations = $eventCounts['conversation_start'] ?? 0;
        $totalMessages = $eventCounts['message_sent'] ?? 0;

        // Calculate engagement rate
        $engagementRate = $totalViews > 0 ? ($totalConversations / $totalViews) * 100 : 0;

        // Calculate average messages per conversation
        $avgMessagesPerConversation = $totalConversations > 0 ? $totalMessages / $totalConversations : 0;

        // Return summary
        return response()->json([
            'total_views' => $totalViews,
            'total_conversations' => $totalConversations,
            'total_messages' => $totalMessages,
            'engagement_rate' => round($engagementRate, 2),
            'avg_messages_per_conversation' => round($avgMessagesPerConversation, 2),
            'period' => $request->period ?? 'month',
        ]);
    }
}
