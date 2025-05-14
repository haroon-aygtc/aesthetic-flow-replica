<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebsiteSource extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'url',
        'title',
        'description',
        'category',
        'status',
        'last_crawled_at',
        'auto_update',
        'update_frequency',
        'metadata',
        'user_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'metadata' => 'array',
        'auto_update' => 'boolean',
        'last_crawled_at' => 'datetime',
    ];

    /**
     * Get the user that owns the website source.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the document created from this website source.
     */
    public function document(): HasMany
    {
        return $this->hasMany(KnowledgeDocument::class, 'source_id')->where('source_type', WebsiteSource::class);
    }

    /**
     * Check if the website source is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if the website source needs updating.
     */
    public function needsUpdate(): bool
    {
        if (!$this->auto_update) {
            return false;
        }

        if (!$this->last_crawled_at) {
            return true;
        }

        $frequency = $this->update_frequency ?: 'weekly';

        switch ($frequency) {
            case 'daily':
                return $this->last_crawled_at->lt(now()->subDay());
            case 'weekly':
                return $this->last_crawled_at->lt(now()->subWeek());
            case 'monthly':
                return $this->last_crawled_at->lt(now()->subMonth());
            default:
                return false;
        }
    }
}
