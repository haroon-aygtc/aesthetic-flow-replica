<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\User;

class Template extends Model
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
        'description',
        'content',
        'placeholders',
        'settings',
        'priority',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'placeholders' => 'array',
        'settings' => 'array',
        'priority' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user that owns the template.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the versions for the template.
     */
    public function versions(): HasMany
    {
        return $this->hasMany(TemplateVersion::class);
    }

    /**
     * Get the latest version for the template.
     */
    public function latestVersion()
    {
        return $this->versions()->latest()->first();
    }

    /**
     * Get the active version for the template.
     */
    public function activeVersion()
    {
        return $this->versions()->where('is_active', true)->first();
    }

    /**
     * Get the widgets associated with the template.
     */
    public function widgets(): BelongsToMany
    {
        return $this->belongsToMany(Widget::class, 'widget_template')
                    ->withPivot('settings')
                    ->withTimestamps();
    }

    /**
     * Scope a query to only include active templates.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to order by priority.
     */
    public function scopeOrderByPriority($query)
    {
        return $query->orderBy('priority', 'desc');
    }

    /**
     * Detect placeholders in the content.
     */
    public function detectPlaceholders(): array
    {
        $placeholders = [];
        $pattern = '/\{\{([^}]+)\}\}/';

        preg_match_all($pattern, $this->content, $matches);

        if (!empty($matches[1])) {
            foreach ($matches[1] as $placeholder) {
                $placeholder = trim($placeholder);
                $placeholders[$placeholder] = [
                    'name' => $placeholder,
                    'description' => '',
                    'default_value' => '',
                    'required' => true,
                ];
            }
        }

        return $placeholders;
    }

    /**
     * Render the template with provided data.
     */
    public function render(array $data = []): string
    {
        $content = $this->content;
        $placeholders = $this->placeholders ?? [];

        foreach ($placeholders as $key => $info) {
            $value = $data[$key] ?? $info['default_value'] ?? '';
            $content = str_replace("{{" . $key . "}}", $value, $content);
        }

        return $content;
    }

    /**
     * Create a new version of the template.
     */
    public function createVersion(array $data, ?int $userId = null): TemplateVersion
    {
        return $this->versions()->create([
            'content' => $data['content'] ?? $this->content,
            'placeholders' => $data['placeholders'] ?? $this->placeholders,
            'settings' => $data['settings'] ?? $this->settings,
            'version_name' => $data['version_name'] ?? ('Version ' . ($this->versions()->count() + 1)),
            'change_notes' => $data['change_notes'] ?? null,
            'created_by' => $userId ?? auth()->id(),
            'is_active' => $data['is_active'] ?? false,
        ]);
    }
}
