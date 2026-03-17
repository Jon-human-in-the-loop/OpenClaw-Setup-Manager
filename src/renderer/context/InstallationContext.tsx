import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { SetupType, InstallConfig, DeploymentType, PlatformCapabilities, SecurityConfig } from "../../types";
import { getDefaultModelForSetupType } from "../lib/models";
import { generateGatewayToken } from "../lib/security";
import { saveInstallationState, loadInstallationState, clearInstallationState } from "../lib/persistence";

export type WizardStep =
  | "welcome"
  | "system-check"
  | "deployment"       // NUEVO: selección de entorno (local / Docker / WSL2)
  | "security"         // NUEVO: token de gateway + advertencias
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
  "deployment",
  "security",
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

  // Plataforma (cargada tras system-check)
  platformCapabilities: PlatformCapabilities | null;

  // Despliegue
  deploymentType: DeploymentType;

  // Seguridad
  gatewayToken: string;
  gatewayAuthEnabled: boolean;

  // Setup
  setupType: SetupType;
  agentName: string;
  agentEmoji: string;
  primaryModel: string;
  fallbackModel?: string;
  apiKey: string;

  // Canales
  channels: Set<string>;
  phoneNumber: string;
  telegramToken: string;
  discordToken: string;
  slackToken: string;

  // Estado de instalación
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

  // Plataforma
  setPlatformCapabilities: (caps: PlatformCapabilities) => void;

  // Despliegue
  setDeploymentType: (type: DeploymentType) => void;

  // Seguridad
  setGatewayToken: (token: string) => void;
  setGatewayAuthEnabled: (enabled: boolean) => void;
  regenerateToken: () => void;

  // Setup
  setSetupType: (type: SetupType) => void;
  setAgentName: (name: string) => void;
  setAgentEmoji: (emoji: string) => void;
  setPrimaryModel: (model: string) => void;
  setFallbackModel: (model: string | undefined) => void;
  setApiKey: (key: string) => void;

  // Canales
  toggleChannel: (channelId: string) => void;
  setPhoneNumber: (v: string) => void;
  setTelegramToken: (v: string) => void;
  setDiscordToken: (v: string) => void;
  setSlackToken: (v: string) => void;

  // Instalación
  setInstallProgress: (percent: number, message: string, log?: string) => void;
  setInstallComplete: (success: boolean, message: string, dashboardUrl?: string) => void;
  buildConfig: (language: "es" | "en") => InstallConfig;

  // Computed
  needsApiKey: boolean;
  needsCredentials: boolean;
  isDockerDeployment: boolean;
}

const InstallationContext = createContext<InstallationContextValue | null>(null);

function getInitialState(): InstallationState {
  const defaultState: InstallationState = {
    step: "welcome",
    stepIndex: 0,

    platformCapabilities: null,
    deploymentType: "local",

    gatewayToken: generateGatewayToken(),
    gatewayAuthEnabled: true,

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
  };

  const savedState = loadInstallationState();
  if (!savedState) return defaultState;

  return {
    ...defaultState,
    step: (savedState.step as WizardStep) || "welcome",
    stepIndex: savedState.stepIndex || 0,
    deploymentType: (savedState.deploymentType as DeploymentType) || "local",
    setupType: (savedState.setupType as SetupType) || "cloud",
    agentName: savedState.agentName || "Clawd",
    agentEmoji: savedState.agentEmoji || "🦞",
    primaryModel: savedState.primaryModel || "anthropic/claude-sonnet-4-5",
    fallbackModel: savedState.fallbackModel,
    apiKey: savedState.apiKey || "",
    channels: new Set(savedState.channels || ["whatsapp"]),
    phoneNumber: savedState.phoneNumber || "",
    telegramToken: savedState.telegramToken || "",
    discordToken: savedState.discordToken || "",
    slackToken: savedState.slackToken || "",
    gatewayToken: savedState.gatewayToken || generateGatewayToken(),
    gatewayAuthEnabled: savedState.gatewayAuthEnabled !== false,
  };
}

