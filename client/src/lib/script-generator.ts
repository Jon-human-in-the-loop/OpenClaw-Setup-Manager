/*
 * ============================================================
 * DESIGN: Terminal Noir — Script Generator Engine
 * Generates installation scripts and JSON configs for OpenClaw
 * ============================================================
 */

import type { Skill, Platform } from "./openclaw-data";

export interface InstallConfig {
  platform: Platform;
  agentName: string;
  agentTheme: string;
  agentEmoji: string;
  selectedSkills: Skill[];
  primaryModel: string;
  fallbackModel?: string;
  channels: string[];
  phoneNumber?: string;
  apiKeys: Record<string, string>;
}

export function generateInstallScript(config: InstallConfig): string {
  const skillSlugs = config.selectedSkills.map((s) => s.slug);
  const isWindows = config.platform === "windows";
  const isOllamaModel = config.primaryModel.startsWith("ollama/");
  const ollamaModel = isOllamaModel ? config.primaryModel.replace("ollama/", "") : null;
  const totalSteps = isOllamaModel ? 6 : 5;

  const lines: string[] = [
    "#!/bin/bash",
    "#",
    "# ╔══════════════════════════════════════════════════════════╗",
    "# ║  OpenClaw One-Click Installer                           ║",
    "# ║  Generado por openclaw-installer                        ║",
    `# ║  ${new Date().toISOString().split("T")[0]}                                       ║`,
    "# ╚══════════════════════════════════════════════════════════╝",
    "#",
    `# Plataforma: ${config.platform}`,
    `# Skills: ${skillSlugs.length} seleccionadas`,
    `# Modelo: ${config.primaryModel}`,
    "#",
    "set -euo pipefail",
    "",
    'echo "\\x1b[0;32m"',
    'echo "  ╔═══════════════════════════════════════╗"',
    'echo "  ║   OpenClaw One-Click Installer        ║"',
    'echo "  ║   Instalando tu asistente IA...       ║"',
    'echo "  ╚═══════════════════════════════════════╝"',
    'echo "\\x1b[0m"',
    "",
    `# ─── PASO 1: Verificar requisitos ───────────────────────`,
    `echo "\\n\\x1b[0;36m[1/${totalSteps}]\\x1b[0m Verificando requisitos del sistema..."`,
    "",
  ];

  // Ollama install step (inserted before Node check if using local model)
  if (isOllamaModel && ollamaModel) {
    lines.push(
      `# ─── PASO 1.5: Instalar Ollama (modelo local) ───────────`,
      `echo "\\n\\x1b[0;36m[1.5/${totalSteps}]\\x1b[0m Verificando Ollama para modelos locales..."`,
      "",
      "if command -v ollama &> /dev/null; then",
      '  echo "\\x1b[0;32m✓\\x1b[0m Ollama ya instalado: $(ollama --version)"',
      "else",
      '  echo "\\x1b[0;33m⚠ Ollama no encontrado. Instalando...\\x1b[0m"',
      '  curl -fsSL https://ollama.ai/install.sh | sh',
      '  echo "\\x1b[0;32m✓\\x1b[0m Ollama instalado"',
      "fi",
      "",
      "# Iniciar servicio Ollama si no está corriendo",
      'if ! pgrep -x "ollama" > /dev/null 2>&1; then',
      '  echo "Iniciando servicio Ollama en segundo plano..."',
      "  ollama serve > /tmp/ollama.log 2>&1 &",
      "  sleep 5",
      "fi",
      "",
      `# Descargar modelo ${ollamaModel}`,
      `echo "Descargando modelo ${ollamaModel} (puede tardar varios minutos según tu conexión)..."`,
      `ollama pull ${ollamaModel}`,
      `echo "\\x1b[0;32m✓\\x1b[0m Modelo ${ollamaModel} descargado y listo"`,
      ""
    );
  }

  // Node check
  lines.push(
    'if command -v node &> /dev/null; then',
    '  NODE_VERSION=$(node -v | cut -d "v" -f 2 | cut -d "." -f 1)',
    '  if [ "$NODE_VERSION" -lt 22 ]; then',
    '    echo "\\x1b[0;33m⚠ Node.js $NODE_VERSION detectado, se requiere v22+. Actualizando...\\x1b[0m"',
    '    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -',
    '    sudo apt-get install -y nodejs',
    '  else',
    '    echo "\\x1b[0;32m✓\\x1b[0m Node.js v$(node -v) detectado"',
    '  fi',
    'else',
    '  echo "\\x1b[0;33m⚠ Node.js no encontrado. Instalando v22...\\x1b[0m"',
    '  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -',
    '  sudo apt-get install -y nodejs',
    'fi',
    ""
  );

  // Step 2: Install OpenClaw
  lines.push(
    "# ─── PASO 2: Instalar OpenClaw ─────────────────────────",
    `echo "\\n\\x1b[0;36m[2/${totalSteps}]\\x1b[0m Instalando OpenClaw..."`,
    ""
  );

  if (isWindows) {
    lines.push(
      "# Windows: Usar PowerShell para descargar e instalar",
      "# Nota: Ejecutar este script dentro de WSL2",
      'echo "\\x1b[0;33mNota: Asegúrate de estar ejecutando esto dentro de WSL2\\x1b[0m"',
      ""
    );
  }

  lines.push(
    "# Instalar via script oficial",
    "curl -fsSL https://openclaw.ai/install.sh | bash -s -- --no-onboard",
    "",
    '# Verificar instalación',
    'if ! command -v openclaw &> /dev/null; then',
    '  echo "\\x1b[0;31m✗ Error: openclaw no se instaló correctamente\\x1b[0m"',
    '  echo "Intenta: npm install -g openclaw@latest"',
    '  exit 1',
    'fi',
    'echo "\\x1b[0;32m✓\\x1b[0m OpenClaw $(openclaw --version) instalado"',
    ""
  );

  // Step 3: Configure
  lines.push(
    "# ─── PASO 3: Configurar OpenClaw ──────────────────────",
    `echo "\\n\\x1b[0;36m[3/${totalSteps}]\\x1b[0m Configurando tu agente..."`,
    "",
    "# Crear directorio de configuración",
    "mkdir -p ~/.openclaw/workspace",
    "mkdir -p ~/.openclaw/skills",
    "",
    "# Escribir configuración",
    "cat > ~/.openclaw/openclaw.json << 'OPENCLAW_CONFIG'",
    generateJsonConfig(config),
    "OPENCLAW_CONFIG",
    "",
    'echo "\\x1b[0;32m✓\\x1b[0m Configuración escrita en ~/.openclaw/openclaw.json"',
    ""
  );

  // Step 4: Set API keys
  const apiKeyEntries = Object.entries(config.apiKeys).filter(
    ([, v]) => v && v.trim() !== ""
  );
  if (apiKeyEntries.length > 0) {
    lines.push(
      "# ─── PASO 3.5: Configurar API Keys ───────────────────",
      'echo "\\n\\x1b[0;36m[3.5/5]\\x1b[0m Configurando API keys..."',
      ""
    );
    for (const [key, value] of apiKeyEntries) {
      lines.push(`export ${key}="${value}"`);
      lines.push(
        `echo 'export ${key}="${value}"' >> ~/.bashrc`
      );
    }
    lines.push(
      "",
      'echo "\\x1b[0;32m✓\\x1b[0m API keys configuradas"',
      ""
    );
  }

  // Step 5: Install skills
  lines.push(
    "# ─── PASO 4: Instalar Skills ─────────────────────────",
    `echo "\\n\\x1b[0;36m[4/${totalSteps}]\\x1b[0m Instalando skills desde ClawHub..."`,
    "",
    "# Instalar ClawHub CLI",
    "npm install -g clawdhub 2>/dev/null || true",
    ""
  );

  for (const slug of skillSlugs) {
    lines.push(
      `echo "  Instalando ${slug}..."`,
      `clawhub install ${slug} 2>/dev/null || echo "\\x1b[0;33m  ⚠ ${slug} requiere configuración manual\\x1b[0m"`,
      ""
    );
  }

  lines.push(
    `echo "\\x1b[0;32m✓\\x1b[0m ${skillSlugs.length} skills instaladas"`,
    ""
  );

  // Step 6: Launch
  lines.push(
    "# ─── PASO 5: Iniciar OpenClaw ────────────────────────",
    `echo "\\n\\x1b[0;36m[5/${totalSteps}]\\x1b[0m Iniciando OpenClaw..."`,
    "",
    "# Ejecutar doctor para verificar",
    "openclaw doctor || true",
    "",
    "# Iniciar el daemon",
    "openclaw onboard --install-daemon",
    "",
    'echo ""',
    'echo "\\x1b[0;32m"',
    'echo "  ╔═══════════════════════════════════════════════════╗"',
    'echo "  ║                                                   ║"',
    `echo "  ║   ✓ ${config.agentName} está listo!                       ║"`,
    `echo "  ║   Skills: ${String(skillSlugs.length).padEnd(3)} instaladas                        ║"`,
    `echo "  ║   Modelo: ${config.primaryModel.split("/").pop()?.substring(0, 25)?.padEnd(25) || ""}          ║"`,
    'echo "  ║                                                   ║"',
    'echo "  ║   Ejecuta: openclaw dashboard                     ║"',
    'echo "  ║   para abrir el panel de control                  ║"',
    'echo "  ║                                                   ║"',
    'echo "  ╚═══════════════════════════════════════════════════╝"',
    'echo "\\x1b[0m"',
  );

  return lines.join("\n");
}

