import { describe, it, expect } from "vitest";
import {
  validateAgentName,
  validateApiKey,
  validateWhatsAppNumber,
  validateTelegramToken,
  validateDiscordToken,
  validateSlackToken,
} from "@/lib/validation";

describe("validation - input validation functions", () => {
  describe("validateAgentName()", () => {
    it("should accept valid agent names", () => {
      expect(validateAgentName("Claude").valid).toBe(true);
      expect(validateAgentName("OpenClaw").valid).toBe(true);
      expect(validateAgentName("My AI Agent").valid).toBe(true);
      expect(validateAgentName("Bot-2024").valid).toBe(true);
    });

    it("should reject empty names", () => {
      const result = validateAgentName("");
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it("should reject names that are too short", () => {
      const result = validateAgentName("A");
      expect(result.valid).toBe(false);
    });

    it("should reject names that are too long", () => {
      const longName = "A".repeat(31); // Over 30 chars
      const result = validateAgentName(longName);
      expect(result.valid).toBe(false);
    });

    it("should accept Spanish characters", () => {
      expect(validateAgentName("José").valid).toBe(true);
      expect(validateAgentName("Ñiño").valid).toBe(true);
    });

    it("should trim whitespace", () => {
      expect(validateAgentName("  Claude  ").valid).toBe(true);
    });

    it("should have bilingual error messages", () => {
      const result = validateAgentName("");
      expect(result.error).toBeTruthy();
      expect(result.errorEn).toBeTruthy();
    });
  });

  describe("validateApiKey()", () => {
    it("should accept valid Anthropic API keys", () => {
      expect(
        validateApiKey("sk-ant-v0-abc123def456ghij789klmnopqrst", "anthropic").valid
      ).toBe(true);
    });

    it("should accept valid OpenAI API keys", () => {
      expect(
        validateApiKey("sk-proj-abc123def456ghij789klmnopqrst1234", "openai").valid
      ).toBe(true);
    });

    it("should accept valid Google API keys", () => {
      expect(
        validateApiKey("AIzaMyKeyAbcDefGhijklmnopqrstuvwxyz12345", "google").valid
      ).toBe(true);
    });

    it("should reject empty API keys", () => {
      expect(validateApiKey("", "anthropic").valid).toBe(false);
    });

    it("should reject invalid format for Anthropic", () => {
      expect(validateApiKey("invalid-key", "anthropic").valid).toBe(false);
    });

    it("should handle whitespace trimming", () => {
      const result = validateApiKey(
        "  sk-ant-v0-abc123def456ghij789klmnopqrst  ",
        "anthropic"
      );
      expect(result.valid).toBe(true);
    });

    it("should have bilingual error messages", () => {
      const result = validateApiKey("", "anthropic");
      expect(result.error).toBeTruthy();
      expect(result.errorEn).toBeTruthy();
    });
  });

  describe("validateWhatsAppNumber()", () => {
    it("should accept valid E.164 format numbers", () => {
      expect(validateWhatsAppNumber("+11234567890").valid).toBe(true);
      expect(validateWhatsAppNumber("+331234567890").valid).toBe(true);
      expect(validateWhatsAppNumber("+521234567890").valid).toBe(true);
    });

    it("should reject numbers without country code", () => {
      expect(validateWhatsAppNumber("5551234567").valid).toBe(false);
    });

    it("should reject empty numbers", () => {
      expect(validateWhatsAppNumber("").valid).toBe(false);
    });

    it("should reject invalid formats", () => {
      expect(validateWhatsAppNumber("invalid").valid).toBe(false);
      expect(validateWhatsAppNumber("++1234567890").valid).toBe(false);
    });

    it("should require minimum digits", () => {
      expect(validateWhatsAppNumber("+1").valid).toBe(false);
    });

    it("should trim whitespace", () => {
      expect(validateWhatsAppNumber("  +11234567890  ").valid).toBe(true);
    });

    it("should have bilingual error messages", () => {
      const result = validateWhatsAppNumber("");
      expect(result.error).toBeTruthy();
      expect(result.errorEn).toBeTruthy();
    });
  });

  describe("validateTelegramToken()", () => {
    it("should accept valid Telegram bot tokens", () => {
      expect(
        validateTelegramToken("123456789:ABCDEFGHijklmnopqrstuvwxyz-_1234567890").valid
      ).toBe(true);
    });

    it("should require colon separator", () => {
      expect(
        validateTelegramToken("123456789ABCDEFGHijklmnopqrstuvwxyz").valid
      ).toBe(false);
    });

    it("should require numeric prefix before colon", () => {
      expect(validateTelegramToken("abc:ABCDEFGHijklmnopqrstuvwxyz").valid).toBe(
        false
      );
    });

    it("should reject empty tokens", () => {
      expect(validateTelegramToken("").valid).toBe(false);
    });

    it("should trim whitespace", () => {
      expect(
        validateTelegramToken("  123456789:ABCDEFGHijklmnopqrstuvwxyz-_1234567890  ").valid
      ).toBe(true);
    });

    it("should have bilingual error messages", () => {
      const result = validateTelegramToken("");
      expect(result.error).toBeTruthy();
      expect(result.errorEn).toBeTruthy();
    });
  });

  describe("validateDiscordToken()", () => {
    it("should accept tokens of sufficient length", () => {
      // Test token with sufficient length (50+ chars)
      const validToken = "11111111111111111111111111111111111111111111111111";
      expect(validateDiscordToken(validToken).valid).toBe(true);
    });

    it("should reject empty tokens", () => {
      expect(validateDiscordToken("").valid).toBe(false);
    });

    it("should reject tokens that are too short", () => {
      expect(validateDiscordToken("short").valid).toBe(false);
    });

    it("should trim whitespace", () => {
      const validToken = "11111111111111111111111111111111111111111111111111";
      expect(validateDiscordToken(`  ${validToken}  `).valid).toBe(true);
    });

    it("should have bilingual error messages", () => {
      const result = validateDiscordToken("");
      expect(result.error).toBeTruthy();
      expect(result.errorEn).toBeTruthy();
    });
  });

  describe("validateSlackToken()", () => {
    it("should accept valid Slack bot tokens with xoxb- prefix", () => {
      // Test token with xoxb- prefix and sufficient length
      const validToken = "xoxb-1111111111111111111111111111111111111111111111";
      expect(validateSlackToken(validToken).valid).toBe(true);
    });

    it("should require xoxb- prefix", () => {
      // Test token with wrong prefix (xoxp-)
      const invalidToken = "xoxp-1111111111111111111111111111111111111111111111";
      expect(validateSlackToken(invalidToken).valid).toBe(false);
    });

    it("should reject empty tokens", () => {
      expect(validateSlackToken("").valid).toBe(false);
    });

    it("should trim whitespace", () => {
      const validToken = "xoxb-1111111111111111111111111111111111111111111111";
      expect(
        validateSlackToken(`  ${validToken}  `).valid
      ).toBe(true);
    });

    it("should have bilingual error messages", () => {
      const result = validateSlackToken("");
      expect(result.error).toBeTruthy();
      expect(result.errorEn).toBeTruthy();
    });
  });

  describe("error message completeness", () => {
    it("all validators should provide both Spanish and English errors", () => {
      const validators = [
        { fn: validateAgentName, args: [""] },
        { fn: validateApiKey, args: ["", "anthropic"] },
        { fn: validateWhatsAppNumber, args: [""] },
        { fn: validateTelegramToken, args: [""] },
        { fn: validateDiscordToken, args: [""] },
        { fn: validateSlackToken, args: [""] },
      ];

      validators.forEach(({ fn, args }) => {
        const result = (fn as any)(...args);
        if (!result.valid) {
          expect(result.error).toBeTruthy(`${fn.name} missing Spanish error`);
          expect(result.errorEn).toBeTruthy(
            `${fn.name} missing English error`
          );
        }
      });
    });
  });
});
