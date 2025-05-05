
// List of supported AI providers
export const providers = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "gemini", label: "Google Gemini" },
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
        { value: "claude-3-opus", label: "Claude 3 Opus" },
        { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
        { value: "claude-3-haiku", label: "Claude 3 Haiku" }
      ];
    case "gemini":
      return [
        { value: "gemini-pro", label: "Gemini Pro" },
        { value: "gemini-ultra", label: "Gemini Ultra" }
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
