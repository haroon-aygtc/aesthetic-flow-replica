<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Widget extends Model
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
        'widget_id',
        'ai_model_id',
        'settings',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'settings' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Boot function from Laravel.
     *
     * @return void
     */
    protected static function boot()
    {
        parent::boot();

        // Auto-generate widget_id when creating a new widget
        static::creating(function ($widget) {
            if (empty($widget->widget_id)) {
                $widget->widget_id = Str::random(12);
            }
        });
    }

    /**
     * Get the user that owns the widget.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the AI model used by this widget.
     */
    public function aiModel()
    {
        return $this->belongsTo(AIModel::class);
    }

    /**
     * Get the chat sessions for this widget.
     */
    public function chatSessions()
    {
        return $this->hasMany(ChatSession::class);
    }

    /**
     * Get the guest users for this widget.
     */
    public function guestUsers()
    {
        return $this->hasMany(GuestUser::class);
    }

    /**
     * Get the default settings for a widget.
     *
     * @return array
     */
    public static function getDefaultSettings()
    {
        return [
            'theme' => 'light',
            'position' => 'bottom-right',
            'welcome_message' => 'Hello! How can I help you today?',
            'placeholder_text' => 'Type your message here...',
            'use_knowledge_base' => false,
            'knowledge_base_settings' => [
                'search_threshold' => 0.7,
                'max_results' => 5,
                'sources' => ['embeddings', 'qa_pairs', 'keywords'],
                'categories' => [],
            ],
        ];
    }

    /**
     * Get the knowledge base settings for this widget.
     *
     * @return array
     */
    public function getKnowledgeBaseSettings()
    {
        $settings = $this->settings ?? [];
        $defaultKnowledgeSettings = self::getDefaultSettings()['knowledge_base_settings'];

        return $settings['knowledge_base_settings'] ?? $defaultKnowledgeSettings;
    }

    /**
     * Check if knowledge base is enabled for this widget.
     *
     * @return bool
     */
    public function isKnowledgeBaseEnabled()
    {
        return $this->settings['use_knowledge_base'] ?? false;
    }

    /**
     * Get the knowledge bases associated with the widget.
     */
    public function knowledgeBases()
    {
        return $this->belongsToMany(KnowledgeBase::class, 'widget_knowledge_base')
                    ->withPivot('settings')
                    ->withTimestamps();
    }

    /**
     * Get the templates associated with the widget.
     */
    public function templates()
    {
        return $this->belongsToMany(Template::class, 'widget_template')
                    ->withPivot('settings')
                    ->withTimestamps();
    }

    /**
     * Get the context rules associated with the widget.
     */
    public function contextRules()
    {
        return $this->belongsToMany(ContextRule::class, 'widget_context_rule')
                    ->withPivot('settings')
                    ->withTimestamps();
    }

    /**
     * Get the branding settings associated with the widget.
     */
    public function brandingSettings()
    {
        return $this->belongsToMany(BrandingSetting::class, 'widget_branding_setting')
                    ->withPivot('overrides')
                    ->withTimestamps();
    }
}
