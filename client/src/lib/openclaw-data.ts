/*
 * ============================================================
 * DESIGN: Terminal Noir — Cyberpunk Hacker Cinema UI
 * This data file powers the OpenClaw One-Click Installer.
 * All skills, packs, and config templates are defined here.
 * ============================================================
 */

export interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: SkillCategory;
  recommended: boolean;
  essential: boolean;
  downloads?: string;
  requiresApiKey?: boolean;
  apiKeyName?: string;
  requiresOAuth?: boolean;
}

export type SkillCategory =
  | "search"
  | "coding"
  | "data"
  | "devops"
  | "productivity"
  | "communication"
  | "security"
  | "browser"
  | "ai-ml";

export interface SkillPack {
  id: string;
  name: string;
  description: string;
  icon: string;
  skills: string[];
  color: "green" | "red" | "cyan";
}

export interface ChannelConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  requiresToken?: boolean;
  tokenName?: string;
  requiresPhoneNumber?: boolean;
}

export interface ModelProvider {
  id: string;
  name: string;
  models: { id: string; name: string; recommended?: boolean }[];
  requiresApiKey: boolean;
  apiKeyName: string;
  apiKeyUrl?: string;
}

// ─── SKILL CATALOG ──────────────────────────────────────────

export const SKILLS: Skill[] = [
  // Search & Research
  { id: "tavily-web-search", name: "Tavily Web Search", slug: "tavily-web-search", description: "Búsqueda web optimizada para agentes IA con resultados estructurados", category: "search", recommended: true, essential: true, downloads: "50K+", requiresApiKey: true, apiKeyName: "TAVILY_API_KEY" },
  { id: "google-search", name: "Google Search", slug: "google-search", description: "Búsqueda via Google Custom Search Engine API", category: "search", recommended: false, essential: false, requiresApiKey: true, apiKeyName: "GOOGLE_CSE_API_KEY" },
  { id: "exa-web-search-free", name: "Exa Web Search", slug: "exa-web-search-free", description: "Búsqueda web gratuita con IA via Exa", category: "search", recommended: true, essential: false, downloads: "15K+" },
  { id: "arxiv-watcher", name: "ArXiv Watcher", slug: "arxiv-watcher", description: "Monitorea papers nuevos de ArXiv por temas o autores", category: "search", recommended: false, essential: false },
  { id: "pubmed-edirect", name: "PubMed E-Direct", slug: "pubmed-edirect", description: "Consulta literatura biomédica revisada por pares", category: "search", recommended: false, essential: false },
  { id: "brightdata", name: "Bright Data", slug: "brightdata", description: "Web scraping avanzado con manejo de anti-bot", category: "search", recommended: false, essential: false, requiresApiKey: true, apiKeyName: "BRIGHTDATA_API_KEY" },
  { id: "web-scraper", name: "Web Scraper as a Service", slug: "web-scraper-as-a-service", description: "Construye scrapers con output de datos limpio", category: "search", recommended: false, essential: false },

  // Coding & Dev
  { id: "github", name: "GitHub", slug: "github", description: "Gestiona repos, issues, PRs y workflows de GitHub", category: "coding", recommended: true, essential: true, downloads: "100K+", requiresOAuth: true },
  { id: "coding-agent", name: "Coding Agent", slug: "coding-agent", description: "Ejecuta herramientas de código (Codex, Claude Code) unificadas", category: "coding", recommended: true, essential: false, downloads: "30K+" },
  { id: "debug-pro", name: "Debug Pro", slug: "debug-pro", description: "Metodología de debugging estructurada y sistemática", category: "coding", recommended: true, essential: false, downloads: "20K+" },
  { id: "test-runner", name: "Test Runner", slug: "test-runner", description: "Escribe y ejecuta tests en múltiples lenguajes", category: "coding", recommended: false, essential: false },
  { id: "cc-godmode", name: "CC GodMode", slug: "cc-godmode", description: "Orquesta trabajo multi-agente para tareas complejas", category: "coding", recommended: false, essential: false },
  { id: "buildlog", name: "BuildLog", slug: "buildlog", description: "Registra sesiones de código como logs compartibles", category: "coding", recommended: false, essential: false },

  // Data & Analytics
  { id: "duckdb", name: "DuckDB", slug: "duckdb", description: "Analytics rápido sobre CSV, Parquet y JSON", category: "data", recommended: true, essential: false, downloads: "25K+" },
  { id: "csv-toolkit", name: "CSV Toolkit", slug: "faahim/csv-toolkit", description: "Herramientas completas para manipulación de CSV", category: "data", recommended: false, essential: false },
  { id: "senior-data-scientist", name: "Senior Data Scientist", slug: "senior-data-scientist", description: "Análisis de datos avanzado con metodología científica", category: "data", recommended: false, essential: false },
  { id: "data-analyst", name: "Data Analyst", slug: "data-analyst", description: "Análisis de datos y generación de reportes", category: "data", recommended: false, essential: false },
  { id: "hugging-face-datasets", name: "Hugging Face Datasets", slug: "hugging-face-datasets", description: "Accede a datasets de Hugging Face directamente", category: "data", recommended: false, essential: false },

  // DevOps & Infra
  { id: "docker-essentials", name: "Docker Essentials", slug: "docker-essentials", description: "Gestión de contenedores Docker", category: "devops", recommended: true, essential: false, downloads: "18K+" },
  { id: "k8-multicluster", name: "K8s MultiCluster", slug: "k8-multicluster", description: "Gestión de clusters Kubernetes multi-entorno", category: "devops", recommended: false, essential: false },
  { id: "aws-infra", name: "AWS Infra", slug: "aws-infra", description: "Gestión de infraestructura AWS", category: "devops", recommended: false, essential: false, requiresApiKey: true, apiKeyName: "AWS_ACCESS_KEY" },
  { id: "nginx-config", name: "Nginx Config Creator", slug: "nginx-config-creator", description: "Genera configuraciones Nginx optimizadas", category: "devops", recommended: false, essential: false },

  // Productivity & Knowledge
  { id: "gog", name: "Google Workspace", slug: "gog", description: "Integración completa con Google Docs, Sheets, Drive", category: "productivity", recommended: true, essential: true, downloads: "80K+", requiresOAuth: true },
  { id: "summarize", name: "Summarize", slug: "summarize", description: "Resúmenes inteligentes de contenido largo", category: "productivity", recommended: true, essential: true, downloads: "60K+" },
  { id: "obsidian", name: "Obsidian", slug: "obsidian", description: "Integración con tu vault de Obsidian como base de conocimiento", category: "productivity", recommended: true, essential: false, downloads: "35K+" },
  { id: "notion", name: "Notion", slug: "notion", description: "Gestiona páginas y bases de datos de Notion", category: "productivity", recommended: false, essential: false, requiresApiKey: true, apiKeyName: "NOTION_API_KEY" },
  { id: "logseq", name: "Logseq", slug: "logseq", description: "Integración con tu grafo de conocimiento Logseq", category: "productivity", recommended: false, essential: false },
  { id: "memory-hygiene", name: "Memory Hygiene", slug: "memory-hygiene", description: "Gestión y limpieza de memoria del agente", category: "productivity", recommended: true, essential: false },

  // Communication
  { id: "agentmail", name: "AgentMail", slug: "agentmail", description: "Infraestructura de email para agentes IA", category: "communication", recommended: true, essential: false, downloads: "22K+", requiresApiKey: true, apiKeyName: "AGENTMAIL_API_KEY" },
  { id: "mailchannels", name: "MailChannels", slug: "mailchannels", description: "Envío de emails transaccionales", category: "communication", recommended: false, essential: false },
  { id: "discord-voice", name: "Discord Voice", slug: "discord-voice", description: "Integración de voz para Discord", category: "communication", recommended: false, essential: false },
  { id: "clawsignal", name: "ClawSignal", slug: "clawsignal", description: "Notificaciones push para OpenClaw", category: "communication", recommended: false, essential: false },

  // Security
  { id: "agentguard", name: "AgentGuard", slug: "agentguard", description: "Protección y monitoreo de seguridad del agente", category: "security", recommended: true, essential: true, downloads: "40K+" },
  { id: "prompt-guard", name: "Prompt Guard", slug: "prompt-guard", description: "Protección contra inyección de prompts", category: "security", recommended: true, essential: false, downloads: "28K+" },
  { id: "clawscan", name: "ClawScan", slug: "clawscan", description: "Escanea skills en busca de código malicioso", category: "security", recommended: true, essential: false, downloads: "15K+" },
  { id: "config-guardian", name: "Config Guardian", slug: "config-guardian", description: "Monitorea y protege tu configuración", category: "security", recommended: false, essential: false },

  // Browser Automation
  { id: "playwright-mcp", name: "Playwright MCP", slug: "playwright-mcp", description: "Automatización completa del navegador", category: "browser", recommended: true, essential: false, downloads: "45K+" },
  { id: "playwright-scraper", name: "Playwright Scraper", slug: "playwright-scraper-skill", description: "Web scraping con protección anti-bot", category: "browser", recommended: false, essential: false },
  { id: "agent-browser", name: "Agent Browser", slug: "agent-browser", description: "Navegación web autónoma para el agente", category: "browser", recommended: false, essential: false },

  // AI/ML
  { id: "capability-evolver", name: "Capability Evolver", slug: "capability-evolver", description: "Auto-mejora de capacidades del agente", category: "ai-ml", recommended: false, essential: false },
  { id: "self-improving", name: "Self-Improving Agent", slug: "self-improving-agent", description: "El agente aprende y mejora con el uso", category: "ai-ml", recommended: false, essential: false },
];

