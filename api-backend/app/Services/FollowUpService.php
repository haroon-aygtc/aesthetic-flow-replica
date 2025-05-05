<?php

namespace App\Services;

use App\Models\Widget;
use App\Models\FollowUpSuggestion;
use App\Models\FollowUpStat;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class FollowUpService
{
    /**
     * Get follow-up settings for a widget.
     *
     * @param int $widgetId
     * @param int $userId
     * @return array
     */
    public function getSettings(int $widgetId, int $userId): array
    {
        try {
            $widget = Widget::where('id', $widgetId)
                ->where('user_id', $userId)
                ->first();

            if (!$widget) {
                // If widget doesn't exist, create default settings
                return $this->getDefaultSettings($widgetId);
            }

            $followUpSettings = $widget->settings['followUp'] ?? [
                'enabled' => true,
                'position' => 'end',
                'suggestionsCount' => 3,
                'suggestionsStyle' => 'buttons',
                'buttonStyle' => 'rounded',
                'contexts' => ['all'],
                'customPrompt' => '',
            ];

            return array_merge(
                ['widgetId' => (int)$widgetId],
                $followUpSettings
            );
        } catch (\Exception $e) {
            // Log the error
            \Log::error('Error getting follow-up settings: ' . $e->getMessage());

            // Return default settings
            return $this->getDefaultSettings($widgetId);
        }
    }

    /**
     * Get default settings for a widget.
     *
     * @param int $widgetId
     * @return array
     */
    private function getDefaultSettings(int $widgetId): array
    {
        return [
            'widgetId' => (int)$widgetId,
            'enabled' => true,
            'position' => 'end',
            'suggestionsCount' => 3,
            'suggestionsStyle' => 'buttons',
            'buttonStyle' => 'rounded',
            'contexts' => ['all'],
            'customPrompt' => '',
        ];
    }

    /**
     * Update follow-up settings for a widget.
     *
     * @param int $widgetId
     * @param int $userId
     * @param array $settingsData
     * @return array
     */
    public function updateSettings(int $widgetId, int $userId, array $settingsData): array
    {
        $widget = Widget::where('id', $widgetId)
                     ->where('user_id', $userId)
                     ->firstOrFail();

        $settings = $widget->settings ?? [];
        $settings['followUp'] = [
            'enabled' => $settingsData['enabled'],
            'position' => $settingsData['position'],
            'suggestionsCount' => $settingsData['suggestionsCount'],
            'suggestionsStyle' => $settingsData['suggestionsStyle'],
            'buttonStyle' => $settingsData['buttonStyle'],
            'contexts' => $settingsData['contexts'],
            'customPrompt' => $settingsData['customPrompt'] ?? '',
        ];

        $widget->settings = $settings;
        $widget->save();

        return array_merge(
            ['widgetId' => (int)$widgetId],
            $settings['followUp']
        );
    }

    /**
     * Get all suggestions for a widget.
     *
     * @param int $widgetId
     * @param int $userId
     * @return Collection
     */
    public function getSuggestions(int $widgetId, int $userId): Collection
    {
        try {
            // Verify widget belongs to user
            $widget = Widget::where('id', $widgetId)
                ->where('user_id', $userId)
                ->first();

            if (!$widget) {
                // If widget doesn't exist, return empty collection
                return collect([]);
            }

            return FollowUpSuggestion::where('widget_id', $widgetId)
                ->orderBy('created_at', 'desc')
                ->get();
        } catch (\Exception $e) {
            // Log the error
            \Log::error('Error getting follow-up suggestions: ' . $e->getMessage());

            // Return empty collection
            return collect([]);
        }
    }

    /**
     * Add a new suggestion.
     *
     * @param int $widgetId
     * @param int $userId
     * @param array $suggestionData
     * @return FollowUpSuggestion
     */
    public function addSuggestion(int $widgetId, int $userId, array $suggestionData): FollowUpSuggestion
    {
        // Verify widget belongs to user
        Widget::where('id', $widgetId)
            ->where('user_id', $userId)
            ->firstOrFail();

        return FollowUpSuggestion::create([
            'widget_id' => $widgetId,
            'text' => $suggestionData['text'],
            'category' => $suggestionData['category'],
            'context' => $suggestionData['context'],
            'position' => $suggestionData['position'] ?? 'end',
            'format' => $suggestionData['format'] ?? 'button',
            'url' => $suggestionData['url'] ?? null,
            'tooltip_text' => $suggestionData['tooltipText'] ?? null,
            'active' => true,
        ]);
    }

    /**
     * Update an existing suggestion.
     *
     * @param int $widgetId
     * @param int $userId
     * @param int $suggestionId
     * @param array $suggestionData
     * @return FollowUpSuggestion
     */
    public function updateSuggestion(int $widgetId, int $userId, int $suggestionId, array $suggestionData): FollowUpSuggestion
    {
        // Verify widget belongs to user
        Widget::where('id', $widgetId)
            ->where('user_id', $userId)
            ->firstOrFail();

        $suggestion = FollowUpSuggestion::where('id', $suggestionId)
            ->where('widget_id', $widgetId)
            ->firstOrFail();

        $suggestion->update([
            'text' => $suggestionData['text'],
            'category' => $suggestionData['category'],
            'context' => $suggestionData['context'],
            'position' => $suggestionData['position'] ?? $suggestion->position,
            'format' => $suggestionData['format'] ?? $suggestion->format,
            'url' => $suggestionData['url'] ?? $suggestion->url,
            'tooltip_text' => $suggestionData['tooltipText'] ?? $suggestion->tooltip_text,
            'active' => $suggestionData['active'] ?? $suggestion->active,
        ]);

        return $suggestion;
    }

    /**
     * Delete a suggestion.
     *
     * @param int $widgetId
     * @param int $userId
     * @param int $suggestionId
     * @return bool
     */
    public function deleteSuggestion(int $widgetId, int $userId, int $suggestionId): bool
    {
        // Verify widget belongs to user
        Widget::where('id', $widgetId)
            ->where('user_id', $userId)
            ->firstOrFail();

        $suggestion = FollowUpSuggestion::where('id', $suggestionId)
            ->where('widget_id', $widgetId)
            ->firstOrFail();

        return $suggestion->delete();
    }

    /**
     * Get follow-up statistics.
     *
     * @param int $widgetId
     * @param int $userId
     * @param string $period
     * @return array
     */
    public function getStats(int $widgetId, int $userId, string $period = '30d'): array
    {
        try {
            // Verify widget belongs to user
            $widget = Widget::where('id', $widgetId)
                ->where('user_id', $userId)
                ->first();

            if (!$widget) {
                // If no widget exists, return default empty stats
                return $this->getDefaultStats();
            }

            // Get date range based on period
            $startDate = $this->getStartDateFromPeriod($period);

            // Get aggregated stats
            $stats = FollowUpStat::where('widget_id', $widgetId)
                ->where('created_at', '>=', $startDate)
                ->selectRaw('SUM(impressions) as total_impressions, SUM(clicks) as total_clicks, SUM(conversions) as total_conversions')
                ->first();

            // Calculate rates
            $totalImpressions = $stats->total_impressions ?? 0;
            $totalClicks = $stats->total_clicks ?? 0;
            $totalConversions = $stats->total_conversions ?? 0;

            $engagementRate = $totalImpressions > 0 ? ($totalClicks / $totalImpressions) * 100 : 0;
            $clickThroughRate = $totalClicks > 0 ? ($totalConversions / $totalClicks) * 100 : 0;
            $conversionRate = $totalImpressions > 0 ? ($totalConversions / $totalImpressions) * 100 : 0;

            // Get top performing suggestions
            $topPerforming = $this->getTopPerformingSuggestions($widgetId, $startDate);

            // Get trend data
            $trendsData = $this->getTrendsData($widgetId, $startDate);

            return [
                'engagementRate' => round($engagementRate, 2),
                'clickThroughRate' => round($clickThroughRate, 2),
                'conversionRate' => round($conversionRate, 2),
                'topPerforming' => $topPerforming,
                'trendsData' => $trendsData,
            ];
        } catch (\Exception $e) {
            // Log the error
            \Log::error('Error getting follow-up stats: ' . $e->getMessage());

            // Return default stats
            return $this->getDefaultStats();
        }
    }

    /**
     * Get default stats when no data is available.
     *
     * @return array
     */
    private function getDefaultStats(): array
    {
        return [
            'engagementRate' => 0,
            'clickThroughRate' => 0,
            'conversionRate' => 0,
            'topPerforming' => [],
            'trendsData' => $this->getDefaultTrendsData(),
        ];
    }

    /**
     * Get default trends data.
     *
     * @return array
     */
    private function getDefaultTrendsData(): array
    {
        $trendsData = [];

        // Generate empty trend data for the last 30 days
        for ($i = 29; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-$i days"));

            $trendsData[] = [
                'date' => $date,
                'engagements' => 0,
                'clicks' => 0,
                'conversions' => 0,
            ];
        }

        return $trendsData;
    }

    /**
     * Get top performing suggestions.
     *
     * @param int $widgetId
     * @param string $startDate
     * @return array
     */
    private function getTopPerformingSuggestions(int $widgetId, string $startDate): array
    {
        // In a real implementation, this would query the database for actual stats
        // For now, we'll return mock data
        return [
            [
                'text' => 'Need help with something else?',
                'engagementRate' => 32.5,
                'change' => 2.1,
            ],
            [
                'text' => 'Would you like to apply now?',
                'engagementRate' => 28.3,
                'change' => -1.4,
            ],
            [
                'text' => 'Read more about our services',
                'engagementRate' => 24.7,
                'change' => 5.2,
            ],
        ];
    }

    /**
     * Get trends data.
     *
     * @param int $widgetId
     * @param string $startDate
     * @return array
     */
    private function getTrendsData(int $widgetId, string $startDate): array
    {
        // In a real implementation, this would query the database for actual stats
        // For now, we'll return mock data
        $trendsData = [];

        // Generate trend data for the last 30 days
        for ($i = 29; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-$i days"));
            $engagements = mt_rand(80, 150);
            $clicks = mt_rand((int)($engagements * 0.3), (int)($engagements * 0.6));
            $conversions = mt_rand((int)($clicks * 0.1), (int)($clicks * 0.3));

            $trendsData[] = [
                'date' => $date,
                'engagements' => $engagements,
                'clicks' => $clicks,
                'conversions' => $conversions,
            ];
        }

        return $trendsData;
    }

    /**
     * Get start date from period string.
     *
     * @param string $period
     * @return string
     */
    private function getStartDateFromPeriod(string $period): string
    {
        $number = (int)$period;
        $unit = substr($period, -1);

        switch ($unit) {
            case 'd':
                return date('Y-m-d', strtotime("-$number days"));
            case 'w':
                return date('Y-m-d', strtotime("-$number weeks"));
            case 'm':
                return date('Y-m-d', strtotime("-$number months"));
            case 'y':
                return date('Y-m-d', strtotime("-$number years"));
            default:
                return date('Y-m-d', strtotime('-30 days'));
        }
    }
}
