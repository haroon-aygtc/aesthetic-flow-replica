<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Models\AIModel;

class VectorEmbeddingService
{
    protected $defaultModel;
    protected $apiKey;
    protected $embeddingDimension;
    protected $cacheEnabled;
    protected $cacheTtl;

    public function __construct()
    {
        // Get default embedding model from config or use a fallback
        $this->defaultModel = config('ai.embedding_model', 'text-embedding-3-small');
        $this->apiKey = config('ai.openai_api_key');
        $this->embeddingDimension = config('ai.embedding_dimension', 1536);
        $this->cacheEnabled = config('ai.cache_embeddings', true);
        $this->cacheTtl = config('ai.embedding_cache_ttl', 86400); // 24 hours
    }

    /**
     * Generate an embedding vector for the given text
     *
     * @param string $text The text to generate an embedding for
     * @param string|null $model The model to use for embedding generation
     * @return array The embedding vector
     */
    public function generateEmbedding(string $text, ?string $model = null): array
    {
        // Normalize and truncate text
        $text = $this->normalizeText($text);
        
        // Use cache if enabled
        if ($this->cacheEnabled) {
            $cacheKey = 'embedding:' . md5($text) . ':' . ($model ?? $this->defaultModel);
            
            return Cache::remember($cacheKey, $this->cacheTtl, function () use ($text, $model) {
                return $this->callEmbeddingAPI($text, $model);
            });
        }
        
        return $this->callEmbeddingAPI($text, $model);
    }
    
    /**
     * Generate embeddings for multiple texts in batch
     *
     * @param array $texts Array of texts to generate embeddings for
     * @param string|null $model The model to use for embedding generation
     * @return array Array of embedding vectors
     */
    public function generateEmbeddingsBatch(array $texts, ?string $model = null): array
    {
        $embeddings = [];
        $uncachedTexts = [];
        $uncachedIndexes = [];
        
        // Normalize all texts
        $normalizedTexts = array_map([$this, 'normalizeText'], $texts);
        
        // If caching is enabled, check cache first
        if ($this->cacheEnabled) {
            foreach ($normalizedTexts as $index => $text) {
                $cacheKey = 'embedding:' . md5($text) . ':' . ($model ?? $this->defaultModel);
                
                if (Cache::has($cacheKey)) {
                    $embeddings[$index] = Cache::get($cacheKey);
                } else {
                    $uncachedTexts[] = $text;
                    $uncachedIndexes[] = $index;
                }
            }
            
            // If all embeddings were in cache, return them
            if (empty($uncachedTexts)) {
                return $embeddings;
            }
        } else {
            $uncachedTexts = $normalizedTexts;
            $uncachedIndexes = array_keys($normalizedTexts);
        }
        
        // Call API for uncached texts
        $newEmbeddings = $this->callEmbeddingAPIBatch($uncachedTexts, $model);
        
        // Store new embeddings in cache and result array
        foreach ($newEmbeddings as $i => $embedding) {
            $index = $uncachedIndexes[$i];
            $embeddings[$index] = $embedding;
            
            if ($this->cacheEnabled) {
                $cacheKey = 'embedding:' . md5($uncachedTexts[$i]) . ':' . ($model ?? $this->defaultModel);
                Cache::put($cacheKey, $embedding, $this->cacheTtl);
            }
        }
        
        // Sort by original index
        ksort($embeddings);
        return $embeddings;
    }
    
    /**
     * Calculate cosine similarity between two embedding vectors
     *
     * @param array $embedding1 First embedding vector
     * @param array $embedding2 Second embedding vector
     * @return float Similarity score between 0 and 1
     */
    public function calculateSimilarity(array $embedding1, array $embedding2): float
    {
        // Ensure vectors have the same dimension
        if (count($embedding1) !== count($embedding2)) {
            throw new \InvalidArgumentException('Embedding vectors must have the same dimension');
        }
        
        // Calculate dot product
        $dotProduct = 0;
        $magnitude1 = 0;
        $magnitude2 = 0;
        
        for ($i = 0; $i < count($embedding1); $i++) {
            $dotProduct += $embedding1[$i] * $embedding2[$i];
            $magnitude1 += $embedding1[$i] * $embedding1[$i];
            $magnitude2 += $embedding2[$i] * $embedding2[$i];
        }
        
        $magnitude1 = sqrt($magnitude1);
        $magnitude2 = sqrt($magnitude2);
        
        // Avoid division by zero
        if ($magnitude1 == 0 || $magnitude2 == 0) {
            return 0;
        }
        
        return $dotProduct / ($magnitude1 * $magnitude2);
    }
    
