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

// ─── Diagnostic Engine ───────────────────────────────────────────────────────

/** Severidad de un hallazgo del diagnóstico */
export type CheckSeverity = "critical" | "recommended" | "optional";

/** Estado de un chequeo individual */
export type DiagnosticStatus =
  | "ready"         // ✓ listo, sin acción necesaria
  | "missing"       // ✗ falta y es necesario
  | "recommended"   // ~ se recomienda pero no bloquea
  | "incompatible"  // ✗ no compatible con este SO/configuración
  | "review";       // ? requiere atención manual

/** Un chequeo individual del motor de diagnóstico */
export interface DiagnosticCheck {
  /** Identificador único del chequeo */
  id: string;
  /** Categoría visual para agrupar en la UI */
  category: "os" | "docker" | "ollama" | "network" | "storage" | "permissions";
  /** Qué tan importante es este chequeo */
  severity: CheckSeverity;
  /** Estado actual detectado */
  status: DiagnosticStatus;
  /** Descripción corta del resultado (para mostrar como detalle) */
  detail: string;
  /** URL de ayuda o descarga si aplica */
  fixUrl?: string;
}

// ─── System Check ────────────────────────────────────────────────────────────

export interface SystemCheckResult {
  // ── Campos legacy (backward-compatible) ──
  nodeInstalled: boolean;
  nodeVersion: string | null;
  nodeMeetsRequirement: boolean;
  portAvailable: boolean;
  diskSpaceGB: number;
  diskSpaceMeetsRequirement: boolean;
  gitInstalled: boolean;
  ollamaInstalled: boolean;
  ollamaVersion: string | null;
  platform: string;
  arch: string;
  /** Capacidades de plataforma incluyendo Docker */
  platformCapabilities: PlatformCapabilities;

  // ── Campos nuevos (Fase 2: Motor de diagnóstico) ──
  /** Docker Compose disponible */
  dockerComposeAvailable: boolean;
  dockerComposeVersion: string | null;
  /** Ollama daemon está ejecutándose */
  ollamaRunning: boolean;
  /** Puerto 3000 (dashboard) disponible */
  dashboardPortAvailable: boolean;
  /** Hay conectividad a internet */
  internetConnected: boolean;
  /** Lista estructurada de diagnósticos con severidad */
  diagnostics: DiagnosticCheck[];
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

// ─── Control Center ──────────────────────────────────────────────────────────

/** Estado del contenedor Docker de OpenClaw */
export type ContainerState = "running" | "stopped" | "restarting" | "not-found" | "error";

export interface ContainerStatus {
  state: ContainerState;
  /** Tiempo de actividad del contenedor (e.g. "Up 2 hours") */
  uptime?: string;
  /** ID corto del contenedor */
  containerId?: string;
  /** Resultado del healthcheck de Docker */
  health?: "healthy" | "unhealthy" | "starting" | "none";
  /** Si el dashboard responde en localhost:3000 */
  dashboardReachable: boolean;
  /** Si el gateway responde en localhost:18789 */
  gatewayReachable: boolean;
  /** Timestamp de la última comprobación */
  lastCheckedAt: number;
}

export type ControlAction = "start" | "stop" | "restart" | "logs" | "open-dashboard" | "open-config";

export interface ControlActionResult {
  success: boolean;
  action: ControlAction;
  message: string;
  /** Datos adicionales (e.g. logs) */
  data?: string;
}

// ─── Repair Engine ───────────────────────────────────────────────────────────

export type RepairIssueId =
  | "docker-not-running"
  | "container-stopped"
  | "container-missing"
  | "port-gateway-occupied"
  | "port-dashboard-occupied"
  | "env-missing"
  | "config-missing"
  | "compose-missing"
  | "dashboard-unreachable"
  | "gateway-unreachable";

export type RepairMode = "auto" | "guided" | "detail";

export interface RepairIssue {
  id: RepairIssueId;
  severity: CheckSeverity;
  title: string;
  description: string;
  /** Si la app puede repararlo automáticamente */
  autoFixable: boolean;
}

export interface RepairResult {
  issue: RepairIssueId;
  success: boolean;
  message: string;
  /** Detalle técnico del comando ejecutado o acción tomada */
  technicalDetail?: string;
}

// ─── Script Generation ───────────────────────────────────────────────────────

export interface GeneratedScript {
  /** Contenido del script bash */
  content: string;
  /** Nombre sugerido del archivo */
  filename: string;
  /** Ruta donde se guardó (si se guardó) */
  savedPath?: string;
}

// ─── Healthcheck ─────────────────────────────────────────────────────────────

export interface HealthcheckResult {
  /** Si el servicio está saludable */
  healthy: boolean;
  /** Tiempo de respuesta en ms */
  responseTimeMs?: number;
  /** Código HTTP recibido */
  statusCode?: number;
  /** Mensaje de error si falló */
  error?: string;
}
