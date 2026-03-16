# 🦞 OpenClaw One-Click Installer

Una aplicación web moderna que genera scripts de instalación personalizados para **OpenClaw** (el asistente personal de IA de código abierto). Los scripts instalan OpenClaw **dentro de Docker** desde el primer momento, aplicando buenas prácticas de seguridad de forma automática.

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

- **Wizard interactivo de 6 pasos**: Sistema → Identidad → Modelo IA → Skills → Canales → Generar
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

1. **Abre la aplicación** en tu navegador
2. **Configura tu agente** a través del wizard:
   - Elige tu plataforma (macOS, Linux, Windows WSL2)
   - Personaliza nombre, emoji y personalidad
   - Selecciona proveedor de IA y modelo
   - Elige skills y packs
   - Selecciona canales de comunicación
3. **Descarga el ejecutable** (`install-openclaw.sh`)
4. **Ejecuta en tu terminal**:
   ```bash
   chmod +x install-openclaw.sh
   ./install-openclaw.sh
   ```
5. **¡Listo!** El script:
   - Instala Docker si no está presente (según tu SO)
   - Genera un token de gateway único y seguro
   - Levanta OpenClaw en Docker con seguridad aplicada
   - Configura el firewall (Linux)

## 📋 Requisitos del sistema

- macOS, Linux, o Windows con WSL2
- Conexión a internet (Docker se instala automáticamente si no está)
- `openssl` (pre-instalado en macOS y la mayoría de Linux)

> Node.js ya **no** es un requisito del host. Corre dentro del contenedor Docker.

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

## 🐳 Comandos Docker útiles

```bash
# Gestión del contenedor
docker compose -f ~/.openclaw/docker-compose.yml logs -f    # Logs en tiempo real
docker compose -f ~/.openclaw/docker-compose.yml down       # Detener
docker compose -f ~/.openclaw/docker-compose.yml restart    # Reiniciar
docker compose -f ~/.openclaw/docker-compose.yml pull       # Actualizar imagen

# Diagnóstico
docker exec openclaw-agent openclaw doctor
docker exec openclaw-agent openclaw status
```

## 🏗️ Stack Técnico

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Routing**: Wouter
- **Build**: Vite + esbuild
- **Styling**: Terminal Noir (OKLCH colors)
- **Runtime generado**: Docker + Docker Compose

## 📁 Estructura del Proyecto

```
client/
  ├── public/          # Archivos estáticos
  └── src/
      ├── pages/       # Páginas principales
      ├── components/  # Componentes (steps del wizard)
      ├── hooks/       # useInstaller — estado del wizard
      ├── lib/
      │   ├── openclaw-data.ts      # Catálogo de skills, modelos, canales
      │   └── script-generator.ts  # Generador de scripts bash + docker-compose
      └── index.css    # Tema Terminal Noir
server/
  └── index.ts         # Express — sirve el SPA
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
