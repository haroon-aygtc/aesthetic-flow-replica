
<?php
namespace App\Http\Controllers;

use App\Models\Widget;
use App\Models\FollowUpSuggestion;
use App\Models\FollowUpStat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class FollowUpController extends Controller
{
    /**
     * Get follow-up settings for a widget.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $widgetId
     * @return \Illuminate\Http\Response
     */
    public function getSettings(Request $request, $widgetId)
    {
        $widget = Widget::where('id', $widgetId)
                     ->where('user_id', $request->user()->id)
                     ->firstOrFail();

        $followUpSettings = $widget->settings['followUp'] ?? [
            'enabled' => true,
            'position' => 'end',
            'suggestionsCount' => 3,
            'suggestionsStyle' => 'buttons',
            'buttonStyle' => 'rounded',
            'contexts' => ['all'],
            'customPrompt' => '',
        ];

        return response()->json(array_merge(
            ['widgetId' => (int)$widgetId],
            $followUpSettings
        ));
    }

    /**
     * Update follow-up settings for a widget.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $widgetId
     * @return \Illuminate\Http\Response
     */
    public function updateSettings(Request $request, $widgetId)
    {
        $validator = Validator::make($request->all(), [
            'enabled' => 'required|boolean',
            'position' => 'required|string|in:start,inline,end',
            'suggestionsCount' => 'required|integer|min:1|max:5',
            'suggestionsStyle' => 'required|string',
            'buttonStyle' => 'required|string',
            'contexts' => 'required|array',
            'customPrompt' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $widget = Widget::where('id', $widgetId)
                     ->where('user_id', $request->user()->id)
                     ->firstOrFail();

        $settings = $widget->settings ?? [];
        $settings['followUp'] = [
            'enabled' => $request->enabled,
            'position' => $request->position,
            'suggestionsCount' => $request->suggestionsCount,
            'suggestionsStyle' => $request->suggestionsStyle,
            'buttonStyle' => $request->buttonStyle,
            'contexts' => $request->contexts,
            'customPrompt' => $request->customPrompt,
        ];

        $widget->settings = $settings;
        $widget->save();

        return response()->json(array_merge(
            ['widgetId' => (int)$widgetId],
            $settings['followUp']
        ));
    }

    /**
     * Get suggestions for a widget.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $widgetId
     * @return \Illuminate\Http\Response
     */
    public function getSuggestions(Request $request, $widgetId)
    {
        $widget = Widget::where('id', $widgetId)
                     ->where('user_id', $request->user()->id)
                     ->firstOrFail();

        $suggestions = $widget->settings['suggestions'] ?? [
            [
                'id' => Str::uuid()->toString(),
                'text' => 'Tell me more about your pricing',
                'category' => 'pricing',
                'context' => 'product',
                'active' => true,
                'format' => 'button'
            ],
            [
                'id' => Str::uuid()->toString(),
                'text' => 'How does your support work?',
                'category' => 'support',
                'context' => 'service',
                'active' => true,
                'format' => 'button'
            ],
            [
                'id' => Str::uuid()->toString(),
                'text' => 'Need help with something else?',
                'category' => 'general',
                'context' => 'all',
                'active' => true,
                'format' => 'bubble'
            ],
        ];

        return response()->json($suggestions);
    }

    /**
     * Add a suggestion.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $widgetId
     * @return \Illuminate\Http\Response
     */
    public function addSuggestion(Request $request, $widgetId)
    {
        $validator = Validator::make($request->all(), [
            'text' => 'required|string|min:3',
            'category' => 'required|string',
            'context' => 'required|string',
            'format' => 'required|string',
            'url' => 'nullable|string|url',
            'tooltipText' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $widget = Widget::where('id', $widgetId)
                     ->where('user_id', $request->user()->id)
                     ->firstOrFail();

        $settings = $widget->settings ?? [];
        $suggestions = $settings['suggestions'] ?? [];

        $newSuggestion = [
            'id' => Str::uuid()->toString(),
            'text' => $request->text,
            'category' => $request->category,
            'context' => $request->context,
            'active' => true,
            'format' => $request->format,
        ];

        if ($request->has('url')) {
            $newSuggestion['url'] = $request->url;
        }

        if ($request->has('tooltipText')) {
            $newSuggestion['tooltipText'] = $request->tooltipText;
        }

        $suggestions[] = $newSuggestion;
        $settings['suggestions'] = $suggestions;

        $widget->settings = $settings;
        $widget->save();

        return response()->json($newSuggestion, 201);
    }

    /**
     * Update a suggestion.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $widgetId
     * @param  string  $suggestionId
     * @return \Illuminate\Http\Response
     */
    public function updateSuggestion(Request $request, $widgetId, $suggestionId)
    {
        $widget = Widget::where('id', $widgetId)
                     ->where('user_id', $request->user()->id)
                     ->firstOrFail();

        $settings = $widget->settings ?? [];
        $suggestions = $settings['suggestions'] ?? [];

        $suggestionIndex = array_search($suggestionId, array_column($suggestions, 'id'));
        
        if ($suggestionIndex === false) {
            return response()->json(['error' => 'Suggestion not found'], 404);
        }

        foreach ($request->all() as $key => $value) {
            if (in_array($key, ['text', 'category', 'context', 'active', 'format', 'url', 'tooltipText'])) {
                $suggestions[$suggestionIndex][$key] = $value;
            }
        }

        $settings['suggestions'] = $suggestions;
        $widget->settings = $settings;
        $widget->save();

        return response()->json($suggestions[$suggestionIndex]);
    }

    /**
     * Delete a suggestion.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $widgetId
     * @param  string  $suggestionId
     * @return \Illuminate\Http\Response
     */
    public function deleteSuggestion(Request $request, $widgetId, $suggestionId)
    {
        $widget = Widget::where('id', $widgetId)
                     ->where('user_id', $request->user()->id)
                     ->firstOrFail();

        $settings = $widget->settings ?? [];
        $suggestions = $settings['suggestions'] ?? [];

        $filteredSuggestions = array_filter($suggestions, function($suggestion) use ($suggestionId) {
            return $suggestion['id'] !== $suggestionId;
        });

        $settings['suggestions'] = array_values($filteredSuggestions);
        $widget->settings = $settings;
        $widget->save();

        return response()->json(null, 204);
    }

    /**
     * Get follow-up stats.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $widgetId
     * @return \Illuminate\Http\Response
     */
    public function getStats(Request $request, $widgetId)
    {
        $widget = Widget::where('id', $widgetId)
                     ->where('user_id', $request->user()->id)
                     ->firstOrFail();
        
        // In a real application, you would query your database for actual stats
        // For this example, we'll generate mock data
        
        $engagementRate = mt_rand(15, 35) + mt_rand(0, 99) / 100;
        $clickThroughRate = mt_rand(8, 20) + mt_rand(0, 99) / 100;
        $conversionRate = mt_rand(2, 8) + mt_rand(0, 99) / 100;
        
        $topPerforming = [
            [
                'text' => 'Tell me more about your pricing',
                'engagementRate' => mt_rand(50, 70) + mt_rand(0, 99) / 100,
                'change' => mt_rand(5, 15) + mt_rand(0, 99) / 100,
            ],
            [
                'text' => 'How does your support work?',
                'engagementRate' => mt_rand(40, 60) + mt_rand(0, 99) / 100,
                'change' => mt_rand(5, 10) + mt_rand(0, 99) / 100,
            ],
            [
                'text' => 'Need help with something else?',
                'engagementRate' => mt_rand(30, 50) + mt_rand(0, 99) / 100,
                'change' => mt_rand(3, 8) + mt_rand(0, 99) / 100,
            ],
        ];
        
        $trendsData = [];
        
        // Generate trend data for the last 30 days
        for ($i = 29; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-$i days"));
            $engagements = mt_rand(80, 150);
            $clicks = mt_rand(int($engagements * 0.3), int($engagements * 0.6));
            $conversions = mt_rand(int($clicks * 0.1), int($clicks * 0.3));
            
            $trendsData[] = [
                'date' => $date,
                'engagements' => $engagements,
                'clicks' => $clicks,
                'conversions' => $conversions,
            ];
        }
        
        return response()->json([
            'engagementRate' => $engagementRate,
            'clickThroughRate' => $clickThroughRate,
            'conversionRate' => $conversionRate,
            'topPerforming' => $topPerforming,
            'trendsData' => $trendsData,
        ]);
    }
}
