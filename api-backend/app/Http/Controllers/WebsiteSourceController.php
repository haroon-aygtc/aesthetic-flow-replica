<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\WebsiteSource;
use App\Models\KnowledgeDocument;
use App\Services\WebScraperService;
use App\Services\DocumentProcessingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class WebsiteSourceController extends Controller
{
    protected $webScraperService;
    protected $documentProcessingService;

    public function __construct(
        WebScraperService $webScraperService,
        DocumentProcessingService $documentProcessingService
    ) {
        $this->webScraperService = $webScraperService;
        $this->documentProcessingService = $documentProcessingService;
    }

    /**
     * Get all website sources.
     */
    public function index(): JsonResponse
    {
        $sources = WebsiteSource::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $sources
        ]);
    }

    /**
     * Store a newly created website source.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'url' => 'required|url|max:255',
            'category' => 'required|string|max:255',
            'auto_update' => 'boolean',
            'update_frequency' => 'in:daily,weekly,monthly',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if URL already exists
        $existingSource = WebsiteSource::where('url', $request->url)->first();
        if ($existingSource) {
            return response()->json([
                'success' => false,
                'message' => 'This URL is already in the knowledge base',
                'data' => $existingSource
            ], 422);
        }

        try {
            // Scrape the website
            $scrapedData = $this->webScraperService->scrapeUrl($request->url);

            // Create website source record
            $source = WebsiteSource::create([
                'url' => $request->url,
                'title' => $scrapedData['title'],
                'description' => $scrapedData['description'],
                'category' => $request->category,
                'auto_update' => $request->auto_update ?? false,
                'update_frequency' => $request->update_frequency ?? 'weekly',
                'status' => 'active',
                'last_crawled_at' => now(),
                'metadata' => $scrapedData['metadata'],
                'user_id' => auth()->id(),
            ]);

            // Create knowledge document from the website content
            $document = KnowledgeDocument::create([
                'name' => $scrapedData['title'] ?: $request->url,
                'type' => 'text/html',
                'size' => strlen($scrapedData['content']),
                'status' => 'processing',
                'category' => $request->category,
                'url' => $request->url,
                'content' => $scrapedData['content'],
                'metadata' => [
                    'source_url' => $request->url,
                    'scraped_at' => now()->toIso8601String(),
                ],
                'user_id' => auth()->id(),
                'source_id' => $source->id,
                'source_type' => WebsiteSource::class,
            ]);

            // Process the document content asynchronously
            $this->documentProcessingService->processDocument($document);

            return response()->json([
                'success' => true,
                'message' => 'Website source added successfully and processing started',
                'data' => $source
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add website source: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified website source.
     */
    public function show(string $id): JsonResponse
    {
        $source = WebsiteSource::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $source
        ]);
    }

    /**
     * Update the specified website source.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'category' => 'string|max:255',
            'auto_update' => 'boolean',
            'update_frequency' => 'in:daily,weekly,monthly',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $source = WebsiteSource::findOrFail($id);
        $source->update($request->only(['category', 'auto_update', 'update_frequency']));

        return response()->json([
            'success' => true,
            'message' => 'Website source updated successfully',
            'data' => $source
        ]);
    }

    /**
     * Remove the specified website source.
     */
    public function destroy(string $id): JsonResponse
    {
        $source = WebsiteSource::findOrFail($id);

        // Delete associated documents
        $documents = KnowledgeDocument::where('source_id', $source->id)
            ->where('source_type', WebsiteSource::class)
            ->get();

        foreach ($documents as $document) {
            // This will also delete associated embeddings due to cascade delete
            $document->delete();
        }

        $source->delete();

        return response()->json([
            'success' => true,
            'message' => 'Website source deleted successfully'
        ]);
    }

    /**
     * Refresh the website content.
     */
    public function refresh(string $id): JsonResponse
    {
        $source = WebsiteSource::findOrFail($id);

        try {
            // Scrape the website again
            $scrapedData = $this->webScraperService->scrapeUrl($source->url);

            // Update the source
            $source->update([
                'title' => $scrapedData['title'],
                'description' => $scrapedData['description'],
                'status' => 'active',
                'last_crawled_at' => now(),
                'metadata' => $scrapedData['metadata'],
            ]);

            // Get the associated document or create a new one
            $document = KnowledgeDocument::where('source_id', $source->id)
                ->where('source_type', WebsiteSource::class)
                ->first();

            if ($document) {
                // Update the existing document
                $document->update([
                    'name' => $scrapedData['title'] ?: $source->url,
                    'size' => strlen($scrapedData['content']),
                    'status' => 'processing',
                    'content' => $scrapedData['content'],
                    'metadata' => array_merge($document->metadata ?? [], [
                        'last_updated' => now()->toIso8601String(),
                    ]),
                ]);
            } else {
                // Create a new document
                $document = KnowledgeDocument::create([
                    'name' => $scrapedData['title'] ?: $source->url,
                    'type' => 'text/html',
                    'size' => strlen($scrapedData['content']),
                    'status' => 'processing',
                    'category' => $source->category,
                    'url' => $source->url,
                    'content' => $scrapedData['content'],
                    'metadata' => [
                        'source_url' => $source->url,
                        'scraped_at' => now()->toIso8601String(),
                    ],
                    'user_id' => $source->user_id,
                    'source_id' => $source->id,
                    'source_type' => WebsiteSource::class,
                ]);
            }

            // Process the document content
            $this->documentProcessingService->processDocument($document);

            return response()->json([
                'success' => true,
                'message' => 'Website source refreshed successfully',
                'data' => $source
            ]);
        } catch (\Exception $e) {
            // Update source status to failed
            $source->update([
                'status' => 'failed',
                'metadata' => array_merge($source->metadata ?? [], [
                    'last_error' => $e->getMessage(),
                    'last_error_time' => now()->toIso8601String(),
                ]),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to refresh website source: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export website content in various formats.
     */
    public function exportContent(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'format' => 'required|string|in:json,csv,text,raw',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $source = WebsiteSource::findOrFail($id);
        $format = $request->input('format');

        try {
            // Get fresh data or use cached data
            $useCached = $request->input('use_cached', true);
            $scrapedData = $this->webScraperService->scrapeUrl($source->url, $useCached);

            // Export the data in the requested format
            $exportedContent = $this->webScraperService->exportData($scrapedData, $format);

            // Determine content type based on format
            $contentType = match($format) {
                'json' => 'application/json',
                'csv' => 'text/csv',
                'text', 'raw' => 'text/plain',
                default => 'text/plain',
            };

            // Generate a filename based on the website and format
            $filename = Str::slug($source->title ?: parse_url($source->url, PHP_URL_HOST)) . '-content.' . $format;

            // Log export activity
            $source->update([
                'metadata' => array_merge($source->metadata ?? [], [
                    'last_exported' => now()->toIso8601String(),
                    'export_format' => $format
                ])
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Content exported successfully',
                'data' => [
                    'content' => $exportedContent,
                    'filename' => $filename,
                    'content_type' => $contentType
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export content: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Preview website content as processed by the scraper.
     */
    public function previewContent(Request $request, string $id): JsonResponse
    {
        $source = WebsiteSource::findOrFail($id);

        try {
            // Use cached data by default for preview
            $useCached = $request->input('use_cached', true);
            $scrapedData = $this->webScraperService->scrapeUrl($source->url, $useCached);

            // Return a subset of data for preview
            return response()->json([
                'success' => true,
                'data' => [
                    'url' => $scrapedData['url'],
                    'title' => $scrapedData['title'],
                    'description' => $scrapedData['description'],
                    'content_sample' => Str::limit($scrapedData['content'], 1000),
                    'content_length' => strlen($scrapedData['content']),
                    'metadata' => $scrapedData['metadata'],
                    'scraped_at' => $scrapedData['scraped_at'],
                    'export_formats' => ['json', 'csv', 'text', 'raw']
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to preview content: ' . $e->getMessage()
            ], 500);
        }
    }
}
