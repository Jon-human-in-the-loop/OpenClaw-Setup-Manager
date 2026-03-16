# OpenClaw Easy Installer

Aplicación Desktop para instalar y configurar [OpenClaw](https://github.com/openclaw/openclaw) sin conocimientos técnicos.

> Desktop app to install and configure OpenClaw without technical knowledge.

---

## 🔒 Seguridad por defecto (Docker-first)

A partir de la Fase 2, la instalación se realiza **dentro de Docker** desde el primer momento. Esto aplica automáticamente las mejores prácticas de seguridad:

| Medida | Descripción |
|--------|-------------|
| **Docker obligatorio** | OpenClaw corre aislado en un contenedor |
| **Gateway solo localhost** | Puerto `127.0.0.1:18789` — no accesible desde la red |
| **Dashboard solo localhost** | Puerto `127.0.0.1:3000` — no accesible desde la red |
| **Token de autenticación** | Generado localmente con crypto.getRandomValues() |
| **Filesystem read-only** | El contenedor no puede escribir fuera de sus volúmenes |
| **Sandbox activo** | `agents.defaults.sandbox.mode: non-main` para sesiones de grupo |
| **cap_drop: ALL** | Sin capacidades privilegiadas del kernel |
| **no-new-privileges** | El proceso no puede escalar privilegios |
| **API keys aisladas** | `~/.openclaw/.env` con chmod 600, no en variables globales |

### Instalación de Docker automática
El instalador detecta el SO e instala Docker si no está presente:
- **Linux**: Script oficial de Docker Inc. (get.docker.com)
- **macOS**: Docker Desktop (Intel o Apple Silicon)
- **Windows WSL2**: docker.io + docker-compose-v2 via apt

---

## ¿Qué hace? / What does it do?

Guía paso a paso al usuario a través de:

1. **Verificación del sistema** — Docker, puerto libre, espacio en disco
2. **Tipo de instalación** — Quick Start (local gratis), Cloud (Claude/GPT), Full
3. **Nombre del agente** — Personaliza tu asistente con nombre y emoji
4. **Modelo de IA** — 14 modelos disponibles (Anthropic, OpenAI, Google, Ollama local)
5. **API Key** — Con guía de obtención por proveedor
6. **Canales** — WhatsApp, Telegram, Discord, Slack
7. **Credenciales** — Con guías visuales paso a paso por canal
8. **Instalación automática** — Docker setup + OpenClaw containerizado con progreso en tiempo real
9. **Dashboard** — Abre en `http://127.0.0.1:3000` al terminar

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
│       ├── install.handler.ts# Ejecuta instalación con Docker
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

## Archivos generados en ~/.openclaw/

Después de instalar, el usuario tendrá:

```
~/.openclaw/
├── openclaw.json          # Configuración del agente (chmod 600)
├── docker-compose.yml     # Compose con seguridad aplicada (chmod 600)
├── .env                   # API keys (chmod 600)
├── .gateway-token         # Token de autenticación del gateway (chmod 600)
├── workspace/             # Directorio de trabajo del agente
└── skills/                # Plugins instalados
```

---

## Comandos Docker útiles

```bash
# Gestión del contenedor
docker compose -f ~/.openclaw/docker-compose.yml logs -f    # Logs en tiempo real
docker compose -f ~/.openclaw/docker-compose.yml down       # Detener
docker compose -f ~/.openclaw/docker-compose.yml restart    # Reiniciar

# Diagnóstico
docker exec openclaw-agent openclaw doctor
docker exec openclaw-agent openclaw status

# Acceso remoto seguro (SSH tunnel)
ssh -L 3000:localhost:3000 usuario@servidor
```

---

## i18n

La app soporta **Español** e **Inglés**. El idioma se detecta automáticamente del sistema operativo y se puede cambiar en cualquier paso del wizard.

---

## Licencia / License

MIT © OpenClaw
