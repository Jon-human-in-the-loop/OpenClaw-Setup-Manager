# ¿Qué hace realmente el instalador OpenClaw Electron?

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│           RENDERER PROCESS (UI/React)                       │
│  - Componentes de interfaz gráfica                          │
│  - Validación de inputs                                     │
│  - Persistencia en localStorage                             │
│  - Manejo del flujo del wizard (12 pasos)                   │
└──────────────────┬──────────────────────────────────────────┘
                   │ IPC (Inter-Process Communication)
                   │ ipcRenderer.invoke("install:start", config)
                   ▼
┌─────────────────────────────────────────────────────────────┐
│           MAIN PROCESS (Backend/Node.js)                    │
│  - Ejecuta comandos del sistema                             │
│  - Genera archivos de configuración                         │
│  - Orquesta la instalación de Docker y OpenClaw            │
│  - Envía eventos de progreso back al renderer               │
└─────────────────────────────────────────────────────────────┘
```

---

## Flujo Completo de `window.api.install.start(config)`

### **PASO 1: Verificar/Instalar Docker (5-35%)**

```typescript
ipcMain.handle("install:start", async (_, config: InstallConfig) => {
  // Verifica si Docker está instalado
  const dockerExists = await isDockerInstalled();

  if (!dockerExists) {
    // Instala Docker según el SO:
    // macOS: Descarga Docker.dmg → monta → copia a /Applications
    // Windows: Instala docker.io en WSL2 via PowerShell
    // Linux: curl https://get.docker.com | sudo sh
    await installDocker(win, 10, 35);
  }
});
```

**¿Qué pasa?**
- Ejecuta `docker --version` para verificar
- Si no existe, descarga e instala automáticamente (varía por SO)
- Emite eventos de progreso cada línea del stdout/stderr

---

### **PASO 2: Crear estructura de directorios (40%)**

```typescript
const homeDir = homedir(); // /home/user o /Users/user o C:\Users\user
const openClawDir = join(homeDir, ".openclaw");

mkdirSync(join(openClawDir, "workspace"), { recursive: true });
mkdirSync(join(openClawDir, "skills"), { recursive: true });
```

**Estructura creada:**
```
~/.openclaw/
├── workspace/      # Donde OpenClaw guarda datos
├── skills/         # Skills custom del usuario
├── openclaw.json   # Configuración principal
├── .env            # API keys (permisos 0600)
├── .gateway-token  # Token de acceso (permisos 0600)
└── docker-compose.yml
```

---

### **PASO 3: Generar token de gateway (45%)**

```typescript
function generateGatewayToken(): string {
  // Genera 32 bytes aleatorios en hex
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  // Resultado: "a3f2c7e9d1b5..." (64 caracteres hex)
}
```

**Propósito:** Token de autenticación para acceder al dashboard

---

### **PASO 4: Escribir `openclaw.json` (50%)**

Genera un JSON con la configuración completa:

```json
{
  "identity": {
    "name": "Clawd",
    "emoji": "🦞"
  },
  "agent": {
    "workspace": "/home/node/.openclaw/workspace",
    "model": "anthropic/claude-sonnet-4-5",
    "fallbacks": ["ollama/qwen2"]
  },
  "gateway": {
    "port": 18789,
    "bind": "loopback",
    "mode": "local",
    "auth": {
      "token": "a3f2c7e9d1b5..."
    }
  },
  "channels": {
    "whatsapp": {
      "allowFrom": ["+521234567890"],
      "groups": { "*": { "requireMention": true } }
    },
    "telegram": {
      "enabled": true,
      "botToken": "123456789:ABCdef..."
    }
  },
  "session": {
    "scope": "per-sender",
    "reset": {
      "mode": "daily",
      "atHour": 4
    }
  }
}
```

**Seguridad:** Permisos 0600 (solo lectura para el usuario)

---

### **PASO 5: Escribir `.env` (52%)**

```typescript
const envContent = `LLM_API_KEY=${config.apiKey}`;
writeFileSync(join(openClawDir, ".env"), envContent, "utf-8");
```

**Contenido:**
```
LLM_API_KEY=sk-ant-v0-abc123...
```

**Seguridad:** Permisos 0600, no se versionea en git

---

### **PASO 6: Generar `docker-compose.yml` (60%)**

Crea orquestación de Docker:

```yaml
version: "3.8"
services:
  openclaw:
    image: ghcr.io/openclaw/openclaw:latest
    container_name: openclaw-agent
    restart: unless-stopped

    # SECURITY: Solo localhost
    ports:
      - "127.0.0.1:18789:18789"  # API/Gateway
      - "127.0.0.1:3000:3000"    # Dashboard

    volumes:
      - ~/.openclaw/openclaw.json:/home/node/.openclaw/openclaw.json:ro
      - ~/.openclaw/workspace:/home/node/.openclaw/workspace
      - ~/.openclaw/skills:/home/node/.openclaw/skills
      - ~/.openclaw/.env:/home/node/.openclaw/.env:ro

    # SECURITY: Filesystem read-only
    read_only: true
    tmpfs:
      - /tmp:size=128m,mode=1777

    # SECURITY: Sin capacidades del SO
    cap_drop:
      - ALL
    security_opt:
      - no-new-privileges:true

    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/healthz"]
