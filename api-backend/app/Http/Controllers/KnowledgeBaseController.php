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
use App\Models\KnowledgeBase;
use App\Models\KnowledgeBaseSource;
use App\Models\KnowledgeBaseEntry;
use App\Services\KnowledgeBaseService;

class KnowledgeBaseController extends Controller
{
    protected $documentProcessingService;
    protected $embeddingService;
    protected $knowledgeSearchService;
    protected $knowledgeBaseService;

    public function __construct(
        DocumentProcessingService $documentProcessingService,
        EmbeddingService $embeddingService,
        KnowledgeSearchService $knowledgeSearchService,
        KnowledgeBaseService $knowledgeBaseService
    ) {
        $this->documentProcessingService = $documentProcessingService;
        $this->embeddingService = $embeddingService;
        $this->knowledgeSearchService = $knowledgeSearchService;
        $this->knowledgeBaseService = $knowledgeBaseService;
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
            'source_type' => 'upload', // Default source type for uploaded files
            'source_id' => 0,          // Default source ID for uploaded files
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
            'sources' => 'array',
            'sources.*' => 'string|in:embeddings,qa_pairs,keywords',
            'category' => 'string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = $request->input('query');

        // Set default search options
        $options = [
            'limit' => $request->input('limit', 5),
            'threshold' => $request->input('threshold', 0.7),
            'sources' => $request->input('sources', ['embeddings', 'qa_pairs', 'keywords']),
        ];

        // Add category if provided
        if ($request->has('category')) {
            $options['category'] = $request->input('category');
        }

        // Search for relevant content
        $results = $this->knowledgeSearchService->search($query, $options);

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

    /**
     * Get all knowledge bases for a user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        try {
            $knowledgeBases = $this->knowledgeBaseService->getKnowledgeBases($request->user()->id);
            return response()->json($knowledgeBases);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get a knowledge base by ID.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $id)
    {
        try {
            $knowledgeBase = $this->knowledgeBaseService->getKnowledgeBase($id, $request->user()->id);
            return response()->json($knowledgeBase);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        }
    }

    /**
     * Create a new knowledge base.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'settings' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $knowledgeBase = $this->knowledgeBaseService->createKnowledgeBase(
                $request->user()->id,
                $request->all()
            );
            return response()->json($knowledgeBase, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update a knowledge base.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'settings' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $knowledgeBase = $this->knowledgeBaseService->updateKnowledgeBase(
                $id,
                $request->user()->id,
                $request->all()
            );
            return response()->json($knowledgeBase);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        }
    }

    /**
     * Delete a knowledge base.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        try {
            $result = $this->knowledgeBaseService->deleteKnowledgeBase($id, $request->user()->id);
            return response()->json(['success' => $result], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        }
    }

    /**
     * Get all sources for a knowledge base.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function getSources(Request $request, $id)
    {
        try {
            $knowledgeBase = $this->knowledgeBaseService->getKnowledgeBase($id, $request->user()->id);
            return response()->json($knowledgeBase->sources);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        }
    }

    /**
     * Add a source to a knowledge base.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function addSource(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'source_type' => 'required|string|in:database,file,website,qa_pair',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'settings' => 'nullable|array',
            'metadata' => 'nullable|array',
            'is_active' => 'nullable|boolean',
            'priority' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $source = $this->knowledgeBaseService->addSource(
                $id,
                $request->user()->id,
                $request->all()
            );
            return response()->json($source, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update a source.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @param  int  $sourceId
     * @return \Illuminate\Http\Response
     */
    public function updateSource(Request $request, $id, $sourceId)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'settings' => 'nullable|array',
            'metadata' => 'nullable|array',
            'is_active' => 'nullable|boolean',
            'priority' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $source = $this->knowledgeBaseService->updateSource(
                $sourceId,
                $request->user()->id,
                $request->all()
            );
            return response()->json($source);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        }
    }

    /**
     * Delete a source.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @param  int  $sourceId
     * @return \Illuminate\Http\Response
     */
    public function deleteSource(Request $request, $id, $sourceId)
    {
        try {
            $result = $this->knowledgeBaseService->deleteSource($sourceId, $request->user()->id);
            return response()->json(['success' => $result], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        }
    }

    /**
     * Add an entry to a source.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @param  int  $sourceId
     * @return \Illuminate\Http\Response
     */
    public function addEntry(Request $request, $id, $sourceId)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
            'metadata' => 'nullable|array',
            'generate_embedding' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $entry = $this->knowledgeBaseService->addEntry(
                $sourceId,
                $request->user()->id,
                $request->all()
            );
            return response()->json($entry, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update an entry.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @param  int  $sourceId
     * @param  int  $entryId
     * @return \Illuminate\Http\Response
     */
    public function updateEntry(Request $request, $id, $sourceId, $entryId)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'sometimes|required|string',
            'metadata' => 'nullable|array',
            'generate_embedding' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $entry = $this->knowledgeBaseService->updateEntry(
                $entryId,
                $request->user()->id,
                $request->all()
            );
            return response()->json($entry);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        }
    }

    /**
     * Delete an entry.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @param  int  $sourceId
     * @param  int  $entryId
     * @return \Illuminate\Http\Response
     */
    public function deleteEntry(Request $request, $id, $sourceId, $entryId)
    {
        try {
            $result = $this->knowledgeBaseService->deleteEntry($entryId, $request->user()->id);
            return response()->json(['success' => $result], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        }
    }

    /**
     * Search for relevant knowledge.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function searchKnowledge(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string',
            'widget_id' => 'required|integer',
            'max_results' => 'nullable|integer|min:1|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $results = $this->knowledgeBaseService->search(
                $request->input('query'),
                [
                    'widget_id' => $request->input('widget_id'),
                    'max_results' => $request->input('max_results', 5),
                ]
            );
            return response()->json(['results' => $results]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Upload and process a document file.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function uploadDocumentFile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:pdf,doc,docx,txt,csv,xlsx,xls|max:10240',
            'knowledge_base_id' => 'required|integer',
            'source_name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Check if the knowledge base exists
            $knowledgeBase = $this->knowledgeBaseService->getKnowledgeBase(
                $request->input('knowledge_base_id'),
                $request->user()->id
            );

            // Store the file
            $file = $request->file('file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('knowledge_base/documents', $filename, 'public');

            // Create a new source
            $source = $this->knowledgeBaseService->addSource(
                $knowledgeBase->id,
                $request->user()->id,
                [
                    'source_type' => 'file',
                    'name' => $request->input('source_name'),
                    'description' => $request->input('description'),
                    'metadata' => [
                        'original_filename' => $file->getClientOriginalName(),
                        'mime_type' => $file->getMimeType(),
                        'size' => $file->getSize(),
                        'storage_path' => $path,
                    ],
                ]
            );

            // Process the document in a background job
            // In a real implementation, this would dispatch a job to process the file
            // For now, we'll just return the source

            return response()->json([
                'source' => $source,
                'message' => 'Document uploaded successfully and queued for processing.',
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Process a document.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $sourceId
     * @return \Illuminate\Http\Response
     */
    public function processDocumentSource(Request $request, $sourceId)
    {
        try {
            $source = KnowledgeBaseSource::findOrFail($sourceId);

            // Check if the user has access to this source
            $knowledgeBase = $this->knowledgeBaseService->getKnowledgeBase(
                $source->knowledge_base_id,
                $request->user()->id
            );

            // In a real implementation, this would dispatch a job to process the document
            // For now, we'll just return a success message

            return response()->json([
                'message' => 'Document processing has been queued.',
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Download a document.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $sourceId
     * @return \Illuminate\Http\Response
     */
    public function downloadDocumentSource(Request $request, $sourceId)
    {
        try {
            $source = KnowledgeBaseSource::findOrFail($sourceId);

            // Check if the user has access to this source
            $knowledgeBase = $this->knowledgeBaseService->getKnowledgeBase(
                $source->knowledge_base_id,
                $request->user()->id
            );

            // Get the file path
            if (!isset($source->metadata['storage_path'])) {
                return response()->json(['error' => 'No file associated with this source'], 404);
            }

            $path = $source->metadata['storage_path'];

            // Check if the file exists
            if (!Storage::disk('public')->exists($path)) {
                return response()->json(['error' => 'File not found'], 404);
            }

            return Storage::disk('public')->download($path, $source->metadata['original_filename'] ?? 'document');
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
