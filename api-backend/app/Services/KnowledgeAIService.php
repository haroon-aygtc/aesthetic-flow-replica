<?php

namespace App\Services;

use App\Models\AIModel;
use App\Models\KnowledgeDocument;
use App\Models\KnowledgeInsight;
use Illuminate\Support\Facades\Log;

class KnowledgeAIService
{
    protected $aiService;
    protected $knowledgeSearchService;
    
    public function __construct(AIService $aiService, KnowledgeSearchService $knowledgeSearchService)
    {
        $this->aiService = $aiService;
        $this->knowledgeSearchService = $knowledgeSearchService;
    }
    
    /**
     * Process a message with knowledge base augmentation.
     *
     * @param array $messages
     * @param AIModel|null $aiModel
     * @param array|null $widgetSettings
     * @param array|null $context
     * @return array
     */
    public function processMessageWithKnowledge(array $messages, ?AIModel $aiModel = null, ?array $widgetSettings = null, ?array $context = null)
    {
        $context = $context ?? [];
        $query = $this->extractQuery($messages);
        
        // Search the knowledge base for relevant content
        $searchResults = $this->knowledgeSearchService->search($query, [
            'limit' => 5,
            'threshold' => 0.7,
            'sources' => ['embeddings', 'qa_pairs', 'keywords'],
        ]);
        
        // Log the search for analytics
        KnowledgeInsight::createSearchInsight(
            $query, 
            count($searchResults['results']), 
            $searchResults['sources'], 
            $context['user_id'] ?? null
        );
        
        // If we have relevant knowledge, augment the messages with it
        if (!empty($searchResults['results'])) {
            $augmentedMessages = $this->augmentMessagesWithKnowledge($messages, $searchResults['results']);
            
            // Process the augmented messages
            $response = $this->aiService->processMessage($augmentedMessages, $aiModel, $widgetSettings, $context);
            
            // Add metadata about the knowledge sources used
            $response['metadata'] = array_merge($response['metadata'] ?? [], [
                'knowledge_sources' => $this->formatKnowledgeSources($searchResults['results']),
                'knowledge_used' => true
            ]);
            
            return $response;
        }
        
        // If no relevant knowledge found, process normally
        return $this->aiService->processMessage($messages, $aiModel, $widgetSettings, $context);
    }
    
    /**
     * Extract the query from the messages.
     *
     * @param array $messages
     * @return string
     */
    protected function extractQuery(array $messages)
    {
        // Get the last user message
        $lastUserMessage = null;
        
        for ($i = count($messages) - 1; $i >= 0; $i--) {
            if (is_array($messages[$i]) && isset($messages[$i]['role']) && $messages[$i]['role'] === 'user') {
                $lastUserMessage = $messages[$i]['content'];
                break;
            }
        }
        
        return $lastUserMessage ?? '';
    }
    
    /**
     * Augment messages with knowledge base content.
     *
     * @param array $messages
     * @param array $knowledgeResults
     * @return array
     */
    protected function augmentMessagesWithKnowledge(array $messages, array $knowledgeResults)
    {
        // Extract relevant content from knowledge results
        $relevantContent = $this->formatKnowledgeContent($knowledgeResults);
        
        // Create a system message with the knowledge context
        $knowledgeMessage = [
            'role' => 'system',
            'content' => "Use the following information to answer the user's question. If the information doesn't contain the answer, say you don't know and respond based on your general knowledge.\n\n" . $relevantContent
        ];
        
        // Insert the knowledge message before the last user message
        $augmentedMessages = [];
        $lastUserMessageIndex = 0;
        
        for ($i = count($messages) - 1; $i >= 0; $i--) {
            if (is_array($messages[$i]) && isset($messages[$i]['role']) && $messages[$i]['role'] === 'user') {
                $lastUserMessageIndex = $i;
                break;
            }
        }
        
        for ($i = 0; $i < count($messages); $i++) {
            if ($i === $lastUserMessageIndex) {
                $augmentedMessages[] = $knowledgeMessage;
            }
            $augmentedMessages[] = $messages[$i];
        }
        
        return $augmentedMessages;
    }
    
    /**
     * Format knowledge content for inclusion in messages.
     *
     * @param array $knowledgeResults
     * @return string
     */
    protected function formatKnowledgeContent(array $knowledgeResults)
    {
        $content = "KNOWLEDGE BASE INFORMATION:\n\n";
        
        foreach ($knowledgeResults as $index => $result) {
            $content .= "Source " . ($index + 1) . ": ";
            
            switch ($result['type']) {
                case 'document_chunk':
                    $content .= "Document: " . $result['document_name'] . "\n";
                    $content .= "Content: " . $result['content'] . "\n\n";
                    break;
                    
                case 'qa_pair':
                    $content .= "Q&A Pair\n";
                    $content .= "Question: " . $result['question'] . "\n";
                    $content .= "Answer: " . $result['answer'] . "\n\n";
                    break;
                    
                case 'document':
                    $content .= "Document: " . $result['document_name'] . "\n";
                    $content .= "Content: " . $result['content'] . "\n\n";
                    break;
            }
        }
        
        return $content;
    }
    
    /**
     * Format knowledge sources for metadata.
     *
     * @param array $knowledgeResults
     * @return array
     */
    protected function formatKnowledgeSources(array $knowledgeResults)
    {
        $sources = [];
        
        foreach ($knowledgeResults as $result) {
            $source = [
                'type' => $result['type'],
                'relevance' => $result['relevance'],
            ];
            
            switch ($result['type']) {
                case 'document_chunk':
                case 'document':
                    $source['document_id'] = $result['document_id'];
                    $source['document_name'] = $result['document_name'];
                    break;
                    
                case 'qa_pair':
                    $source['question'] = $result['question'];
                    break;
            }
            
            $sources[] = $source;
        }
        
        return $sources;
    }
}
