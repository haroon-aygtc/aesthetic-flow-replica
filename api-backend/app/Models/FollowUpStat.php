<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FollowUpStat extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'suggestion_id',
        'widget_id',
        'impressions',
        'clicks',
        'conversions',
        'session_id',
        'user_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'impressions' => 'integer',
        'clicks' => 'integer',
        'conversions' => 'integer',
    ];

    /**
     * Get the suggestion that owns the stat.
     */
    public function suggestion()
    {
        return $this->belongsTo(FollowUpSuggestion::class, 'suggestion_id');
    }

    /**
     * Get the widget that owns the stat.
     */
    public function widget()
    {
        return $this->belongsTo(Widget::class);
    }
}
