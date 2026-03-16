# Seguridad en OpenClaw / OpenClaw Security Guide

> **Importante**: OpenClaw es una plataforma de agentes de IA muy potente con amplio acceso a sistemas externos. Sigue esta guía para un despliegue seguro.

---

## Tabla de Contenidos

1. [Principios Básicos](#principios-básicos)
2. [Aislamiento del Gateway](#aislamiento-del-gateway)
3. [Entornos Recomendados](#entornos-recomendados)
4. [Compatibilidad por Sistema Operativo](#compatibilidad-por-sistema-operativo)
5. [Autenticación del Gateway](#autenticación-del-gateway)
6. [Revisión de Skills](#revisión-de-skills)
7. [Gestión de Credenciales](#gestión-de-credenciales)
8. [Firewall](#firewall)
9. [Mínimo Privilegio](#mínimo-privilegio)
10. [Monitoreo y Auditoría](#monitoreo-y-auditoría)
11. [Actualización y Respaldos](#actualización-y-respaldos)
12. [Alternativas de Código Abierto](#alternativas-de-código-abierto)

---

## Principios Básicos

OpenClaw presenta vectores de ataque importantes (tool poisoning, inyección de prompts) que podrían exfiltrar datos o ejecutar comandos no deseados. La defensa en profundidad aplica aquí:

- **Aislar** el gateway en localhost
- **Autenticar** con token fuerte
- **Limitar** privilegios del proceso
- **Revisar** skills antes de instalarlas
- **Monitorear** la actividad del agente

---

## Aislamiento del Gateway

OpenClaw **nunca debe exponerse directamente a internet**.

### Configuración correcta

```bash
# Forzar solo localhost
openclaw config set GATEWAY_HOST 127.0.0.1
openclaw config set GATEWAY_PORT 18789

# Bloquear con firewall (Linux/ufw)
sudo ufw deny 18789
sudo ufw allow from 127.0.0.1 to any port 18789
```

### Para acceso remoto seguro

En lugar de exponer el puerto, usa:

```bash
# SSH tunnel
ssh -L 18789:127.0.0.1:18789 usuario@servidor

# O Tailscale (VPN mesh, más cómodo)
# https://tailscale.com
```

### ❌ NUNCA hagas esto

```bash
# ❌ Exponer a todas las interfaces
openclaw config set GATEWAY_HOST 0.0.0.0

# ❌ Abrir el firewall al mundo
sudo ufw allow 18789
```

---

## Entornos Recomendados

### Opción 1: Docker (macOS / Linux) — ⭐ Recomendado

El contenedor aísla OpenClaw del sistema host. Un agente comprometido solo ve lo que se montó explícitamente.

```bash
docker run -d \
  --name openclaw \
  -p 127.0.0.1:18789:18789 \   # Solo localhost
  --restart unless-stopped \
  --memory 1g \                  # Límite de RAM
  --cpus 2 \                     # Límite de CPU
  -e AGENT_NAME="MiAgente" \
  -e PRIMARY_MODEL="anthropic/claude-sonnet-4-5" \
  -e GATEWAY_TOKEN="tu-token-seguro" \
  openclaw/openclaw:latest
```

**Firewall con Docker (Linux)**

Docker puede bypassar UFW. Usa la cadena `DOCKER-USER`:

```bash
# Bloquear tráfico entrante al contenedor desde exterior
sudo iptables -I DOCKER-USER -p tcp --dport 18789 ! -s 127.0.0.1 -j DROP
```

### Opción 2: VPS dedicado

Para uso 24/7 con mayor disponibilidad:

```bash
# En VPS Debian/Ubuntu
apt install docker.io -y
systemctl enable docker

# Desplegar OpenClaw
docker run -d \
  --name openclaw \
  -p 127.0.0.1:18789:18789 \
  --restart always \
  openclaw/openclaw:latest
```

Proveedores recomendados: Hetzner, DigitalOcean, Vultr.
Costo aproximado: 5–12 USD/mes para instancia pequeña.

### Opción 3: Instalación local (Windows / casos simples)

Para Windows o cuando Docker no está disponible:

```bash
npm install -g openclaw@latest
openclaw config set GATEWAY_HOST 127.0.0.1
openclaw start
```

**Importante en Windows**:
- No ejecutar como Administrador
- Guardar API keys como variables de entorno del sistema (no en archivos)
- Bloquear el puerto en Windows Defender Firewall

### Opción 4: WSL2 + Docker (Windows avanzado)

Para usuarios de Windows que quieren aislamiento con Docker:

1. Habilitar WSL2: `wsl --install`
2. Instalar Docker Desktop con integración WSL2
3. Ejecutar el contenedor desde WSL2

---

## Compatibilidad por Sistema Operativo

| Función | Windows | macOS | Linux |
|---------|---------|-------|-------|
| Instalación local (npm) | ✅ Recomendado | ✅ | ✅ |
| Docker nativo | ❌ (necesita Docker Desktop) | ✅ | ✅ |
| Firewall automático (ufw) | ❌ | ❌ | ✅ |
| WSL2 + Docker | ✅ (avanzado) | N/A | N/A |
| Mínimo privilegio | ⚠️ (UAC) | ✅ | ✅ |

**Windows**: Docker Desktop requiere Hyper-V (Windows Pro/Enterprise) o WSL2. No se recomienda para usuarios no técnicos.

**macOS/Linux**: Docker CE es nativo y ligero. Opción preferida para mayor seguridad.

---

## Autenticación del Gateway

### Habilitar token de acceso

```bash
# Configurar modo de autenticación
openclaw config set gateway.auth.mode token

# Definir un token fuerte (mínimo 32 caracteres)
openclaw config set GATEWAY_TOKEN "$(openssl rand -hex 32)"
```

### Verificar configuración

```bash
openclaw config get gateway.auth.mode
# Debe mostrar: token
```

### En Docker

```bash
docker run -e GATEWAY_TOKEN="tu-token-largo-y-aleatorio" ...
```

---

## Revisión de Skills

Antes de instalar cualquier skill de terceros, revisa su código:

```bash
# Buscar patrones sospechosos
grep -r "exec\|child_process\|eval\|require('fs')" ruta/al/skill/
grep -r "http\|https\|fetch\|axios" ruta/al/skill/
grep -r "process.env\|readFile\|writeFile" ruta/al/skill/
```

### Señales de alerta

- Llamadas a `exec()` o `child_process`
- Peticiones HTTP a dominios desconocidos
- Lectura de variables de entorno del sistema
- Acceso al filesystem fuera del workspace
- Uso de `eval()` o `Function()`

### Regla general

**Solo instala skills de fuentes de confianza.** Revisa el código antes de activar cualquier skill que realice operaciones sensibles.

---

## Gestión de Credenciales

### ✅ Forma correcta

```bash
# Variables de entorno del sistema (no en archivos)
export LLM_API_KEY="sk-ant-..."
export TELEGRAM_BOT_TOKEN="123456:ABC..."

# O en el gestor de secretos de OpenClaw
openclaw config set LLM_API_KEY "$LLM_API_KEY"
```

### ❌ Evitar

```bash
# ❌ Hardcodear en archivos de configuración
echo "LLM_API_KEY=sk-ant-..." > config.txt

# ❌ Compartir el archivo openclaw.json
cat ~/.openclaw/openclaw.json  # Puede contener secretos
```

### Rotación periódica

- Rota las API keys cada 90 días
- Revoca inmediatamente si sospechas compromiso
- Establece límites de gasto en los proveedores de modelos

---

## Firewall

### Linux (ufw)

```bash
# Política por defecto: denegar entrada
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir SSH (si es servidor)
sudo ufw allow ssh

# Denegar acceso externo al puerto 18789
sudo ufw deny 18789

# Aplicar
sudo ufw enable
sudo ufw status
```

### Linux (iptables directo)

```bash
# Bloquear puerto 18789 desde redes externas
iptables -A INPUT -p tcp --dport 18789 ! -s 127.0.0.1 -j DROP
```

### macOS

```bash
# En Preferencias del Sistema → Seguridad → Firewall
# O via pfctl:
echo "block in proto tcp from any to any port 18789" | sudo pfctl -f -
```

### Windows

```powershell
# Bloquear entrada al puerto 18789
New-NetFirewallRule -DisplayName "Block OpenClaw External" `
  -Direction Inbound -Protocol TCP -LocalPort 18789 `
  -RemoteAddress Internet -Action Block
```

---

## Mínimo Privilegio

### Linux / macOS

```bash
# Crear usuario dedicado para OpenClaw
sudo useradd -r -s /bin/false openclaw

# Ejecutar como ese usuario
sudo -u openclaw openclaw start
```

### Docker (ya incluye aislamiento)

```dockerfile
# El contenedor oficial ya corre como usuario no-root
USER openclaw
```

### Windows

- No ejecutar como Administrador
- Crear cuenta de usuario limitada para OpenClaw

---

## Monitoreo y Auditoría

### Herramienta integrada

```bash
# Auditoría automática de configuración
openclaw security audit

# Revisa:
# ✓ Gateway solo en localhost
# ✓ Token de acceso activado
# ✓ Puerto no expuesto
# ✓ Permisos del proceso
```

### Monitoreo de uso de API

Establece alertas de gasto en tus proveedores:
- **Anthropic**: https://console.anthropic.com → Usage limits
- **OpenAI**: https://platform.openai.com → Usage limits
- **Google**: https://console.cloud.google.com → Budgets

Un pico inesperado puede indicar un skill descontrolado o compromiso.

### Logs de actividad

```bash
# Ver logs de OpenClaw
openclaw logs --tail 100

# Docker
docker logs openclaw --tail 100 -f
```

---

## Actualización y Respaldos

### Actualizar OpenClaw

```bash
# Instalación local
npm install -g openclaw@latest

# Docker
docker pull openclaw/openclaw:latest
docker stop openclaw && docker rm openclaw
# Re-ejecutar con los mismos parámetros
```

### Respaldar configuración

```bash
# Respaldar directorio de configuración
cp -r ~/.openclaw ~/.openclaw.backup.$(date +%Y%m%d)

# O versionar en Git (excluir secretos)
cd ~/.openclaw
echo "*.key" >> .gitignore
git init && git add -A && git commit -m "backup"
```

---

## Alternativas de Código Abierto

Si necesitas más seguridad o un proyecto más pequeño y auditable:

| Proyecto | Enfoque | Ventajas |
|---------|---------|----------|
| **NanoClaw** | Seguridad máxima | ~3.900 líneas, contenedor por sesión |
| **NullClaw** | Minimalismo extremo | Binario estático 678KB, sandboxing |
| **Nanobot** | Simplicidad | ~4.000 líneas, auditable fácilmente |
| **memU** | Memoria contextual | Complemento para memoria persistente |
| **OpenCode** | Programación | Especializado en coding |

**Cuándo usar alternativas**:
- Si el código auditable es crítico → NanoClaw o Nanobot
- Si los recursos son muy limitados → NullClaw
- Si solo necesitas asistencia de código → OpenCode

---

## Checklist de Despliegue Seguro

Antes de poner OpenClaw en producción:

- [ ] Gateway ligado a `127.0.0.1`, no `0.0.0.0`
- [ ] Token de acceso activado (mínimo 32 caracteres)
- [ ] Puerto 18789 bloqueado en firewall para acceso externo
- [ ] OpenClaw no corre como root/administrador
- [ ] API keys en variables de entorno, no en archivos
- [ ] Skills revisadas antes de instalar
- [ ] Límites de gasto configurados en proveedores de modelos
- [ ] Acceso remoto via SSH tunnel o VPN (no puerto expuesto)
- [ ] Respaldo de `~/.openclaw` configurado
- [ ] `openclaw security audit` ejecutado sin errores

---

**Referencias**: Documentación oficial de OpenClaw, Security Guide comunitario, DigitalOcean Deploy Guide, análisis de seguridad de terceros.

**Mantenido por**: Equipo OpenClaw — Actualizado Marzo 2025
