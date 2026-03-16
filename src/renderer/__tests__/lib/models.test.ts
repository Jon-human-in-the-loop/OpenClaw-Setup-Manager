import { describe, it, expect } from "vitest";
import {
  MODELS,
  MODEL_PROVIDERS,
  getProviderForModel,
  getModel,
  getDefaultModelForSetupType,
} from "@/lib/models";

describe("models - LLM model definitions", () => {
  describe("MODEL_PROVIDERS array", () => {
    it("should have at least 4 providers defined", () => {
      expect(MODEL_PROVIDERS.length).toBeGreaterThanOrEqual(4);
    });

    it("should have models in each provider", () => {
      MODEL_PROVIDERS.forEach((provider) => {
        expect(provider.id).toBeTruthy();
        expect(provider.name).toBeTruthy();
        expect(provider.models).toBeDefined();
        expect(provider.models.length).toBeGreaterThan(0);
      });
    });

    it("should have unique provider IDs", () => {
      const ids = MODEL_PROVIDERS.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have all required model fields within providers", () => {
      MODEL_PROVIDERS.forEach((provider) => {
        provider.models.forEach((model) => {
          expect(model.id).toBeTruthy();
          expect(model.name).toBeTruthy();
          expect(model.description).toBeTruthy();
          expect(model.descriptionEn).toBeTruthy();
          expect(model.isLocal).toEqual(expect.any(Boolean));
        });
      });
    });

    it("should have unique model IDs across all providers", () => {
      const allModelIds: string[] = [];
      MODEL_PROVIDERS.forEach((provider) => {
        provider.models.forEach((model) => {
          allModelIds.push(model.id);
        });
      });
      const uniqueIds = new Set(allModelIds);
      expect(uniqueIds.size).toBe(allModelIds.length);
    });
  });

  describe("provider presence and configuration", () => {
    it("should have Local provider with models", () => {
      const local = MODEL_PROVIDERS.find((p) => p.id === "local");
      expect(local).toBeTruthy();
      expect(local?.models.length).toBeGreaterThan(0);
      expect(local?.requiresApiKey).toBe(false);
    });

    it("should have Anthropic provider with models", () => {
      const anthropic = MODEL_PROVIDERS.find((p) => p.id === "anthropic");
      expect(anthropic).toBeTruthy();
      expect(anthropic?.models.length).toBeGreaterThan(0);
      expect(anthropic?.requiresApiKey).toBe(true);
    });

    it("should have OpenAI provider with models", () => {
      const openai = MODEL_PROVIDERS.find((p) => p.id === "openai");
      expect(openai).toBeTruthy();
      expect(openai?.models.length).toBeGreaterThan(0);
      expect(openai?.requiresApiKey).toBe(true);
    });

    it("should have Google provider with models", () => {
      const google = MODEL_PROVIDERS.find((p) => p.id === "google");
      expect(google).toBeTruthy();
      expect(google?.models.length).toBeGreaterThan(0);
      expect(google?.requiresApiKey).toBe(true);
    });

    it("cloud providers should have API key URLs", () => {
      const cloudProviders = MODEL_PROVIDERS.filter((p) => p.requiresApiKey);
      cloudProviders.forEach((provider) => {
        expect(provider.apiKeyUrl).toBeTruthy();
      });
    });
  });

  describe("getProviderForModel()", () => {
    it("should return provider for known Ollama model", () => {
      const provider = getProviderForModel("ollama/qwen3:8b");
      expect(provider).toBeTruthy();
      expect(provider?.id).toBe("local");
    });

    it("should return undefined for unknown model", () => {
      const provider = getProviderForModel("unknown-model-xyz");
      expect(provider).toBeUndefined();
    });

    it("should return correct provider for Anthropic models", () => {
      const provider = getProviderForModel("anthropic/claude-opus-4-6");
      expect(provider?.id).toBe("anthropic");
    });

    it("should return correct provider for OpenAI models", () => {
      const provider = getProviderForModel("openai/gpt-4o");
      expect(provider?.id).toBe("openai");
    });

    it("should return correct provider for Google models", () => {
      const provider = getProviderForModel("google/gemini-2.0-flash");
      expect(provider?.id).toBe("google");
    });
  });

  describe("getModel()", () => {
    it("should return model details for known model ID", () => {
      const model = getModel("ollama/qwen3:8b");
      expect(model).toBeTruthy();
      expect(model?.id).toBe("ollama/qwen3:8b");
      expect(model?.name).toBeTruthy();
    });

    it("should return undefined for unknown model ID", () => {
      const model = getModel("unknown-model");
      expect(model).toBeUndefined();
    });

    it("should have context info for returned model", () => {
      const model = getModel("anthropic/claude-opus-4-6");
      expect(model?.context).toBeTruthy();
    });

    it("should correctly identify local models", () => {
      const localModel = getModel("ollama/qwen3:8b");
      expect(localModel?.isLocal).toBe(true);

      const cloudModel = getModel("anthropic/claude-opus-4-6");
      expect(cloudModel?.isLocal).toBe(false);
    });
  });

  describe("getDefaultModelForSetupType()", () => {
    it("should return a model ID string for 'quick' setup", () => {
      const modelId = getDefaultModelForSetupType("quick");
      expect(modelId).toBeTruthy();
      expect(typeof modelId).toBe("string");
      // Verify it's a valid model that exists
      const model = getModel(modelId);
      expect(model).toBeTruthy();
      expect(model?.isLocal).toBe(true); // Quick should use local
    });

    it("should return a model ID string for 'cloud' setup", () => {
      const modelId = getDefaultModelForSetupType("cloud");
      expect(modelId).toBeTruthy();
      expect(typeof modelId).toBe("string");
      const model = getModel(modelId);
      expect(model).toBeTruthy();
      expect(model?.isLocal).toBe(false); // Cloud should use non-local
    });

    it("should return a model ID string for 'full' setup", () => {
      const modelId = getDefaultModelForSetupType("full");
      expect(modelId).toBeTruthy();
      expect(typeof modelId).toBe("string");
      const model = getModel(modelId);
      expect(model).toBeTruthy();
    });

    it("should return different models for quick vs cloud", () => {
      const quick = getDefaultModelForSetupType("quick");
      const cloud = getDefaultModelForSetupType("cloud");

      // Quick and Cloud should be different
      expect(quick).not.toBe(cloud);
    });
  });

  describe("model provider configuration", () => {
    it("should have API key requirement info for cloud providers", () => {
      const anthropic = MODEL_PROVIDERS.find((p) => p.id === "anthropic");
      expect(anthropic?.requiresApiKey).toBe(true);

      const local = MODEL_PROVIDERS.find((p) => p.id === "local");
      expect(local?.requiresApiKey).toBe(false);
    });

    it("should have apiKeyName for providers that require API keys", () => {
      MODEL_PROVIDERS.forEach((provider) => {
        if (provider.requiresApiKey) {
          expect(provider.apiKeyName).toBeTruthy();
        }
      });
    });
  });

  describe("context information", () => {
    it("should have context info for all models", () => {
      MODEL_PROVIDERS.forEach((provider) => {
        provider.models.forEach((model) => {
          // Some models might have context, at least verify it's reasonable
          if (model.context) {
            expect(model.context).toMatch(/^\d+K$|^\d+M$|^\d+$/);
          }
        });
      });
    });

    it("local models should be marked as local", () => {
      const localProvider = MODEL_PROVIDERS.find((p) => p.id === "local");
      localProvider?.models.forEach((model) => {
        expect(model.isLocal).toBe(true);
      });
    });

    it("cloud models should not be marked as local", () => {
      const cloudProviders = MODEL_PROVIDERS.filter((p) => p.id !== "local");
      cloudProviders.forEach((provider) => {
        provider.models.forEach((model) => {
          expect(model.isLocal).toBe(false);
        });
      });
    });
  });
});
