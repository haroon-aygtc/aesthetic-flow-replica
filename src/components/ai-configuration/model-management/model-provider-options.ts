// List of supported AI providers
export const providers = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "gemini", label: "Google Gemini" },
  { value: "grok", label: "Grok AI" },
  { value: "huggingface", label: "Hugging Face" },
  { value: "openrouter", label: "OpenRouter" },
  { value: "mistral", label: "Mistral AI" },
  { value: "deepseek", label: "DeepSeek" },
  { value: "cohere", label: "Cohere" },
  { value: "custom", label: "Custom Provider" }
];

// Helper function to get model options based on provider
export const getModelOptions = (provider: string) => {
  switch (provider) {
    case "openai":
      return [
        { value: "gpt-4o", label: "GPT-4o" },
        { value: "gpt-4o-mini", label: "GPT-4o Mini" },
        { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" }
      ];
    case "anthropic":
      return [
        { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
        { value: "claude-3-sonnet-20240229", label: "Claude 3 Sonnet" },
        { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku" }
      ];
    case "gemini":
      return [
        { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
        { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
        { value: "gemini-1.0-pro", label: "Gemini 1.0 Pro" }
      ];
    case "grok":
      return [
        { value: "grok-1", label: "Grok-1" }
      ];
    case "huggingface":
      return [
        // Free models - widely accessible
        { value: "google/flan-t5-small", label: "Flan-T5 Small (Free)" },
        { value: "facebook/bart-large-cnn", label: "BART CNN (Free)" },
        { value: "gpt2", label: "GPT-2 (Free)" },
        { value: "EleutherAI/gpt-neo-125m", label: "GPT-Neo 125M (Free)" },
        { value: "EleutherAI/gpt-neo-1.3B", label: "GPT-Neo 1.3B (Free)" },
        { value: "bigscience/bloom-560m", label: "BLOOM 560M (Free)" },
        { value: "t5-small", label: "T5 Small (Free)" },
        { value: "distilbert-base-uncased", label: "DistilBERT Base (Free)" },
        { value: "sentence-transformers/all-MiniLM-L6-v2", label: "MiniLM L6 v2 (Free)" },
        
        // Models requiring access approval
        // Meta Llama models
        { value: "meta-llama/Llama-3-70b-chat-hf", label: "Llama 3 70B (Restricted)" },
        { value: "meta-llama/Llama-3-8b-chat-hf", label: "Llama 3 8B (Restricted)" },
        { value: "meta-llama/Llama-2-70b-chat-hf", label: "Llama 2 70B (Restricted)" },
        { value: "meta-llama/Llama-2-13b-chat-hf", label: "Llama 2 13B (Restricted)" },
        
        // Mistral models
        { value: "mistralai/Mixtral-8x7B-Instruct-v0.1", label: "Mixtral 8x7B (Restricted)" },
        { value: "mistralai/Mistral-7B-Instruct-v0.2", label: "Mistral 7B v0.2 (Restricted)" },
        
        // Gemma models
        { value: "google/gemma-7b-it", label: "Gemma 7B-IT (Restricted)" },
        { value: "google/gemma-2b-it", label: "Gemma 2B-IT (Restricted)" },
        
        // Other restricted models
        { value: "tiiuae/falcon-7b-instruct", label: "Falcon 7B (Restricted)" },
        { value: "bigscience/bloomz-7b1", label: "BLOOMZ 7B (Restricted)" },
        { value: "microsoft/phi-2", label: "Phi-2 (Restricted)" },
        { value: "Salesforce/codegen25-7b-instruct", label: "CodeGen 2.5 7B (Restricted)" }
      ];
    case "openrouter":
      return [
        { value: "openai/gpt-4o", label: "GPT-4o (OpenAI)" },
        { value: "anthropic/claude-3-opus", label: "Claude 3 Opus (Anthropic)" },
        { value: "meta-llama/llama-3-70b-instruct", label: "Llama 3 70B (Meta)" }
      ];
    case "mistral":
      return [
        { value: "mistral-large-latest", label: "Mistral Large" },
        { value: "mistral-medium-latest", label: "Mistral Medium" },
        { value: "mistral-small-latest", label: "Mistral Small" }
      ];
    case "deepseek":
      return [
        { value: "deepseek-chat", label: "DeepSeek Chat" },
        { value: "deepseek-coder", label: "DeepSeek Coder" }
      ];
    case "cohere":
      return [
        { value: "command", label: "Command" },
        { value: "command-light", label: "Command Light" },
        { value: "command-r", label: "Command R" }
      ];
    default:
      return [];
  }
};