// ─── SKILL PACKS ────────────────────────────────────────────

export const SKILL_PACKS: SkillPack[] = [
  {
    id: "developer",
    name: "Developer Pack",
    description: "Todo lo que un desarrollador necesita: GitHub, coding, debugging, testing y Docker",
    icon: "terminal",
    skills: ["github", "coding-agent", "debug-pro", "test-runner", "docker-essentials", "duckdb", "playwright-mcp"],
    color: "green",
  },
  {
    id: "productivity",
    name: "Productivity Pack",
    description: "Máxima productividad: Google Workspace, Obsidian, resúmenes y gestión de memoria",
    icon: "zap",
    skills: ["gog", "summarize", "obsidian", "memory-hygiene", "agentmail", "tavily-web-search"],
    color: "cyan",
  },
  {
    id: "security",
    name: "Security Pack",
    description: "Protege tu agente: guardia, escaneo de skills, protección de prompts y config",
    icon: "shield",
    skills: ["agentguard", "prompt-guard", "clawscan", "config-guardian"],
    color: "red",
  },
  {
    id: "full-stack",
    name: "Full Stack Pack",
    description: "La configuración completa recomendada por la comunidad con las 15 mejores skills",
    icon: "layers",
    skills: ["github", "coding-agent", "debug-pro", "tavily-web-search", "exa-web-search-free", "gog", "summarize", "obsidian", "memory-hygiene", "agentguard", "prompt-guard", "clawscan", "playwright-mcp", "duckdb", "docker-essentials"],
    color: "green",
  },
];

