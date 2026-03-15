import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { SetupType, InstallConfig } from "../../types";
import { getDefaultModelForSetupType } from "../lib/models";

export type WizardStep =
  | "welcome"
  | "system-check"
  | "setup-type"
  | "agent-name"
  | "model"
  | "api-key"
  | "channels"
  | "credentials"
  | "installing"
  | "success";

export const WIZARD_STEPS: WizardStep[] = [
  "welcome",
  "system-check",
  "setup-type",
  "agent-name",
  "model",
  "api-key",
  "channels",
  "credentials",
  "installing",
  "success",
];

interface InstallationState {
  step: WizardStep;
  stepIndex: number;
  setupType: SetupType;
  agentName: string;
  agentEmoji: string;
  primaryModel: string;
  fallbackModel?: string;
  apiKey: string;
  channels: Set<string>;
  phoneNumber: string;
  telegramToken: string;
  discordToken: string;
  slackToken: string;
  isInstalling: boolean;
  installPercent: number;
  installMessage: string;
  installLog: string[];
  installSuccess: boolean | null;
  dashboardUrl: string;
  errorMessage: string;
}

interface InstallationContextValue extends InstallationState {
  goNext: () => void;
  goPrev: () => void;
  goTo: (step: WizardStep) => void;
  setSetupType: (type: SetupType) => void;
  setAgentName: (name: string) => void;
  setAgentEmoji: (emoji: string) => void;
  setPrimaryModel: (model: string) => void;
  setFallbackModel: (model: string | undefined) => void;
  setApiKey: (key: string) => void;
  toggleChannel: (channelId: string) => void;
  setPhoneNumber: (v: string) => void;
  setTelegramToken: (v: string) => void;
  setDiscordToken: (v: string) => void;
  setSlackToken: (v: string) => void;
  setInstallProgress: (percent: number, message: string, log?: string) => void;
  setInstallComplete: (success: boolean, message: string, dashboardUrl?: string) => void;
  buildConfig: (language: "es" | "en") => InstallConfig;
  needsApiKey: boolean;
  needsCredentials: boolean;
}

const InstallationContext = createContext<InstallationContextValue | null>(null);

