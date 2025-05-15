<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class BrandingSetting extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'logo_url',
        'colors',
        'typography',
        'elements',
        'is_active',
        'is_default',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'colors' => 'array',
        'typography' => 'array',
        'elements' => 'array',
        'is_active' => 'boolean',
        'is_default' => 'boolean',
    ];

    /**
     * Get the user that owns the branding setting.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the widgets associated with the branding setting.
     */
    public function widgets(): BelongsToMany
    {
        return $this->belongsToMany(Widget::class, 'widget_branding_setting')
                    ->withPivot('overrides')
                    ->withTimestamps();
    }

    /**
     * Scope a query to only include active branding settings.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include default branding settings.
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Initialize default colors if not set.
     */
    public function getColorsAttribute($value)
    {
        $colors = json_decode($value, true);

        if (empty($colors)) {
            return [
                'primary' => '#0070f3',
                'secondary' => '#1a1a1a',
                'accent' => '#f5f5f5',
                'background' => '#ffffff',
                'text' => '#000000',
            ];
        }

        return $colors;
    }

    /**
     * Initialize default typography if not set.
     */
    public function getTypographyAttribute($value)
    {
        $typography = json_decode($value, true);

        if (empty($typography)) {
            return [
                'fontFamily' => 'system-ui, sans-serif',
                'headingFontFamily' => 'system-ui, sans-serif',
                'fontSize' => '16px',
                'headingScale' => 1.25,
            ];
        }

        return $typography;
    }

    /**
     * Initialize default elements if not set.
     */
    public function getElementsAttribute($value)
    {
        $elements = json_decode($value, true);

        if (empty($elements)) {
            return [
                'borderRadius' => '4px',
                'buttonStyle' => 'filled',
                'shadows' => 'medium',
                'spacing' => 'default',
            ];
        }

        return $elements;
    }

    /**
     * Get merged branding settings with widget overrides.
     *
     * @param array $overrides
     * @return array
     */
    public function getMergedSettings(array $overrides = []): array
    {
        $settings = [
            'colors' => $this->colors,
            'typography' => $this->typography,
            'elements' => $this->elements,
            'logo_url' => $this->logo_url,
        ];

        if (empty($overrides)) {
            return $settings;
        }

        foreach ($overrides as $key => $value) {
            if (is_array($value) && isset($settings[$key]) && is_array($settings[$key])) {
                $settings[$key] = array_merge($settings[$key], $value);
            } else {
                $settings[$key] = $value;
            }
        }

        return $settings;
    }
}