export function generateJsonConfig(config: InstallConfig): string {
  const channelConfig: Record<string, unknown> = {};

  if (config.channels.includes("whatsapp")) {
    channelConfig.whatsapp = {
      allowFrom: config.phoneNumber ? [config.phoneNumber] : ["+1XXXXXXXXXX"],
      groups: { "*": { requireMention: true } },
    };
  }

  if (config.channels.includes("telegram")) {
    channelConfig.telegram = {
      enabled: true,
      botToken: config.apiKeys["TELEGRAM_BOT_TOKEN"] || "YOUR_TELEGRAM_BOT_TOKEN",
      allowFrom: ["YOUR_TELEGRAM_USER_ID"],
      groups: { "*": { requireMention: true } },
    };
  }

  if (config.channels.includes("discord")) {
    channelConfig.discord = {
      enabled: true,
      token: config.apiKeys["DISCORD_BOT_TOKEN"] || "YOUR_DISCORD_BOT_TOKEN",
      dm: { enabled: true, allowFrom: ["YOUR_DISCORD_USER_ID"] },
    };
  }

  if (config.channels.includes("slack")) {
    channelConfig.slack = {
      enabled: true,
      botToken: config.apiKeys["SLACK_BOT_TOKEN"] || "xoxb-REPLACE_ME",
      appToken: config.apiKeys["SLACK_APP_TOKEN"] || "xapp-REPLACE_ME",
      dm: { enabled: true },
    };
  }

  if (config.channels.includes("webchat")) {
    channelConfig.webchat = { enabled: true };
  }

  const jsonConfig: Record<string, unknown> = {
    identity: {
      name: config.agentName || "Clawd",
      theme: config.agentTheme || "helpful assistant",
      emoji: config.agentEmoji || "🦞",
    },
    agent: {
      workspace: "~/.openclaw/workspace",
      model: {
        primary: config.primaryModel,
        ...(config.fallbackModel ? { fallbacks: [config.fallbackModel] } : {}),
      },
    },
    channels: channelConfig,
    tools: {
      media: {
        audio: { enabled: true },
        video: { enabled: true },
      },
    },
    session: {
      scope: "per-sender",
      reset: {
        mode: "daily",
        atHour: 4,
      },
      resetTriggers: ["/new", "/reset"],
    },
  };

  // Add env section for API keys
  const envVars: Record<string, string> = {};
  for (const [key, value] of Object.entries(config.apiKeys)) {
    if (value && value.trim() !== "" && !key.includes("TOKEN")) {
      envVars[key] = value;
    }
  }

  if (Object.keys(envVars).length > 0) {
    jsonConfig.env = { vars: envVars };
  }

  return JSON.stringify(jsonConfig, null, 2);
}

