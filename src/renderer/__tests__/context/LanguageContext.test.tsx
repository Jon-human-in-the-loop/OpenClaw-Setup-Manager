import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";

// Test component that uses the hook
function TestComponent() {
  const { language, setLanguage } = useLanguage();

  return (
    <div>
      <div data-testid="current-language">{language}</div>
      <button
        data-testid="toggle-button"
        onClick={() => setLanguage(language === "es" ? "en" : "es")}
      >
        Toggle
      </button>
    </div>
  );
}

describe("LanguageContext", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("LanguageProvider", () => {
    it("should provide language context", () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      const langElement = screen.getByTestId("current-language");
      expect(langElement).toBeInTheDocument();
    });

    it("should detect system language on mount", () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      const langElement = screen.getByTestId("current-language");
      // Should be either "es" or "en" based on system
      expect(["es", "en"]).toContain(langElement.textContent);
    });

    it("should default to 'es' if system language is not supported", () => {
      // Mock navigator.language to unsupported value
      Object.defineProperty(navigator, "language", {
        value: "fr",
        configurable: true,
      });

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      const langElement = screen.getByTestId("current-language");
      expect(langElement.textContent).toBe("es");
    });
  });

  describe("useLanguage hook", () => {
    it("should allow changing language", async () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      const toggleButton = screen.getByTestId("toggle-button");
      const langElement = screen.getByTestId("current-language");

      const initialLanguage = langElement.textContent;

      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(langElement.textContent).not.toBe(initialLanguage);
      });
    });

    it("should toggle between es and en", async () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      const toggleButton = screen.getByTestId("toggle-button");
      const langElement = screen.getByTestId("current-language");

      const initial = langElement.textContent;
      fireEvent.click(toggleButton);

      await waitFor(() => {
        const afterToggle = langElement.textContent;
        expect(afterToggle).not.toBe(initial);
        fireEvent.click(toggleButton);
      });

      await waitFor(() => {
        expect(langElement.textContent).toBe(initial);
      });
    });

    it("should persist language to localStorage", async () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      const toggleButton = screen.getByTestId("toggle-button");

      fireEvent.click(toggleButton);

      await waitFor(() => {
        const stored = localStorage.getItem("app-language");
        expect(stored).toBeTruthy();
        expect(["es", "en"]).toContain(stored);
      });
    });

    it("should restore language from localStorage on mount", () => {
      localStorage.setItem("app-language", "en");

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      const langElement = screen.getByTestId("current-language");
      expect(langElement.textContent).toBe("en");
    });

    it("should throw error when used outside provider", () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe("language persistence", () => {
    it("should update localStorage when language changes", async () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      const toggleButton = screen.getByTestId("toggle-button");

      fireEvent.click(toggleButton);

      await waitFor(() => {
        const stored = localStorage.getItem("app-language");
        const displayed = screen.getByTestId("current-language").textContent;
        expect(stored).toBe(displayed);
      });
    });

    it("should support manual language setting", async () => {
      function ManualSetComponent() {
        const { language, setLanguage } = useLanguage();

        return (
          <div>
            <div data-testid="language">{language}</div>
            <button
              data-testid="set-es"
              onClick={() => setLanguage("es")}
            >
              Set Spanish
            </button>
            <button
              data-testid="set-en"
              onClick={() => setLanguage("en")}
            >
              Set English
            </button>
          </div>
        );
      }

      render(
        <LanguageProvider>
          <ManualSetComponent />
        </LanguageProvider>
      );

      const langElement = screen.getByTestId("language");
      const setEnButton = screen.getByTestId("set-en");

      fireEvent.click(setEnButton);

      await waitFor(() => {
        expect(langElement.textContent).toBe("en");
      });
    });
  });
});
