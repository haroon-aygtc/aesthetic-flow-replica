<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\AIModel;
use App\Models\DocumentEmbedding;
use Exception;

class EmbeddingService
{
    /**
     * The AI model selector service.
     *
     * @var \App\Services\AIModelSelector
     */
    protected $modelSelector;

    /**
     * Create a new service instance.
     *
     * @param  \App\Services\AIModelSelector  $modelSelector
     * @return void
     */
    public function __construct(AIModelSelector $modelSelector)
    {
        $this->modelSelector = $modelSelector;
    }

    /**
     * Generate embeddings for a text.
     *
     * @param  string  $text
     * @param  \App\Models\AIModel|null  $model
     * @return string|null
     * @throws \Exception
     */
    public function generateEmbedding($text, AIModel $model = null)
    {
        // If no specific model is provided, find an appropriate embedding model
        if (!$model) {
            $model = $this->modelSelector->selectEmbeddingModel();

            if (!$model) {
                throw new Exception("No embedding model available");
            }
        }

        // Get the provider
        $provider = $model->provider ?? 'openai';

        // Generate embedding based on provider
        switch ($provider) {
            case 'openai':
                return $this->generateOpenAIEmbedding($text, $model);
            case 'cohere':
                return $this->generateCohereEmbedding($text, $model);
            case 'azure':
                return $this->generateAzureEmbedding($text, $model);
            default:
                throw new Exception("Unsupported embedding provider: {$provider}");
        }
    }

    /**
     * Generate embeddings using OpenAI.
     *
     * @param  string  $text
     * @param  \App\Models\AIModel  $model
     * @return string|null
     * @throws \Exception
     */
    private function generateOpenAIEmbedding($text, AIModel $model)
    {
        try {
            $modelSettings = $model->settings ?? [];
            $embeddingModelName = $modelSettings['embedding_model'] ?? 'text-embedding-ada-002';

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $model->api_key,
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/embeddings', [
                'model' => $embeddingModelName,
                'input' => $text,
            ]);

            if ($response->failed()) {
                Log::error('OpenAI embedding error: ' . $response->body());
                throw new Exception('Failed to generate embedding: ' . $response->body());
            }

            $data = $response->json();
            $embedding = $data['data'][0]['embedding'] ?? null;

            if (!$embedding) {
                throw new Exception('No embedding returned from OpenAI');
            }

            return json_encode($embedding);
        } catch (Exception $e) {
            Log::error('Error generating OpenAI embedding: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate embeddings using Cohere.
     *
     * @param  string  $text
     * @param  \App\Models\AIModel  $model
     * @return string|null
     * @throws \Exception
     */
    private function generateCohereEmbedding($text, AIModel $model)
    {
        try {
            $modelSettings = $model->settings ?? [];
            $embeddingModelName = $modelSettings['embedding_model'] ?? 'embed-english-v2.0';

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $model->api_key,
                'Content-Type' => 'application/json',
            ])->post('https://api.cohere.ai/v1/embed', [
                'model' => $embeddingModelName,
                'texts' => [$text],
            ]);

            if ($response->failed()) {
                Log::error('Cohere embedding error: ' . $response->body());
                throw new Exception('Failed to generate embedding: ' . $response->body());
            }

            $data = $response->json();
            $embedding = $data['embeddings'][0] ?? null;

            if (!$embedding) {
                throw new Exception('No embedding returned from Cohere');
            }

            return json_encode($embedding);
        } catch (Exception $e) {
            Log::error('Error generating Cohere embedding: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate embeddings using Azure OpenAI.
     *
     * @param  string  $text
     * @param  \App\Models\AIModel  $model
     * @return string|null
     * @throws \Exception
     */
    private function generateAzureEmbedding($text, AIModel $model)
    {
        try {
            $modelSettings = $model->settings ?? [];
            $endpoint = $modelSettings['endpoint'] ?? '';
            $deploymentId = $modelSettings['embedding_deployment_id'] ?? '';
            $apiVersion = $modelSettings['api_version'] ?? '2023-05-15';

            if (empty($endpoint) || empty($deploymentId)) {
                throw new Exception('Azure OpenAI configuration is incomplete');
            }

            $url = "{$endpoint}/openai/deployments/{$deploymentId}/embeddings?api-version={$apiVersion}";

            $response = Http::withHeaders([
                'api-key' => $model->api_key,
                'Content-Type' => 'application/json',
            ])->post($url, [
                'input' => $text,
            ]);

            if ($response->failed()) {
                Log::error('Azure embedding error: ' . $response->body());
                throw new Exception('Failed to generate embedding: ' . $response->body());
            }

            $data = $response->json();
            $embedding = $data['data'][0]['embedding'] ?? null;

            if (!$embedding) {
                throw new Exception('No embedding returned from Azure');
            }

            return json_encode($embedding);
        } catch (Exception $e) {
            Log::error('Error generating Azure embedding: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Calculate cosine similarity between two embeddings.
     *
     * @param  string  $embedding1
     * @param  string  $embedding2
     * @return float
     */
    public function calculateCosineSimilarity($embedding1, $embedding2)
    {
        $vector1 = json_decode($embedding1, true);
        $vector2 = json_decode($embedding2, true);

        if (!is_array($vector1) || !is_array($vector2)) {
            return 0;
        }

        // Calculate dot product
        $dotProduct = 0;
        $magnitude1 = 0;
        $magnitude2 = 0;

        foreach ($vector1 as $i => $value) {
            if (isset($vector2[$i])) {
                $dotProduct += $value * $vector2[$i];
                $magnitude1 += $value * $value;
                $magnitude2 += $vector2[$i] * $vector2[$i];
            }
        }

        $magnitude1 = sqrt($magnitude1);
        $magnitude2 = sqrt($magnitude2);

        if ($magnitude1 == 0 || $magnitude2 == 0) {
            return 0;
        }

        return $dotProduct / ($magnitude1 * $magnitude2);
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
            $similarity = $this->calculateCosineSimilarity($queryEmbedding, $embedding->embedding_vector);

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
}
