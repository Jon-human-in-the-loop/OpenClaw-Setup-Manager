# 🦞 OpenClaw Setup Manager

Una aplicación desktop de **Electron** que prepara, configura y valida **OpenClaw** (el asistente personal de IA de código abierto) mediante un flujo guiado. Genera scripts de despliegue personalizados que instalan OpenClaw **dentro de Docker**, aplicando buenas prácticas de seguridad de forma automática.

## ✅ Qué hace esta app

- ✓ Detecta tu SO (macOS, Linux, Windows WSL2)
- ✓ Valida que Docker o Ollama estén instalados
- ✓ Guía completa a través de 10 pasos interactivos
- ✓ Configura identidad, proveedor IA, skills y canales
- ✓ Genera un script bash personalizado (`deploy-openclaw.sh`)
- ✓ El script instala OpenClaw en Docker con seguridad automática
- ✓ Configura firewall en Linux
- ✓ Crea archivos de configuración seguros (`chmod 600`)

## ❌ Qué NO hace (el usuario hace)

- ❌ **NO instala Docker** — Tú lo instalas primero (guía incluida)
- ❌ **NO gestiona API keys** — Tú las proporcionas en el wizard
- ❌ **NO actualiza OpenClaw** — El usuario ejecuta `docker pull` manualmente
- ❌ **NO es ejecutable de una línea** — Son 3 pasos: preparar sistema → configurar → desplegar

---

## 🔒 Seguridad por defecto (Docker-first)

El instalador generado aplica automáticamente las siguientes medidas de seguridad:

| Medida | Descripción |
|--------|-------------|
| **Docker obligatorio** | OpenClaw corre en un contenedor aislado del sistema operativo |
| **Gateway solo localhost** | Puerto `127.0.0.1:18789` — no accesible desde la red |
| **Dashboard solo localhost** | Puerto `127.0.0.1:3000` — no accesible desde la red |
| **Token de autenticación** | Generado localmente con `openssl rand -hex 32` al instalar |
| **Filesystem read-only** | El contenedor no puede escribir fuera de sus volúmenes |
| **Sandbox activo** | `agents.defaults.sandbox.mode: non-main` para sesiones de grupo |
| **cap_drop: ALL** | Sin capacidades privilegiadas del kernel |
| **no-new-privileges** | El proceso no puede escalar privilegios |
| **API keys aisladas** | `~/.openclaw/.env` con `chmod 600`, no en variables globales |
| **Firewall** | Script configura ufw/firewalld en Linux (macOS: verifica estado) |

> **Acceso remoto**: Si necesitas acceder desde otra máquina, usa un SSH tunnel:
> ```bash
> ssh -L 3000:localhost:3000 usuario@tu-servidor
> ```

## 🎯 Características

- **Wizard interactivo de 10 pasos**:
  1. Detección del sistema (macOS, Linux, Windows WSL2)
  2. Validación de prerrequisitos (Docker/Ollama)
  3. Identidad del agente (nombre, emoji, personalidad)
  4. Selección del proveedor de IA (Anthropic, OpenAI, Google, OpenRouter, Ollama)
  5. Elección del modelo (según proveedor)
  6. Configuración de API keys (si aplica)
  7. Selección de skills (41 curadas, 4 packs temáticos)
  8. Selección de canales (WhatsApp, Telegram, Discord, Slack, Signal, WebChat)
  9. Revisión completa de la configuración
  10. Generación y descarga del script de despliegue
- **41 skills curadas** organizadas en 4 packs temáticos:
  - 🔧 **Developer Pack**: GitHub, Coding Agent, Debug Pro, Docker, etc.
  - 📊 **Productivity Pack**: Google Workspace, Obsidian, Summarize, Memory Hygiene
  - 🔒 **Security Pack**: AgentGuard, Prompt Guard, ClawScan, Config Guardian
  - ⭐ **Full Stack Pack**: Las 15 mejores skills recomendadas por la comunidad

- **5 proveedores de IA soportados**:
  - Anthropic (Claude Sonnet, Opus, Haiku)
  - OpenAI (GPT-4o, etc.)
  - Google (Gemini)
  - OpenRouter
  - Ollama (local, también en Docker)

- **6 canales de comunicación**:
  - WhatsApp, Telegram, Discord, Slack, Signal, WebChat

- **Ejecutable único y completo**: Un solo archivo `.sh` con configuración embebida en Base64

- **Interfaz Terminal Noir**: Estética cinematográfica con verde neón y rojo coral

## 🚀 Cómo usar

### Paso A: Prepare tu sistema

**Requisitos previos (el usuario instala):**
- Docker o Ollama (según tu elección en el paso 2 del wizard)
- `openssl` (pre-instalado en macOS y Linux)
- Conexión a internet

