<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContextSession extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'session_id',
        'data',
        'expires_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'data' => 'array',
        'expires_at' => 'datetime',
    ];

    /**
     * Get the widget that owns the context session.
     */
    public function widget(): BelongsTo
    {
        return $this->belongsTo(Widget::class);
    }

    /**
     * Scope a query to only include active sessions.
     */
    public function scopeActive($query)
    {
        return $query->where(function ($query) {
            $query->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
        });
    }

    /**
     * Merge new data with existing session data.
     *
     * @param array $newData
     * @return $this
     */
    public function mergeData(array $newData)
    {
        $this->data = array_merge($this->data ?? [], $newData);
        return $this;
    }

    /**
     * Add an item to the context history.
     */
    public function addToHistory(array $data): self
    {
        $history = $this->context_history ?? [];

        // Add timestamp
        $data['timestamp'] = now()->toIso8601String();

        // Add to history with most recent first
        array_unshift($history, $data);

        // Limit history length (keep last 50 entries)
        $maxHistory = 50;
        if (count($history) > $maxHistory) {
            $history = array_slice($history, 0, $maxHistory);
        }

        $this->context_history = $history;
        return $this;
    }

    /**
     * Update user data for the session.
     */
    public function updateUserData(array $data, bool $merge = true): self
    {
        if ($merge) {
            $userData = $this->user_data ?? [];
            $this->user_data = array_merge($userData, $data);
        } else {
            $this->user_data = $data;
        }

        return $this;
    }

    /**
     * Get the current context.
     */
    public function getCurrentContext(): array
    {
        return [
            'session' => [
                'id' => $this->session_id,
                'created_at' => $this->created_at->toIso8601String(),
                'last_activity' => $this->updated_at->toIso8601String(),
                'history' => $this->context_history ?? [],
                'metadata' => $this->metadata ?? [],
            ],
            'user' => $this->user_data ?? [],
            'widget' => [
                'id' => $this->widget_id,
            ],
        ];
    }

    /**
     * Find a session by session ID, or create a new one.
     */
    public static function findOrCreateBySessionId(string $sessionId, int $widgetId): self
    {
        return static::firstOrCreate(
            ['session_id' => $sessionId],
            [
                'widget_id' => $widgetId,
                'user_data' => [],
                'context_history' => [],
                'metadata' => [
                    'created_from_ip' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                ],
            ]
        );
    }
}
