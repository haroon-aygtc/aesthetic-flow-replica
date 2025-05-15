<?php

namespace App\Services;

use App\Models\KnowledgeBase;
use App\Models\KnowledgeBaseSource;
use App\Models\KnowledgeBaseEntry;
use App\Models\Widget;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Exception;

class KnowledgeBaseService
{
    /**
     * The embedding service instance.
     *
     * @var \App\Services\EmbeddingService
     */
    protected $embeddingService;

    /**
     * Create a new service instance.
     *
     * @param  \App\Services\EmbeddingService  $embeddingService
     * @return void
     */
    public function __construct(EmbeddingService $embeddingService)
    {
        $this->embeddingService = $embeddingService;
    }

    /**
     * Get knowledge bases for a user.
     *
     * @param  int  $userId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getKnowledgeBases($userId)
    {
        return KnowledgeBase::where('user_id', $userId)
                           ->with('sources')
                           ->get();
    }

    /**
     * Get a knowledge base by ID.
     *
     * @param  int  $id
     * @param  int  $userId
     * @return \App\Models\KnowledgeBase
     * @throws \Exception
     */
    public function getKnowledgeBase($id, $userId)
    {
        $knowledgeBase = KnowledgeBase::where('id', $id)
                                     ->where('user_id', $userId)
                                     ->with('sources')
                                     ->first();

        if (!$knowledgeBase) {
            throw new Exception("Knowledge base not found");
        }

        return $knowledgeBase;
    }

    /**
     * Create a new knowledge base.
     *
     * @param  int  $userId
     * @param  array  $data
     * @return \App\Models\KnowledgeBase
     */
    public function createKnowledgeBase($userId, array $data)
    {
        $knowledgeBase = new KnowledgeBase();
        $knowledgeBase->user_id = $userId;
        $knowledgeBase->name = $data['name'];
        $knowledgeBase->description = $data['description'] ?? null;
        $knowledgeBase->settings = $data['settings'] ?? [];
        $knowledgeBase->is_active = $data['is_active'] ?? true;
        $knowledgeBase->save();

        return $knowledgeBase;
    }

    /**
     * Update a knowledge base.
     *
     * @param  int  $id
     * @param  int  $userId
     * @param  array  $data
     * @return \App\Models\KnowledgeBase
     * @throws \Exception
     */
    public function updateKnowledgeBase($id, $userId, array $data)
    {
        $knowledgeBase = $this->getKnowledgeBase($id, $userId);

        if (isset($data['name'])) {
            $knowledgeBase->name = $data['name'];
        }

        if (isset($data['description'])) {
            $knowledgeBase->description = $data['description'];
        }

        if (isset($data['settings'])) {
            $knowledgeBase->settings = $data['settings'];
        }

        if (isset($data['is_active'])) {
            $knowledgeBase->is_active = $data['is_active'];
        }

        $knowledgeBase->save();

        return $knowledgeBase;
    }

    /**
     * Delete a knowledge base.
     *
     * @param  int  $id
     * @param  int  $userId
     * @return bool
     * @throws \Exception
     */
    public function deleteKnowledgeBase($id, $userId)
    {
        $knowledgeBase = $this->getKnowledgeBase($id, $userId);
        return $knowledgeBase->delete();
    }

    /**
     * Add a source to a knowledge base.
     *
     * @param  int  $knowledgeBaseId
     * @param  int  $userId
     * @param  array  $data
     * @return \App\Models\KnowledgeBaseSource
     * @throws \Exception
     */
    public function addSource($knowledgeBaseId, $userId, array $data)
    {
        $knowledgeBase = $this->getKnowledgeBase($knowledgeBaseId, $userId);

        $source = new KnowledgeBaseSource();
        $source->knowledge_base_id = $knowledgeBase->id;
        $source->source_type = $data['source_type'];
        $source->name = $data['name'];
        $source->description = $data['description'] ?? null;
        $source->settings = $data['settings'] ?? [];
        $source->metadata = $data['metadata'] ?? [];
        $source->is_active = $data['is_active'] ?? true;
        $source->priority = $data['priority'] ?? 0;
        $source->save();

        return $source;
    }

    /**
     * Update a source.
     *
     * @param  int  $sourceId
     * @param  int  $userId
     * @param  array  $data
     * @return \App\Models\KnowledgeBaseSource
     * @throws \Exception
     */
    public function updateSource($sourceId, $userId, array $data)
    {
        $source = KnowledgeBaseSource::find($sourceId);

        if (!$source) {
            throw new Exception("Source not found");
        }

        $knowledgeBase = $this->getKnowledgeBase($source->knowledge_base_id, $userId);

        if (isset($data['name'])) {
            $source->name = $data['name'];
        }

        if (isset($data['description'])) {
            $source->description = $data['description'];
        }

        if (isset($data['settings'])) {
            $source->settings = $data['settings'];
        }

        if (isset($data['metadata'])) {
            $source->metadata = $data['metadata'];
        }

        if (isset($data['is_active'])) {
            $source->is_active = $data['is_active'];
        }

        if (isset($data['priority'])) {
            $source->priority = $data['priority'];
        }

        $source->save();

        return $source;
    }

