/*
 * ============================================================
 * DESIGN: Terminal Noir — Installer State Hook
 * Manages the full state of the OpenClaw installation wizard
 * ============================================================
 */

import { useState, useCallback, useMemo } from "react";
import { SKILLS, type Skill, type Platform } from "@/lib/openclaw-data";
import {
  generateInstallScript,
  generateJsonConfig,
  generateDockerCompose,
  generateCompleteExecutable,
  type InstallConfig,
} from "@/lib/script-generator";

export type WizardStep =
  | "platform"
  | "identity"
  | "model"
  | "skills"
  | "channels"
  | "generate";

const STEPS: WizardStep[] = [
  "platform",
  "identity",
  "model",
  "skills",
  "channels",
  "generate",
];

const STEP_LABELS: Record<WizardStep, string> = {
  platform: "Sistema",
  identity: "Identidad",
  model: "Modelo IA",
  skills: "Skills",
  channels: "Canales",
  generate: "Generar",
};

export function useInstaller() {
  const [currentStep, setCurrentStep] = useState<WizardStep>("platform");
  const [platform, setPlatform] = useState<Platform>("macos");
  const [agentName, setAgentName] = useState("Clawd");
  const [agentTheme, setAgentTheme] = useState("helpful assistant");
  const [agentEmoji, setAgentEmoji] = useState("🦞");
  const [primaryModel, setPrimaryModel] = useState("anthropic/claude-sonnet-4-5");
  const [fallbackModel, setFallbackModel] = useState<string | undefined>();
  const [selectedSkillIds, setSelectedSkillIds] = useState<Set<string>>(
    () => new Set(SKILLS.filter((s) => s.essential).map((s) => s.id))
  );
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(
    () => new Set(["whatsapp"])
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const currentStepIndex = STEPS.indexOf(currentStep);

  const selectedSkills = useMemo(
    () => SKILLS.filter((s) => selectedSkillIds.has(s.id)),
    [selectedSkillIds]
  );

  const toggleSkill = useCallback((skillId: string) => {
    setSelectedSkillIds((prev) => {
      const next = new Set(prev);
      if (next.has(skillId)) {
        next.delete(skillId);
      } else {
        next.add(skillId);
      }
      return next;
    });
  }, []);

  const selectSkillPack = useCallback((skillIds: string[]) => {
    setSelectedSkillIds((prev) => {
      const next = new Set(prev);
      for (const id of skillIds) {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleChannel = useCallback((channelId: string) => {
    setSelectedChannels((prev) => {
      const next = new Set(prev);
      if (next.has(channelId)) {
        next.delete(channelId);
      } else {
        next.add(channelId);
      }
      return next;
    });
  }, []);

  const setApiKey = useCallback((key: string, value: string) => {
    setApiKeys((prev) => ({ ...prev, [key]: value }));
  }, []);

  const goNext = useCallback(() => {
    const idx = STEPS.indexOf(currentStep);
    if (idx < STEPS.length - 1) {
      setCurrentStep(STEPS[idx + 1]);
    }
  }, [currentStep]);

  const goPrev = useCallback(() => {
    const idx = STEPS.indexOf(currentStep);
    if (idx > 0) {
      setCurrentStep(STEPS[idx - 1]);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: WizardStep) => {
    setCurrentStep(step);
  }, []);

  const installConfig: InstallConfig = useMemo(
    () => ({
      platform,
      agentName,
      agentTheme,
      agentEmoji,
      selectedSkills,
      primaryModel,
      fallbackModel,
      channels: Array.from(selectedChannels),
      phoneNumber,
      apiKeys,
    }),
    [
      platform,
      agentName,
      agentTheme,
      agentEmoji,
      selectedSkills,
      primaryModel,
      fallbackModel,
      selectedChannels,
      phoneNumber,
      apiKeys,
    ]
  );

  const generatedScript = useMemo(
    () => generateInstallScript(installConfig),
    [installConfig]
  );

  const generatedConfig = useMemo(
    () => generateJsonConfig(installConfig),
    [installConfig]
  );

  const generatedDocker = useMemo(
    () => generateDockerCompose(installConfig),
    [installConfig]
  );

  const downloadScript = useCallback(() => {
    const blob = new Blob([generatedScript], { type: "text/x-shellscript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "install-openclaw.sh";
    a.click();
    URL.revokeObjectURL(url);
  }, [generatedScript]);

  const downloadConfig = useCallback(() => {
    const blob = new Blob([generatedConfig], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "openclaw.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [generatedConfig]);

  const downloadDocker = useCallback(() => {
    const blob = new Blob([generatedDocker], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "docker-compose.yml";
    a.click();
    URL.revokeObjectURL(url);
  }, [generatedDocker]);

  const generatedExecutable = useMemo(
    () => generateCompleteExecutable(installConfig),
    [installConfig]
  );

  const downloadExecutable = useCallback(() => {
    const blob = new Blob([generatedExecutable], { type: "text/x-shellscript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "install-openclaw.sh";
    a.click();
    URL.revokeObjectURL(url);
  }, [generatedExecutable]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    // Navigation
    currentStep,
    currentStepIndex,
    steps: STEPS,
    stepLabels: STEP_LABELS,
    goNext,
    goPrev,
    goToStep,

    // Platform
    platform,
    setPlatform,

    // Identity
    agentName,
    setAgentName,
    agentTheme,
    setAgentTheme,
    agentEmoji,
    setAgentEmoji,

    // Model
    primaryModel,
    setPrimaryModel,
    fallbackModel,
    setFallbackModel,

    // Skills
    selectedSkillIds,
    selectedSkills,
    toggleSkill,
    selectSkillPack,

    // Channels
    selectedChannels,
    toggleChannel,
    phoneNumber,
    setPhoneNumber,

    // API Keys
    apiKeys,
    setApiKey,

    // Generation
    isGenerating,
    setIsGenerating,
    generatedScript,
    generatedConfig,
    generatedDocker,
    generatedExecutable,
    downloadScript,
    downloadConfig,
    downloadDocker,
    downloadExecutable,
    copyToClipboard,
    installConfig,
  };
}
