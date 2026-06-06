export interface AiModel {
  id: string;
  name: string;
  provider: string;
  description: string;
}

// Curated list of OpenRouter models suitable for sales/research tasks
export const AI_MODELS: AiModel[] = [
  // Anthropic
  { id: "anthropic/claude-3.5-haiku", name: "Claude 3.5 Haiku", provider: "Anthropic", description: "Fast & cost-efficient — great for email drafting" },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic", description: "Balanced quality & speed" },
  { id: "anthropic/claude-opus-4", name: "Claude Opus 4", provider: "Anthropic", description: "Most capable — best for deep research" },
  // OpenAI
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", description: "Fast & affordable" },
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI", description: "High quality, multimodal" },
  // Google
  { id: "google/gemini-flash-1.5", name: "Gemini 1.5 Flash", provider: "Google", description: "Very fast, large context" },
  { id: "google/gemini-pro-1.5", name: "Gemini 1.5 Pro", provider: "Google", description: "Advanced reasoning" },
  // Meta (free tier available)
  { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", provider: "Meta", description: "Open-source, high quality" },
  { id: "meta-llama/llama-3.1-8b-instruct:free", name: "Llama 3.1 8B (Free)", provider: "Meta", description: "Free tier, fast" },
];

export const DEFAULT_EMAIL_MODEL = "anthropic/claude-3.5-haiku";
export const DEFAULT_RESEARCH_MODEL = "anthropic/claude-3.5-sonnet";