export function InstallationProvider({ children }: { children: ReactNode }): JSX.Element {
  const [state, setState] = useState<InstallationState>({
    step: "welcome",
    stepIndex: 0,
    setupType: "cloud",
    agentName: "Clawd",
    agentEmoji: "🦞",
    primaryModel: "anthropic/claude-sonnet-4-5",
    fallbackModel: undefined,
    apiKey: "",
    channels: new Set(["whatsapp"]),
    phoneNumber: "",
    telegramToken: "",
    discordToken: "",
    slackToken: "",
    isInstalling: false,
    installPercent: 0,
    installMessage: "",
    installLog: [],
    installSuccess: null,
    dashboardUrl: "",
    errorMessage: "",
  });

  const computeNextStep = useCallback((current: WizardStep, st: InstallationState): WizardStep => {
    const idx = WIZARD_STEPS.indexOf(current);

    // Skip api-key if local model or quick setup
    if (current === "model") {
      const isLocal = st.primaryModel.startsWith("ollama/");
      if (isLocal || st.setupType === "quick") return "channels";
    }

    // Skip credentials if no channels with tokens
    if (current === "channels") {
      const hasChannels = st.channels.size > 0 && !st.channels.has("none");
      if (!hasChannels) return "installing";
    }

    return WIZARD_STEPS[idx + 1] ?? current;
  }, []);

  const computePrevStep = useCallback((current: WizardStep, st: InstallationState): WizardStep => {
    const idx = WIZARD_STEPS.indexOf(current);

    // Skip api-key if going back from channels
    if (current === "channels") {
      const isLocal = st.primaryModel.startsWith("ollama/");
      if (isLocal || st.setupType === "quick") return "model";
    }

    // Skip credentials going back from installing
    if (current === "installing") {
      const hasChannels = st.channels.size > 0 && !st.channels.has("none");
      if (!hasChannels) return "channels";
    }

    return WIZARD_STEPS[idx - 1] ?? current;
  }, []);

  const goNext = useCallback(() => {
    setState((prev) => {
      const next = computeNextStep(prev.step, prev);
      return { ...prev, step: next, stepIndex: WIZARD_STEPS.indexOf(next) };
    });
  }, [computeNextStep]);

  const goPrev = useCallback(() => {
    setState((prev) => {
      const prev2 = computePrevStep(prev.step, prev);
      return { ...prev, step: prev2, stepIndex: WIZARD_STEPS.indexOf(prev2) };
    });
  }, [computePrevStep]);

  const goTo = useCallback((step: WizardStep) => {
    setState((prev) => ({
      ...prev,
      step,
      stepIndex: WIZARD_STEPS.indexOf(step),
    }));
  }, []);

  const setSetupType = useCallback((type: SetupType) => {
    setState((prev) => ({
      ...prev,
      setupType: type,
      primaryModel: getDefaultModelForSetupType(type),
      apiKey: type === "quick" ? "" : prev.apiKey,
    }));
  }, []);

  const setAgentName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, agentName: name }));
  }, []);

  const setAgentEmoji = useCallback((emoji: string) => {
    setState((prev) => ({ ...prev, agentEmoji: emoji }));
  }, []);

  const setPrimaryModel = useCallback((model: string) => {
    setState((prev) => ({ ...prev, primaryModel: model }));
  }, []);

  const setFallbackModel = useCallback((model: string | undefined) => {
    setState((prev) => ({ ...prev, fallbackModel: model }));
  }, []);

  const setApiKey = useCallback((key: string) => {
    setState((prev) => ({ ...prev, apiKey: key }));
  }, []);

  const toggleChannel = useCallback((channelId: string) => {
    setState((prev) => {
      const next = new Set(prev.channels);
      if (next.has(channelId)) {
        next.delete(channelId);
      } else {
        next.add(channelId);
        next.delete("none");
      }
      if (channelId === "none") {
        next.clear();
        next.add("none");
      }
      return { ...prev, channels: next };
    });
  }, []);

  const setPhoneNumber = useCallback((v: string) => setState((p) => ({ ...p, phoneNumber: v })), []);
  const setTelegramToken = useCallback((v: string) => setState((p) => ({ ...p, telegramToken: v })), []);
  const setDiscordToken = useCallback((v: string) => setState((p) => ({ ...p, discordToken: v })), []);
  const setSlackToken = useCallback((v: string) => setState((p) => ({ ...p, slackToken: v })), []);

  const setInstallProgress = useCallback((percent: number, message: string, log?: string) => {
    setState((prev) => ({
      ...prev,
      isInstalling: true,
      installPercent: percent,
      installMessage: message,
      installLog: log ? [...prev.installLog, log] : prev.installLog,
    }));
  }, []);

  const setInstallComplete = useCallback((success: boolean, message: string, dashboardUrl?: string) => {
    setState((prev) => ({
      ...prev,
      isInstalling: false,
      installSuccess: success,
      installPercent: success ? 100 : prev.installPercent,
      dashboardUrl: dashboardUrl ?? prev.dashboardUrl,
      errorMessage: success ? "" : message,
    }));
  }, []);

  const buildConfig = useCallback((language: "es" | "en"): InstallConfig => ({
    setupType: state.setupType,
    language,
    agentName: state.agentName,
    primaryModel: state.primaryModel,
    fallbackModel: state.fallbackModel,
    apiKey: state.apiKey || undefined,
    channels: Array.from(state.channels).filter((c) => c !== "none"),
    phoneNumber: state.phoneNumber || undefined,
    telegramToken: state.telegramToken || undefined,
    discordToken: state.discordToken || undefined,
    slackToken: state.slackToken || undefined,
  }), [state]);

  const needsApiKey = !state.primaryModel.startsWith("ollama/") && state.setupType !== "quick";

  const needsCredentials =
    state.channels.size > 0 &&
    !state.channels.has("none") &&
    (state.channels.has("whatsapp") ||
      state.channels.has("telegram") ||
      state.channels.has("discord") ||
      state.channels.has("slack"));

  return (
    <InstallationContext.Provider
      value={{
        ...state,
        goNext,
        goPrev,
        goTo,
        setSetupType,
        setAgentName,
        setAgentEmoji,
        setPrimaryModel,
        setFallbackModel,
        setApiKey,
        toggleChannel,
        setPhoneNumber,
        setTelegramToken,
        setDiscordToken,
        setSlackToken,
        setInstallProgress,
        setInstallComplete,
        buildConfig,
        needsApiKey,
        needsCredentials,
      }}
    >
      {children}
    </InstallationContext.Provider>
  );
}

export function useInstallation(): InstallationContextValue {
  const ctx = useContext(InstallationContext);
  if (!ctx) throw new Error("useInstallation must be used within InstallationProvider");
  return ctx;
}
