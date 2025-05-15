<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class KnowledgeBase extends Model
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
     * Get the user that owns the knowledge base.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the sources for the knowledge base.
     */
    public function sources(): HasMany
    {
        return $this->hasMany(KnowledgeBaseSource::class);
    }

    /**
     * Get the widgets associated with the knowledge base.
     */
    public function widgets(): BelongsToMany
    {
        return $this->belongsToMany(Widget::class, 'widget_knowledge_base')
                    ->withPivot('settings')
                    ->withTimestamps();
    }

    /**
     * Scope a query to only include active knowledge bases.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
