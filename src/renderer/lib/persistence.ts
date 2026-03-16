// ─── Installation State Persistence ───────────────────────────────────────

const PERSISTENCE_KEY = "openclaw_installer_state";

export interface PersistedInstallationState {
  step: string;
  stepIndex: number;
  deploymentType: string;
  setupType: string;
  agentName: string;
  agentEmoji: string;
  primaryModel: string;
  fallbackModel?: string;
  apiKey: string;
  channels: string[];
  phoneNumber: string;
  telegramToken: string;
  discordToken: string;
  slackToken: string;
  gatewayToken: string;
  gatewayAuthEnabled: boolean;
}

/**
 * Save installation state to localStorage
 */
export function saveInstallationState(state: PersistedInstallationState): void {
  try {
    localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save installation state:", error);
  }
}

/**
 * Load installation state from localStorage
 */
export function loadInstallationState(): PersistedInstallationState | null {
  try {
    const saved = localStorage.getItem(PERSISTENCE_KEY);
    if (!saved) return null;
    return JSON.parse(saved) as PersistedInstallationState;
  } catch (error) {
    console.error("Failed to load installation state:", error);
    return null;
  }
}

/**
 * Clear installation state from localStorage (call on success or when starting fresh)
 */
export function clearInstallationState(): void {
  try {
    localStorage.removeItem(PERSISTENCE_KEY);
  } catch (error) {
    console.error("Failed to clear installation state:", error);
  }
}
