# 🦞 OpenClaw One-Click Installer

Una aplicación web moderna que permite instalar y configurar **OpenClaw** (el asistente personal de IA de código abierto) en un solo clic. Genera un ejecutable personalizado que automatiza completamente la instalación con todas tus skills y bots favoritos.

## 🎯 Características

- **Wizard interactivo de 6 pasos**: Sistema → Identidad → Modelo IA → Skills → Canales → Generar
- **41 skills curadas** organizadas en 4 packs temáticos:
  - 🔧 **Developer Pack**: GitHub, Coding Agent, Debug Pro, Docker, etc.
  - 📊 **Productivity Pack**: Google Workspace, Obsidian, Summarize, Memory Hygiene
  - 🔒 **Security Pack**: AgentGuard, Prompt Guard, ClawScan, Config Guardian
  - ⭐ **Full Stack Pack**: Las 15 mejores skills recomendadas por la comunidad
  
- **5 proveedores de IA soportados**:
  - Anthropic (Claude Sonnet, Opus, Haiku)
  - OpenAI (GPT-5.2, GPT-4o)
  - Google (Gemini)
  - OpenRouter
  - Ollama (local)

- **6 canales de comunicación**:
  - WhatsApp, Telegram, Discord, Slack, Signal, WebChat

- **Ejecutable único y completo**: Descarga un archivo `.sh` que contiene toda la configuración embebida en Base64. Solo ejecuta:
  \`\`\`bash
  chmod +x install-openclaw.sh
  ./install-openclaw.sh
  \`\`\`

- **Interfaz Terminal Noir**: Estética cinematográfica inspirada en Mr. Robot y The Matrix con verde neón y rojo coral

## 🚀 Cómo usar

1. **Abre la aplicación** en tu navegador
2. **Configura tu agente** a través del wizard:
   - Elige tu plataforma (macOS, Linux, Windows WSL2)
   - Personaliza nombre, emoji y personalidad
   - Selecciona proveedor de IA y modelo
   - Elige skills y packs
   - Selecciona canales de comunicación
3. **Descarga el ejecutable** (\`install-openclaw.sh\`)
4. **Ejecuta en tu terminal**:
   \`\`\`bash
   chmod +x install-openclaw.sh
   ./install-openclaw.sh
   \`\`\`
5. **¡Listo!** OpenClaw estará instalado con todas tus configuraciones

## 📋 Requisitos

- Node.js 22+ (se instala automáticamente si no lo tienes)
- macOS, Linux, o Windows con WSL2
- Conexión a internet

## 🏗️ Stack Técnico

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Routing**: Wouter
- **Build**: Vite
- **Styling**: Terminal Noir (OKLCH colors, custom theme)

## 📁 Estructura del Proyecto

\`\`\`
client/
  ├── public/          # Archivos estáticos
  ├── src/
  │   ├── pages/       # Páginas principales
  │   ├── components/  # Componentes reutilizables
  │   ├── hooks/       # Custom hooks
  │   ├── lib/         # Utilidades
  │   └── index.css    # Estilos globales
  └── index.html       # Template HTML
\`\`\`

## 🔧 Desarrollo

\`\`\`bash
pnpm install
pnpm dev
pnpm build
\`\`\`

## 📝 Licencia

MIT License - Ver LICENSE para detalles

---

**Hecho con ❤️ para la comunidad de OpenClaw**
