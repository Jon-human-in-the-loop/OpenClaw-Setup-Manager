export type SetupType = "quick" | "cloud" | "full";
export type Language = "es" | "en";

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
