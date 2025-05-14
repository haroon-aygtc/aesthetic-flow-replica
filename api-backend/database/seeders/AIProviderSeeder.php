<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AIProvider;
use App\Models\ProviderParameter;
use App\Models\ProviderModel;

class AIProviderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default providers
        $providers = [
            [
                'name' => 'OpenAI',
                'slug' => 'openai',
                'description' => 'OpenAI API provider for GPT models',
                'api_base_url' => 'https://api.openai.com/v1',
                'supports_streaming' => true,
                'requires_model_selection' => true,
                'capabilities' => [
                    'chat' => true,
                    'completions' => true,
                    'embeddings' => true,
                    'vision' => true
                ],
                'auth_config' => [
                    'type' => 'api_key',
                    'header_name' => 'Authorization',
                    'header_value_prefix' => 'Bearer '
                ]
            ],
            [
                'name' => 'Anthropic',
                'slug' => 'anthropic',
                'description' => 'Anthropic API provider for Claude models',
                'api_base_url' => 'https://api.anthropic.com/v1',
                'supports_streaming' => true,
                'requires_model_selection' => true,
                'capabilities' => [
                    'chat' => true,
                    'completions' => false,
                    'embeddings' => false,
                    'vision' => true
                ],
                'auth_config' => [
                    'type' => 'api_key',
                    'header_name' => 'x-api-key'
                ]
            ],
            [
                'name' => 'Google AI',
                'slug' => 'gemini',
                'description' => 'Google AI API provider for Gemini models',
                'api_base_url' => 'https://generativelanguage.googleapis.com/v1',
                'supports_streaming' => true,
                'requires_model_selection' => true,
                'capabilities' => [
                    'chat' => true,
                    'completions' => false,
                    'embeddings' => true,
                    'vision' => true
                ],
                'auth_config' => [
                    'type' => 'api_key',
                    'query_param' => 'key'
                ]
            ],
            [
                'name' => 'Mistral AI',
                'slug' => 'mistral',
                'description' => 'Mistral AI API provider',
                'api_base_url' => 'https://api.mistral.ai/v1',
                'supports_streaming' => true,
                'requires_model_selection' => true,
                'capabilities' => [
                    'chat' => true,
                    'completions' => false,
                    'embeddings' => true,
                    'vision' => false
                ],
                'auth_config' => [
                    'type' => 'api_key',
                    'header_name' => 'Authorization',
                    'header_value_prefix' => 'Bearer '
                ]
            ],
            [
                'name' => 'Grok',
                'slug' => 'grok',
                'description' => 'X.AI Grok API provider',
                'api_base_url' => 'https://api.grok.x.com/v1',
                'supports_streaming' => true,
                'requires_model_selection' => true,
                'capabilities' => [
                    'chat' => true,
                    'completions' => false,
                    'embeddings' => false,
                    'vision' => false
                ],
                'auth_config' => [
                    'type' => 'api_key',
                    'header_name' => 'Authorization',
                    'header_value_prefix' => 'Bearer '
                ]
            ],
            [
                'name' => 'HuggingFace',
                'slug' => 'huggingface',
                'description' => 'HuggingFace Inference API provider',
                'api_base_url' => 'https://api-inference.huggingface.co/models',
                'supports_streaming' => false,
                'requires_model_selection' => true,
                'capabilities' => [
                    'chat' => true,
                    'completions' => true,
                    'embeddings' => true,
                    'vision' => true
                ],
                'auth_config' => [
                    'type' => 'api_key',
                    'header_name' => 'Authorization',
                    'header_value_prefix' => 'Bearer '
                ]
            ],
            [
                'name' => 'OpenRouter',
                'slug' => 'openrouter',
                'description' => 'OpenRouter API gateway for multiple AI models',
                'api_base_url' => 'https://openrouter.ai/api/v1',
                'supports_streaming' => true,
                'requires_model_selection' => true,
                'capabilities' => [
                    'chat' => true,
                    'completions' => true,
                    'embeddings' => true,
                    'vision' => true
                ],
                'auth_config' => [
                    'type' => 'api_key',
                    'header_name' => 'Authorization',
                    'header_value_prefix' => 'Bearer '
                ]
            ],
            [
                'name' => 'DeepSeek',
                'slug' => 'deepseek',
                'description' => 'DeepSeek API provider',
                'api_base_url' => 'https://api.deepseek.com/v1',
                'supports_streaming' => true,
                'requires_model_selection' => true,
                'capabilities' => [
                    'chat' => true,
                    'completions' => true,
                    'embeddings' => false,
                    'vision' => false
                ],
                'auth_config' => [
                    'type' => 'api_key',
                    'header_name' => 'Authorization',
                    'header_value_prefix' => 'Bearer '
                ]
            ],
            [
                'name' => 'Cohere',
                'slug' => 'cohere',
                'description' => 'Cohere API provider',
                'api_base_url' => 'https://api.cohere.ai/v1',
                'supports_streaming' => true,
                'requires_model_selection' => true,
                'capabilities' => [
                    'chat' => true,
                    'completions' => true,
                    'embeddings' => true,
                    'vision' => false
                ],
                'auth_config' => [
                    'type' => 'api_key',
                    'header_name' => 'Authorization',
                    'header_value_prefix' => 'Bearer '
                ]
            ]
        ];
        
        foreach ($providers as $providerData) {
            $provider = AIProvider::updateOrCreate(
                ['slug' => $providerData['slug']],
                $providerData
            );
            
            // Add standard parameters for each provider
            $this->createStandardParameters($provider);
            
            // Add provider-specific parameters
            $this->createProviderSpecificParameters($provider);
        }
    }
    
    /**
     * Create standard parameters for a provider
     */
    private function createStandardParameters(AIProvider $provider): void
    {
        $standardParams = [
            [
                'param_key' => 'temperature',
                'display_name' => 'Temperature',
                'type' => 'number',
                'config' => [
                    'min' => 0,
                    'max' => 1,
                    'step' => 0.01,
                    'presets' => [
                        'precise' => 0.1,
                        'balanced' => 0.7,
                        'creative' => 1.0
                    ]
                ],
                'default_value' => '0.7',
                'description' => 'Controls randomness: lower values for more deterministic outputs, higher values for more creative responses.',
                'is_required' => false,
                'is_advanced' => false,
                'display_order' => 10
            ],
            [
                'param_key' => 'max_tokens',
                'display_name' => 'Maximum Output Tokens',
                'type' => 'number',
                'config' => [
                    'min' => 1,
                    'max' => $provider->slug === 'anthropic' ? 100000 : 8000,
                    'step' => 1
                ],
                'default_value' => '2048',
                'description' => 'The maximum number of tokens to generate in the response.',
                'is_required' => false,
                'is_advanced' => false,
                'display_order' => 20
            ],
            [
                'param_key' => 'top_p',
                'display_name' => 'Top P',
                'type' => 'number',
                'config' => [
                    'min' => 0,
                    'max' => 1,
                    'step' => 0.01
                ],
                'default_value' => '1',
                'description' => 'Controls diversity via nucleus sampling: 0.1 means only tokens comprising the top 10% probability mass are considered.',
                'is_required' => false,
                'is_advanced' => true,
                'display_order' => 30
            ],
            [
                'param_key' => 'frequency_penalty',
                'display_name' => 'Frequency Penalty',
                'type' => 'number',
                'config' => [
                    'min' => 0,
                    'max' => 2,
                    'step' => 0.01
                ],
                'default_value' => '0',
                'description' => 'Reduces repetition by penalizing tokens that have already appeared in the text.',
                'is_required' => false,
                'is_advanced' => true,
                'display_order' => 40
            ],
            [
                'param_key' => 'presence_penalty',
                'display_name' => 'Presence Penalty',
                'type' => 'number',
                'config' => [
                    'min' => 0,
                    'max' => 2,
                    'step' => 0.01
                ],
                'default_value' => '0',
                'description' => 'Encourages the model to talk about new topics by penalizing tokens that have appeared at all.',
                'is_required' => false,
                'is_advanced' => true,
                'display_order' => 50
            ]
        ];
        
        foreach ($standardParams as $paramData) {
            ProviderParameter::updateOrCreate(
                [
                    'provider_id' => $provider->id,
                    'param_key' => $paramData['param_key']
                ],
                $paramData
            );
        }
    }
    
    /**
     * Create provider-specific parameters
     */
    private function createProviderSpecificParameters(AIProvider $provider): void
    {
        if ($provider->slug === 'openai') {
            $this->createOpenAIParameters($provider);
        } elseif ($provider->slug === 'anthropic') {
            $this->createAnthropicParameters($provider);
        } elseif ($provider->slug === 'gemini') {
            $this->createGeminiParameters($provider);
        } elseif ($provider->slug === 'mistral') {
            $this->createMistralParameters($provider);
        } elseif ($provider->slug === 'grok') {
            $this->createGrokParameters($provider);
        } elseif ($provider->slug === 'huggingface') {
            $this->createHuggingFaceParameters($provider);
        } elseif ($provider->slug === 'openrouter') {
            $this->createOpenRouterParameters($provider);
        } elseif ($provider->slug === 'deepseek') {
            $this->createDeepSeekParameters($provider);
        } elseif ($provider->slug === 'cohere') {
            $this->createCohereParameters($provider);
        }
    }
    
    /**
     * Create OpenAI specific parameters
     */
    private function createOpenAIParameters(AIProvider $provider): void
    {
        // Create default models
        $models = [
            [
                'model_id' => 'gpt-4-turbo',
                'display_name' => 'GPT-4 Turbo',
                'description' => 'Most advanced model for complex tasks, reasoning, and creative content',
                'is_default' => true,
                'is_free' => false,
                'is_restricted' => false,
                'input_token_limit' => 128000,
                'output_token_limit' => 16000,
                'capabilities' => [
                    'streaming' => true,
                    'vision' => true
                ],
                'display_order' => 10
            ],
            [
                'model_id' => 'gpt-4o',
                'display_name' => 'GPT-4o',
                'description' => 'Latest multimodal model with vision capabilities and high performance',
                'is_default' => false,
                'is_free' => false,
                'is_restricted' => false,
                'input_token_limit' => 128000,
                'output_token_limit' => 4000,
                'capabilities' => [
                    'streaming' => true,
                    'vision' => true
                ],
                'display_order' => 20
            ],
            [
                'model_id' => 'gpt-3.5-turbo',
                'display_name' => 'GPT-3.5 Turbo',
                'description' => 'Fast and cost-effective model for most common use cases',
                'is_default' => false,
                'is_free' => true,
                'is_restricted' => false,
                'input_token_limit' => 16385,
                'output_token_limit' => 4096,
                'capabilities' => [
                    'streaming' => true,
                    'vision' => true
                ],
                'display_order' => 30
            ]
        ];
        
        foreach ($models as $modelData) {
            ProviderModel::updateOrCreate(
                [
                    'provider_id' => $provider->id,
                    'model_id' => $modelData['model_id']
                ],
                $modelData
            );
        }
    }
    
    /**
     * Create Anthropic specific parameters
     */
    private function createAnthropicParameters(AIProvider $provider): void
    {
        // Create default models
        $models = [
            [
                'model_id' => 'claude-3-opus-20240229',
                'display_name' => 'Claude 3 Opus',
                'description' => 'Most capable Claude model for complex tasks requiring deep analysis',
                'is_default' => true,
                'is_free' => false,
                'is_restricted' => false,
                'input_token_limit' => 200000,
                'output_token_limit' => 100000,
                'capabilities' => [
                    'streaming' => true,
                    'vision' => true
                ],
                'display_order' => 10
            ],
            [
                'model_id' => 'claude-3-sonnet-20240229',
                'display_name' => 'Claude 3 Sonnet',
                'description' => 'Balanced Claude model offering great performance at lower cost',
                'is_default' => false,
                'is_free' => false,
                'is_restricted' => false,
                'input_token_limit' => 200000,
                'output_token_limit' => 100000,
                'capabilities' => [
                    'streaming' => true,
                    'vision' => true
                ],
                'display_order' => 20
            ],
            [
                'model_id' => 'claude-3-haiku-20240307',
                'display_name' => 'Claude 3 Haiku',
                'description' => 'Fastest and most compact Claude model for simple, high-volume tasks',
                'is_default' => false,
                'is_free' => true,
                'is_restricted' => false,
                'input_token_limit' => 200000,
                'output_token_limit' => 100000,
                'capabilities' => [
                    'streaming' => true,
                    'vision' => true
                ],
                'display_order' => 30
            ]
        ];
        
        foreach ($models as $modelData) {
            ProviderModel::updateOrCreate(
                [
                    'provider_id' => $provider->id,
                    'model_id' => $modelData['model_id']
                ],
                $modelData
            );
        }
    }
    
    /**
     * Create Google Gemini specific parameters
     */
    private function createGeminiParameters(AIProvider $provider): void
    {
        // Create default models
        $models = [
            [
                'model_id' => 'gemini-1.5-pro',
                'display_name' => 'Gemini 1.5 Pro',
                'description' => 'Advanced model with strong general capability and multimodal features',
                'is_default' => true,
                'is_free' => false,
                'is_restricted' => false,
                'input_token_limit' => 1000000,
                'output_token_limit' => 8192,
                'capabilities' => [
                    'streaming' => true,
                    'vision' => true
                ],
                'display_order' => 10
            ],
            [
                'model_id' => 'gemini-1.5-flash',
                'display_name' => 'Gemini 1.5 Flash',
                'description' => 'Fast model with good balance of speed and capability',
                'is_default' => false,
                'is_free' => false,
                'is_restricted' => false,
                'input_token_limit' => 1000000,
                'output_token_limit' => 8192,
                'capabilities' => [
                    'streaming' => true,
                    'vision' => true
                ],
                'display_order' => 20
            ],
            [
                'model_id' => 'gemini-1.0-pro',
                'display_name' => 'Gemini 1.0 Pro',
                'description' => 'Balanced model for most tasks at reasonable cost',
                'is_default' => false,
                'is_free' => true,
                'is_restricted' => false,
                'input_token_limit' => 32768,
                'output_token_limit' => 4096,
                'capabilities' => [
                    'streaming' => true,
                    'vision' => true
                ],
                'display_order' => 30
            ]
        ];
        
        foreach ($models as $modelData) {
            ProviderModel::updateOrCreate(
                [
                    'provider_id' => $provider->id,
                    'model_id' => $modelData['model_id']
                ],
                $modelData
            );
        }
    }
    
    /**
     * Create Mistral specific parameters
     */
    private function createMistralParameters(AIProvider $provider): void
    {
        // Create default models
        $models = [
            [
                'model_id' => 'mistral-large-latest',
                'display_name' => 'Mistral Large',
                'description' => 'Most powerful and capable Mistral model',
                'is_default' => true,
                'is_free' => false,
                'is_restricted' => false,
                'input_token_limit' => 32768,
                'output_token_limit' => 4096,
                'capabilities' => [
                    'streaming' => true,
                    'vision' => false
                ],
                'display_order' => 10
            ],
            [
                'model_id' => 'mistral-medium-latest',
                'display_name' => 'Mistral Medium',
                'description' => 'Good balance of capability and cost',
                'is_default' => false,
                'is_free' => false,
                'is_restricted' => false,
                'input_token_limit' => 32768,
                'output_token_limit' => 4096,
                'capabilities' => [
                    'streaming' => true,
                    'vision' => false
                ],
                'display_order' => 20
            ],
            [
                'model_id' => 'mistral-small-latest',
                'display_name' => 'Mistral Small',
                'description' => 'Fast and cost-effective model for simple tasks',
                'is_default' => false,
                'is_free' => true,
                'is_restricted' => false,
                'input_token_limit' => 32768,
                'output_token_limit' => 4096,
                'capabilities' => [
                    'streaming' => true,
                    'vision' => false
                ],
                'display_order' => 30
            ]
        ];
        
        foreach ($models as $modelData) {
            ProviderModel::updateOrCreate(
                [
                    'provider_id' => $provider->id,
                    'model_id' => $modelData['model_id']
                ],
                $modelData
            );
        }
    }
    
    /**
     * Create Grok specific parameters
     */
    private function createGrokParameters(AIProvider $provider): void
    {
        // Create default models
        $models = [
            [
                'model_id' => 'grok-1',
                'display_name' => 'Grok-1',
                'description' => 'X.AI\'s conversational AI model',
                'is_default' => true,
                'is_free' => false,
                'is_restricted' => false,
                'input_token_limit' => 8192,
                'output_token_limit' => 4096,
                'capabilities' => [
                    'streaming' => true,
                    'vision' => false
                ],
                'display_order' => 10
            ]
        ];
        
        foreach ($models as $modelData) {
            ProviderModel::updateOrCreate(
                [
                    'provider_id' => $provider->id,
                    'model_id' => $modelData['model_id']
                ],
                $modelData
            );
        }
    }
    
    /**
     * Create HuggingFace specific parameters
     */
    private function createHuggingFaceParameters(AIProvider $provider): void
    {
        // Create default models
        $models = [
            [
                'model_id' => 'meta-llama/Llama-2-70b-chat-hf',
                'display_name' => 'Llama 2 70B Chat',
                'description' => 'Meta\'s large conversational model',
                'is_default' => true,
                'is_free' => false,
                'is_restricted' => false,
                'input_token_limit' => 4096,
                'output_token_limit' => 4096,
                'capabilities' => [
                    'streaming' => false,
                    'vision' => false
                ],
                'display_order' => 10
            ],
            [
                'model_id' => 'mistralai/Mixtral-8x7B-Instruct-v0.1',
                'display_name' => 'Mixtral 8x7B',
                'description' => 'Mistral\'s powerful mixture-of-experts model',
                'is_default' => false,
                'is_free' => false,
                'is_restricted' => false,
                'input_token_limit' => 32768,
                'output_token_limit' => 4096,
                'capabilities' => [
                    'streaming' => false,
                    'vision' => false
                ],
                'display_order' => 20
            ]
        ];
        
        foreach ($models as $modelData) {
            ProviderModel::updateOrCreate(
                [
                    'provider_id' => $provider->id,
                    'model_id' => $modelData['model_id']
                ],
                $modelData
            );
        }
    }
    
    /**
     * Create OpenRouter specific parameters
     */
    private function createOpenRouterParameters(AIProvider $provider): void
    {
        // Create default models
        $models = [
            [
                'model_id' => 'openai/gpt-4-turbo',
                'display_name' => 'OpenAI GPT-4 Turbo',
                'description' => 'GPT-4 Turbo through OpenRouter',
                'is_default' => true,
                'is_free' => false,
                'is_restricted' => false,
                'input_token_limit' => 128000,
                'output_token_limit' => 16000,
                'capabilities' => [
                    'streaming' => true,
                    'vision' => true
                ],
                'display_order' => 10
            ],
            [
                'model_id' => 'anthropic/claude-3-opus',
                'display_name' => 'Anthropic Claude 3 Opus',
                'description' => 'Claude 3 Opus through OpenRouter',
                'is_default' => false,
                'is_free' => false,
                'is_restricted' => false,
                'input_token_limit' => 200000,
                'output_token_limit' => 100000,
                'capabilities' => [
                    'streaming' => true,
                    'vision' => true
                ],
                'display_order' => 20
            ]
        ];
        
        foreach ($models as $modelData) {
            ProviderModel::updateOrCreate(
                [
                    'provider_id' => $provider->id,
                    'model_id' => $modelData['model_id']
                ],
                $modelData
            );
        }
    }
    
    /**
     * Create DeepSeek specific parameters
     */
    private function createDeepSeekParameters(AIProvider $provider): void
    {
        // Create default models
        $models = [
            [
                'model_id' => 'deepseek-chat',
                'display_name' => 'DeepSeek Chat',
                'description' => 'DeepSeek\'s conversational AI model',
                'is_default' => true,
                'is_free' => false,
                'is_restricted' => false,
                'input_token_limit' => 8192,
                'output_token_limit' => 4096,
                'capabilities' => [
                    'streaming' => true,
                    'vision' => false
                ],
                'display_order' => 10
            ],
            [
                'model_id' => 'deepseek-coder',
                'display_name' => 'DeepSeek Coder',
                'description' => 'DeepSeek\'s specialized model for code generation',
                'is_default' => false,
                'is_free' => false,
                'is_restricted' => false,
                'input_token_limit' => 8192,
                'output_token_limit' => 4096,
                'capabilities' => [
                    'streaming' => true,
                    'vision' => false
                ],
                'display_order' => 20
            ]
        ];
        
        foreach ($models as $modelData) {
            ProviderModel::updateOrCreate(
                [
                    'provider_id' => $provider->id,
                    'model_id' => $modelData['model_id']
                ],
                $modelData
            );
        }
    }
    
    /**
     * Create Cohere specific parameters
     */
    private function createCohereParameters(AIProvider $provider): void
    {
        // Create default models
        $models = [
            [
                'model_id' => 'command',
                'display_name' => 'Command',
                'description' => 'Cohere\'s flagship general model for chat and instruction following',
                'is_default' => true,
                'is_free' => false,
                'is_restricted' => false,
                'input_token_limit' => 4096,
                'output_token_limit' => 4096,
                'capabilities' => [
                    'streaming' => true,
                    'vision' => false
                ],
                'display_order' => 10
            ],
            [
                'model_id' => 'command-light',
                'display_name' => 'Command Light',
                'description' => 'Faster, more efficient version of Command for simpler tasks',
                'is_default' => false,
                'is_free' => false,
                'is_restricted' => false,
                'input_token_limit' => 4096,
                'output_token_limit' => 4096,
                'capabilities' => [
                    'streaming' => true,
                    'vision' => false
                ],
                'display_order' => 20
            ],
            [
                'model_id' => 'command-r',
                'display_name' => 'Command-R',
                'description' => 'Enhanced model with improved reasoning capabilities',
                'is_default' => false,
                'is_free' => false,
                'is_restricted' => false,
                'input_token_limit' => 4096,
                'output_token_limit' => 4096,
                'capabilities' => [
                    'streaming' => true,
                    'vision' => false
                ],
                'display_order' => 30
            ]
        ];
        
        foreach ($models as $modelData) {
            ProviderModel::updateOrCreate(
                [
                    'provider_id' => $provider->id,
                    'model_id' => $modelData['model_id']
                ],
                $modelData
            );
        }
    }
} 