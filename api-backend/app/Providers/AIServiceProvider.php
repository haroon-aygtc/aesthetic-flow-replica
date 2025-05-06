<?php

namespace App\Providers;

use App\Services\AIService;
use App\Services\AIModelSelector;
use App\Services\AI\ProviderRegistry;
use App\Services\AI\Providers\GrokProvider;
use App\Services\AI\Providers\GeminiProvider;
use App\Services\AI\Providers\OpenAIProvider;
use App\Services\AI\Providers\MistralProvider;
use App\Services\AI\Providers\CohereProvider;
use App\Services\AI\Providers\DeepSeekProvider;
use App\Services\AI\Providers\AnthropicProvider;
use App\Services\AI\Providers\OpenRouterProvider;
use App\Services\AI\Providers\HuggingFaceProvider;
use Illuminate\Support\ServiceProvider;

class AIServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        // Register Provider Registry
        $this->app->singleton(ProviderRegistry::class, function ($app) {
            $registry = new ProviderRegistry();

            // Register providers if they exist
            if (class_exists(OpenAIProvider::class)) {
                $registry->register('openai', OpenAIProvider::class);
            }

            if (class_exists(AnthropicProvider::class)) {
                $registry->register('anthropic', AnthropicProvider::class);
            }

            if (class_exists(GeminiProvider::class)) {
                $registry->register('gemini', GeminiProvider::class);
            }

            if (class_exists(GrokProvider::class)) {
                $registry->register('grok', GrokProvider::class);
            }

            if (class_exists(HuggingFaceProvider::class)) {
                $registry->register('huggingface', HuggingFaceProvider::class);
            }

            if (class_exists(OpenRouterProvider::class)) {
                $registry->register('openrouter', OpenRouterProvider::class);
            }

            if (class_exists(MistralProvider::class)) {
                $registry->register('mistral', MistralProvider::class);
            }

            if (class_exists(DeepSeekProvider::class)) {
                $registry->register('deepseek', DeepSeekProvider::class);
            }

            if (class_exists(CohereProvider::class)) {
                $registry->register('cohere', CohereProvider::class);
            }

            return $registry;
        });

        // Register AIModelSelector
        $this->app->singleton(AIModelSelector::class, function ($app) {
            return new AIModelSelector();
        });

        // Register AIService with dependencies
        $this->app->singleton(AIService::class, function ($app) {
            return new AIService(
                $app->make(AIModelSelector::class),
                $app->make(ProviderRegistry::class)
            );
        });
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        // Publish configuration
        $this->publishes([
            __DIR__.'/../../config/ai.php' => config_path('ai.php'),
        ], 'ai-config');
    }
}
