# 🦞 OpenClaw Setup Manager

Una aplicación desktop de **Electron** que diagnostica tu sistema, guía la configuración de **OpenClaw** (el asistente personal de IA de código abierto) mediante un flujo de 10 pasos, y genera scripts de despliegue personalizados que ejecutan OpenClaw **dentro de Docker** con buenas prácticas de seguridad aplicadas automáticamente.

**La forma guiada, segura y validada de desplegar OpenClaw en Windows, macOS y Linux.**

## ✅ Qué hace esta app

### 🔍 **Motor 1: Detección del Sistema**
- ✓ Detecta tu SO (macOS, Linux, Windows con WSL2)
- ✓ Verifica Docker instalado y ejecutándose
- ✓ Verifica Ollama instalado (si aplica)
- ✓ Comprueba puertos disponibles, espacio en disco, permisos

### 🧭 **Motor 2: Asistente de Dependencias**
- ✓ Guía clara sobre cómo instalar Docker si falta
- ✓ Recomendación inteligente por SO (WSL2+Docker en Windows, Docker Desktop en macOS, Docker en Linux)
- ✓ Enlaces oficiales de descarga contextualizados
- ✓ Validación post-instalación

### ⚙️ **Motor 3: Configuración y Despliegue** (10 pasos interactivos)
- ✓ Identidad del agente (nombre, emoji, personalidad)
- ✓ Selección del proveedor IA (Anthropic, OpenAI, Google, OpenRouter, Ollama)
- ✓ Configuración de API keys y credenciales
- ✓ Selección de skills (41 curadas en 4 packs)
- ✓ Canales de comunicación (WhatsApp, Telegram, Discord, Slack, Signal, WebChat)
- ✓ Revisión completa antes de ejecutar
- ✓ Genera script bash personalizado (`deploy-openclaw.sh`)
- ✓ Configura firewall en Linux automáticamente

### ✔️ **Motor 4: Validación de Despliegue**
- ✓ Verifica que OpenClaw esté activo post-despliegue
- ✓ Genera token de autenticación único y seguro
- ✓ Crea archivos de configuración seguros (`chmod 600`)
- ✓ Muestra URLs accesibles y estado final del entorno

## ❌ Qué NO hace hoy (limitaciones actuales)

- ❌ **NO instala Docker automáticamente** — Hoy guía y valida, no ejecuta instaladores. El usuario instala primero (con guía incluida)
- ❌ **NO instala Ollama automáticamente** — Igual que Docker: guía incluida, instalación manual
- ❌ **NO gestiona API keys en secreto** — Tú las proporcionas en el wizard y quedan en `~/.openclaw/.env` con permisos 600
- ❌ **NO actualiza OpenClaw** — El usuario ejecuta `docker pull` manualmente (o lo hace la app en futuras versiones)
- ❌ **NO es de una sola línea** — Son 3 pasos: preparar sistema → configurar en wizard → ejecutar script generado
- ❌ **NO repara problemas comunes todavía** — Eso llega en la fase siguiente (Motor de Repair)

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

## 🎯 Características principales

### **Diagnóstico inteligente por sistema**
- macOS (Intel y Apple Silicon)
- Linux (Ubuntu, Debian, etc.)
- Windows (con WSL2)
- Matriz de requisitos clara por SO

### **Wizard interactivo de 10 pasos** (diseñado para ser honesto y seguro)
1. Bienvenida + idioma
2. Diagnóstico del sistema
3. Recomendación según SO
4. Identidad del agente (nombre, emoji, personalidad)
5. Proveedor de IA (Anthropic, OpenAI, Google, OpenRouter, Ollama)
6. Modelo específico (según proveedor)
7. API keys y credenciales
8. Skills (41 curadas en 4 packs temáticos)
9. Canales de comunicación (6 soportados)
10. Revisión y descarga del script

### **41 skills curadas en 4 packs**
- 🔧 **Developer Pack**: GitHub, Coding Agent, Debug Pro, Docker, etc.
- 📊 **Productivity Pack**: Google Workspace, Obsidian, Summarize, Memory Hygiene
- 🔒 **Security Pack**: AgentGuard, Prompt Guard, ClawScan, Config Guardian
- ⭐ **Full Stack Pack**: Las 15 mejores skills recomendadas por la comunidad

### **Proveedores de IA soportados**
- Anthropic Claude (Opus, Sonnet, Haiku)
- OpenAI (GPT-4o, etc.)
- Google (Gemini)
- OpenRouter
- Ollama (local, en Docker)

