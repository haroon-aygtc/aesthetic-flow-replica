<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\KnowledgeDocument;
use App\Models\QAPair;
use App\Models\KnowledgeInsight;
use App\Models\DocumentEmbedding;
use App\Jobs\ProcessDocumentContent;
use App\Services\DocumentProcessingService;
use App\Services\EmbeddingService;
use App\Services\KnowledgeSearchService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;

class KnowledgeBaseController extends Controller
{
    protected $documentProcessingService;
    protected $embeddingService;
    protected $knowledgeSearchService;

    public function __construct(
        DocumentProcessingService $documentProcessingService,
        EmbeddingService $embeddingService,
        KnowledgeSearchService $knowledgeSearchService
    ) {
        $this->documentProcessingService = $documentProcessingService;
        $this->embeddingService = $embeddingService;
        $this->knowledgeSearchService = $knowledgeSearchService;
    }
    /**
     * Get all documents.
     */
    public function getDocuments(): JsonResponse
    {
        $documents = KnowledgeDocument::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $documents
        ]);
    }

    /**
     * Upload a new document.
     */
    public function uploadDocument(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240', // 10MB max
            'category' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $file = $request->file('file');
        $fileName = $file->getClientOriginalName();
        $fileSize = $file->getSize();
        $fileType = $file->getMimeType();

        // Generate a unique path for the file
        $path = $file->store('knowledge-base', 'public');
        $url = Storage::url($path);

        // Create document record
        $document = KnowledgeDocument::create([
            'name' => $fileName,
            'type' => $fileType,
            'size' => $fileSize,
            'status' => 'processing', // Will be processed asynchronously
            'category' => $request->category,
            'url' => $url,
            'user_id' => auth()->id(),
        ]);

        // Dispatch job to process document content
        ProcessDocumentContent::dispatch($document);

        return response()->json([
            'success' => true,
            'message' => 'Document uploaded successfully and processing started',
            'data' => $document
        ]);
    }

    /**
     * Delete a document.
     */
    public function deleteDocument(string $id): JsonResponse
    {
        $document = KnowledgeDocument::findOrFail($id);

        // Delete the file from storage if it exists
        if ($document->url) {
            $path = str_replace('/storage/', '', $document->url);
            Storage::disk('public')->delete($path);
        }

        // Delete associated embeddings
        DocumentEmbedding::where('document_id', $document->id)->delete();

        $document->delete();

        return response()->json([
            'success' => true,
            'message' => 'Document and associated embeddings deleted successfully'
        ]);
    }

    /**
     * Download a document.
     */
    public function downloadDocument(string $id): JsonResponse
    {
        $document = KnowledgeDocument::findOrFail($id);

        if (!$document->url) {
            return response()->json([
                'success' => false,
                'message' => 'Document file not found'
            ], 404);
        }

        $path = str_replace('/storage/', '', $document->url);

        if (!Storage::disk('public')->exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'Document file not found in storage'
            ], 404);
        }

        return response()->download(
            Storage::disk('public')->path($path),
            $document->name
        );
    }

    /**
     * Get all QA pairs.
     */
    public function getQAPairs(): JsonResponse
    {
        $qaPairs = QAPair::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $qaPairs
        ]);
    }

    /**
     * Create a new QA pair.
     */
    public function createQAPair(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'question' => 'required|string',
            'answer' => 'required|string',
            'category' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $qaPair = QAPair::create([
            'question' => $request->question,
            'answer' => $request->answer,
            'category' => $request->category,
            'user_id' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'QA pair created successfully',
            'data' => $qaPair
        ]);
    }

    /**
     * Update a QA pair.
     */
    public function updateQAPair(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'question' => 'required|string',
            'answer' => 'required|string',
            'category' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $qaPair = QAPair::findOrFail($id);

        $qaPair->update([
            'question' => $request->question,
            'answer' => $request->answer,
            'category' => $request->category,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'QA pair updated successfully',
            'data' => $qaPair
        ]);
    }

    /**
     * Delete a QA pair.
     */
    public function deleteQAPair(string $id): JsonResponse
    {
        $qaPair = QAPair::findOrFail($id);
        $qaPair->delete();

        return response()->json([
            'success' => true,
            'message' => 'QA pair deleted successfully'
        ]);
    }

    /**
     * Get knowledge base insights.
     */
    public function getInsights(Request $request): JsonResponse
    {
        $timeframe = $request->query('timeframe', '30days');

        // Determine the date range based on timeframe
        $endDate = now();
        $startDate = match($timeframe) {
            '7days' => now()->subDays(7),
            '30days' => now()->subDays(30),
            '90days' => now()->subDays(90),
            'year' => now()->subYear(),
            default => now()->subDays(30),
        };

        // Get insights within the date range
        $insights = KnowledgeInsight::whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'asc')
            ->get()
            ->groupBy('metric');

        // Get document and QA pair counts
        $documentCount = KnowledgeDocument::count();
        $qaPairCount = QAPair::count();
        $embeddingCount = DocumentEmbedding::count();

        // Get document status counts
        $documentStatusCounts = KnowledgeDocument::select('status', \DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        return response()->json([
            'success' => true,
            'data' => [
                'insights' => $insights,
                'summary' => [
                    'documentCount' => $documentCount,
                    'qaPairCount' => $qaPairCount,
                    'embeddingCount' => $embeddingCount,
                    'documentStatusCounts' => $documentStatusCounts
                ]
            ]
        ]);
    }

    /**
     * Search the knowledge base.
     */
    public function search(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string|min:3',
            'limit' => 'integer|min:1|max:20',
            'threshold' => 'numeric|min:0|max:1',
            'category' => 'string|nullable',
            'sources' => 'array|nullable',
            'sources.*' => 'string|in:embeddings,qa_pairs,keywords',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = $request->input('query');
        $limit = $request->input('limit', 5);
        $threshold = $request->input('threshold', 0.7);
        $category = $request->input('category');
        $sources = $request->input('sources', ['embeddings', 'qa_pairs', 'keywords']);

        $options = [
            'limit' => $limit,
            'threshold' => $threshold,
            'category' => $category,
            'sources' => $sources,
        ];

        $results = $this->knowledgeSearchService->search($query, $options);

        // Log the search for analytics
        KnowledgeInsight::create([
            'type' => 'search',
            'source_id' => auth()->id() ?? 0,
            'source_type' => auth()->check() ? 'user' : 'guest',
            'metric' => 'search_count',
            'value' => 1,
            'date' => now(),
            'metadata' => [
                'query' => $query,
                'results_count' => count($results['results']),
                'sources' => $sources,
            ]
        ]);

        return response()->json([
            'success' => true,
            'data' => $results
        ]);
    }

    /**
     * Process a document manually.
     */
    public function processDocument(string $id): JsonResponse
    {
        $document = KnowledgeDocument::findOrFail($id);

        if ($document->status === 'processed') {
            return response()->json([
                'success' => false,
                'message' => 'Document is already processed'
            ], 400);
        }

        // Dispatch job to process document
        ProcessDocumentContent::dispatch($document);

        return response()->json([
            'success' => true,
            'message' => 'Document processing started',
            'data' => $document
        ]);
    }

    /**
     * Get document embeddings.
     */
    public function getDocumentEmbeddings(string $id): JsonResponse
    {
        $document = KnowledgeDocument::findOrFail($id);

        $embeddings = DocumentEmbedding::where('document_id', $document->id)
            ->orderBy('chunk_index')
            ->get(['id', 'content_chunk', 'chunk_index', 'embedding_model', 'created_at']);

        return response()->json([
            'success' => true,
            'data' => [
                'document' => $document,
                'embeddings' => $embeddings,
                'count' => $embeddings->count()
            ]
        ]);
    }
}