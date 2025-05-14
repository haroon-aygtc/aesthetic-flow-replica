<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\AIModel;
use App\Models\DocumentEmbedding;

class EmbeddingService
{
    protected $defaultModel;
    
    public function __construct()
    {
        // Get a default AI model with embedding capability
        $this->defaultModel = AIModel::where('provider', 'openai')
            ->where('active', true)
            ->first();
    }
    
    public function generateEmbedding($text, AIModel $model = null)
    {
        $model = $model ?? $this->defaultModel;
        
        if (!$model) {
            throw new \Exception('No suitable AI model found for embeddings');
        }
        
        $provider = $model->provider;
        
        switch ($provider) {
            case 'openai':
                return $this->generateOpenAIEmbedding($text, $model);
            case 'huggingface':
                return $this->generateHuggingFaceEmbedding($text, $model);
            case 'cohere':
                return $this->generateCohereEmbedding($text, $model);
            default:
                throw new \Exception("Unsupported provider for embeddings: {$provider}");
        }
    }
    
    protected function generateOpenAIEmbedding($text, AIModel $model)
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $model->api_key,
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/embeddings', [
                'model' => 'text-embedding-3-small',
                'input' => $text
            ]);
            
            if ($response->successful()) {
                $data = $response->json();
                return [
                    'model' => 'text-embedding-3-small',
                    'vector' => $data['data'][0]['embedding']
                ];
            } else {
                Log::error('OpenAI embedding generation failed', [
                    'status' => $response->status(),
                    'response' => $response->json()
                ]);
                throw new \Exception('Failed to generate embedding: ' . $response->json()['error']['message']);
            }
        } catch (\Exception $e) {
            Log::error('OpenAI embedding error: ' . $e->getMessage());
            throw $e;
        }
    }
    
    protected function generateHuggingFaceEmbedding($text, AIModel $model)
    {
        try {
            $modelName = $model->settings['model_name'] ?? 'sentence-transformers/all-MiniLM-L6-v2';
            
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $model->api_key,
                'Content-Type' => 'application/json',
            ])->post("https://api-inference.huggingface.co/models/{$modelName}", [
                'inputs' => $text
            ]);
            
            if ($response->successful()) {
                $data = $response->json();
                return [
                    'model' => $modelName,
                    'vector' => $data
                ];
            } else {
                Log::error('HuggingFace embedding generation failed', [
                    'status' => $response->status(),
                    'response' => $response->json()
                ]);
                throw new \Exception('Failed to generate embedding: ' . $response->body());
            }
        } catch (\Exception $e) {
            Log::error('HuggingFace embedding error: ' . $e->getMessage());
            throw $e;
        }
    }
    
    protected function generateCohereEmbedding($text, AIModel $model)
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $model->api_key,
                'Content-Type' => 'application/json',
            ])->post('https://api.cohere.ai/v1/embed', [
                'texts' => [$text],
                'model' => 'embed-english-v3.0'
            ]);
            
            if ($response->successful()) {
                $data = $response->json();
                return [
                    'model' => 'embed-english-v3.0',
                    'vector' => $data['embeddings'][0]
                ];
            } else {
                Log::error('Cohere embedding generation failed', [
                    'status' => $response->status(),
                    'response' => $response->json()
                ]);
                throw new \Exception('Failed to generate embedding: ' . $response->body());
            }
        } catch (\Exception $e) {
            Log::error('Cohere embedding error: ' . $e->getMessage());
            throw $e;
        }
    }
    
    public function findSimilarChunks($query, $limit = 5, $threshold = 0.7)
    {
        // Generate embedding for the query
        $queryEmbedding = $this->generateEmbedding($query);
        
        // Get all document embeddings
        $embeddings = DocumentEmbedding::all();
        
        // Calculate similarity scores
        $scoredChunks = [];
        foreach ($embeddings as $embedding) {
            $similarity = $this->cosineSimilarity($queryEmbedding['vector'], $embedding->embedding_vector);
            
            // Only include results above threshold
            if ($similarity >= $threshold) {
                $scoredChunks[] = [
                    'embedding_id' => $embedding->id,
                    'document_id' => $embedding->document_id,
                    'content' => $embedding->content_chunk,
                    'similarity' => $similarity,
                    'metadata' => $embedding->metadata
                ];
            }
        }
        
        // Sort by similarity (highest first)
        usort($scoredChunks, function ($a, $b) {
            return $b['similarity'] <=> $a['similarity'];
        });
        
        // Return top results
        return array_slice($scoredChunks, 0, $limit);
    }
    
    protected function cosineSimilarity($vectorA, $vectorB)
    {
        $dotProduct = 0;
        $magnitudeA = 0;
        $magnitudeB = 0;
        
        foreach ($vectorA as $i => $valueA) {
            $valueB = $vectorB[$i];
            $dotProduct += $valueA * $valueB;
            $magnitudeA += $valueA * $valueA;
            $magnitudeB += $valueB * $valueB;
        }
        
        $magnitudeA = sqrt($magnitudeA);
        $magnitudeB = sqrt($magnitudeB);
        
        if ($magnitudeA == 0 || $magnitudeB == 0) {
            return 0;
        }
        
        return $dotProduct / ($magnitudeA * $magnitudeB);
    }
}