export function generateDockerCompose(config: InstallConfig): string {
  const envLines = Object.entries(config.apiKeys)
    .filter(([, v]) => v && v.trim() !== "")
    .map(([k, v]) => `      - ${k}=${v}`)
    .join("\n");

  return `# Docker Compose para OpenClaw
# Generado por openclaw-installer

version: "3.8"

services:
  openclaw:
    image: ghcr.io/openclaw/openclaw:latest
    container_name: openclaw
    restart: unless-stopped
    volumes:
      - ./data/.openclaw:/root/.openclaw
      - ./data/workspace:/root/.openclaw/workspace
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
${envLines}
    healthcheck:
      test: ["CMD", "openclaw", "doctor"]
      interval: 30s
      timeout: 10s
      retries: 3
`;
}

/**
 * Genera un ejecutable completo que embebe la configuración JSON
 * El usuario solo descarga este archivo y lo ejecuta
 */
export function generateCompleteExecutable(config: InstallConfig): string {
  const jsonConfig = generateJsonConfig(config);
  const skillSlugs = config.selectedSkills.map((s) => s.slug);
  const isOllamaModel = config.primaryModel.startsWith("ollama/");
  const ollamaModel = isOllamaModel ? config.primaryModel.replace("ollama/", "") : null;
  const totalSteps = isOllamaModel ? 7 : 6;
  // Use btoa for client-side base64 encoding (with UTF-8 support)
  const encodedJson = typeof window !== 'undefined'
    ? btoa(unescape(encodeURIComponent(jsonConfig)))
    : Buffer.from(jsonConfig).toString('base64');

  const lines: string[] = [
    "#!/bin/bash",
    "#",
    "# ╔══════════════════════════════════════════════════════════╗",
    "# ║  OpenClaw One-Click Installer - Ejecutable Completo      ║",
    "# ║  Generado por openclaw-installer                        ║",
    `# ║  ${new Date().toISOString().split("T")[0]}                                       ║`,
    `# ║  Usuario: ${config.agentName}                                       ║`,
    "# ╚══════════════════════════════════════════════════════════╝",
    "#",
    "# Este archivo contiene toda la configuración embebida.",
    "# Solo ejecuta: chmod +x install-openclaw.sh && ./install-openclaw.sh",
    "#",
    "set -euo pipefail",
    "",
    "# ═══════════════════════════════════════════════════════════",
    "# CONFIGURACIÓN EMBEBIDA (Base64)",
    "# ═══════════════════════════════════════════════════════════",
    `OPENCLAW_CONFIG_B64='${encodedJson}'`,
    "",
    "# ═══════════════════════════════════════════════════════════",
    "# INICIO DE INSTALACIÓN",
    "# ═══════════════════════════════════════════════════════════",
    "",
    'echo "\\x1b[0;32m"',
    'echo "  ╔═══════════════════════════════════════════════════╗"',
    'echo "  ║                                                   ║"',
    `echo "  ║   🦞 OpenClaw One-Click Installer                 ║"`,
    `echo "  ║   Agente: ${config.agentName.padEnd(35)}║"`,
    `echo "  ║   Skills: ${String(skillSlugs.length).padEnd(35)}║"`,
    'echo "  ║                                                   ║"',
    'echo "  ╚═══════════════════════════════════════════════════╝"',
    'echo "\\x1b[0m"',
    "",
    "# ─── PASO 1: Verificar requisitos ───────────────────────",
    `echo "\\n\\x1b[0;36m[1/${totalSteps}]\\x1b[0m Verificando requisitos del sistema..."`,
    "",
  ];

  // Ollama install step for local models
  if (isOllamaModel && ollamaModel) {
    lines.push(
      "# ─── PASO 1.5: Instalar Ollama (modelo local) ───────────",
      `echo "\\n\\x1b[0;36m[1.5/${totalSteps}]\\x1b[0m Verificando Ollama para modelos locales..."`,
      "",
      "if command -v ollama &> /dev/null; then",
      '  echo "\\x1b[0;32m✓\\x1b[0m Ollama ya instalado: $(ollama --version)"',
      "else",
      '  echo "\\x1b[0;33m⚠ Ollama no encontrado. Instalando...\\x1b[0m"',
      '  curl -fsSL https://ollama.ai/install.sh | sh',
      '  echo "\\x1b[0;32m✓\\x1b[0m Ollama instalado"',
      "fi",
      "",
      "# Iniciar servicio Ollama si no está corriendo",
      'if ! pgrep -x "ollama" > /dev/null 2>&1; then',
      '  echo "Iniciando servicio Ollama en segundo plano..."',
      "  ollama serve > /tmp/ollama.log 2>&1 &",
      "  sleep 5",
      "fi",
      "",
      `# Descargar modelo ${ollamaModel}`,
      `echo "Descargando modelo ${ollamaModel} (puede tardar varios minutos según tu conexión)..."`,
      `ollama pull ${ollamaModel}`,
      `echo "\\x1b[0;32m✓\\x1b[0m Modelo ${ollamaModel} descargado y listo"`,
      ""
    );
  }

  // Node check
  lines.push(
    'if command -v node &> /dev/null; then',
    '  NODE_VERSION=$(node -v | cut -d "v" -f 2 | cut -d "." -f 1)',
    '  if [ "$NODE_VERSION" -lt 22 ]; then',
    '    echo "\\x1b[0;33m⚠ Node.js $NODE_VERSION detectado, se requiere v22+. Actualizando...\\x1b[0m"',
    '    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -',
    '    sudo apt-get install -y nodejs',
    '  else',
    '    echo "\\x1b[0;32m✓\\x1b[0m Node.js v$(node -v) detectado"',
    '  fi',
    'else',
    '  echo "\\x1b[0;33m⚠ Node.js no encontrado. Instalando v22...\\x1b[0m"',
    '  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -',
    '  sudo apt-get install -y nodejs',
    'fi',
    ""
  );

  // Step 2: Install OpenClaw
  lines.push(
    "# ─── PASO 2: Instalar OpenClaw ─────────────────────────",
    `echo "\\n\\x1b[0;36m[2/${totalSteps}]\\x1b[0m Instalando OpenClaw..."`,
    "",
    "curl -fsSL https://openclaw.ai/install.sh | bash -s -- --no-onboard",
    "",
    'if ! command -v openclaw &> /dev/null; then',
    '  echo "\\x1b[0;31m✗ Error: openclaw no se instaló correctamente\\x1b[0m"',
    '  exit 1',
    'fi',
    'echo "\\x1b[0;32m✓\\x1b[0m OpenClaw instalado"',
    ""
  );

  // Step 3: Create directories
  lines.push(
    "# ─── PASO 3: Crear directorios ─────────────────────────",
    `echo "\\n\\x1b[0;36m[3/${totalSteps}]\\x1b[0m Creando directorios..."`,
    "",
    "mkdir -p ~/.openclaw/workspace",
    "mkdir -p ~/.openclaw/skills",
    'echo "\\x1b[0;32m✓\\x1b[0m Directorios creados"',
    ""
  );

  // Step 4: Write config from embedded base64
  lines.push(
    "# ─── PASO 4: Escribir configuración ────────────────────",
    `echo "\\n\\x1b[0;36m[4/${totalSteps}]\\x1b[0m Escribiendo configuración..."`,
    "",
    'echo "$OPENCLAW_CONFIG_B64" | base64 -d > ~/.openclaw/openclaw.json',
    'echo "\\x1b[0;32m✓\\x1b[0m Configuración escrita en ~/.openclaw/openclaw.json"',
    ""
  );

  // Step 5: Set API keys if any
  const apiKeyEntries = Object.entries(config.apiKeys).filter(
    ([, v]) => v && v.trim() !== ""
  );
  if (apiKeyEntries.length > 0) {
    lines.push(
      "# ─── PASO 5: Configurar API Keys ──────────────────────",
      `echo "\\n\\x1b[0;36m[5/${totalSteps}]\\x1b[0m Configurando API keys..."`,
      ""
    );
    for (const [key, value] of apiKeyEntries) {
      lines.push(`export ${key}="${value}"`);
      lines.push(`echo 'export ${key}="${value}"' >> ~/.bashrc`);
    }
    lines.push(
      'echo "\\x1b[0;32m✓\\x1b[0m API keys configuradas"',
      ""
    );
  }

  // Step 6: Install skills
  lines.push(
    "# ─── PASO 6: Instalar Skills ──────────────────────────",
    `echo "\\n\\x1b[0;36m[6/${totalSteps}]\\x1b[0m Instalando skills desde ClawHub..."`,
    "",
    "npm install -g clawdhub 2>/dev/null || true",
    ""
  );

  for (const slug of skillSlugs) {
    lines.push(
      `echo "  Instalando ${slug}..."`
    );
    lines.push(
      `clawhub install ${slug} 2>/dev/null || echo "\\x1b[0;33m  ⚠ ${slug} requiere configuración manual\\x1b[0m"`
    );
  }

  lines.push(
    `echo "\\x1b[0;32m✓\\x1b[0m ${skillSlugs.length} skills instaladas"`,
    ""
  );

  // Final message
  lines.push(
    'echo ""',
    'echo "\\x1b[0;32m"',
    'echo "  ╔═══════════════════════════════════════════════════╗"',
    'echo "  ║                                                   ║"',
    `echo "  ║   ✓ ${config.agentName} está listo!                       ║"`,
    `echo "  ║   Skills: ${String(skillSlugs.length).padEnd(3)} instaladas                        ║"`,
    `echo "  ║   Modelo: ${config.primaryModel.split("/").pop()?.substring(0, 25)?.padEnd(25) || ""}          ║"`,
    'echo "  ║                                                   ║"',
    'echo "  ║   Próximos pasos:                                  ║"',
    'echo "  ║   1. openclaw doctor                              ║"',
    'echo "  ║   2. openclaw dashboard                           ║"',
    'echo "  ║   3. ¡Envía un mensaje para probar!               ║"',
    'echo "  ║                                                   ║"',
    'echo "  ╚═══════════════════════════════════════════════════╝"',
    'echo "\\x1b[0m"',
  );

  return lines.join("\n");
}
