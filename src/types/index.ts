export type SetupType = "quick" | "cloud" | "full";
export type Language = "es" | "en";

export interface InstallConfig {
  // Wizard state
  setupType: SetupType;
  language: Language;

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
