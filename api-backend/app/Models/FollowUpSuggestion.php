<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FollowUpSuggestion extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'widget_id',
        'text',
        'category',
        'context',
        'position',
        'format',
        'url',
        'tooltip_text',
        'active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'active' => 'boolean',
    ];

    /**
     * Get the widget that owns the suggestion.
     */
    public function widget()
    {
        return $this->belongsTo(Widget::class);
    }

    /**
     * Get the stats for this suggestion.
     */
    public function stats()
    {
        return $this->hasMany(FollowUpStat::class, 'suggestion_id');
    }
}