export function InstallationProvider({ children }: { children: ReactNode }): JSX.Element {
  const [state, setState] = useState<InstallationState>(getInitialState());

  // ─── Navegación ────────────────────────────────────────────────────────────

  const computeNextStep = useCallback((current: WizardStep, st: InstallationState): WizardStep => {
    const idx = WIZARD_STEPS.indexOf(current);

    // Skip api-key si modelo local o quick setup
    if (current === "model") {
      const isLocal = st.primaryModel.startsWith("ollama/");
      if (isLocal || st.setupType === "quick") return "channels";
    }

    // Skip credentials si no hay canales
    if (current === "channels") {
      const hasChannels = st.channels.size > 0 && !st.channels.has("none");
      if (!hasChannels) return "installing";
    }

    return WIZARD_STEPS[idx + 1] ?? current;
  }, []);

  const computePrevStep = useCallback((current: WizardStep, st: InstallationState): WizardStep => {
    const idx = WIZARD_STEPS.indexOf(current);

    if (current === "channels") {
      const isLocal = st.primaryModel.startsWith("ollama/");
      if (isLocal || st.setupType === "quick") return "model";
    }

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
    setState((prev) => ({ ...prev, step, stepIndex: WIZARD_STEPS.indexOf(step) }));
  }, []);

  // ─── Setters ───────────────────────────────────────────────────────────────

  const setPlatformCapabilities = useCallback((caps: PlatformCapabilities) => {
    setState((prev) => ({
      ...prev,
      platformCapabilities: caps,
      // Preseleccionar el deployment recomendado para este SO
      deploymentType: caps.recommendedDeployment,
    }));
  }, []);

  const setDeploymentType = useCallback((type: DeploymentType) => {
    setState((prev) => ({ ...prev, deploymentType: type }));
  }, []);

  const setGatewayToken = useCallback((token: string) => {
    setState((prev) => ({ ...prev, gatewayToken: token }));
  }, []);

  const setGatewayAuthEnabled = useCallback((enabled: boolean) => {
    setState((prev) => ({ ...prev, gatewayAuthEnabled: enabled }));
  }, []);

  const regenerateToken = useCallback(() => {
    setState((prev) => ({ ...prev, gatewayToken: generateGatewayToken() }));
  }, []);

  const setSetupType = useCallback((type: SetupType) => {
    setState((prev) => ({
      ...prev,
      setupType: type,
      primaryModel: getDefaultModelForSetupType(type),
      apiKey: type === "quick" ? "" : prev.apiKey,
    }));
  }, []);

  const setAgentName = useCallback((name: string) => setState((p) => ({ ...p, agentName: name })), []);
  const setAgentEmoji = useCallback((emoji: string) => setState((p) => ({ ...p, agentEmoji: emoji })), []);
  const setPrimaryModel = useCallback((model: string) => setState((p) => ({ ...p, primaryModel: model })), []);
  const setFallbackModel = useCallback((model: string | undefined) => setState((p) => ({ ...p, fallbackModel: model })), []);
  const setApiKey = useCallback((key: string) => setState((p) => ({ ...p, apiKey: key })), []);

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

  const buildConfig = useCallback((language: "es" | "en"): InstallConfig => {
    const security: SecurityConfig = {
      gatewayToken: state.gatewayToken,
      gatewayAuthMode: state.gatewayAuthEnabled ? "token" : "none",
      firewallConfigured: false, // se actualiza post-install
    };

    return {
      setupType: state.setupType,
      language,
      deploymentType: state.deploymentType,
      security,
      agentName: state.agentName,
      primaryModel: state.primaryModel,
      fallbackModel: state.fallbackModel,
      apiKey: state.apiKey || undefined,
      channels: Array.from(state.channels).filter((c) => c !== "none"),
      phoneNumber: state.phoneNumber || undefined,
      telegramToken: state.telegramToken || undefined,
      discordToken: state.discordToken || undefined,
      slackToken: state.slackToken || undefined,
    };
  }, [state]);

  // ─── Persistence ───────────────────────────────────────────────────────────

  useEffect(() => {
    // Don't persist if still on welcome, system-check, deployment, security, or success
    if (
      state.step === "welcome" ||
      state.step === "system-check" ||
      state.step === "deployment" ||
      state.step === "security" ||
      state.step === "success" ||
      state.installSuccess === true
    ) {
      // Clear state if installation was successful
      if (state.installSuccess === true) {
        clearInstallationState();
      }
      return;
    }

    saveInstallationState({
      step: state.step,
      stepIndex: state.stepIndex,
      deploymentType: state.deploymentType,
      setupType: state.setupType,
      agentName: state.agentName,
      agentEmoji: state.agentEmoji,
      primaryModel: state.primaryModel,
      fallbackModel: state.fallbackModel,
      apiKey: state.apiKey,
      channels: Array.from(state.channels),
      phoneNumber: state.phoneNumber,
      telegramToken: state.telegramToken,
      discordToken: state.discordToken,
      slackToken: state.slackToken,
      gatewayToken: state.gatewayToken,
      gatewayAuthEnabled: state.gatewayAuthEnabled,
    });
  }, [state]);

  // ─── Computed ──────────────────────────────────────────────────────────────

  const needsApiKey = !state.primaryModel.startsWith("ollama/") && state.setupType !== "quick";

  const needsCredentials =
    state.channels.size > 0 &&
    !state.channels.has("none") &&
    (state.channels.has("whatsapp") ||
      state.channels.has("telegram") ||
      state.channels.has("discord") ||
      state.channels.has("slack"));

  const isDockerDeployment =
    state.deploymentType === "docker" || state.deploymentType === "wsl2-docker";

  return (
    <InstallationContext.Provider
      value={{
        ...state,
        goNext, goPrev, goTo,
        setPlatformCapabilities,
        setDeploymentType,
        setGatewayToken, setGatewayAuthEnabled, regenerateToken,
        setSetupType,
        setAgentName, setAgentEmoji,
        setPrimaryModel, setFallbackModel,
        setApiKey,
        toggleChannel,
        setPhoneNumber, setTelegramToken, setDiscordToken, setSlackToken,
        setInstallProgress, setInstallComplete,
        buildConfig,
        needsApiKey, needsCredentials, isDockerDeployment,
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