    /**
     * Delete a source.
     *
     * @param  int  $sourceId
     * @param  int  $userId
     * @return bool
     * @throws \Exception
     */
    public function deleteSource($sourceId, $userId)
    {
        $source = KnowledgeBaseSource::find($sourceId);

        if (!$source) {
            throw new Exception("Source not found");
        }

        $knowledgeBase = $this->getKnowledgeBase($source->knowledge_base_id, $userId);

        return $source->delete();
    }

    /**
     * Add an entry to a source.
     *
     * @param  int  $sourceId
     * @param  int  $userId
     * @param  array  $data
     * @return \App\Models\KnowledgeBaseEntry
     * @throws \Exception
     */
    public function addEntry($sourceId, $userId, array $data)
    {
        $source = KnowledgeBaseSource::find($sourceId);

        if (!$source) {
            throw new Exception("Source not found");
        }

        $knowledgeBase = $this->getKnowledgeBase($source->knowledge_base_id, $userId);

        $entry = new KnowledgeBaseEntry();
        $entry->knowledge_base_source_id = $source->id;
        $entry->content = $data['content'];
        $entry->metadata = $data['metadata'] ?? [];

        // Generate embedding if configured
        if (isset($data['generate_embedding']) && $data['generate_embedding']) {
            try {
                $entry->embedding_vector = $this->embeddingService->generateEmbedding($data['content']);
            } catch (Exception $e) {
                Log::error("Failed to generate embedding: " . $e->getMessage());
            }
        }

        $entry->save();

        return $entry;
    }

    /**
     * Update an entry.
     *
     * @param  int  $entryId
     * @param  int  $userId
     * @param  array  $data
     * @return \App\Models\KnowledgeBaseEntry
     * @throws \Exception
     */
    public function updateEntry($entryId, $userId, array $data)
    {
        $entry = KnowledgeBaseEntry::find($entryId);

        if (!$entry) {
            throw new Exception("Entry not found");
        }

        $source = $entry->source;
        $knowledgeBase = $this->getKnowledgeBase($source->knowledge_base_id, $userId);

        if (isset($data['content'])) {
            $entry->content = $data['content'];

            // Regenerate embedding if content is changed
            if (isset($data['generate_embedding']) && $data['generate_embedding']) {
                try {
                    $entry->embedding_vector = $this->embeddingService->generateEmbedding($data['content']);
                } catch (Exception $e) {
                    Log::error("Failed to generate embedding: " . $e->getMessage());
                }
            }
        }

        if (isset($data['metadata'])) {
            $entry->metadata = $data['metadata'];
        }

        $entry->save();

        return $entry;
    }

    /**
     * Delete an entry.
     *
     * @param  int  $entryId
     * @param  int  $userId
     * @return bool
     * @throws \Exception
     */
    public function deleteEntry($entryId, $userId)
    {
        $entry = KnowledgeBaseEntry::find($entryId);

        if (!$entry) {
            throw new Exception("Entry not found");
        }

        $source = $entry->source;
        $knowledgeBase = $this->getKnowledgeBase($source->knowledge_base_id, $userId);

        return $entry->delete();
    }

    /**
     * Search the knowledge base for relevant information.
     *
     * @param  string  $query
     * @param  array  $context
     * @return array
     */
    public function search($query, array $context = [])
    {
        $results = [];
        $widgetId = $context['widget_id'] ?? null;

        if (!$widgetId) {
            return $results;
        }

        $widget = Widget::find($widgetId);

        if (!$widget) {
            return $results;
        }

        // Get knowledge bases associated with the widget
        $knowledgeBases = $widget->knowledgeBases()->with('sources.entries')->get();

        foreach ($knowledgeBases as $knowledgeBase) {
            // Skip inactive knowledge bases
            if (!$knowledgeBase->is_active) {
                continue;
            }

            $sources = $knowledgeBase->sources()
                                   ->active()
                                   ->orderByPriority()
                                   ->get();

            foreach ($sources as $source) {
                switch ($source->source_type) {
                    case 'qa_pair':
                        $qaResults = $this->searchQAPairs($query, $source);
                        $results = array_merge($results, $qaResults);
                        break;
                    case 'file':
                        $fileResults = $this->searchFileContent($query, $source);
                        $results = array_merge($results, $fileResults);
                        break;
                    case 'website':
                        $websiteResults = $this->searchWebsiteContent($query, $source);
                        $results = array_merge($results, $websiteResults);
                        break;
                    case 'database':
                        $dbResults = $this->searchDatabaseContent($query, $source);
                        $results = array_merge($results, $dbResults);
                        break;
                    default:
                        // Skip unknown source types
                        continue 2;
                }
            }
        }

        // Sort results by relevance and limit the number of results
        usort($results, function ($a, $b) {
            return $b['score'] <=> $a['score'];
        });

        $maxResults = $context['max_results'] ?? 5;
        return array_slice($results, 0, $maxResults);
    }

