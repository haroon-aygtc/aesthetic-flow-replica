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
}
