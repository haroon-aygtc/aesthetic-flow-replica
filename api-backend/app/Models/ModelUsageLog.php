
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ModelUsageLog extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'model_id',
        'user_id',
        'tenant_id',
        'widget_id',
        'query_type',
        'use_case',
        'tokens_input',
        'tokens_output',
        'response_time',
        'confidence_score',
        'fallback_used',
        'success',
        'error_message',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'tokens_input' => 'integer',
        'tokens_output' => 'integer',
        'response_time' => 'float',
        'confidence_score' => 'float',
        'fallback_used' => 'boolean',
        'success' => 'boolean',
    ];

    /**
     * Get the AI model that this log belongs to.
     */
    public function aiModel()
    {
        return $this->belongsTo(AIModel::class, 'model_id');
    }

    /**
     * Get the user that made this request.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the widget that this log belongs to.
     */
    public function widget()
    {
        return $this->belongsTo(Widget::class, 'widget_id');
    }
}
