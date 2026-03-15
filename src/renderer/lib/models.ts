// ─── LLM Model definitions ───────────────────────────────────────────────────
// Adapted from OpenClaw-oneclick/client/src/lib/openclaw-data.ts

export interface ModelProvider {
  id: string;
  name: string;
  requiresApiKey: boolean;
  apiKeyName: string;
  apiKeyUrl?: string;
  models: LLMModel[];
}

export interface LLMModel {
  id: string;
  name: string;
  description: string;
  descriptionEn: string;
  isLocal: boolean;
  recommended?: boolean;
  context?: string;
}

export const MODEL_PROVIDERS: ModelProvider[] = [
  {
    id: "local",
    name: "Local (Gratis)",
    requiresApiKey: false,
    apiKeyName: "",
    models: [
      {
        id: "ollama/qwen3:8b",
        name: "Qwen 3 8B",
        description: "Modelo local gratuito. Bueno para uso general, sin costo.",
        descriptionEn: "Free local model. Good for general use, no cost.",
        isLocal: true,
        recommended: true,
        context: "8K",
      },
      {
        id: "ollama/qwen3:14b",
        name: "Qwen 3 14B",
        description: "Más potente que 8B. Requiere ~10GB de RAM.",
        descriptionEn: "More powerful than 8B. Requires ~10GB RAM.",
        isLocal: true,
        context: "8K",
      },
      {
        id: "ollama/llama3.2:3b",
        name: "Llama 3.2 3B",
        description: "Modelo ultra-ligero de Meta. Ideal para hardware limitado.",
        descriptionEn: "Ultra-light model by Meta. Ideal for limited hardware.",
        isLocal: true,
        context: "8K",
      },
      {
        id: "ollama/llama3.1:8b",
        name: "Llama 3.1 8B",
        description: "Modelo de Meta. Excelente balance calidad/recursos.",
        descriptionEn: "Meta's model. Excellent quality/resource balance.",
        isLocal: true,
        context: "128K",
      },
      {
        id: "ollama/mistral:7b",
        name: "Mistral 7B",
        description: "Modelo eficiente de Mistral AI. Rápido y preciso.",
        descriptionEn: "Efficient model by Mistral AI. Fast and accurate.",
        isLocal: true,
        context: "8K",
      },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    requiresApiKey: true,
    apiKeyName: "ANTHROPIC_API_KEY",
    apiKeyUrl: "https://console.anthropic.com/",
    models: [
      {
        id: "anthropic/claude-sonnet-4-5",
        name: "Claude Sonnet 4.5",
        description: "Potente y eficiente. La mejor elección para la mayoría.",
        descriptionEn: "Powerful and efficient. The best choice for most use cases.",
        isLocal: false,
        recommended: true,
        context: "200K",
      },
      {
        id: "anthropic/claude-opus-4-6",
        name: "Claude Opus 4.6",
        description: "El modelo más inteligente de Anthropic. Para tareas complejas.",
        descriptionEn: "Anthropic's most intelligent model. For complex tasks.",
        isLocal: false,
        context: "200K",
      },
      {
        id: "anthropic/claude-haiku-4-5",
        name: "Claude Haiku 4.5",
        description: "Más rápido y económico. Ideal para respuestas simples.",
        descriptionEn: "Faster and cheaper. Ideal for simple responses.",
        isLocal: false,
        context: "200K",
      },
    ],
  },
  {
    id: "openai",
    name: "OpenAI (GPT)",
    requiresApiKey: true,
    apiKeyName: "OPENAI_API_KEY",
    apiKeyUrl: "https://platform.openai.com/api-keys",
    models: [
      {
        id: "openai/gpt-4o",
        name: "GPT-4o",
        description: "Modelo multimodal de OpenAI. Excelente rendimiento general.",
        descriptionEn: "OpenAI's multimodal model. Excellent overall performance.",
        isLocal: false,
        recommended: true,
        context: "128K",
      },
      {
        id: "openai/gpt-4o-mini",
        name: "GPT-4o Mini",
        description: "Versión compacta y económica de GPT-4o.",
        descriptionEn: "Compact and cost-effective version of GPT-4o.",
        isLocal: false,
        context: "128K",
      },
      {
        id: "openai/o3-mini",
        name: "o3-mini",
        description: "Especializado en razonamiento lógico y matemático.",
        descriptionEn: "Specialized in logical and mathematical reasoning.",
        isLocal: false,
        context: "200K",
      },
    ],
  },
  {
    id: "google",
    name: "Google (Gemini)",
    requiresApiKey: true,
    apiKeyName: "GOOGLE_API_KEY",
    apiKeyUrl: "https://aistudio.google.com/app/apikey",
    models: [
      {
        id: "google/gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        description: "Rápido y potente. Contexto de 1 millón de tokens.",
        descriptionEn: "Fast and powerful. 1 million token context.",
        isLocal: false,
        recommended: true,
        context: "1M",
      },
      {
        id: "google/gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
        description: "El modelo más potente de Google. Para tareas de alto nivel.",
        descriptionEn: "Google's most powerful model. For high-level tasks.",
        isLocal: false,
        context: "1M",
      },
    ],
  },
];

export function getProviderForModel(modelId: string): ModelProvider | undefined {
  return MODEL_PROVIDERS.find((p) => p.models.some((m) => m.id === modelId));
}

export function getModel(modelId: string): LLMModel | undefined {
  for (const provider of MODEL_PROVIDERS) {
    const model = provider.models.find((m) => m.id === modelId);
    if (model) return model;
  }
  return undefined;
}

export function getDefaultModelForSetupType(setupType: "quick" | "cloud" | "full"): string {
  if (setupType === "quick") return "ollama/qwen3:8b";
  return "anthropic/claude-sonnet-4-5";
}
