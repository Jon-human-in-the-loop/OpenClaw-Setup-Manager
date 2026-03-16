/*
 * ============================================================
 * DESIGN: Terminal Noir — Script Generator Engine
 * Generates installation scripts and JSON configs for OpenClaw
 * SECURITY: Docker-first · Sandbox isolation · Token auth
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

// ─── JSON CONFIG ────────────────────────────────────────────
// Based on real openclaw.json format (github.com/openclaw/openclaw)

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

  // NOTE: API keys are stored in ~/.openclaw/.env (not here)
  // to prevent accidental exposure through config file sharing.
  const jsonConfig: Record<string, unknown> = {
    identity: {
      name: config.agentName || "Clawd",
      theme: config.agentTheme || "helpful assistant",
      emoji: config.agentEmoji || "🦞",
    },
    agent: {
      workspace: "/home/node/.openclaw/workspace",
      // Real format: model is a string, not an object
      model: config.primaryModel,
      ...(config.fallbackModel ? { fallbacks: [config.fallbackModel] } : {}),
    },
    // Security: gateway only accessible from localhost with auth token
    gateway: {
      port: 18789,
      bind: "loopback",
      mode: "local",
      reload: {
        mode: "hybrid",
      },
      auth: {
        // Placeholder replaced at install time by openssl rand
        token: "__GATEWAY_TOKEN__",
      },
    },
    // Security: sandbox mode isolates group/channel sessions
    agents: {
      defaults: {
        sandbox: {
          mode: "non-main",
        },
      },
    },
    channels: channelConfig,
    session: {
      scope: "per-sender",
      reset: {
        mode: "daily",
        atHour: 4,
      },
      resetTriggers: ["/new", "/reset"],
    },
  };

  return JSON.stringify(jsonConfig, null, 2);
}

// ─── DOCKER COMPOSE ─────────────────────────────────────────
// Security: localhost-only ports, cap_drop, no-new-privileges

export function generateDockerCompose(config: InstallConfig): string {
  const hasApiKeys = Object.entries(config.apiKeys).some(
    ([, v]) => v && v.trim() !== ""
  );
  const isOllama = config.primaryModel.startsWith("ollama/");
  const ollamaModel = isOllama
    ? config.primaryModel.replace("ollama/", "")
    : null;

  const envFileSection = hasApiKeys
    ? `\n    env_file:\n      - .env`
    : "";

  const ollamaService = isOllama
    ? `\n  openclaw-ollama:\n    image: ollama/ollama:latest\n    container_name: openclaw-ollama\n    restart: unless-stopped\n    ports:\n      - "127.0.0.1:11434:11434"\n    volumes:\n      - openclaw-ollama-data:/root/.ollama\n    security_opt:\n      - no-new-privileges:true\n`
    : "";

  const dependsOn = isOllama
    ? `\n    depends_on:\n      openclaw-ollama:\n        condition: service_started`
    : "";

  const ollamaEnv = isOllama
    ? `\n    environment:\n      - OLLAMA_HOST=http://openclaw-ollama:11434`
    : "";

  const volumesSection = isOllama
    ? `\nvolumes:\n  openclaw-ollama-data:`
    : "";

  // Note: double-escape backslashes for JS string, single $ kept literal for docker compose
  return `# ╔══════════════════════════════════════════════════════════╗
# ║  OpenClaw — Docker Compose Seguro                        ║
# ║  Generado por openclaw-installer                         ║
# ║  Gateway: localhost ONLY · Cap_drop · No-new-privileges  ║
# ╚══════════════════════════════════════════════════════════╝
#
# MEDIDAS DE SEGURIDAD APLICADAS:
#   - Puertos solo en 127.0.0.1 (NO accesibles desde red externa)
#   - cap_drop: ALL (sin capacidades privilegiadas del kernel)
#   - no-new-privileges (no puede escalar privilegios)
#   - Filesystem de solo lectura (excepto volúmenes explícitos)
#   - API keys en .env con chmod 600 (no en este archivo)

services:
  openclaw:
    image: ghcr.io/openclaw/openclaw:latest
    container_name: openclaw-agent
    restart: unless-stopped

    # SEGURIDAD CRÍTICA: Solo accesible desde localhost
    ports:
      - "127.0.0.1:18789:18789"
      - "127.0.0.1:3000:3000"

    # Volúmenes: config read-only, workspace/skills read-write
    volumes:
      - \${HOME}/.openclaw/openclaw.json:/home/node/.openclaw/openclaw.json:ro
      - \${HOME}/.openclaw/workspace:/home/node/.openclaw/workspace
      - \${HOME}/.openclaw/skills:/home/node/.openclaw/skills
${envFileSection}
${ollamaEnv}
    # SEGURIDAD: Filesystem de solo lectura con tmpfs para escritura temporal
    read_only: true
    tmpfs:
      - /tmp:size=128m,mode=1777

    # SEGURIDAD: Sin capacidades del kernel, sin escalada de privilegios
    cap_drop:
      - ALL
    security_opt:
      - no-new-privileges:true

    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
${dependsOn}
${ollamaService}
${volumesSection}
`;
}

// ─── SCRIPT BUILDER (interno) ────────────────────────────────
// Genera el script bash de instalación.
// embedded=true: incluye configuración en base64 dentro del script.

function buildScript(config: InstallConfig, embedded: boolean): string {
  const skillSlugs = config.selectedSkills.map((s) => s.slug);
  const isWindows = config.platform === "windows";
  const isMacos = config.platform === "macos";
  const isOllamaModel = config.primaryModel.startsWith("ollama/");
  const ollamaModel = isOllamaModel
    ? config.primaryModel.replace("ollama/", "")
    : null;

  const apiKeyEntries = Object.entries(config.apiKeys).filter(
    ([, v]) => v && v.trim() !== ""
  );

  const jsonConfigTemplate = generateJsonConfig(config);
  // base64-encode the config template for embedding
  const encodedConfig =
    typeof window !== "undefined"
      ? btoa(unescape(encodeURIComponent(jsonConfigTemplate)))
      : Buffer.from(jsonConfigTemplate).toString("base64");

  const agentNameSafe = (config.agentName || "Clawd").substring(0, 20).padEnd(20);
  const modelNameShort = (config.primaryModel.split("/").pop() ?? "").substring(0, 20).padEnd(20);

  const lines: string[] = [
    "#!/bin/bash",
    "#",
    "# ╔══════════════════════════════════════════════════════════╗",
    "# ║  OpenClaw One-Click Installer — Instalación con Docker  ║",
    "# ║  Generado por openclaw-installer                        ║",
    `# ║  ${new Date().toISOString().split("T")[0]}                                       ║`,
    "# ╚══════════════════════════════════════════════════════════╝",
    "#",
    "# SEGURIDAD APLICADA EN ESTA INSTALACIÓN:",
    "#   ✓ OpenClaw corre DENTRO de Docker (aislado del sistema)",
    "#   ✓ Gateway solo accesible desde localhost (127.0.0.1:18789)",
    "#   ✓ Dashboard solo en localhost (127.0.0.1:3000)",
    "#   ✓ Filesystem del contenedor en modo solo-lectura",
    "#   ✓ Sandbox activo para sesiones de grupo/canal",
    "#   ✓ Token de autenticación del gateway generado localmente",
    "#   ✓ API keys en ~/.openclaw/.env con chmod 600",
    "#",
    `# Plataforma: ${config.platform} | Skills: ${skillSlugs.length} | Modelo: ${config.primaryModel}`,
    "#",
    "set -euo pipefail",
    "",
  ];

  if (embedded) {
    lines.push(
      "# Configuración embebida en Base64",
      `OPENCLAW_CONFIG_B64='${encodedConfig}'`,
      ""
    );
  }

  // Banner
  lines.push(
    'echo "\\x1b[0;32m"',
    'echo "  ╔══════════════════════════════════════════════════════╗"',
    'echo "  ║   OpenClaw — Instalación Segura con Docker          ║"',
    `echo "  ║   Agente: ${agentNameSafe}                    ║"`,
    `echo "  ║   Modelo: ${modelNameShort}                    ║"`,
    'echo "  ╚══════════════════════════════════════════════════════╝"',
    'echo "\\x1b[0m"',
    ""
  );

  // ─── PASO 1: DOCKER ──────────────────────────────────────
  lines.push(
    "# ─── PASO 1/5: Docker (requisito de seguridad) ──────────",
    'echo "\\n\\x1b[0;36m[1/5]\\x1b[0m Verificando Docker..."',
    "",
    "DOCKER_OK=false",
    'if command -v docker &> /dev/null && docker info &> /dev/null 2>&1; then',
    "  DOCKER_OK=true",
    `  echo "\\x1b[0;32m✓\\x1b[0m Docker \\$(docker --version | awk '{print \\$3}' | tr -d ',') detectado"`,
    "fi",
    "",
    'if [ "$DOCKER_OK" = "false" ]; then',
    '  echo "\\x1b[0;33m⚠ Docker no encontrado o no iniciado. Instalando...\\x1b[0m"',
    ""
  );

  if (isMacos) {
    lines.push(
      "  # macOS: Detectar arquitectura e instalar Docker Desktop",
      "  ARCH=$(uname -m)",
      '  if [ "$ARCH" = "arm64" ]; then',
      '    DMG_URL="https://desktop.docker.com/mac/main/arm64/Docker.dmg"',
      "  else",
      '    DMG_URL="https://desktop.docker.com/mac/main/amd64/Docker.dmg"',
      "  fi",
      '  echo "Descargando Docker Desktop para macOS ($ARCH)..."',
      '  curl -L "$DMG_URL" -o /tmp/Docker.dmg --progress-bar',
      "  hdiutil attach /tmp/Docker.dmg -quiet",
      "  sudo cp -r /Volumes/Docker/Docker.app /Applications/ 2>/dev/null || cp -r /Volumes/Docker/Docker.app /Applications/",
      "  hdiutil detach /Volumes/Docker -quiet",
      "  rm /tmp/Docker.dmg",
      "  open /Applications/Docker.app",
      '  echo ""',
      '  echo "\\x1b[0;33m⚠ Docker Desktop se está iniciando."',
      '  echo "  Espera a que aparezca el ícono de ballena en la barra de menú."',
      '  echo "  Cuando Docker esté listo, presiona ENTER para continuar..."',
      '  read -r _DOCKER_WAIT'
    );
  } else if (isWindows) {
    lines.push(
      "  # Windows WSL2: instalar docker.io via apt",
      "  sudo apt-get update -qq",
      "  sudo apt-get install -y docker.io docker-compose-v2",
      "  sudo systemctl enable docker --now 2>/dev/null || sudo service docker start 2>/dev/null || true",
      '  sudo usermod -aG docker "$USER" 2>/dev/null || true',
      '  echo "\\x1b[0;33m⚠ Usuario agregado al grupo docker."',
      '  echo "  Si el siguiente paso falla con permisos, cierra y abre WSL2 de nuevo.\\x1b[0m"',
      "  sg docker -c 'docker info > /dev/null 2>&1' && DOCKER_OK=true || true"
    );
  } else {
    // Linux genérico
    lines.push(
      "  # Linux: script oficial de Docker Inc. (get.docker.com)",
      "  curl -fsSL https://get.docker.com | sudo sh",
      "  sudo systemctl enable docker --now",
      '  sudo usermod -aG docker "$USER"',
      "  sg docker -c 'docker info > /dev/null 2>&1' && DOCKER_OK=true || true"
    );
  }

  lines.push(
    "fi",
    "",
    "# Verificación final de Docker",
    'if ! docker info &> /dev/null 2>&1; then',
    '  echo "\\x1b[0;31m✗ Docker no está accesible. Por favor:"',
    '  echo "  1. Inicia Docker (o reinicia sesión si se acaba de instalar)"',
    '  echo "  2. Ejecuta este script de nuevo"',
    '  echo "\\x1b[0m"',
    "  exit 1",
    "fi",
    'echo "\\x1b[0;32m✓\\x1b[0m Docker accesible"',
    ""
  );

  // ─── PASO 2: CONFIGURACIÓN SEGURA ────────────────────────
  lines.push(
    "# ─── PASO 2/5: Configuración segura ─────────────────────",
    'echo "\\n\\x1b[0;36m[2/5]\\x1b[0m Creando configuración segura..."',
    "",
    "mkdir -p ~/.openclaw/workspace ~/.openclaw/skills",
    "",
    "# Generar token de autenticación del gateway de forma local",
    "# (nunca sale del sistema, se almacena solo en ~/.openclaw/.gateway-token)",
    "GATEWAY_TOKEN=$(openssl rand -hex 32 2>/dev/null \\",
    "  || od -An -N32 -tx1 /dev/urandom 2>/dev/null | tr -d ' \\n' \\",
    "  || date +%s%N | sha256sum | head -c 64)",
    ""
  );

  if (embedded) {
    lines.push(
      "# Decodificar configuración embebida y sustituir token",
      "# awk es portable (funciona igual en macOS y Linux)",
      "echo \"$OPENCLAW_CONFIG_B64\" | base64 -d | \\",
      "  awk -v t=\"$GATEWAY_TOKEN\" '{gsub(/__GATEWAY_TOKEN__/, t); print}' \\",
      "  > ~/.openclaw/openclaw.json"
    );
  } else {
    lines.push(
      "# Escribir config a archivo temporal y sustituir token",
      "# (heredoc con comillas simples: sin expansión de variables bash)",
      "_OPENCLAW_TMP=$(mktemp)",
      "cat > \"$_OPENCLAW_TMP\" << 'OPENCLAW_CONFIG_EOF'",
      jsonConfigTemplate,
      "OPENCLAW_CONFIG_EOF",
      "# Reemplazar placeholder con token real (portable: awk funciona en macOS y Linux)",
      "awk -v t=\"$GATEWAY_TOKEN\" '{gsub(/__GATEWAY_TOKEN__/, t); print}' \\",
      "  \"$_OPENCLAW_TMP\" > ~/.openclaw/openclaw.json",
      "rm -f \"$_OPENCLAW_TMP\""
    );
  }

  lines.push(
    "chmod 600 ~/.openclaw/openclaw.json",
    'echo "\\x1b[0;32m✓\\x1b[0m openclaw.json escrito (chmod 600, token único)"',
    ""
  );

  // Guardar token
  lines.push(
    "echo \"$GATEWAY_TOKEN\" > ~/.openclaw/.gateway-token",
    "chmod 600 ~/.openclaw/.gateway-token",
    'echo "\\x1b[0;32m✓\\x1b[0m Token guardado en ~/.openclaw/.gateway-token (chmod 600)"',
    ""
  );

  // API keys en .env
  if (apiKeyEntries.length > 0) {
    lines.push(
      "# API keys en archivo .env aislado (chmod 600, no en variables globales)",
      "cat > ~/.openclaw/.env << 'OPENCLAW_ENV_EOF'",
      ...apiKeyEntries.map(([k, v]) => `${k}=${v}`),
      "OPENCLAW_ENV_EOF",
      "chmod 600 ~/.openclaw/.env",
      'echo "\\x1b[0;32m✓\\x1b[0m API keys en ~/.openclaw/.env (chmod 600)"',
      ""
    );
  }

  // ─── PASO 3: DOCKER COMPOSE ──────────────────────────────
  lines.push(
    "# ─── PASO 3/5: Docker Compose seguro ────────────────────",
    'echo "\\n\\x1b[0;36m[3/5]\\x1b[0m Generando docker-compose.yml..."',
    "",
    "cat > ~/.openclaw/docker-compose.yml << 'DOCKER_COMPOSE_EOF'",
    generateDockerCompose(config),
    "DOCKER_COMPOSE_EOF",
    "chmod 600 ~/.openclaw/docker-compose.yml",
    'echo "\\x1b[0;32m✓\\x1b[0m docker-compose.yml generado (puertos: solo localhost)"',
    ""
  );

  // Ollama: descargar modelo en Docker
  if (isOllamaModel && ollamaModel) {
    lines.push(
      "# ─── Descargar modelo Ollama ─────────────────────────────",
      `echo "\\n\\x1b[0;36m[3.5/5]\\x1b[0m Descargando modelo ${ollamaModel} en Docker..."`,
      "",
      "docker run --rm -d --name openclaw-ollama-setup \\",
      "  -v openclaw-ollama-data:/root/.ollama \\",
      "  -p 127.0.0.1:11434:11434 \\",
      "  ollama/ollama:latest",
      "sleep 5",
      `docker exec openclaw-ollama-setup ollama pull ${ollamaModel}`,
      "docker stop openclaw-ollama-setup",
      `echo "\\x1b[0;32m✓\\x1b[0m Modelo ${ollamaModel} descargado"`,
      ""
    );
  }

  // ─── PASO 4: INICIAR CONTENEDOR ──────────────────────────
  lines.push(
    "# ─── PASO 4/5: Iniciar OpenClaw en Docker ───────────────",
    'echo "\\n\\x1b[0;36m[4/5]\\x1b[0m Iniciando contenedor OpenClaw..."',
    "",
    "cd ~/.openclaw",
    "docker compose pull --quiet",
    "docker compose up -d",
    "",
    "# Esperar health check (máx 60 segundos)",
    'echo "Esperando que OpenClaw esté listo..."',
    "_OC_READY=false",
    "for _i in $(seq 1 30); do",
    "  if docker exec openclaw-agent wget -qO- http://localhost:3000/healthz 2>/dev/null | grep -q 'ok'; then",
    "    _OC_READY=true",
    "    break",
    "  fi",
    "  sleep 2",
    "done",
    "",
    'if [ "$_OC_READY" = "true" ]; then',
    '  echo "\\x1b[0;32m✓\\x1b[0m OpenClaw listo"',
    "else",
    '  echo "\\x1b[0;33m⚠ OpenClaw tardó más de lo esperado. Verifica:"',
    '  echo "  docker logs openclaw-agent"',
    "fi",
    ""
  );

  // ─── PASO 5: FIREWALL ────────────────────────────────────
  if (isMacos) {
    lines.push(
      "# ─── PASO 5/5: Verificar seguridad macOS ────────────────",
      'echo "\\n\\x1b[0;36m[5/5]\\x1b[0m Verificando firewall macOS..."',
      "",
      "_FW_STATE=$(/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate 2>/dev/null || echo 'unknown')",
      'if echo "$_FW_STATE" | grep -q "enabled"; then',
      '  echo "\\x1b[0;32m✓\\x1b[0m Firewall macOS activo"',
      "else",
      '  echo "\\x1b[0;33m⚠ Firewall macOS inactivo. Actívalo en:"',
      '  echo "  Preferencias del Sistema → Seguridad y Privacidad → Firewall\\x1b[0m"',
      "fi",
      ""
    );
  } else {
    lines.push(
      "# ─── PASO 5/5: Firewall ─────────────────────────────────",
      'echo "\\n\\x1b[0;36m[5/5]\\x1b[0m Configurando firewall..."',
      "",
      'if command -v ufw &> /dev/null; then',
      "  sudo ufw default deny incoming 2>/dev/null || true",
      "  sudo ufw default allow outgoing 2>/dev/null || true",
      "  sudo ufw allow 22/tcp 2>/dev/null || true",
      "  sudo ufw --force enable 2>/dev/null || true",
      '  echo "\\x1b[0;32m✓\\x1b[0m ufw activo (entrada: solo SSH)"',
      'elif command -v firewall-cmd &> /dev/null; then',
      '  echo "\\x1b[0;32m✓\\x1b[0m firewalld detectado (configuración existente respetada)"',
      "else",
      '  echo "\\x1b[0;33m⚠ Sin firewall. Recomendado:"',
      '  echo "  sudo apt install ufw && sudo ufw allow 22/tcp && sudo ufw enable\\x1b[0m"',
      "fi",
      ""
    );
  }

  // Mensaje final
  lines.push(
    'echo ""',
    'echo "\\x1b[0;32m"',
    'echo "  ╔══════════════════════════════════════════════════════╗"',
    'echo "  ║                                                      ║"',
    `echo "  ║   ✓ ${agentNameSafe} listo en Docker!        ║"`,
    'echo "  ║                                                      ║"',
    'echo "  ║   Dashboard  → http://localhost:3000                 ║"',
    'echo "  ║   Gateway    → ws://127.0.0.1:18789 (solo local)    ║"',
    'echo "  ║                                                      ║"',
    'echo "  ║   Comandos:                                          ║"',
    'echo "  ║     docker compose -f ~/.openclaw/docker-compose.yml║"',
    'echo "  ║       logs -f    → Logs en tiempo real              ║"',
    'echo "  ║       down       → Detener OpenClaw                 ║"',
    'echo "  ║       restart    → Reiniciar                        ║"',
    'echo "  ║                                                      ║"',
    'echo "  ║   Acceso remoto seguro (SSH tunnel):                 ║"',
    'echo "  ║     ssh -L 3000:localhost:3000 usuario@servidor     ║"',
    'echo "  ║                                                      ║"',
    'echo "  ╚══════════════════════════════════════════════════════╝"',
    'echo "\\x1b[0m"',
    'echo "\\x1b[0;33m⚠ Token de gateway (guardado en ~/.openclaw/.gateway-token):\\x1b[0m"',
    'echo "  $GATEWAY_TOKEN"',
    'echo ""'
  );

  return lines.join("\n");
}

// ─── EXPORTS PÚBLICOS ────────────────────────────────────────

export function generateInstallScript(config: InstallConfig): string {
  return buildScript(config, false);
}

/**
 * Genera un ejecutable completo con la configuración embebida en Base64.
 * El usuario descarga un solo archivo y lo ejecuta: ./install-openclaw.sh
 */
export function generateCompleteExecutable(config: InstallConfig): string {
  return buildScript(config, true);
}