// ─── CHANNELS ───────────────────────────────────────────────

export const CHANNELS: ChannelConfig[] = [
  { id: "whatsapp", name: "WhatsApp", icon: "message-circle", description: "Conecta via WhatsApp Web QR", requiresPhoneNumber: true },
  { id: "telegram", name: "Telegram", icon: "send", description: "Conecta via Telegram Bot Token", requiresToken: true, tokenName: "TELEGRAM_BOT_TOKEN" },
  { id: "discord", name: "Discord", icon: "hash", description: "Conecta via Discord Bot Token", requiresToken: true, tokenName: "DISCORD_BOT_TOKEN" },
  { id: "slack", name: "Slack", icon: "slack", description: "Conecta via Slack Bot + App Token", requiresToken: true, tokenName: "SLACK_BOT_TOKEN" },
  { id: "signal", name: "Signal", icon: "lock", description: "Conecta via Signal CLI", requiresPhoneNumber: true },
  { id: "webchat", name: "WebChat", icon: "globe", description: "Chat web integrado en el dashboard" },
];

// ─── MODEL PROVIDERS ────────────────────────────────────────

export const MODEL_PROVIDERS: ModelProvider[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    models: [
      { id: "anthropic/claude-sonnet-4-5", name: "Claude Sonnet 4.5", recommended: true },
      { id: "anthropic/claude-opus-4-6", name: "Claude Opus 4.6" },
      { id: "anthropic/claude-haiku-3-5", name: "Claude Haiku 3.5" },
    ],
    requiresApiKey: true,
    apiKeyName: "ANTHROPIC_API_KEY",
    apiKeyUrl: "https://console.anthropic.com/",
  },
  {
    id: "openai",
    name: "OpenAI",
    models: [
      { id: "openai/gpt-5.2", name: "GPT-5.2" },
      { id: "openai/gpt-4o", name: "GPT-4o", recommended: true },
      { id: "openai/gpt-4o-mini", name: "GPT-4o Mini" },
    ],
    requiresApiKey: true,
    apiKeyName: "OPENAI_API_KEY",
    apiKeyUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "google",
    name: "Google",
    models: [
      { id: "google/gemini-3-flash-preview", name: "Gemini 3 Flash" },
      { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro" },
    ],
    requiresApiKey: true,
    apiKeyName: "GOOGLE_AI_API_KEY",
    apiKeyUrl: "https://aistudio.google.com/apikey",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    models: [
      { id: "openrouter/auto", name: "Auto (mejor modelo disponible)", recommended: true },
    ],
    requiresApiKey: true,
    apiKeyName: "OPENROUTER_API_KEY",
    apiKeyUrl: "https://openrouter.ai/keys",
  },
  {
    id: "ollama",
    name: "Ollama (Local)",
    models: [
      { id: "ollama/llama3.3", name: "Llama 3.3 70B" },
      { id: "ollama/qwen2.5", name: "Qwen 2.5" },
      { id: "ollama/deepseek-r1", name: "DeepSeek R1" },
    ],
    requiresApiKey: false,
    apiKeyName: "",
  },
];

// ─── CATEGORY METADATA ──────────────────────────────────────

export const CATEGORY_META: Record<SkillCategory, { label: string; icon: string; color: string }> = {
  search: { label: "Búsqueda & Research", icon: "search", color: "neon-green" },
  coding: { label: "Código & Dev", icon: "code", color: "neon-cyan" },
  data: { label: "Datos & Analytics", icon: "database", color: "neon-green" },
  devops: { label: "DevOps & Infra", icon: "server", color: "neon-cyan" },
  productivity: { label: "Productividad", icon: "zap", color: "neon-green" },
  communication: { label: "Comunicación", icon: "mail", color: "neon-cyan" },
  security: { label: "Seguridad", icon: "shield", color: "neon-red" },
  browser: { label: "Navegador", icon: "globe", color: "neon-cyan" },
  "ai-ml": { label: "IA / ML", icon: "brain", color: "neon-green" },
};

// ─── PLATFORMS (OS) ─────────────────────────────────────────

export const PLATFORMS = [
  { id: "macos", name: "macOS", icon: "apple" },
  { id: "linux", name: "Linux", icon: "terminal" },
  { id: "windows", name: "Windows (WSL2)", icon: "monitor" },
] as const;

export type Platform = typeof PLATFORMS[number]["id"];
