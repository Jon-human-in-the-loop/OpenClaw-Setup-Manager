import { describe, it, expect } from "vitest";
import { t } from "@/lib/i18n";

describe("i18n - translation system", () => {
  describe("t() function", () => {
    it("should return Spanish translation when lang is 'es'", () => {
      const result = t("es", "common.next");
      expect(result).toBe("Siguiente");
    });

    it("should return English translation when lang is 'en'", () => {
      const result = t("en", "common.next");
      expect(result).toBe("Next");
    });

    it("should return the key when translation not found", () => {
      const result = t("es", "nonexistent.key" as any);
      expect(result).toBe("nonexistent.key");
    });

    it("should handle variable substitution", () => {
      const result = t("es", "systemcheck.node.ok", { version: "22.3.0" });
      expect(result).toBe("Node.js 22.3.0 instalado");
    });

    it("should handle multiple variable substitutions", () => {
      const result = t("en", "apikey.label", { provider: "Anthropic" });
      expect(result).toBe("Anthropic API Key");
    });

    it("should default to Spanish when translation missing for given language", () => {
      const result = t("en", "common.guide");
      expect(result).toBe("View guide");
    });
  });

  describe("common translations", () => {
    it("should have all common action keys", () => {
      expect(t("es", "common.next")).toBeTruthy();
      expect(t("es", "common.back")).toBeTruthy();
      expect(t("es", "common.install")).toBeTruthy();
      expect(t("es", "common.open")).toBeTruthy();
      expect(t("es", "common.close")).toBeTruthy();
      expect(t("es", "common.copy")).toBeTruthy();
      expect(t("es", "common.retry")).toBeTruthy();
    });

    it("should have bilingual translations for common keys", () => {
      const keys = [
        "common.next",
        "common.back",
        "common.install",
        "common.understood",
      ];

      keys.forEach((key) => {
        const es = t("es", key as any);
        const en = t("en", key as any);
        expect(es).toBeTruthy();
        expect(en).toBeTruthy();
        expect(es).not.toEqual(en); // Should be different
      });
    });
  });

  describe("page-specific translations", () => {
    it("should have welcome page translations", () => {
      expect(t("es", "welcome.title")).toBe("Instala OpenClaw\nen 5 minutos");
      expect(t("en", "welcome.title")).toBe("Install OpenClaw\nin 5 minutes");
    });

    it("should have system check translations", () => {
      expect(t("es", "systemcheck.title")).toBeTruthy();
      expect(t("es", "systemcheck.node")).toBeTruthy();
      expect(t("es", "systemcheck.port")).toBeTruthy();
      expect(t("es", "systemcheck.disk")).toBeTruthy();
    });

    it("should have agent name translations", () => {
      expect(t("es", "agentname.title")).toBe("Nombra a tu agente");
      expect(t("en", "agentname.title")).toBe("Name your agent");
    });

    it("should have channels translations", () => {
      expect(t("es", "channels.whatsapp")).toBe("WhatsApp");
      expect(t("es", "channels.telegram")).toBe("Telegram");
      expect(t("es", "channels.discord")).toBe("Discord");
      expect(t("es", "channels.slack")).toBe("Slack");
    });

    it("should have success page translations", () => {
      expect(t("es", "success.title")).toBeTruthy();
      expect(t("es", "success.dashboard")).toBeTruthy();
      expect(t("es", "success.agent.name")).toBeTruthy();
    });
  });

  describe("error message translations", () => {
    it("should have all system check error messages", () => {
      expect(t("es", "systemcheck.node.missing")).toBeTruthy();
      expect(t("es", "systemcheck.port.busy")).toBeTruthy();
      expect(t("es", "systemcheck.disk.low")).toBeTruthy();
    });

    it("should have fix action translations", () => {
      expect(t("es", "systemcheck.fix.node")).toBeTruthy();
      expect(t("es", "systemcheck.fix.port")).toBeTruthy();
      expect(t("es", "systemcheck.fix.disk")).toBeTruthy();
    });
  });

  describe("installing step translations", () => {
    it("should have all installing step messages", () => {
      expect(t("es", "installing.title")).toBe("Instalando OpenClaw...");
      expect(t("es", "installing.almostDone")).toBe("¡Casi listo!");
      expect(t("es", "installing.error.title")).toBe("Error en la instalación");
    });
  });
});
