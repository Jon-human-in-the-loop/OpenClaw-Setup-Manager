export type SetupType = "quick" | "cloud" | "full";
export type Language = "es" | "en";
export type WizardStep =
  | "welcome"
  | "system-check"
  | "deployment"
  | "security"
  | "setup-type"
  | "agent-name"
  | "model"
  | "api-key"
  | "channels"
  | "credentials"
  | "installing"
  | "success";

// ─── Deployment types ────────────────────────────────────────────────────────

/** Cómo se despliega OpenClaw */
export type DeploymentType =
  | "local"          // npm install -g directo (todos los SO)
  | "docker"         // Contenedor Docker (macOS / Linux)
  | "wsl2-docker";   // WSL2 + Docker (Windows avanzado)

/** Info de Docker detectada en el sistema */
export interface DockerInfo {
  installed: boolean;
  running: boolean;
  version?: string;
  /** true solo en Linux (Docker CE nativo, sin overhead) */
  isNative: boolean;
}

/** Capacidades de la plataforma actual */
export interface PlatformCapabilities {
  /** win32 | darwin | linux */
  os: string;
  arch: string;
  docker: DockerInfo;
  /** Solo Windows: indica si WSL2 está disponible */
  wsl2Available: boolean;
  /** Opciones de despliegue disponibles para este SO */
  availableDeployments: DeploymentType[];
  /** Opción recomendada para este SO */
  recommendedDeployment: DeploymentType;
}

// ─── Security ────────────────────────────────────────────────────────────────

export interface SecurityConfig {
  /** Token aleatorio de acceso al gateway */
  gatewayToken: string;
  /** Modo de autenticación del gateway */
  gatewayAuthMode: "token" | "none";
  /** Si se aplicó hardening de firewall (solo Linux con ufw) */
  firewallConfigured: boolean;
}

// ─── Install Config ──────────────────────────────────────────────────────────

export interface InstallConfig {
  // Wizard state
  setupType: SetupType;
  language: Language;

  // Deployment
  deploymentType: DeploymentType;
  security: SecurityConfig;

  // Agent identity
  agentName: string;

  // Model selection
  primaryModel: string;
  fallbackModel?: string;

  // Credentials
  apiKey?: string;

  // Channels
  channels: string[];
  phoneNumber?: string;
  telegramToken?: string;
  discordToken?: string;
  slackToken?: string;
}

// ─── System Check ────────────────────────────────────────────────────────────

export interface SystemCheckResult {
  nodeInstalled: boolean;
  nodeVersion: string | null;
  nodeMeetsRequirement: boolean;
  portAvailable: boolean;
  diskSpaceGB: number;
  diskSpaceMeetsRequirement: boolean;
  gitInstalled: boolean;
  platform: string;
  arch: string;
  /** Capacidades de plataforma incluyendo Docker */
  platformCapabilities: PlatformCapabilities;
}

export interface InstallProgressEvent {
  percent: number;
  message: string;
  log?: string;
}

export interface InstallCompleteEvent {
  success: boolean;
  dashboardUrl?: string;
  message: string;
}

// ─── Auto-Update ────────────────────────────────────────────────────────────

export type UpdateState = "idle" | "checking" | "available" | "downloading" | "downloaded" | "installing" | "error";

export interface UpdateInfo {
  version: string;
  releaseNotes?: string;
  releaseName?: string;
  releaseDate?: string;
}

export interface UpdateCheckResult {
  updateAvailable: boolean;
  updateInfo?: UpdateInfo;
}

export interface UpdateProgressEvent {
  percent: number;
  bytesPerSecond: number;
  total: number;
  transferred: number;
}

export interface UpdateErrorEvent {
  error: string;
  code?: string;
}

export interface UpdatePreferences {
  autoCheckForUpdates: boolean;
  lastUpdateCheck?: number;
  updateChannel: "latest" | "beta";
  skipVersion?: string;
}

export interface AppVersion {
  current: string;
  previous?: string;
  lastUpdateTime?: number;
}

// ─── Network Status ──────────────────────────────────────────────────────────

export interface NetworkStatus {
  isOnline: boolean;
  lastCheckedAt: number;
}

// ─── Installation Session (Resume) ────────────────────────────────────────

export type InstallationSessionStatus = "active" | "completed" | "failed" | "interrupted";

export interface InstallationSession {
  // Identifiers
  sessionId: string;
  createdAt: number; // timestamp
  lastModifiedAt: number;

  // Status
  status: InstallationSessionStatus;
  failureReason?: string;

  // Configuration snapshot
  currentStep: WizardStep;
  setupType: SetupType;
  language: Language;
  agentName: string;
  primaryModel: string;
  fallbackModel?: string;
  apiKey?: string;
  channels: string[];
  phoneNumber?: string;
  telegramToken?: string;
  discordToken?: string;
  slackToken?: string;

  // Progress tracking
  completedSteps: WizardStep[];
  installationStartTime?: number;
  installationProgress: {
    percent: number;
    currentLog: string;
    logs: string[];
  };
}

export interface InstallationHistory {
  sessions: InstallationSession[];
  totalCount: number;
}