    /**
     * Search Q&A pairs for relevant information.
     *
     * @param  string  $query
     * @param  \App\Models\KnowledgeBaseSource  $source
     * @return array
     */
    private function searchQAPairs($query, KnowledgeBaseSource $source)
    {
        $results = [];
        $entries = $source->entries;

        foreach ($entries as $entry) {
            $content = json_decode($entry->content, true);

            if (!is_array($content) || !isset($content['question']) || !isset($content['answer'])) {
                continue;
            }

            // Simple keyword matching (in a real implementation, use embeddings)
            $questionSimilarity = $this->calculateSimilarity($query, $content['question']);

            if ($questionSimilarity > 0.7) {
                $results[] = [
                    'content' => $content['answer'],
                    'source' => [
                        'id' => $source->id,
                        'name' => $source->name,
                        'type' => $source->source_type
                    ],
                    'score' => $questionSimilarity,
                    'metadata' => $entry->metadata
                ];
            }
        }

        return $results;
    }

    /**
     * Search file content for relevant information.
     *
     * @param  string  $query
     * @param  \App\Models\KnowledgeBaseSource  $source
     * @return array
     */
    private function searchFileContent($query, KnowledgeBaseSource $source)
    {
        $results = [];
        $entries = $source->entries;

        foreach ($entries as $entry) {
            // In a real implementation, use embeddings for semantic search
            $similarity = $this->calculateSimilarity($query, $entry->content);

            if ($similarity > 0.6) {
                $results[] = [
                    'content' => $entry->content,
                    'source' => [
                        'id' => $source->id,
                        'name' => $source->name,
                        'type' => $source->source_type
                    ],
                    'score' => $similarity,
                    'metadata' => $entry->metadata
                ];
            }
        }

        return $results;
    }

    /**
     * Search website content for relevant information.
     *
     * @param  string  $query
     * @param  \App\Models\KnowledgeBaseSource  $source
     * @return array
     */
    private function searchWebsiteContent($query, KnowledgeBaseSource $source)
    {
        // Same implementation as file content for now
        return $this->searchFileContent($query, $source);
    }

    /**
     * Search database content for relevant information.
     *
     * @param  string  $query
     * @param  \App\Models\KnowledgeBaseSource  $source
     * @return array
     */
    private function searchDatabaseContent($query, KnowledgeBaseSource $source)
    {
        // Same implementation as file content for now
        return $this->searchFileContent($query, $source);
    }

    /**
     * Calculate similarity between two texts.
     *
     * @param  string  $text1
     * @param  string  $text2
     * @return float
     */
    private function calculateSimilarity($text1, $text2)
    {
        // Simplified implementation for demonstration
        // In a real implementation, use proper vector similarity with embeddings

        $text1 = strtolower($text1);
        $text2 = strtolower($text2);

        // Count word occurrences
        $words1 = array_count_values(str_word_count($text1, 1));
        $words2 = array_count_values(str_word_count($text2, 1));

        // Count common words
        $commonWords = 0;
        foreach ($words1 as $word => $count) {
            if (isset($words2[$word])) {
                $commonWords += min($count, $words2[$word]);
            }
        }

        // Total word count
        $totalWords = array_sum($words1) + array_sum($words2);

        if ($totalWords === 0) {
            return 0;
        }

        return (2 * $commonWords) / $totalWords;
    }

    /**
     * Enhance AI prompts with knowledge base context.
     *
     * @param  array  $messages
     * @param  string  $query
     * @param  array  $context
     * @return array
     */
    public function enhancePromptWithKnowledge(array $messages, $query, array $context = [])
    {
        // Search for relevant knowledge
        $searchResults = $this->search($query, $context);

        if (empty($searchResults)) {
            return $messages;
        }

        // Create a knowledge context
        $knowledgeContext = "Here is some relevant information to help answer the query:\n\n";

        foreach ($searchResults as $index => $result) {
            $knowledgeContext .= "Source {$index} ({$result['source']['name']}):\n{$result['content']}\n\n";
        }

        $knowledgeContext .= "Please use the above information when crafting your response. If the above information is not relevant or sufficient, you may rely on your general knowledge.";

        // Add knowledge context to messages
        $systemMessage = null;
        foreach ($messages as $key => $message) {
            if ($message['role'] === 'system') {
                $systemMessage = $message;
                $systemMessage['content'] .= "\n\n" . $knowledgeContext;
                $messages[$key] = $systemMessage;
                break;
            }
        }

        // If no system message, add one
        if (!$systemMessage) {
            array_unshift($messages, [
                'role' => 'system',
                'content' => $knowledgeContext
            ]);
        }

        return $messages;
    }
}
