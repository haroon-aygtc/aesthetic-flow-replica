<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ChatSession extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'widget_id',
        'session_id',
        'visitor_id',
        'metadata',
        'last_activity_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'metadata' => 'array',
        'last_activity_at' => 'datetime',
    ];

    /**
     * Boot function from Laravel.
     *
     * @return void
     */
    protected static function boot()
    {
        parent::boot();

        // Auto-generate session_id when creating a new chat session
        static::creating(function ($chatSession) {
            if (empty($chatSession->session_id)) {
                $chatSession->session_id = Str::uuid();
            }
        });
    }

    /**
     * Get the widget that owns the chat session.
     */
    public function widget()
    {
        return $this->belongsTo(Widget::class);
    }

    /**
     * Get the messages for this chat session.
     */
    public function messages()
    {
        return $this->hasMany(ChatMessage::class);
    }
}