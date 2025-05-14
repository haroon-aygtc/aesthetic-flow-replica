<?php

namespace App\Services;

use App\Models\KnowledgeDocument;
use App\Models\QAPair;
use App\Models\DocumentEmbedding;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class KnowledgeSearchService
{
    protected $embeddingService;
    
    public function __construct(EmbeddingService $embeddingService)
    {
        $this->embeddingService = $embeddingService;
    }
    
    public function search($query, $options = [])
    {
        $limit = $options['limit'] ?? 5;
        $threshold = $options['threshold'] ?? 0.7;
        $sources = $options['sources'] ?? ['embeddings', 'qa_pairs', 'keywords'];
        $category = $options['category'] ?? null;
        
        $results = [];
        $sourceResults = [];
        
        // Search in each source
        foreach ($sources as $source) {
            try {
                switch ($source) {
                    case 'embeddings':
                        $sourceResults[$source] = $this->searchEmbeddings($query, $limit, $threshold, $category);
                        break;
                    case 'qa_pairs':
                        $sourceResults[$source] = $this->searchQAPairs($query, $limit, $category);
                        break;
                    case 'keywords':
                        $sourceResults[$source] = $this->searchKeywords($query, $limit, $category);
                        break;
                }
            } catch (\Exception $e) {
                Log::error("Error searching in source {$source}: " . $e->getMessage());
                $sourceResults[$source] = [];
            }
        }
        
        // Combine and rank results
        $results = $this->rankAndCombineResults($sourceResults, $limit);
        
        return [
            'query' => $query,
            'results' => $results,
            'sources' => array_keys($sourceResults),
            'total' => count($results)
        ];
    }
    
    protected function searchEmbeddings($query, $limit, $threshold, $category = null)
    {
        // Get similar chunks using vector similarity
        $similarChunks = $this->embeddingService->findSimilarChunks($query, $limit * 2, $threshold);
        
        // Filter by category if specified
        if ($category) {
            $similarChunks = array_filter($similarChunks, function($chunk) use ($category) {
                return isset($chunk['metadata']['document_category']) && 
                       $chunk['metadata']['document_category'] === $category;
            });
        }
        
        // Format results
        $results = [];
        foreach ($similarChunks as $chunk) {
            $document = KnowledgeDocument::find($chunk['document_id']);
            if (!$document) continue;
            
            $results[] = [
                'id' => 'emb_' . $chunk['embedding_id'],
                'type' => 'document_chunk',
                'document_id' => $chunk['document_id'],
                'document_name' => $document->name,
                'category' => $document->category,
                'content' => $chunk['content'],
                'relevance' => $chunk['similarity'],
                'source' => 'embeddings'
            ];
        }
        
        return array_slice($results, 0, $limit);
    }
    
    protected function searchQAPairs($query, $limit, $category = null)
    {
        // First try exact match
        $qaPairs = QAPair::where('question', 'like', "%{$query}%")
            ->when($category, function($q) use ($category) {
                return $q->where('category', $category);
            })
            ->limit($limit)
            ->get();
            
        // If no results, try fuzzy matching on words
        if ($qaPairs->isEmpty()) {
            $words = explode(' ', $query);
            $qaPairs = QAPair::where(function($q) use ($words) {
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
        
        // Format results
        $results = [];
        foreach ($qaPairs as $pair) {
            $results[] = [
                'id' => 'qa_' . $pair->id,
                'type' => 'qa_pair',
                'question' => $pair->question,
                'answer' => $pair->answer,
                'category' => $pair->category,
                'relevance' => $this->calculateTextSimilarity($query, $pair->question),
                'source' => 'qa_pairs'
            ];
        }
        
        // Sort by relevance
        usort($results, function($a, $b) {
            return $b['relevance'] <=> $a['relevance'];
        });
        
        return array_slice($results, 0, $limit);
    }
    
    protected function searchKeywords($query, $limit, $category = null)
    {
        // Search in document content using keywords
        $documents = KnowledgeDocument::where('content', 'like', "%{$query}%")
            ->when($category, function($q) use ($category) {
                return $q->where('category', $category);
            })
            ->where('status', 'processed')
            ->limit($limit)
            ->get();
            
        // Format results
        $results = [];
        foreach ($documents as $document) {
            // Extract a snippet containing the query
            $snippet = $this->extractSnippet($document->content, $query);
            
            $results[] = [
                'id' => 'doc_' . $document->id,
                'type' => 'document',
                'document_id' => $document->id,
                'document_name' => $document->name,
                'category' => $document->category,
                'content' => $snippet,
                'relevance' => 0.7, // Default relevance for keyword matches
                'source' => 'keywords'
            ];
        }
        
        return $results;
    }
    
    protected function extractSnippet($content, $query, $snippetLength = 300)
    {
        $position = stripos($content, $query);
        if ($position === false) {
            // If exact query not found, try to find any of the words
            $words = explode(' ', $query);
            foreach ($words as $word) {
                if (strlen($word) > 3) {
                    $position = stripos($content, $word);
                    if ($position !== false) break;
                }
            }
            
            // If still not found, return beginning of content
            if ($position === false) {
                return substr($content, 0, $snippetLength) . '...';
            }
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
    
    protected function rankAndCombineResults($sourceResults, $limit)
    {
        // Combine all results
        $allResults = [];
        foreach ($sourceResults as $source => $results) {
            foreach ($results as $result) {
                // Apply source-specific weighting
                switch ($source) {
                    case 'qa_pairs':
                        $result['relevance'] *= 1.2; // Boost QA pairs
                        break;
                    case 'embeddings':
                        $result['relevance'] *= 1.1; // Slightly boost embeddings
                        break;
                }
                
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
