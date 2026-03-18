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
  "common.understood": { es: "Entendido", en: "Got it" },
  "common.openLink": { es: "Abrir", en: "Open" },

  // ── TitleBar ──────────────────────────────────────────────────────────────
  "titlebar.title": { es: "OpenClaw Setup Manager", en: "OpenClaw Setup Manager" },

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
  "welcome.title": { es: "Prepara OpenClaw\npaso a paso", en: "Set up OpenClaw\nstep by step" },
  "welcome.subtitle": {
    es: "Diagnóstico guiado, configuración segura\ny validación completa de tu entorno.",
    en: "Guided diagnosis, secure configuration\nand full environment validation.",
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
  "welcome.steps.5": { es: "Despliegue guiado y validación final", en: "Guided deployment and final validation" },
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
  "systemcheck.ollama": { es: "Ollama", en: "Ollama" },
  "systemcheck.ollama.ok": { es: "Ollama {version} instalado", en: "Ollama {version} installed" },
  "systemcheck.ollama.missing": { es: "Ollama no encontrado (opcional)", en: "Ollama not found (optional)" },
  "systemcheck.docker": { es: "Docker (opcional)", en: "Docker (optional)" },
  "systemcheck.docker.ok": { es: "Docker {version} corriendo", en: "Docker {version} running" },
  "systemcheck.docker.installed_not_running": { es: "Docker instalado pero no corriendo", en: "Docker installed but not running" },
  "systemcheck.docker.missing": { es: "Docker no encontrado (opcional)", en: "Docker not found (optional)" },
  "systemcheck.fix.node": { es: "Descarga Node.js desde nodejs.org", en: "Download Node.js from nodejs.org" },
  "systemcheck.fix.port": { es: "Cierra otros programas o reinicia el sistema", en: "Close other programs or restart the system" },
  "systemcheck.fix.disk": { es: "Libera espacio en disco (necesitas 5GB)", en: "Free up disk space (need 5GB)" },
  "systemcheck.fix.docker": { es: "Abre Docker Desktop o instálalo desde docker.com", en: "Open Docker Desktop or install it from docker.com" },
  "systemcheck.fix.ollama": { es: "Descarga Ollama desde ollama.ai para usar modelos locales", en: "Download Ollama from ollama.ai to use local models" },
  "systemcheck.allGood": { es: "¡Todo listo!", en: "All good!" },
  "systemcheck.hasErrors": { es: "Hay problemas que resolver", en: "There are issues to resolve" },
  "systemcheck.hasWarnings": { es: "Listo, con algunas recomendaciones", en: "Ready, with some recommendations" },
  "systemcheck.continue": { es: "Continuar", en: "Continue" },
  "systemcheck.fixAndRetry": { es: "Corregir y volver a verificar", en: "Fix and re-check" },

  // ── Diagnostic categories ───────────────────────────────────────────────
  "diag.category.os": { es: "Sistema Operativo", en: "Operating System" },
  "diag.category.docker": { es: "Docker", en: "Docker" },
  "diag.category.ollama": { es: "Ollama", en: "Ollama" },
  "diag.category.network": { es: "Red y Puertos", en: "Network & Ports" },
  "diag.category.storage": { es: "Almacenamiento", en: "Storage" },
  "diag.category.permissions": { es: "Permisos", en: "Permissions" },

  // ── Severity labels ─────────────────────────────────────────────────────
  "diag.severity.critical": { es: "Crítico", en: "Critical" },
  "diag.severity.recommended": { es: "Recomendado", en: "Recommended" },
  "diag.severity.optional": { es: "Opcional", en: "Optional" },

  // ── Diagnostic statuses ─────────────────────────────────────────────────
  "diag.status.ready": { es: "Listo", en: "Ready" },
  "diag.status.missing": { es: "Falta", en: "Missing" },
  "diag.status.recommended": { es: "Recomendado", en: "Recommended" },
  "diag.status.incompatible": { es: "No compatible", en: "Incompatible" },
  "diag.status.review": { es: "Revisar", en: "Review" },

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
  "model.warning.anthropic.title": { es: "⚠️ Riesgo de baneo de cuenta Anthropic", en: "⚠️ Risk of Anthropic account ban" },
  "model.warning.anthropic.description": { es: "Se han reportado casos de baneos permanentes de cuentas de Anthropic por usar OpenClaw. Usuarios con suscripciones pagadas también han sido afectados.", en: "There have been reports of permanent Anthropic account bans for using OpenClaw. Users with paid subscriptions have also been affected." },
  "model.warning.anthropic.point1": { es: "Anthropic detecta clientes de terceros que usan contextos de larga duración", en: "Anthropic detects third-party clients using long-duration contexts" },
  "model.warning.anthropic.point2": { es: "El uso puede violar los Términos de Servicio de Anthropic", en: "Using OpenClaw may violate Anthropic's Terms of Service" },
  "model.warning.anthropic.point3": { es: "No hay proceso de apelación una vez baneado", en: "No clear appeals process once banned" },
  "model.warning.gemini.title": { es: "⚠️ Riesgo de baneo de cuenta Google", en: "⚠️ Risk of Google account ban" },
  "model.warning.gemini.description": { es: "Múltiples usuarios han reportado baneos permanentes de cuentas de Google por integrar Gemini con OpenClaw. Esto afecta toda la cuenta, incluyendo Gmail y Drive.", en: "Multiple users report permanent Google account bans for integrating Gemini with OpenClaw. This affects entire account including Gmail and Drive." },
  "model.warning.gemini.point1": { es: "El baneo afecta toda la cuenta Google, no solo Gemini", en: "Ban affects entire Google account, not just Gemini" },
  "model.warning.gemini.point2": { es: "Cuentas antiguas y premium también han sido baneadas", en: "Old accounts and premium accounts have been banned" },
  "model.warning.gemini.point3": { es: "Error típico: 'Gemini has been disabled for violation of Terms of Service'", en: "Typical error: 'Gemini has been disabled for violation of Terms of Service'" },

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
  "channels.warning.title": { es: "Sin canales configurados", en: "No channels configured" },
  "channels.warning.desc": { es: "Tu agente funcionará pero no podrás interactuar con él desde WhatsApp, Telegram, Discord o Slack. Podrás acceder solo a través del dashboard.", en: "Your agent will run but you won't be able to interact with it from WhatsApp, Telegram, Discord, or Slack. You can only access it through the dashboard." },

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
  "installing.almostDone": { es: "¡Casi listo!", en: "Almost done!" },
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

  // ── Deployment ────────────────────────────────────────────────────────────
  "deployment.title": { es: "Elige tu entorno de instalación", en: "Choose your installation environment" },
  "deployment.subtitle": { es: "El entorno determina el nivel de seguridad y aislamiento de OpenClaw.", en: "The environment determines the security and isolation level of OpenClaw." },
  "deployment.platform": { es: "Tu sistema", en: "Your system" },

  // Local
  "deployment.local.title": { es: "Instalación local directa", en: "Direct local install" },
  "deployment.local.desc": { es: "Instala OpenClaw en tu sistema usando npm. Rápido y sencillo, sin dependencias extra.", en: "Install OpenClaw on your system using npm. Fast and simple, no extra dependencies." },
  "deployment.local.desc.windows": { es: "Opción recomendada para Windows. Instala directamente con npm, sin Docker. Funciona en todas las versiones de Windows.", en: "Recommended option for Windows. Installs directly with npm, no Docker. Works on all Windows versions." },
  "deployment.local.badge.windows": { es: "Recomendado para Windows", en: "Recommended for Windows" },
  "deployment.local.warning": { es: "OpenClaw correrá directamente en tu sistema. Asegúrate de no ejecutarlo con privilegios de administrador.", en: "OpenClaw will run directly on your system. Make sure not to run it with administrator privileges." },
  "deployment.local.warning.windows": { es: "Para mayor seguridad, no ejecutes como Administrador. Guarda tus API keys en variables de entorno, no en archivos de texto.", en: "For better security, don't run as Administrator. Store your API keys as environment variables, not in text files." },

  // Docker
  "deployment.docker.title": { es: "Contenedor Docker", en: "Docker container" },
  "deployment.docker.desc": { es: "Ejecuta OpenClaw dentro de un contenedor aislado. Recomendado para mayor seguridad: el agente no tiene acceso directo a tu sistema.", en: "Run OpenClaw inside an isolated container. Recommended for better security: the agent has no direct access to your system." },
  "deployment.docker.badge": { es: "Recomendado — Mayor seguridad", en: "Recommended — Better security" },
  "deployment.docker.missing.title": { es: "Docker no está instalado", en: "Docker is not installed" },
  "deployment.docker.missing.desc": { es: "Para usar esta opción, instala Docker Desktop primero. Es gratuito y tarda unos minutos.", en: "To use this option, install Docker Desktop first. It's free and takes a few minutes." },
  "deployment.docker.missing.link": { es: "Instalar Docker →", en: "Install Docker →" },
  "deployment.docker.notrunning": { es: "Docker está instalado pero no está activo. Ábrelo antes de continuar (busca Docker Desktop en tus aplicaciones).", en: "Docker is installed but not running. Open it before continuing (look for Docker Desktop in your applications)." },

  // WSL2
  "deployment.wsl2.title": { es: "WSL2 + Docker (Windows avanzado)", en: "WSL2 + Docker (Advanced Windows)" },
  "deployment.wsl2.desc": { es: "Usa el subsistema Linux de Windows para correr OpenClaw en un contenedor Docker real. Mayor seguridad que la instalación local, pero requiere más configuración.", en: "Use Windows Subsystem for Linux to run OpenClaw in a real Docker container. Better security than local install, but requires more setup." },
  "deployment.wsl2.badge": { es: "Avanzado", en: "Advanced" },
  "deployment.wsl2.warning": { es: "Esta opción requiere que Docker Desktop esté corriendo con la integración de WSL2 habilitada. Ve a Docker Desktop → Settings → Resources → WSL Integration.", en: "This option requires Docker Desktop running with WSL2 integration enabled. Go to Docker Desktop → Settings → Resources → WSL Integration." },

  // ── Security Setup ────────────────────────────────────────────────────────
  "security.title": { es: "Configuración de seguridad", en: "Security setup" },
  "security.subtitle": { es: "Protege tu instalación de OpenClaw con estas configuraciones esenciales.", en: "Protect your OpenClaw installation with these essential settings." },

  "security.item.localhost.title": { es: "Solo localhost", en: "Localhost only" },
  "security.item.localhost.desc": { es: "Gateway ligado a 127.0.0.1, nunca expuesto a internet.", en: "Gateway bound to 127.0.0.1, never exposed to the internet." },
  "security.item.isolation.title": { es: "Aislamiento", en: "Isolation" },
  "security.item.isolation.docker": { es: "Contenedor Docker aislado del sistema host.", en: "Docker container isolated from the host system." },
  "security.item.isolation.local": { es: "Instalación local. Evita ejecutar como root/administrador.", en: "Local install. Avoid running as root/administrator." },
  "security.item.auth.title": { es: "Autenticación", en: "Authentication" },
  "security.item.auth.desc": { es: "Token de acceso para el gateway configurado.", en: "Access token for the gateway configured." },
  "security.item.update.title": { es: "Actualizaciones", en: "Updates" },
  "security.item.update.desc": { es: "Mantén OpenClaw actualizado para recibir parches de seguridad.", en: "Keep OpenClaw updated to receive security patches." },

  "security.token.title": { es: "Token de acceso al gateway", en: "Gateway access token" },
  "security.token.enable": { es: "Activar", en: "Enable" },
  "security.token.desc": { es: "Este token protege el dashboard y la API de OpenClaw. Guárdalo en un lugar seguro.", en: "This token protects the OpenClaw dashboard and API. Store it in a safe place." },
  "security.token.regenerate": { es: "Generar nuevo token", en: "Generate new token" },
  "security.token.ok": { es: "Token válido", en: "Valid token" },
  "security.token.disabled.warning": { es: "⚠️ Sin token de acceso cualquier persona en tu red local puede controlar tu agente. No recomendado.", en: "⚠️ Without an access token, anyone on your local network can control your agent. Not recommended." },

  "security.note.title": { es: "Buenas prácticas", en: "Best practices" },
  "security.note.desc": { es: "OpenClaw corre solo en localhost. Usa SSH tunneling o Tailscale si necesitas acceso remoto. Nunca expongas el puerto 18789 directamente a internet.", en: "OpenClaw runs only on localhost. Use SSH tunneling or Tailscale for remote access. Never expose port 18789 directly to the internet." },

  // ── Welcome stats ─────────────────────────────────────────────────────────
  "welcome.stats.stars":     { es: "GitHub Stars", en: "GitHub Stars" },
  "welcome.stats.skills":    { es: "Skills Curadas", en: "Curated Skills" },
  "welcome.stats.channels":  { es: "Canales", en: "Channels" },
  "welcome.stats.providers": { es: "Proveedores IA", en: "AI Providers" },

  // ── Installing — pasos Docker ─────────────────────────────────────────────
  "installing.step.docker.pull": { es: "Descargando imagen Docker...", en: "Pulling Docker image..." },
  "installing.step.docker.run": { es: "Iniciando contenedor...", en: "Starting container..." },
  "installing.step.docker.config": { es: "Configurando contenedor...", en: "Configuring container..." },

  // ── Installing — Inicialización ───────────────────────────────────────────
  "installing.initializing": { es: "Inicializando instalación", en: "Initializing installation" },
  "installing.initializing.subtitle": { es: "Preparando configuración...", en: "Preparing configuration..." },
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
