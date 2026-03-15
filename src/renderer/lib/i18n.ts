import type { Language } from "../../types";

export type { Language };

// ─── Translation Map ─────────────────────────────────────────────────────────

const translations = {
  // ── Common ────────────────────────────────────────────────────────────────
  "common.next": { es: "Siguiente", en: "Next" },
  "common.back": { es: "Atrás", en: "Back" },
  "common.install": { es: "Instalar ahora", en: "Install now" },
  "common.open": { es: "Abrir", en: "Open" },
  "common.close": { es: "Cerrar", en: "Close" },
  "common.help": { es: "Ayuda", en: "Help" },
  "common.copy": { es: "Copiar", en: "Copy" },
  "common.copied": { es: "Copiado", en: "Copied" },
  "common.optional": { es: "Opcional", en: "Optional" },
  "common.required": { es: "Requerido", en: "Required" },
  "common.recommended": { es: "Recomendado", en: "Recommended" },
  "common.loading": { es: "Cargando...", en: "Loading..." },
  "common.retry": { es: "Reintentar", en: "Retry" },
  "common.skip": { es: "Omitir", en: "Skip" },
  "common.yes": { es: "Sí", en: "Yes" },
  "common.no": { es: "No", en: "No" },
  "common.getKey": { es: "Obtener clave", en: "Get key" },
  "common.guide": { es: "Ver guía", en: "View guide" },

  // ── TitleBar ──────────────────────────────────────────────────────────────
  "titlebar.title": { es: "OpenClaw Easy Installer", en: "OpenClaw Easy Installer" },

  // ── Agent Name ────────────────────────────────────────────────────────────
  "agentname.title": { es: "Nombra a tu agente", en: "Name your agent" },
  "agentname.subtitle": {
    es: "Dale un nombre y personalidad a tu asistente. Lo podrás cambiar después.",
    en: "Give your assistant a name and personality. You can change it later.",
  },
  "agentname.label": { es: "Nombre del agente", en: "Agent name" },
  "agentname.placeholder": { es: "Ej: Clawd, Aria, Max...", en: "E.g.: Clawd, Aria, Max..." },
  "agentname.emoji": { es: "Elige un emoji", en: "Choose an emoji" },
  "agentname.preview": { es: "Vista previa", en: "Preview" },

  // ── Welcome ───────────────────────────────────────────────────────────────
  "welcome.title": { es: "Instala OpenClaw\nen 5 minutos", en: "Install OpenClaw\nin 5 minutes" },
  "welcome.subtitle": {
    es: "Sin tecnicismos. Sin complicaciones.\nTu asistente IA personal listo para usar.",
    en: "No technical jargon. No complexity.\nYour personal AI assistant, ready to use.",
  },
  "welcome.what.title": { es: "¿Qué es OpenClaw?", en: "What is OpenClaw?" },
  "welcome.what.desc": {
    es: "OpenClaw es un asistente IA que conectas a tus canales de mensajería (WhatsApp, Telegram, Discord) y le das superpoderes: buscar en internet, escribir código, manejar archivos y mucho más.",
    en: "OpenClaw is an AI assistant you connect to your messaging channels (WhatsApp, Telegram, Discord) and give superpowers: search the internet, write code, manage files and much more.",
  },
  "welcome.steps.title": { es: "¿Qué vamos a hacer?", en: "What are we going to do?" },
  "welcome.steps.1": { es: "Verificar que tu sistema esté listo", en: "Verify your system is ready" },
  "welcome.steps.2": { es: "Elegir tu tipo de instalación", en: "Choose your installation type" },
  "welcome.steps.3": { es: "Seleccionar modelo de IA", en: "Select AI model" },
  "welcome.steps.4": { es: "Conectar tus canales de mensajería", en: "Connect your messaging channels" },
  "welcome.steps.5": { es: "Instalación automática completa", en: "Complete automatic installation" },
  "welcome.cta": { es: "Comenzar", en: "Get Started" },

  // ── System Check ──────────────────────────────────────────────────────────
  "systemcheck.title": { es: "Verificando tu sistema", en: "Checking your system" },
  "systemcheck.subtitle": { es: "Revisamos que todo esté listo para instalar OpenClaw.", en: "We check that everything is ready to install OpenClaw." },
  "systemcheck.checking": { es: "Verificando...", en: "Checking..." },
  "systemcheck.node": { es: "Node.js 22+", en: "Node.js 22+" },
  "systemcheck.node.ok": { es: "Node.js {version} instalado", en: "Node.js {version} installed" },
  "systemcheck.node.missing": { es: "Node.js no encontrado", en: "Node.js not found" },
  "systemcheck.node.outdated": { es: "Node.js {version} (necesitas v22+)", en: "Node.js {version} (need v22+)" },
  "systemcheck.port": { es: "Puerto 18789 libre", en: "Port 18789 available" },
  "systemcheck.port.ok": { es: "Puerto disponible", en: "Port available" },
  "systemcheck.port.busy": { es: "Puerto ocupado", en: "Port in use" },
  "systemcheck.disk": { es: "Espacio en disco (5GB)", en: "Disk space (5GB)" },
  "systemcheck.disk.ok": { es: "{gb}GB disponibles", en: "{gb}GB available" },
  "systemcheck.disk.low": { es: "Solo {gb}GB disponibles", en: "Only {gb}GB available" },
  "systemcheck.git": { es: "Git", en: "Git" },
  "systemcheck.git.ok": { es: "Git instalado", en: "Git installed" },
  "systemcheck.git.missing": { es: "Git no encontrado (opcional)", en: "Git not found (optional)" },
  "systemcheck.fix.node": { es: "Descarga Node.js desde nodejs.org", en: "Download Node.js from nodejs.org" },
  "systemcheck.fix.port": { es: "Cierra otros programas o reinicia el sistema", en: "Close other programs or restart the system" },
  "systemcheck.fix.disk": { es: "Libera espacio en disco (necesitas 5GB)", en: "Free up disk space (need 5GB)" },
  "systemcheck.allGood": { es: "¡Todo listo!", en: "All good!" },
  "systemcheck.hasErrors": { es: "Hay problemas que resolver", en: "There are issues to resolve" },
  "systemcheck.continue": { es: "Continuar", en: "Continue" },
  "systemcheck.fixAndRetry": { es: "Corregir y volver a verificar", en: "Fix and re-check" },

  // ── Setup Type ────────────────────────────────────────────────────────────
  "setuptype.title": { es: "¿Cómo quieres instalar OpenClaw?", en: "How do you want to install OpenClaw?" },
  "setuptype.subtitle": { es: "Elige según tus necesidades. Puedes cambiar todo después.", en: "Choose based on your needs. You can change everything later." },
  "setuptype.quick.name": { es: "Inicio Rápido", en: "Quick Start" },
  "setuptype.quick.desc": { es: "Agente local con modelo Qwen 3. Gratis, sin API keys. Ideal para probar.", en: "Local agent with Qwen 3 model. Free, no API keys. Perfect for testing." },
  "setuptype.quick.tag": { es: "Gratis • Sin registro", en: "Free • No signup" },
  "setuptype.cloud.name": { es: "Cloud Setup", en: "Cloud Setup" },
  "setuptype.cloud.desc": { es: "Usa Claude, GPT-4 u otros modelos cloud. Más potente, requiere API key.", en: "Use Claude, GPT-4 or other cloud models. More powerful, requires API key." },
  "setuptype.cloud.tag": { es: "Más potente • API key requerida", en: "More powerful • API key required" },
  "setuptype.full.name": { es: "Instalación Completa", en: "Full Setup" },
  "setuptype.full.desc": { es: "Multi-canal con WhatsApp, Telegram, Discord. Configuración personalizada completa.", en: "Multi-channel with WhatsApp, Telegram, Discord. Full custom configuration." },
  "setuptype.full.tag": { es: "Todo incluido • Avanzado", en: "All included • Advanced" },

  // ── Model Selection ───────────────────────────────────────────────────────
  "model.title": { es: "Elige tu modelo de IA", en: "Choose your AI model" },
  "model.subtitle": { es: "El modelo determina la inteligencia y costo de tu agente.", en: "The model determines the intelligence and cost of your agent." },
  "model.provider": { es: "Proveedor", en: "Provider" },
  "model.select": { es: "Selecciona un modelo", en: "Select a model" },
  "model.fallback": { es: "Modelo de respaldo (opcional)", en: "Fallback model (optional)" },
  "model.fallback.desc": { es: "Se usa si el modelo principal falla o no está disponible.", en: "Used if the primary model fails or is unavailable." },
  "model.local.badge": { es: "Local • Gratis", en: "Local • Free" },
  "model.cloud.badge": { es: "Cloud • De pago", en: "Cloud • Paid" },

  // ── API Key ───────────────────────────────────────────────────────────────
  "apikey.title": { es: "Ingresa tu API Key", en: "Enter your API Key" },
  "apikey.subtitle": { es: "Necesitamos tu clave para conectar al modelo seleccionado.", en: "We need your key to connect to the selected model." },
  "apikey.label": { es: "API Key de {provider}", en: "{provider} API Key" },
  "apikey.placeholder": { es: "Pega tu API key aquí", en: "Paste your API key here" },
  "apikey.where": { es: "¿Dónde obtengo mi API key?", en: "Where do I get my API key?" },
  "apikey.guide.anthropic": { es: "Ir a console.anthropic.com → API Keys", en: "Go to console.anthropic.com → API Keys" },
  "apikey.guide.openai": { es: "Ir a platform.openai.com → API Keys", en: "Go to platform.openai.com → API Keys" },
  "apikey.guide.google": { es: "Ir a aistudio.google.com → API Keys", en: "Go to aistudio.google.com → API Keys" },
  "apikey.valid": { es: "Formato válido", en: "Valid format" },
  "apikey.invalid": { es: "Formato inválido — revisa tu clave", en: "Invalid format — check your key" },
  "apikey.security": { es: "Tu API key se guarda solo en tu computadora.", en: "Your API key is stored only on your computer." },

  // ── Channels ──────────────────────────────────────────────────────────────
  "channels.title": { es: "¿Por dónde quieres chatear?", en: "Where do you want to chat?" },
  "channels.subtitle": { es: "Selecciona uno o más canales. Puedes agregar más después.", en: "Select one or more channels. You can add more later." },
  "channels.whatsapp": { es: "WhatsApp", en: "WhatsApp" },
  "channels.whatsapp.desc": { es: "Chatea con tu agente desde WhatsApp", en: "Chat with your agent from WhatsApp" },
  "channels.telegram": { es: "Telegram", en: "Telegram" },
  "channels.telegram.desc": { es: "Crea un bot de Telegram para tu agente", en: "Create a Telegram bot for your agent" },
  "channels.discord": { es: "Discord", en: "Discord" },
  "channels.discord.desc": { es: "Agrega tu agente a un servidor de Discord", en: "Add your agent to a Discord server" },
  "channels.slack": { es: "Slack", en: "Slack" },
  "channels.slack.desc": { es: "Integra tu agente en tu workspace de Slack", en: "Integrate your agent in your Slack workspace" },
  "channels.none": { es: "Sin canal (solo API local)", en: "No channel (local API only)" },
  "channels.none.desc": { es: "Accede al agente solo vía API en localhost", en: "Access the agent only via API on localhost" },

  // ── Channel Credentials ───────────────────────────────────────────────────
  "credentials.title": { es: "Credenciales de canales", en: "Channel credentials" },
  "credentials.subtitle": { es: "Necesitamos un token/número por cada canal seleccionado.", en: "We need a token/number for each selected channel." },
  "credentials.whatsapp.label": { es: "Número de WhatsApp", en: "WhatsApp number" },
  "credentials.whatsapp.placeholder": { es: "+1234567890", en: "+1234567890" },
  "credentials.whatsapp.hint": { es: "Incluye el código de país. Ej: +52 para México.", en: "Include country code. E.g.: +1 for USA." },
  "credentials.telegram.label": { es: "Token del Bot de Telegram", en: "Telegram Bot Token" },
  "credentials.telegram.placeholder": { es: "123456789:ABCdef...", en: "123456789:ABCdef..." },
  "credentials.telegram.hint": { es: "Obtén el token creando un bot con @BotFather.", en: "Get the token by creating a bot with @BotFather." },
  "credentials.discord.label": { es: "Token del Bot de Discord", en: "Discord Bot Token" },
  "credentials.discord.placeholder": { es: "MTIz...xyz", en: "MTIz...xyz" },
  "credentials.discord.hint": { es: "Obtén el token en el Discord Developer Portal.", en: "Get the token from the Discord Developer Portal." },
  "credentials.slack.label": { es: "Token de Slack Bot", en: "Slack Bot Token" },
  "credentials.slack.placeholder": { es: "xoxb-...", en: "xoxb-..." },
  "credentials.slack.hint": { es: "Empieza con 'xoxb-'. Obtenlo en api.slack.com.", en: "Starts with 'xoxb-'. Get it at api.slack.com." },

  // ── Installing ────────────────────────────────────────────────────────────
  "installing.title": { es: "Instalando OpenClaw...", en: "Installing OpenClaw..." },
  "installing.subtitle": { es: "Esto toma entre 2 y 5 minutos. No cierres esta ventana.", en: "This takes 2 to 5 minutes. Don't close this window." },
  "installing.step.download": { es: "Descargando OpenClaw...", en: "Downloading OpenClaw..." },
  "installing.step.install": { es: "Instalando dependencias...", en: "Installing dependencies..." },
  "installing.step.config": { es: "Configurando tu agente...", en: "Configuring your agent..." },
  "installing.step.start": { es: "Iniciando servicio...", en: "Starting service..." },
  "installing.log.title": { es: "Registro de instalación", en: "Installation log" },
  "installing.error.title": { es: "Error en la instalación", en: "Installation error" },
  "installing.error.retry": { es: "Reintentar", en: "Retry" },

  // ── Success ───────────────────────────────────────────────────────────────
  "success.title": { es: "¡Listo! Tu agente está instalado", en: "Done! Your agent is installed" },
  "success.subtitle": { es: "OpenClaw está corriendo en tu computadora.", en: "OpenClaw is running on your computer." },
  "success.dashboard": { es: "Abrir Dashboard", en: "Open Dashboard" },
  "success.dashboard.desc": { es: "Accede al panel de control de tu agente", en: "Access your agent's control panel" },
  "success.docs": { es: "Ver Documentación", en: "View Documentation" },
  "success.agent.name": { es: "Nombre de tu agente", en: "Your agent's name" },
  "success.agent.model": { es: "Modelo", en: "Model" },
  "success.agent.channels": { es: "Canales", en: "Channels" },
  "success.agent.url": { es: "Dashboard URL", en: "Dashboard URL" },
  "success.tip": { es: "Tip: El agente se inicia automáticamente con tu computadora.", en: "Tip: The agent starts automatically with your computer." },
} as const;

type TranslationKey = keyof typeof translations;

// ─── Public API ───────────────────────────────────────────────────────────────

export function t(lang: Language, key: TranslationKey, vars?: Record<string, string>): string {
  const entry = translations[key];
  if (!entry) return key;

  let text: string = entry[lang] ?? entry.es;

  if (vars) {
    for (const [varKey, varValue] of Object.entries(vars)) {
      text = text.replace(`{${varKey}}`, varValue);
    }
  }

  return text;
}

export function useT(lang: Language) {
  return (key: TranslationKey, vars?: Record<string, string>) => t(lang, key, vars);
}
