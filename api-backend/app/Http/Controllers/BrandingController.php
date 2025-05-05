<?php

namespace App\Http\Controllers;

use App\Models\Widget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BrandingController extends Controller
{
    /**
     * Get branding settings for a widget.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $widgetId
     * @return \Illuminate\Http\Response
     */
    public function getBrandingSettings(Request $request, $widgetId)
    {
        $widget = Widget::where('id', $widgetId)
                     ->where('user_id', $request->user()->id)
                     ->firstOrFail();

        $brandingSettings = $widget->settings['branding'] ?? [
            'brandName' => $widget->name,
            'brandVoice' => 'friendly',
            'responseTone' => 'helpful',
            'formalityLevel' => 'casual',
            'personalityTraits' => ['trustworthy'],
            'customPrompt' => '',
            'useBrandImages' => false,
            'businessType' => 'retail',
            'targetAudience' => 'general',
        ];

        return response()->json(array_merge(
            ['widgetId' => (int)$widgetId],
            $brandingSettings
        ));
    }

    /**
     * Update branding settings for a widget.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $widgetId
     * @return \Illuminate\Http\Response
     */
    public function updateBrandingSettings(Request $request, $widgetId)
    {
        $validator = Validator::make($request->all(), [
            'brandName' => 'required|string|max:100',
            'brandVoice' => 'required|string',
            'responseTone' => 'required|string',
            'formalityLevel' => 'required|string',
            'personalityTraits' => 'required|array',
            'personalityTraits.*' => 'string',
            'customPrompt' => 'nullable|string',
            'useBrandImages' => 'boolean',
            'businessType' => 'required|string',
            'targetAudience' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $widget = Widget::where('id', $widgetId)
                     ->where('user_id', $request->user()->id)
                     ->firstOrFail();

        $settings = $widget->settings ?? [];
        $settings['branding'] = [
            'brandName' => $request->brandName,
            'brandVoice' => $request->brandVoice,
            'responseTone' => $request->responseTone,
            'formalityLevel' => $request->formalityLevel,
            'personalityTraits' => $request->personalityTraits,
            'customPrompt' => $request->customPrompt,
            'useBrandImages' => $request->useBrandImages,
            'businessType' => $request->businessType,
            'targetAudience' => $request->targetAudience,
        ];

        $widget->settings = $settings;
        $widget->save();

        return response()->json(array_merge(
            ['widgetId' => (int)$widgetId],
            $settings['branding']
        ));
    }

    /**
     * Generate a preview of how branding settings would affect AI responses.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $widgetId
     * @return \Illuminate\Http\Response
     */
    public function generatePreview(Request $request, $widgetId)
    {
        $validator = Validator::make($request->all(), [
            'prompt' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $widget = Widget::where('id', $widgetId)
                     ->where('user_id', $request->user()->id)
                     ->firstOrFail();

        // Get the branding settings
        $brandingSettings = $widget->settings['branding'] ?? [];

        // In a real implementation, this would call the AI model with the branding context
        // For now, we'll return a simulated response based on the branding settings
        $brandVoice = $brandingSettings['brandVoice'] ?? 'friendly';
        $responseTone = $brandingSettings['responseTone'] ?? 'helpful';
        $brandName = $brandingSettings['brandName'] ?? 'Our Brand';

        // Create a response based on the prompt and branding
        $responses = [
            'friendly' => "Hi there! 😊 Thanks for reaching out to {$brandName}. {$request->prompt}",
            'professional' => "Thank you for contacting {$brandName}. We appreciate your inquiry. {$request->prompt}",
            'casual' => "Hey! What's up? Thanks for chatting with {$brandName}. {$request->prompt}",
            'formal' => "Dear valued customer, we at {$brandName} thank you for your correspondence. {$request->prompt}",
            'technical' => "Greetings from {$brandName}. According to our technical assessment: {$request->prompt}"
        ];

        $message = $responses[$brandVoice] ?? $responses['friendly'];

        return response()->json([
            'message' => $message,
            'appliedSettings' => [
                'brandVoice' => $brandVoice,
                'responseTone' => $responseTone
            ]
        ]);
    }

    /**
     * Get branding templates.
     *
     * @return \Illuminate\Http\Response
     */
    public function getBrandingTemplates()
    {
        // In a real implementation, these would come from the database
        $templates = [
            [
                'id' => 1,
                'name' => 'Friendly Customer Support',
                'description' => 'Warm, approachable tone ideal for customer service',
                'settings' => [
                    'brandVoice' => 'friendly',
                    'responseTone' => 'helpful',
                    'formalityLevel' => 'casual',
                    'personalityTraits' => ['supportive', 'approachable', 'kind']
                ]
            ],
            [
                'id' => 2,
                'name' => 'Professional Business',
                'description' => 'Formal and polished for enterprise communications',
                'settings' => [
                    'brandVoice' => 'professional',
                    'responseTone' => 'informative',
                    'formalityLevel' => 'formal',
                    'personalityTraits' => ['trustworthy', 'authoritative', 'knowledgeable']
                ]
            ],
            [
                'id' => 3,
                'name' => 'Technical Specialist',
                'description' => 'Detail-oriented responses for technical products',
                'settings' => [
                    'brandVoice' => 'technical',
                    'responseTone' => 'precise',
                    'formalityLevel' => 'neutral',
                    'personalityTraits' => ['analytical', 'thorough', 'expert']
                ]
            ]
        ];

        return response()->json($templates);
    }
}
