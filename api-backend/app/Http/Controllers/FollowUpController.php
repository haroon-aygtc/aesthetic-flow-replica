<?php

namespace App\Http\Controllers;

use App\Models\Widget;
use App\Models\FollowUpSuggestion;
use App\Models\FollowUpStat;
use App\Services\FollowUpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class FollowUpController extends Controller
{
    /**
     * The follow-up service instance.
     *
     * @var \App\Services\FollowUpService
     */
    protected $followUpService;

    /**
     * Create a new controller instance.
     *
     * @param  \App\Services\FollowUpService  $followUpService
     * @return void
     */
    public function __construct(FollowUpService $followUpService)
    {
        $this->followUpService = $followUpService;
    }
    /**
     * Get follow-up settings for a widget.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $widgetId
     * @return \Illuminate\Http\Response
     */
    public function getSettings(Request $request, $widgetId)
    {
        try {
            $settings = $this->followUpService->getSettings($widgetId, $request->user()->id);
            return response()->json($settings);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to get follow-up settings', 'message' => $e->getMessage()], 500);
        }
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

        try {
            $settings = $this->followUpService->updateSettings($widgetId, $request->user()->id, $request->all());
            return response()->json($settings);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update follow-up settings', 'message' => $e->getMessage()], 500);
        }
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
        try {
            $suggestions = $this->followUpService->getSuggestions($widgetId, $request->user()->id);
            return response()->json($suggestions);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to get follow-up suggestions', 'message' => $e->getMessage()], 500);
        }
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
            'position' => 'nullable|string|in:start,inline,end',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $suggestion = $this->followUpService->addSuggestion($widgetId, $request->user()->id, $request->all());
            return response()->json($suggestion, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to add follow-up suggestion', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Update a suggestion.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $widgetId
     * @param  int  $suggestionId
     * @return \Illuminate\Http\Response
     */
    public function updateSuggestion(Request $request, $widgetId, $suggestionId)
    {
        $validator = Validator::make($request->all(), [
            'text' => 'sometimes|required|string|min:3',
            'category' => 'sometimes|required|string',
            'context' => 'sometimes|required|string',
            'format' => 'sometimes|required|string',
            'url' => 'nullable|string|url',
            'tooltipText' => 'nullable|string',
            'position' => 'nullable|string|in:start,inline,end',
            'active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $suggestion = $this->followUpService->updateSuggestion($widgetId, $request->user()->id, $suggestionId, $request->all());
            return response()->json($suggestion);
        } catch (\Exception $e) {
            if (str_contains($e->getMessage(), 'not found')) {
                return response()->json(['error' => 'Suggestion not found'], 404);
            }
            return response()->json(['error' => 'Failed to update follow-up suggestion', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete a suggestion.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $widgetId
     * @param  int  $suggestionId
     * @return \Illuminate\Http\Response
     */
    public function deleteSuggestion(Request $request, $widgetId, $suggestionId)
    {
        try {
            $this->followUpService->deleteSuggestion($widgetId, $request->user()->id, $suggestionId);
            return response()->json(null, 204);
        } catch (\Exception $e) {
            if (str_contains($e->getMessage(), 'not found')) {
                return response()->json(['error' => 'Suggestion not found'], 404);
            }
            return response()->json(['error' => 'Failed to delete follow-up suggestion', 'message' => $e->getMessage()], 500);
        }
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
        $period = $request->input('period', '30d');

        try {
            $stats = $this->followUpService->getStats($widgetId, $request->user()->id, $period);
            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to get follow-up stats', 'message' => $e->getMessage()], 500);
        }
    }
}
