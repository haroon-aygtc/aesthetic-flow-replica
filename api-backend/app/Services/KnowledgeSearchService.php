<?php

namespace App\Services;

use App\Models\KnowledgeDocument;
use App\Models\QAPair;
use App\Models\DocumentEmbedding;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class KnowledgeSearchService
{
    protected $vectorEmbeddingService;
    protected $cacheEnabled;
    protected $cacheTtl;

    public function __construct(VectorEmbeddingService $vectorEmbeddingService)
    {
        $this->vectorEmbeddingService = $vectorEmbeddingService;
        $this->cacheEnabled = config('ai.cache_search_results', true);
        $this->cacheTtl = config('ai.search_cache_ttl', 3600); // 1 hour
    }

    public function search($query, $options = [])
    {
        $startTime = microtime(true);

        // Extract options with defaults
        $limit = $options['limit'] ?? 5;
        $threshold = $options['threshold'] ?? 0.7;
        $sources = $options['sources'] ?? ['embeddings', 'qa_pairs', 'keywords'];
        $category = $options['category'] ?? null;
        $useCache = $options['cache'] ?? $this->cacheEnabled;

        // Check cache if enabled
        if ($useCache) {
            $cacheKey = $this->generateCacheKey($query, $options);

            if (Cache::has($cacheKey)) {
                $cachedResults = Cache::get($cacheKey);

                // Add cache hit metadata
                $cachedResults['metadata']['cache_hit'] = true;

                return $cachedResults;
            }
        }

        $results = [];
        $sourceResults = [];
        $metadata = [
            'query' => $query,
            'threshold' => $threshold,
            'sources_used' => [],
            'timing' => [],
            'cache_hit' => false
        ];

        // Generate embedding for the query
        $embeddingStartTime = microtime(true);
        $queryEmbedding = $this->vectorEmbeddingService->generateEmbedding($query);
        $metadata['timing']['embedding_generation'] = microtime(true) - $embeddingStartTime;

        // Search in each source
        foreach ($sources as $source) {
            try {
                $sourceStartTime = microtime(true);

                switch ($source) {
                    case 'embeddings':
                        $sourceResults[$source] = $this->searchEmbeddings($query, $queryEmbedding, $limit, $threshold, $category);
                        break;
                    case 'qa_pairs':
                        $sourceResults[$source] = $this->searchQAPairs($query, $queryEmbedding, $limit, $threshold, $category);
                        break;
                    case 'keywords':
                        $sourceResults[$source] = $this->searchKeywords($query, $limit, $category);
                        break;
                }

                $metadata['sources_used'][] = $source;
                $metadata['timing'][$source] = microtime(true) - $sourceStartTime;
            } catch (\Exception $e) {
                Log::error("Error searching in source {$source}: " . $e->getMessage(), [
                    'trace' => $e->getTraceAsString()
                ]);
                $sourceResults[$source] = [];
            }
        }

        // Combine and rank results
        $rankStartTime = microtime(true);
        $results = $this->rankAndCombineResults($sourceResults, $limit);
        $metadata['timing']['ranking'] = microtime(true) - $rankStartTime;

        // Add total search time to metadata
        $metadata['timing']['total'] = microtime(true) - $startTime;

        $searchResults = [
            'query' => $query,
            'results' => $results,
            'sources' => array_keys($sourceResults),
            'total' => count($results),
            'metadata' => $metadata
        ];

        // Cache results if enabled
        if ($useCache) {
            $cacheKey = $this->generateCacheKey($query, $options);
            Cache::put($cacheKey, $searchResults, $this->cacheTtl);
        }

        return $searchResults;
    }

    /**
     * Generate a cache key for search results
     */
    protected function generateCacheKey(string $query, array $options): string
    {
        $normalizedQuery = strtolower(trim($query));
        $optionsHash = md5(json_encode([
            'limit' => $options['limit'] ?? 5,
            'threshold' => $options['threshold'] ?? 0.7,
            'sources' => $options['sources'] ?? ['embeddings', 'qa_pairs', 'keywords'],
            'category' => $options['category'] ?? null,
        ]));

        return "knowledge_search:{$normalizedQuery}:{$optionsHash}";
    }

    protected function searchEmbeddings($query, $queryEmbedding, $limit, $threshold, $category = null)
    {
        try {
            // Get all document embeddings
            // In a production environment, this should be optimized with a vector database
            $embeddings = DocumentEmbedding::with('document')
                ->when($category, function ($query, $category) {
                    return $query->whereHas('document', function ($q) use ($category) {
                        $q->where('category', $category);
                    });
                })
                ->get();

            if ($embeddings->isEmpty()) {
                return [];
            }

            // Prepare embeddings for similarity search
            $embeddingVectors = [];
            foreach ($embeddings as $embedding) {
                $embeddingVectors[$embedding->id] = json_decode($embedding->embedding, true);
            }

            // Find similar embeddings
            $similarEmbeddings = $this->vectorEmbeddingService->findSimilarEmbeddings(
                $queryEmbedding,
                $embeddingVectors,
                $threshold,
                $limit * 2 // Get more than needed to allow for filtering
            );

            // Format results
            $results = [];
            foreach ($similarEmbeddings as $embeddingId => $similarity) {
                $embedding = $embeddings->firstWhere('id', $embeddingId);

                if ($embedding && $embedding->document) {
                    $results[] = [
                        'id' => 'emb_' . $embedding->id,
                        'type' => 'document_chunk',
                        'document_id' => $embedding->document->id,
                        'document_name' => $embedding->document->name,
                        'category' => $embedding->document->category,
                        'content' => $embedding->content_chunk,
                        'relevance' => $similarity,
                        'source' => 'embeddings',
                        'metadata' => [
                            'document_id' => $embedding->document->id,
                            'document_name' => $embedding->document->name,
                            'chunk_index' => $embedding->chunk_index,
                            'similarity_score' => $similarity
                        ]
                    ];
                }
            }

            // Sort by relevance
            usort($results, function($a, $b) {
                return $b['relevance'] <=> $a['relevance'];
            });

            return array_slice($results, 0, $limit);
        } catch (\Exception $e) {
            Log::error('Error searching embeddings: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return [];
        }
    }

    protected function searchQAPairs($query, $queryEmbedding, $limit, $threshold, $category = null)
    {
        try {
            // Get QA pairs
            $qaPairs = QAPair::when($category, function ($query, $category) {
                return $query->where('category', $category);
            })->get();

            if ($qaPairs->isEmpty()) {
                return [];
            }

            // Generate embeddings for all questions
            $questions = $qaPairs->pluck('question')->toArray();
            $questionEmbeddings = $this->vectorEmbeddingService->generateEmbeddingsBatch($questions);

            // Find similar questions
            $similarities = [];
            foreach ($questionEmbeddings as $index => $embedding) {
                $similarity = $this->vectorEmbeddingService->calculateSimilarity($queryEmbedding, $embedding);

                if ($similarity >= $threshold) {
                    $similarities[$index] = $similarity;
                }
            }

            // If no semantic matches found, try keyword matching as fallback
            if (empty($similarities)) {
                // First try exact match
                $keywordQaPairs = QAPair::where('question', 'like', "%{$query}%")
                    ->when($category, function($q) use ($category) {
                        return $q->where('category', $category);
                    })
                    ->limit($limit)
                    ->get();

                // If still no results, try fuzzy matching on words
                if ($keywordQaPairs->isEmpty()) {
                    $words = explode(' ', $query);
                    $keywordQaPairs = QAPair::where(function($q) use ($words) {
                        foreach ($words as $word) {
                            if (strlen($word) > 3) { // Only use meaningful words
                                $q->orWhere('question', 'like', "%{$word}%");
                            }
                        }
                    })
                    ->when($category, function($q) use ($category) {
                        return $q->where('category', $category);
                    })
                    ->limit($limit)
                    ->get();
                }

                // Add keyword matches with lower relevance scores
                foreach ($keywordQaPairs as $index => $pair) {
                    $similarities[$qaPairs->search(function($item) use ($pair) {
                        return $item->id === $pair->id;
                    })] = $this->calculateTextSimilarity($query, $pair->question) * 0.8; // Lower weight for keyword matches
                }
            }

            // Sort by similarity (descending)
            arsort($similarities);

            // Format results
            $results = [];
            foreach (array_slice($similarities, 0, $limit, true) as $index => $similarity) {
                $pair = $qaPairs[$index];

                $results[] = [
                    'id' => 'qa_' . $pair->id,
                    'type' => 'qa_pair',
                    'question' => $pair->question,
                    'answer' => $pair->answer,
                    'category' => $pair->category,
                    'relevance' => $similarity,
                    'source' => 'qa_pairs',
                    'metadata' => [
                        'question' => $pair->question,
                        'category' => $pair->category,
                        'similarity_score' => $similarity,
                        'match_type' => $similarity > 0.8 ? 'semantic' : 'keyword'
                    ]
                ];
            }

            return $results;
        } catch (\Exception $e) {
            Log::error('Error searching QA pairs: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return [];
        }
    }

    protected function searchKeywords($query, $limit, $category = null)
    {
        try {
            // Extract keywords from query
            $keywords = $this->extractKeywords($query);

            if (empty($keywords)) {
                // If no meaningful keywords, just use the original query
                $keywords = [$query];
            }

            // Search in document content using keywords
            $documents = KnowledgeDocument::where(function($q) use ($query, $keywords) {
                // First try exact query match
                $q->where('content', 'like', "%{$query}%");

                // Then try individual keywords
                foreach ($keywords as $keyword) {
                    if (strlen($keyword) > 3) {
                        $q->orWhere('content', 'like', "%{$keyword}%");
                    }
                }
            })
            ->when($category, function($q) use ($category) {
                return $q->where('category', $category);
            })
            ->where('status', 'processed')
            ->limit($limit * 2) // Get more than needed to allow for relevance filtering
            ->get();

            // Format results
            $results = [];
            foreach ($documents as $document) {
                // Extract a snippet containing the query
                $snippet = $this->extractSnippet($document->content, $query, $keywords);

                // Calculate relevance based on keyword matches
                $relevance = $this->calculateKeywordRelevance($document, $keywords);

                $results[] = [
                    'id' => 'doc_' . $document->id,
                    'type' => 'document',
                    'document_id' => $document->id,
                    'document_name' => $document->name,
                    'category' => $document->category,
                    'content' => $snippet,
                    'relevance' => $relevance,
                    'source' => 'keywords',
                    'metadata' => [
                        'document_id' => $document->id,
                        'document_name' => $document->name,
                        'match_type' => 'keyword',
                        'keywords_matched' => $this->getMatchedKeywords($document->content, $keywords)
                    ]
                ];
            }

            // Sort by relevance
            usort($results, function($a, $b) {
                return $b['relevance'] <=> $a['relevance'];
            });

            return array_slice($results, 0, $limit);
        } catch (\Exception $e) {
            Log::error('Error searching by keywords: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return [];
        }
    }

    /**
     * Extract keywords from a query
     */
    protected function extractKeywords($query)
    {
        // Remove common stop words
        $stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'as'];
        $words = preg_split('/\s+/', strtolower($query));
        $keywords = array_filter($words, function ($word) use ($stopWords) {
            return strlen($word) > 2 && !in_array($word, $stopWords);
        });

        return array_values($keywords);
    }

    /**
     * Get list of matched keywords in content
     */
    protected function getMatchedKeywords($content, $keywords)
    {
        $matched = [];
        $content = strtolower($content);

        foreach ($keywords as $keyword) {
            if (strpos($content, strtolower($keyword)) !== false) {
                $matched[] = $keyword;
            }
        }

        return $matched;
    }

    protected function extractSnippet($content, $query, $keywords = null, $snippetLength = 300)
    {
        // Try to find the exact query first
        $position = stripos($content, $query);

        // If exact query not found and keywords provided, try to find any of the keywords
        if ($position === false && is_array($keywords) && !empty($keywords)) {
            $firstKeywordPos = PHP_INT_MAX;
            $matchedKeyword = '';

            foreach ($keywords as $keyword) {
                if (strlen($keyword) > 3) {
                    $pos = stripos($content, $keyword);
                    if ($pos !== false && $pos < $firstKeywordPos) {
                        $firstKeywordPos = $pos;
                        $matchedKeyword = $keyword;
                    }
                }
            }

            if ($firstKeywordPos !== PHP_INT_MAX) {
                $position = $firstKeywordPos;
                $query = $matchedKeyword; // Use the matched keyword for highlighting
            }
        }

        // If still not found, try to find any words from the query
        if ($position === false) {
            $words = explode(' ', $query);
            $firstWordPos = PHP_INT_MAX;
            $matchedWord = '';

            foreach ($words as $word) {
                if (strlen($word) > 3) {
                    $pos = stripos($content, $word);
                    if ($pos !== false && $pos < $firstWordPos) {
                        $firstWordPos = $pos;
                        $matchedWord = $word;
                    }
                }
            }

            if ($firstWordPos !== PHP_INT_MAX) {
                $position = $firstWordPos;
                $query = $matchedWord; // Use the matched word for highlighting
            }
        }

        // If still not found, return beginning of content
        if ($position === false) {
            return substr($content, 0, $snippetLength) . '...';
        }

        // Calculate start and end positions for the snippet
        $start = max(0, $position - ($snippetLength / 2));
        $end = min(strlen($content), $position + strlen($query) + ($snippetLength / 2));

        // Adjust to not break words
        while ($start > 0 && $content[$start] !== ' ' && $content[$start] !== "\n") {
            $start--;
        }

        while ($end < strlen($content) && $content[$end] !== ' ' && $content[$end] !== "\n") {
            $end++;
        }

        // Extract snippet
        $snippet = substr($content, $start, $end - $start);

        // Add ellipsis if needed
        if ($start > 0) {
            $snippet = '...' . $snippet;
        }

        if ($end < strlen($content)) {
            $snippet .= '...';
        }

        return $snippet;
    }

    /**
     * Calculate relevance score based on keyword matches
     */
    protected function calculateKeywordRelevance($item, array $keywords, array $fields = ['name', 'content'])
    {
        $totalMatches = 0;
        $maxPossibleMatches = count($keywords) * count($fields);
        $weightedScore = 0;

        foreach ($fields as $fieldIndex => $field) {
            if (property_exists($item, $field) || isset($item->$field)) {
                $content = strtolower($item->$field);
                $fieldWeight = ($field === 'name') ? 2 : 1; // Give more weight to matches in name/title

                foreach ($keywords as $keywordIndex => $keyword) {
                    if (strlen($keyword) < 3) continue;

                    $keywordWeight = 1 - ($keywordIndex / (count($keywords) * 2)); // Earlier keywords have more weight

                    if (strpos($content, strtolower($keyword)) !== false) {
                        $totalMatches++;
                        $weightedScore += $fieldWeight * $keywordWeight;

                        // Bonus for exact phrase match
                        if (count($keywords) > 1 && strpos($content, strtolower(implode(' ', $keywords))) !== false) {
                            $weightedScore += 0.5;
                        }
                    }
                }
            }
        }

        // Base score from match ratio
        $baseScore = $maxPossibleMatches > 0 ? $totalMatches / $maxPossibleMatches : 0;

        // Combine base score with weighted score
        $finalScore = ($baseScore * 0.4) + (min($weightedScore / $maxPossibleMatches, 1) * 0.6);

        // Ensure score is between 0 and 1
        return min(max($finalScore, 0), 1);
    }

    /**
     * Calculate text similarity using Jaccard similarity
     */
    protected function calculateTextSimilarity($text1, $text2)
    {
        // Simple Jaccard similarity for text
        $words1 = array_count_values(str_word_count(strtolower($text1), 1));
        $words2 = array_count_values(str_word_count(strtolower($text2), 1));

        $intersection = 0;
        foreach ($words1 as $word => $count) {
            if (isset($words2[$word])) {
                $intersection += min($count, $words2[$word]);
            }
        }

        $union = array_sum($words1) + array_sum($words2) - $intersection;

        return $union > 0 ? $intersection / $union : 0;
    }

    /**
     * Rank and combine results from different sources
     */
    protected function rankAndCombineResults($sourceResults, $limit)
    {
        // Combine all results
        $allResults = [];
        $sourceWeights = [
            'qa_pairs' => 1.2,    // Boost QA pairs
            'embeddings' => 1.1,  // Slightly boost embeddings
            'keywords' => 0.9     // Slightly reduce keyword matches
        ];

        // Track duplicate content to avoid showing the same information multiple times
        $seenContent = [];

        foreach ($sourceResults as $source => $results) {
            foreach ($results as $result) {
                // Generate a content hash to detect duplicates
                $contentHash = md5($result['content']);

                // Skip if we've already seen very similar content with higher relevance
                if (isset($seenContent[$contentHash]) && $seenContent[$contentHash] > $result['relevance']) {
                    continue;
                }

                // Apply source-specific weighting
                $sourceWeight = $sourceWeights[$source] ?? 1.0;
                $result['relevance'] *= $sourceWeight;

                // Apply additional ranking factors
                if (isset($result['metadata'])) {
                    // Boost results with more matched keywords
                    if (isset($result['metadata']['keywords_matched']) && is_array($result['metadata']['keywords_matched'])) {
                        $keywordBoost = min(count($result['metadata']['keywords_matched']) * 0.05, 0.2);
                        $result['relevance'] += $keywordBoost;
                    }

                    // Boost semantic matches
                    if (isset($result['metadata']['match_type']) && $result['metadata']['match_type'] === 'semantic') {
                        $result['relevance'] += 0.05;
                    }
                }

                // Ensure relevance is between 0 and 1
                $result['relevance'] = min(max($result['relevance'], 0), 1);

                // Record this content hash with its relevance
                $seenContent[$contentHash] = $result['relevance'];

                $allResults[] = $result;
            }
        }

        // Sort by relevance
        usort($allResults, function($a, $b) {
            return $b['relevance'] <=> $a['relevance'];
        });

        // Return top results
        return array_slice($allResults, 0, $limit);
    }
}
