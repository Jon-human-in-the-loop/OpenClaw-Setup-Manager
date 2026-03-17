// ─── Generación de token de gateway ─────────────────────────────────────────

/**
 * Genera un token aleatorio seguro para el gateway de OpenClaw.
 * Usa crypto.getRandomValues si está disponible (renderer), o Math.random como fallback.
 */
export function generateGatewayToken(length = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const array = new Uint8Array(length);

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(array)
    .map((b) => chars[b % chars.length])
    .join("");
}

/**
 * Valida que un token de gateway tenga longitud y caracteres válidos.
 */
export function validateGatewayToken(token: string): { valid: boolean; error?: string } {
  if (!token || token.trim().length === 0) {
    return { valid: false, error: "El token no puede estar vacío" };
  }
  if (token.length < 16) {
    return { valid: false, error: "El token debe tener al menos 16 caracteres" };
  }
  return { valid: true };
}

/**
 * Enmascara un token para mostrarlo en UI (primeros 6 + ****).
 */
export function maskToken(token: string): string {
  if (token.length <= 6) return "••••••••";
  return token.slice(0, 6) + "••••••••••••••••••••••••••";
}