```

---

### **PASO 7: Descargar imagen Docker (70-75%)**

```typescript
await runCommand(win, "docker",
  ["compose", "-f", composePath, "pull"],
  70, 75, "Descargando imagen..."
);
```

Ejecuta:
```bash
docker compose -f ~/.openclaw/docker-compose.yml pull
```

**Resultado:** Descarga `ghcr.io/openclaw/openclaw:latest` (cientos de MB)

---

### **PASO 8: Levantar contenedor (75-85%)**

```typescript
await runCommand(win, "docker",
  ["compose", "-f", composePath, "up", "-d"],
  75, 85, "Levantando contenedor..."
);
```

Ejecuta:
```bash
docker compose -f ~/.openclaw/docker-compose.yml up -d
```

**Resultado:**
- Container `openclaw-agent` corriendo en background
- Dashboard accesible en `http://127.0.0.1:3000`
- API en puerto 18789

---

### **PASO 9: Esperar health check (85-90%)**

```typescript
// Simple wait (en una app real, hacer proper health check)
await new Promise((resolve) => setTimeout(resolve, 5000));
```

Espera a que OpenClaw esté listo (actualmente 5 segundos hardcodeado)

---

### **PASO 10: ✅ Completado (100%)**

```typescript
emit(win, "install:complete", {
  success: true,
  dashboardUrl: "http://127.0.0.1:3000",
  message: "¡OpenClaw instalado en Docker correctamente!"
});
```

Renderiza página de `Success.tsx` con:
- URL del dashboard
- Información del agente configurado
- Botones para abrir dashboard y docs

---

## ¿Qué es OpenClaw realmente?

### **Es un agente IA con estos componentes:**

1. **LLM Backend**
   - Conecta a modelos: Claude, GPT-4, Gemini, Ollama
   - Ejecuta en Docker aislado del sistema

2. **Gateway (Puerto 18789)**
   - API REST para comunicarse con OpenClaw
   - Autenticación con token
   - Accesible SOLO desde localhost (127.0.0.1)

3. **Dashboard (Puerto 3000)**
   - UI para ver/editar configuración
   - Monitorear ejecuciones del agente
   - Requiere token de gateway para autenticarse

4. **Canales de Mensajería**
   - **WhatsApp**: Conecta a un número específico
   - **Telegram**: Bot que responde en chat
   - **Discord**: Bot en servidores
   - **Slack**: Integración workspace

5. **Workspace y Skills**
   - Almacena conversaciones y datos
   - Skills (plugins) custom para extender funcionalidad

---

## Seguridad implementada

| Aspecto | Medida |
|--------|--------|
| **Red** | Solo localhost (127.0.0.1), nunca en 0.0.0.0 |
| **API Keys** | Se guardan en `.env` con permisos 0600 |
| **Token Gateway** | Aleatorio de 64 caracteres hex, 0600 |
| **Filesystem** | Contenedor con read-only + tmpfs |
| **Capabilities** | `cap_drop: ALL` (sin privilegios del SO) |
| **Actualización** | Restart automático con `restart: unless-stopped` |

---

## Archivos generados en `~/.openclaw/`

```
~/.openclaw/
├── openclaw.json          # Configuración (mode: 0600)
├── .env                   # API Keys (mode: 0600)
├── .gateway-token         # Token auth (mode: 0600)
├── docker-compose.yml     # Orquestación Docker
├── workspace/
│   ├── conversations/     # Historial de chats
│   └── data/              # Datos persistentes
└── skills/                # Skills custom
```

---

## Flujo típico del usuario

1. **Abrir instalador** → Renderer process inicia
2. **Llenar formulario** → React valida inputs localmente
3. **Click "Instalar"** → `window.api.install.start(config)`
4. **IPC call** → Main process recibe config
5. **Instalación en 8 pasos** → Emite progreso cada línea de log
6. **Docker levantado** → OpenClaw corriendo en container
7. **Success page** → Usuario abre http://127.0.0.1:3000
8. **Dashboard** → Agente listo para usar con WhatsApp/Telegram/etc

---

## Resumido en una línea

**OpenClaw es un agente IA que corre en Docker, se comunica por múltiples canales (WhatsApp, Telegram, etc), y el instalador Electron automatiza toda la configuración en 8 pasos.**
