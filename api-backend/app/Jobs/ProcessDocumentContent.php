<?php

namespace App\Jobs;

use App\Models\KnowledgeDocument;
use App\Services\DocumentProcessingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessDocumentContent implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $document;
    public $timeout = 600; // 10 minutes
    public $tries = 3;

    public function __construct(KnowledgeDocument $document)
    {
        $this->document = $document;
    }

    public function handle(DocumentProcessingService $documentService)
    {
        Log::info('Processing document', ['document_id' => $this->document->id, 'name' => $this->document->name]);
        $documentService->processDocument($this->document);
    }
    
    public function failed(\Throwable $exception)
    {
        Log::error('Document processing job failed', [
            'document_id' => $this->document->id,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);
        
        // Update document status to failed
        $this->document->status = 'failed';
        $this->document->metadata = array_merge($this->document->metadata ?? [], [
            'error' => $exception->getMessage()
        ]);
        $this->document->save();
    }
}
