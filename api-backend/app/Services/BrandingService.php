<?php

namespace App\Services;

use App\Models\BrandingSetting;
use App\Models\Widget;
use Illuminate\Support\Facades\Log;
use Exception;

class BrandingService
{
    /**
     * Get branding settings for a user.
     *
     * @param  int  $userId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getSettings($userId)
    {
        return BrandingSetting::where('user_id', $userId)
                        ->orderBy('name')
                        ->get();
    }

    /**
     * Get a branding setting by ID.
     *
     * @param  int  $id
     * @param  int  $userId
     * @return \App\Models\BrandingSetting
     * @throws \Exception
     */
    public function getSetting($id, $userId)
    {
        $setting = BrandingSetting::where('id', $id)
                          ->where('user_id', $userId)
                          ->first();

        if (!$setting) {
            throw new Exception("Branding setting not found");
        }

        return $setting;
    }

    /**
     * Create a new branding setting.
     *
     * @param  int  $userId
     * @param  array  $data
     * @return \App\Models\BrandingSetting
     */
    public function createSetting($userId, array $data)
    {
        $setting = new BrandingSetting();
        $setting->user_id = $userId;
        $setting->name = $data['name'];
        $setting->logo_url = $data['logo_url'] ?? null;
        $setting->colors = $data['colors'] ?? null;
        $setting->typography = $data['typography'] ?? null;
        $setting->elements = $data['elements'] ?? null;
        $setting->is_active = $data['is_active'] ?? true;
        $setting->is_default = $data['is_default'] ?? false;
        $setting->save();

        // If set as default, unset any other defaults
        if ($setting->is_default) {
            $this->updateDefaultSetting($userId, $setting->id);
        }

        return $setting;
    }

    /**
     * Update a branding setting.
     *
     * @param  int  $id
     * @param  int  $userId
     * @param  array  $data
     * @return \App\Models\BrandingSetting
     * @throws \Exception
     */
    public function updateSetting($id, $userId, array $data)
    {
        $setting = $this->getSetting($id, $userId);

        if (isset($data['name'])) {
            $setting->name = $data['name'];
        }

        if (isset($data['logo_url'])) {
            $setting->logo_url = $data['logo_url'];
        }

        if (isset($data['colors'])) {
            $setting->colors = $data['colors'];
        }

        if (isset($data['typography'])) {
            $setting->typography = $data['typography'];
        }

        if (isset($data['elements'])) {
            $setting->elements = $data['elements'];
        }

        if (isset($data['is_active'])) {
            $setting->is_active = $data['is_active'];
        }

        if (isset($data['is_default']) && $data['is_default'] !== $setting->is_default) {
            $setting->is_default = $data['is_default'];

            // If set as default, unset any other defaults
            if ($setting->is_default) {
                $this->updateDefaultSetting($userId, $setting->id);
            }
        }

        $setting->save();

        return $setting;
    }

    /**
     * Delete a branding setting.
     *
     * @param  int  $id
     * @param  int  $userId
     * @return bool
     * @throws \Exception
     */
    public function deleteSetting($id, $userId)
    {
        $setting = $this->getSetting($id, $userId);

        if ($setting->is_default) {
            // If deleting the default setting, try to set another one as default
            $newDefault = BrandingSetting::where('user_id', $userId)
                                ->where('id', '!=', $id)
                                ->first();

            if ($newDefault) {
                $newDefault->is_default = true;
                $newDefault->save();
            }
        }

        return $setting->delete();
    }

    /**
     * Update the default branding setting.
     *
     * @param  int  $userId
     * @param  int  $newDefaultId
     * @return void
     */
    private function updateDefaultSetting($userId, $newDefaultId)
    {
        BrandingSetting::where('user_id', $userId)
                    ->where('id', '!=', $newDefaultId)
                    ->where('is_default', true)
                    ->update(['is_default' => false]);
    }

    /**
     * Get the default branding setting for a user.
     *
     * @param  int  $userId
     * @return \App\Models\BrandingSetting|null
     */
    public function getDefaultSetting($userId)
    {
        return BrandingSetting::where('user_id', $userId)
                        ->where('is_default', true)
                        ->first();
    }

    /**
     * Associate a branding setting with a widget.
     *
     * @param  int  $settingId
     * @param  int  $widgetId
     * @param  int  $userId
     * @param  array  $overrides
     * @return \App\Models\Widget
     * @throws \Exception
     */
    public function associateSettingWithWidget($settingId, $widgetId, $userId, array $overrides = [])
    {
        $setting = $this->getSetting($settingId, $userId);
        $widget = Widget::findOrFail($widgetId);

        // Check if widget belongs to user
        if ($widget->user_id !== $userId) {
            throw new Exception("Widget not found");
        }

        $widget->brandingSettings()->sync([$settingId => ['overrides' => $overrides]], false);

        return $widget;
    }

    /**
     * Dissociate a branding setting from a widget.
     *
     * @param  int  $settingId
     * @param  int  $widgetId
     * @param  int  $userId
     * @return \App\Models\Widget
     * @throws \Exception
     */
    public function dissociateSettingFromWidget($settingId, $widgetId, $userId)
    {
        $setting = $this->getSetting($settingId, $userId);
        $widget = Widget::findOrFail($widgetId);

        // Check if widget belongs to user
        if ($widget->user_id !== $userId) {
            throw new Exception("Widget not found");
        }

        $widget->brandingSettings()->detach($settingId);

        return $widget;
    }

    /**
     * Get branding settings for a widget.
     *
     * @param  int  $widgetId
     * @param  int  $userId
     * @return array
     * @throws \Exception
     */
    public function getWidgetBrandingSettings($widgetId, $userId)
    {
        $widget = Widget::findOrFail($widgetId);

        // Check if widget belongs to user
        if ($widget->user_id !== $userId) {
            throw new Exception("Widget not found");
        }

        $settings = $widget->brandingSettings()->first();

        if (!$settings) {
            // If no specific settings, try to get the default for the user
            $settings = $this->getDefaultSetting($userId);

            if (!$settings) {
                // If no default either, return empty settings
                return [
                    'colors' => [],
                    'typography' => [],
                    'elements' => [],
                    'logo_url' => null,
                ];
            }

            return $settings->getMergedSettings();
        }

        $overrides = $settings->pivot->overrides ? json_decode($settings->pivot->overrides, true) : [];
        return $settings->getMergedSettings($overrides);
    }

    /**
     * Generate CSS variables from branding settings.
     *
     * @param  array  $settings
     * @return string
     */
    public function generateCssVariables(array $settings): string
    {
        $css = ":root {\n";

        // Colors
        if (isset($settings['colors']) && is_array($settings['colors'])) {
            foreach ($settings['colors'] as $name => $value) {
                $css .= "  --color-{$name}: {$value};\n";
            }
        }

        // Typography
        if (isset($settings['typography']) && is_array($settings['typography'])) {
            foreach ($settings['typography'] as $name => $value) {
                $css .= "  --typography-{$name}: {$value};\n";
            }
        }

        // Elements
        if (isset($settings['elements']) && is_array($settings['elements'])) {
            foreach ($settings['elements'] as $name => $value) {
                $css .= "  --element-{$name}: {$value};\n";
            }
        }

        $css .= "}\n";

        return $css;
    }
}
