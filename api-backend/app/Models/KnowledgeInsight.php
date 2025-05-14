<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KnowledgeInsight extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'type',
        'source_id',
        'source_type',
        'metric',
        'value',
        'date',
        'metadata',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'value' => 'float',
        'date' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * Get the source model (polymorphic).
     */
    public function source()
    {
        return $this->morphTo();
    }

    /**
     * Scope a query to only include insights of a specific type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope a query to only include insights with a specific metric.
     */
    public function scopeWithMetric($query, $metric)
    {
        return $query->where('metric', $metric);
    }

    /**
     * Scope a query to only include insights within a date range.
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Create a search insight record.
     */
    public static function createSearchInsight($query, $resultsCount, $sources = [], $userId = null)
    {
        return self::create([
            'type' => 'search',
            'metric' => 'search_count',
            'value' => 1,
            'date' => now(),
            'metadata' => [
                'query' => $query,
                'results_count' => $resultsCount,
                'sources' => $sources,
                'user_id' => $userId
            ]
        ]);
    }

    /**
     * Create a document usage insight record.
     */
    public static function createDocumentUsageInsight(KnowledgeDocument $document, $relevanceScore, $userId = null)
    {
        return self::create([
            'type' => 'document_usage',
            'source_id' => $document->id,
            'source_type' => KnowledgeDocument::class,
            'metric' => 'usage_count',
            'value' => 1,
            'date' => now(),
            'metadata' => [
                'document_id' => $document->id,
                'document_name' => $document->name,
                'relevance_score' => $relevanceScore,
                'user_id' => $userId
            ]
        ]);
    }

    /**
     * Create a QA pair usage insight record.
     */
    public static function createQAPairUsageInsight(QAPair $qaPair, $relevanceScore, $userId = null)
    {
        return self::create([
            'type' => 'qa_pair_usage',
            'source_id' => $qaPair->id,
            'source_type' => QAPair::class,
            'metric' => 'usage_count',
            'value' => 1,
            'date' => now(),
            'metadata' => [
                'qa_pair_id' => $qaPair->id,
                'question' => $qaPair->question,
                'relevance_score' => $relevanceScore,
                'user_id' => $userId
            ]
        ]);
    }

    /**
     * Create a website source usage insight record.
     */
    public static function createWebsiteSourceUsageInsight(WebsiteSource $websiteSource, $relevanceScore, $userId = null)
    {
        return self::create([
            'type' => 'website_source_usage',
            'source_id' => $websiteSource->id,
            'source_type' => WebsiteSource::class,
            'metric' => 'usage_count',
            'value' => 1,
            'date' => now(),
            'metadata' => [
                'website_source_id' => $websiteSource->id,
                'url' => $websiteSource->url,
                'relevance_score' => $relevanceScore,
                'user_id' => $userId
            ]
        ]);
    }
}
