<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class KnowledgeDocument extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'type',
        'size',
        'status',
        'category',
        'url',
        'content',
        'metadata',
        'user_id',
        'source_id',
        'source_type',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'size' => 'integer',
        'metadata' => 'array',
    ];

    /**
     * Get the user that owns the document.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the embeddings for the document.
     */
    public function embeddings(): HasMany
    {
        return $this->hasMany(DocumentEmbedding::class, 'document_id');
    }

    /**
     * Get the source of the document (polymorphic).
     */
    public function source(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the document processing status.
     */
    public function getStatusAttribute($value): string
    {
        return $value ?: 'pending';
    }

    /**
     * Check if the document has been processed.
     */
    public function isProcessed(): bool
    {
        return $this->status === 'processed';
    }

    /**
     * Check if the document is being processed.
     */
    public function isProcessing(): bool
    {
        return in_array($this->status, ['processing', 'processing_embeddings']);
    }

    /**
     * Check if the document processing has failed.
     */
    public function hasFailed(): bool
    {
        return $this->status === 'failed';
    }
}
