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
            'source_id' => $userId ?? 0,
            'source_type' => $userId ? 'user' : 'guest',
            'metric' => 'search_count',
            'value' => 1,
            'date' => now(),
            'metadata' => [
                'query' => $query,
                'results_count' => $resultsCount,
                'sources' => $sources,
            ]
        ]);
    }

    /**
     * Create a document view insight record.
     */
    public static function createDocumentViewInsight($documentId, $userId = null)
    {
        return self::create([
            'type' => 'document_view',
            'source_id' => $userId ?? 0,
            'source_type' => $userId ? 'user' : 'guest',
            'metric' => 'document_view_count',
            'value' => 1,
            'date' => now(),
            'metadata' => [
                'document_id' => $documentId,
            ]
        ]);
    }

    /**
     * Create a search result click insight record.
     */
    public static function createSearchResultClickInsight($query, $resultType, $resultId, $userId = null)
    {
        return self::create([
            'type' => 'search_result_click',
            'source_id' => $userId ?? 0,
            'source_type' => $userId ? 'user' : 'guest',
            'metric' => 'search_result_click_count',
            'value' => 1,
            'date' => now(),
            'metadata' => [
                'query' => $query,
                'result_type' => $resultType,
                'result_id' => $resultId,
            ]
        ]);
    }
}