[Ver guía de instalación de Docker](#-instalación-de-docker)

### Paso B: Usa el Setup Manager

1. **Abre la aplicación desktop** (se ejecuta automáticamente al instalar el ejecutable)
2. **Sigue el wizard de 10 pasos**:
   - Detectaremos tu SO automáticamente
   - Validaremos que Docker/Ollama esté instalado
   - Configurarás tu agente, proveedor IA, skills y canales
   - Revisarás la configuración completa antes de generar
3. **Descarga el script** (`deploy-openclaw.sh`)

### Paso C: Deploy en tu máquina

4. **Ejecuta en tu terminal**:
   ```bash
   chmod +x deploy-openclaw.sh
   ./deploy-openclaw.sh
   ```
5. **El script automáticamente:**
   - Genera un token de gateway único y seguro
   - Levanta OpenClaw en Docker con seguridad aplicada
   - Configura el firewall (Linux)
   - Te muestra la URL de acceso y token de autenticación

## 📋 Requisitos del sistema (tu máquina)

- **SO**: macOS 12+, Linux (Ubuntu 20.04+, Debian 11+, etc.), o Windows con WSL2
- **Docker** o **Ollama** (elige uno en el wizard)
  - **NO** se instalan automáticamente. Tú los instalas primero (ver guía abajo)
  - El script generado valida que estén presentes
- **openssl** (pre-instalado en macOS y la mayoría de Linux)
- **Conexión a internet** (para descargar la imagen Docker y APIs de IA)

> **Nota:** Node.js **no** es un requisito del host. OpenClaw corre completamente dentro del contenedor Docker.

## 🐳 Instalación de Docker

Elige tu sistema operativo:

### macOS
```bash
# Opción 1: Usar Homebrew (recomendado)
brew install --cask docker

# Opción 2: Descargar desde Docker Desktop
# https://www.docker.com/products/docker-desktop
```

### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker  # O reinicia sesión
```

### Windows (WSL2)
```bash
# En PowerShell (como Administrador)
wsl --update
wsl --install
```
Luego instala Docker Desktop para Windows: https://www.docker.com/products/docker-desktop

---

**Valida la instalación:**
```bash
docker --version
docker run hello-world
```

## 📁 Archivos generados en el host

```
~/.openclaw/
├── openclaw.json          # Configuración del agente (chmod 600)
├── docker-compose.yml     # Compose con seguridad aplicada (chmod 600)
├── .env                   # API keys (chmod 600, referenciado por compose)
├── .gateway-token         # Token de autenticación del gateway (chmod 600)
├── workspace/             # Directorio de trabajo del agente
└── skills/                # Plugins instalados
```

## 🛠️ Gestión de OpenClaw (después de desplegar)

### Logs y estado
```bash
docker compose -f ~/.openclaw/docker-compose.yml logs -f    # Logs en tiempo real
docker compose -f ~/.openclaw/docker-compose.yml ps         # Estado del contenedor
docker exec openclaw-agent openclaw status                  # Estado de OpenClaw
```

### Control
```bash
docker compose -f ~/.openclaw/docker-compose.yml restart    # Reiniciar
docker compose -f ~/.openclaw/docker-compose.yml down       # Detener
docker compose -f ~/.openclaw/docker-compose.yml up -d      # Reanudar en background
```

### Actualización
```bash
docker compose -f ~/.openclaw/docker-compose.yml pull       # Descargar imagen nueva
docker compose -f ~/.openclaw/docker-compose.yml restart    # Reiniciar con nueva imagen
```

### Diagnóstico
```bash
docker exec openclaw-agent openclaw doctor                  # Check de salud completo
docker exec openclaw-agent openclaw config                  # Mostrar configuración actual
```

## 🏗️ Stack Técnico

- **Desktop**: Electron (multiplatform: macOS, Linux, Windows)
- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Routing**: Wouter
- **Build**: electron-vite + Vite + esbuild
- **Styling**: Terminal Noir (OKLCH colors)
- **Runtime generado**: Docker + Docker Compose

## 📁 Estructura del Proyecto

```
client/
  ├── public/          # Archivos estáticos (favicon, manifest)
  └── src/
      ├── pages/
      │   ├── Home.tsx           # Página principal del wizard
      │   └── ...                # Otras vistas
      ├── components/
      │   ├── steps/             # Componentes de cada paso del wizard
      │   │   ├── Step1SystemDetection.tsx
      │   │   ├── Step2Prerequisites.tsx
      │   │   ├── Step3AgentIdentity.tsx
      │   │   ├── Step4AIProvider.tsx
      │   │   ├── Step5Model.tsx
      │   │   ├── Step6APIKeys.tsx
      │   │   ├── Step7Skills.tsx
      │   │   ├── Step8Channels.tsx
      │   │   ├── Step9Review.tsx
      │   │   └── Step10Generate.tsx
      │   └── ...                # Componentes comunes (UI, layout)
      ├── hooks/
      │   └── useInstaller.ts    # Gestión del estado global del wizard
      ├── lib/
      │   ├── openclaw-data.ts      # Catálogo: skills, modelos, canales, proveedores
      │   ├── script-generator.ts   # Generador de scripts bash + docker-compose
      │   └── system-detection.ts   # Detección del SO y validación de prereqs
      └── index.css    # Tema Terminal Noir (OKLCH colors)
server/
  └── index.ts         # Express — sirve el SPA React
```

## 🔧 Desarrollo

```bash
pnpm install
pnpm dev        # Servidor de desarrollo en localhost:3000
pnpm build      # Build de producción
pnpm check      # Verificar TypeScript
```

## 📝 Licencia

MIT License - Ver LICENSE para detalles

---

**Hecho con ❤️ para la comunidad de OpenClaw**

## 🤝 Contribuye

¿Encontraste un bug o tienes una idea? [Abre un issue](https://github.com/jonathancreates/OpenClaw-oneclick/issues) o envía un PR.

---

> **Última actualización:** Marzo 2026 | README honesto sobre capacidades y limitaciones
