<?php

namespace App\Console\Commands;

use App\Models\WebsiteSource;
use App\Services\WebScraperService;
use App\Services\DocumentProcessingService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class RefreshWebsiteSources extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'knowledge:refresh-websites {--force : Force refresh all websites}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Refresh content from website sources in the knowledge base';

    /**
     * Create a new command instance.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(WebScraperService $webScraperService, DocumentProcessingService $documentProcessingService)
    {
        $force = $this->option('force');

        if ($force) {
            $this->info('Forcing refresh of all website sources...');
            $sources = WebsiteSource::where('status', '!=', 'failed')->get();
        } else {
            $this->info('Checking for website sources that need updating...');
            $sources = WebsiteSource::where('auto_update', true)
                ->where('status', '!=', 'failed')
                ->get()
                ->filter(function($source) {
                    return $source->needsUpdate();
                });
        }

        $count = $sources->count();
        $this->info("Found {$count} website sources to refresh.");

        if ($count === 0) {
            return 0;
        }

        $progressBar = $this->output->createProgressBar($count);
        $progressBar->start();

        $success = 0;
        $failed = 0;

        foreach ($sources as $source) {
            try {
                $this->line("\nRefreshing {$source->url}...");

                // Scrape the website
                $scrapedData = $webScraperService->scrapeUrl($source->url);

                // Update the source
                $source->update([
                    'title' => $scrapedData['title'],
                    'description' => $scrapedData['description'],
                    'status' => 'active',
                    'last_crawled_at' => now(),
                    'metadata' => $scrapedData['metadata'],
                ]);

                // Get the associated document or create a new one
                $document = $source->document()->first();

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
                    $document = $source->document()->create([
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
                    ]);
                }

                // Process the document content
                $documentProcessingService->processDocument($document);

                $success++;
                $this->line(" <info>Success</info>");
            } catch (\Exception $e) {
                $failed++;
                $this->line(" <error>Failed: {$e->getMessage()}</error>");

                // Update source status
                $source->update([
                    'status' => 'failed',
                    'metadata' => array_merge($source->metadata ?? [], [
                        'last_error' => $e->getMessage(),
                        'last_error_time' => now()->toIso8601String(),
                    ]),
                ]);

                Log::error('Failed to refresh website source', [
                    'url' => $source->url,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->line("\n");
        $this->info("Website sources refresh completed: {$success} succeeded, {$failed} failed.");

        return 0;
    }
}