    /**
     * Find the most similar embeddings to a query embedding
     *
     * @param array $queryEmbedding The query embedding vector
     * @param array $embeddings Array of embeddings to compare against
     * @param float $threshold Minimum similarity threshold (0-1)
     * @param int $limit Maximum number of results to return
     * @return array Array of [index => similarity_score] sorted by similarity
     */
    public function findSimilarEmbeddings(
        array $queryEmbedding, 
        array $embeddings, 
        float $threshold = 0.7, 
        int $limit = 5
    ): array {
        $similarities = [];
        
        foreach ($embeddings as $index => $embedding) {
            $similarity = $this->calculateSimilarity($queryEmbedding, $embedding);
            
            if ($similarity >= $threshold) {
                $similarities[$index] = $similarity;
            }
        }
        
        // Sort by similarity (descending)
        arsort($similarities);
        
        // Limit results
        return array_slice($similarities, 0, $limit, true);
    }
    
    /**
     * Normalize text for embedding generation
     *
     * @param string $text Text to normalize
     * @return string Normalized text
     */
    protected function normalizeText(string $text): string
    {
        // Trim whitespace and normalize spaces
        $text = trim(preg_replace('/\s+/', ' ', $text));
        
        // Truncate if too long (most models have token limits)
        $maxLength = 8000; // Approximate limit for most embedding models
        if (strlen($text) > $maxLength) {
            $text = substr($text, 0, $maxLength);
        }
        
        return $text;
    }
    
    /**
     * Call the embedding API for a single text
     *
     * @param string $text Text to embed
     * @param string|null $model Model to use
     * @return array Embedding vector
     */
    protected function callEmbeddingAPI(string $text, ?string $model = null): array
    {
        try {
            $model = $model ?? $this->defaultModel;
            $apiKey = $this->apiKey;
            
            // Use OpenAI API for embeddings
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/embeddings', [
                'input' => $text,
                'model' => $model,
            ]);
            
            if ($response->successful()) {
                $data = $response->json();
                return $data['data'][0]['embedding'];
            } else {
                Log::error('Embedding API error: ' . $response->body());
                throw new \Exception('Failed to generate embedding: ' . $response->body());
            }
        } catch (\Exception $e) {
            Log::error('Embedding generation error: ' . $e->getMessage());
            
            // Return a zero vector as fallback
            return array_fill(0, $this->embeddingDimension, 0);
        }
    }
    
    /**
     * Call the embedding API for multiple texts
     *
     * @param array $texts Texts to embed
     * @param string|null $model Model to use
     * @return array Array of embedding vectors
     */
    protected function callEmbeddingAPIBatch(array $texts, ?string $model = null): array
    {
        try {
            $model = $model ?? $this->defaultModel;
            $apiKey = $this->apiKey;
            
            // Use OpenAI API for embeddings
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/embeddings', [
                'input' => $texts,
                'model' => $model,
            ]);
            
            if ($response->successful()) {
                $data = $response->json();
                
                // Sort by index to maintain original order
                $embeddings = $data['data'];
                usort($embeddings, function ($a, $b) {
                    return $a['index'] - $b['index'];
                });
                
                return array_map(function ($item) {
                    return $item['embedding'];
                }, $embeddings);
            } else {
                Log::error('Batch embedding API error: ' . $response->body());
                throw new \Exception('Failed to generate batch embeddings: ' . $response->body());
            }
        } catch (\Exception $e) {
            Log::error('Batch embedding generation error: ' . $e->getMessage());
            
            // Return zero vectors as fallback
            return array_fill(0, count($texts), array_fill(0, $this->embeddingDimension, 0));
        }
    }
}
