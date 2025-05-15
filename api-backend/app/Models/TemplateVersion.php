<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TemplateVersion extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'template_id',
        'content',
        'placeholders',
        'settings',
        'version_name',
        'change_notes',
        'created_by',
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
        'is_active' => 'boolean',
    ];

    /**
     * Get the template that owns the version.
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }

    /**
     * Get the user who created this version.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Make this version the active one.
     */
    public function makeActive(): self
    {
        // First, deactivate all versions for this template
        $this->template->versions()->update(['is_active' => false]);

        // Then activate this version
        $this->is_active = true;
        $this->save();

        return $this;
    }

    /**
     * Render the template version with provided data.
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
}
