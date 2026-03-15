# OpenClaw Easy Installer

Aplicación Desktop para instalar y configurar [OpenClaw](https://github.com/openclaw/openclaw) sin conocimientos técnicos.

> Desktop app to install and configure OpenClaw without technical knowledge.

---

## ¿Qué hace? / What does it do?

Guía paso a paso al usuario a través de:

1. **Verificación del sistema** — Node.js 22+, puerto libre, espacio en disco
2. **Tipo de instalación** — Quick Start (local gratis), Cloud (Claude/GPT), Full
3. **Nombre del agente** — Personaliza tu asistente con nombre y emoji
4. **Modelo de IA** — 14 modelos disponibles (Anthropic, OpenAI, Google, Ollama local)
5. **API Key** — Con guía de obtención por proveedor
6. **Canales** — WhatsApp, Telegram, Discord, Slack
7. **Credenciales** — Con guías visuales paso a paso por canal
8. **Instalación automática** — npm install + openclaw config con progreso en tiempo real
9. **Dashboard** — Abre en `http://127.0.0.1:18789` al terminar

---

## Tech Stack

- **Electron 33** — Aplicación desktop cross-platform
- **React 18** + **TypeScript** — UI reactiva con tipos
- **Vite** via **electron-vite** — Build moderno y HMR en dev
- **Tailwind CSS 3** — Tema dark con verde neon
- **framer-motion** — Animaciones de transición entre pasos
- **shadcn/ui** (Radix UI) — Componentes accesibles

---

## Desarrollo / Development

```bash
# Instalar dependencias
pnpm install

# Desarrollo con hot-reload
pnpm dev

# Verificar TypeScript
pnpm check

# Build de producción
pnpm build
```

---

## Packaging

```bash
# Todos los sistemas (requiere ambiente adecuado)
pnpm package

# Solo Windows (.exe NSIS installer)
pnpm package:win

# Solo macOS (.dmg)
pnpm package:mac

# Solo Linux (AppImage + .deb)
pnpm package:linux
```

> **Nota:** Agrega los iconos en `build/` antes de empaquetar. Ver `build/README.md`.

---

## Estructura del Proyecto

```
src/
├── main/                     # Electron main process
│   ├── index.ts              # Entry point, BrowserWindow
│   └── handlers/
│       ├── system.handler.ts # Verificación del sistema
│       ├── install.handler.ts# Ejecuta instalación
│       └── config.handler.ts # Persistencia de configuración
├── preload/
│   └── preload.ts            # API segura para el renderer
├── renderer/                 # React UI
│   ├── pages/                # 9 páginas del wizard
│   ├── components/           # TitleBar, StepIndicator, GuideModal, etc.
│   │   └── ChannelGuide/     # Guías por canal (WhatsApp, Telegram, Discord, Slack)
│   ├── context/              # LanguageContext, InstallationContext
│   ├── lib/                  # i18n, models, validation, error-messages
│   └── styles/globals.css    # Tema dark
└── types/index.ts            # Tipos compartidos
```

---

## i18n

La app soporta **Español** e **Inglés**. El idioma se detecta automáticamente del sistema operativo y se puede cambiar en cualquier paso del wizard.

---

## Licencia / License

MIT © OpenClaw
