<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\DocumentProcessingService;
use App\Services\EmbeddingService;
use App\Services\KnowledgeSearchService;

class KnowledgeServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(EmbeddingService::class, function ($app) {
            return new EmbeddingService();
        });
        
        $this->app->singleton(DocumentProcessingService::class, function ($app) {
            return new DocumentProcessingService(
                $app->make(EmbeddingService::class)
            );
        });
        
        $this->app->singleton(KnowledgeSearchService::class, function ($app) {
            return new KnowledgeSearchService(
                $app->make(EmbeddingService::class)
            );
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