### **6 canales de comunicación**
- WhatsApp, Telegram, Discord, Slack, Signal, WebChat

### **Generador de scripts personalizado**
- Un solo archivo `.sh` con configuración embebida
- Seguridad aplicada automáticamente
- Sin dependencias externas en el script

### **Interfaz Terminal Noir**
- Estética cinematográfica con verde neón y rojo coral
- Responsive en múltiples resoluciones
- Accesible y clara

## 🚀 Cómo usar

### **Paso 1: Abre la aplicación Setup Manager**

1. **Descarga e instala** el ejecutable para tu SO
2. **Abre la app** — se ejecuta como ventana de escritorio normal

### **Paso 2: Pasa por el diagnóstico y configuración (10 pasos)**

**Paso 1: Bienvenida + idioma**
- Elige Español o English
- Resumen de qué hace y qué no la app

**Paso 2: Diagnóstico del sistema**
- Detectamos tu SO (macOS, Linux, Windows+WSL2)
- Verificamos Docker/Ollama
- Validamos puertos, espacio, permisos
- Te mostramos qué falta o qué está listo

**Paso 3: Recomendación por sistema**
- Si Windows → recomendamos WSL2 + Docker
- Si macOS → recomendamos Docker Desktop
- Si Linux → recomendamos Docker
- Tú puedes cambiar si lo deseas

**Paso 4-5: Identidad y proveedor IA**
- Nombre, emoji, personalidad del agente
- Elige proveedor (Anthropic, OpenAI, Google, Ollama, etc.)
- Selecciona modelo

**Paso 6-8: Credenciales, skills y canales**
- API keys (si usas ChatGPT, Gemini, etc.)
- Skills (41 disponibles en 4 packs)
- Canales de comunicación (WhatsApp, Telegram, Discord, Slack, Signal, WebChat)

**Paso 9: Revisión completa**
- Ves exactamente qué se va a desplegar
- Sistema elegido, proveedor, modelo, skills, canales
- Avisos de seguridad si aplica

**Paso 10: Descarga del script**
- Descargamos `deploy-openclaw.sh` con tu configuración embebida

### **Paso 3: Ejecuta el script en tu máquina**

```bash
chmod +x deploy-openclaw.sh
./deploy-openclaw.sh
```

**El script:**
- Verifica nuevamente las dependencias
- Levanta OpenClaw en Docker con seguridad automática
- Configura firewall (Linux)
- Genera token de autenticación único
- Te muestra URL accesible y credenciales
- Muestra estado final: OpenClaw ✓, Dashboard ✓, Gateway ✓

### **Requisitos que tú instalas antes de comenzar**

- **Docker** o **Ollama** (la app te guía cómo instalarlos, pero los instalas tú)
- `openssl` (pre-instalado en macOS y Linux)
- Conexión a internet

👉 **Si no tienes Docker/Ollama:** La app lo detecta en el Paso 2, te da el enlace oficial de descarga y espera a que lo instales. Luego valida de nuevo.

[Ver guía completa de instalación de Docker](#-instalación-de-docker)

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

## 🎯 Hoja de ruta (Roadmap)

### Fase 1: Reposicionamiento (EN PROGRESO)
- ✓ Renombrar y alinear mensajes del producto
- ✓ README honesto sobre capacidades
- ⏳ Actualizar documentación arquitectónica
- ⏳ Refactorizar mensajes del wizard

### Fase 2: Motor de diagnóstico mejorado (PRÓXIMO)
- Matriz de requisitos por SO más robusta
- Detección de Docker daemon activo vs solo instalado
- Validación de permisos y espacios más detallados
- Chequeos de virtualización en Windows
- Pantalla de diagnóstico aún más clara

### Fase 3: Asistencia de dependencias (v1.1)
- Botones de descarga directa (enlaces oficiales por SO)
- Detección automática post-instalación
- Instrucciones contextuales por error
- Checklist persistente

### Fase 4: Repair Mode (v1.2)
- Botón "Reparar" en la pantalla final
- Casos: Docker no corre, OpenClaw no responde, puerto ocupado, .env incompleto
- Revalidación automática

### Fase 5: Control Center (v1.3)
- Panel post-instalación permanente
- Estado general, logs, restart/stop/start
- Health checks recurrentes

### Fase 6: Instalación automática (v2.0)
- Solo cuando el Repair Mode esté sólido
- Prioridad: Linux → macOS → Windows

---

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
