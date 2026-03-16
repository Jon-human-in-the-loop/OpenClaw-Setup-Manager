import { ReactElement } from "react";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import { LanguageProvider } from "@/context/LanguageContext";
import { InstallationProvider } from "@/context/InstallationContext";

/**
 * Custom render function that includes necessary providers
 */
function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
): RenderResult {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <LanguageProvider>
        <InstallationProvider>{children}</InstallationProvider>
      </LanguageProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

export * from "@testing-library/react";
export { renderWithProviders as render };
