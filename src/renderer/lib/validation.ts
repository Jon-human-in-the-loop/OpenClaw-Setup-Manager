// ─── Input validation ─────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  error?: string;
  errorEn?: string;
}

export function validateAgentName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, error: "El nombre no puede estar vacío", errorEn: "Name cannot be empty" };
  }
  if (trimmed.length < 2) {
    return { valid: false, error: "El nombre debe tener al menos 2 caracteres", errorEn: "Name must be at least 2 characters" };
  }
  if (trimmed.length > 30) {
    return { valid: false, error: "El nombre no puede superar 30 caracteres", errorEn: "Name cannot exceed 30 characters" };
  }
  if (!/^[\w\s\-áéíóúñÁÉÍÓÚÑ]+$/u.test(trimmed)) {
    return { valid: false, error: "Solo letras, números, espacios y guiones", errorEn: "Only letters, numbers, spaces and hyphens" };
  }
  return { valid: true };
}

export function validateApiKey(key: string, provider: string): ValidationResult {
  const trimmed = key.trim();
  if (!trimmed) {
    return { valid: false, error: "La API key no puede estar vacía", errorEn: "API key cannot be empty" };
  }

  const patterns: Record<string, RegExp> = {
    anthropic: /^sk-ant-[a-zA-Z0-9_-]{20,}$/,
    openai: /^sk-[a-zA-Z0-9_-]{20,}$/,
    google: /^[a-zA-Z0-9_-]{30,}$/,
  };

  const pattern = patterns[provider];
  if (pattern && !pattern.test(trimmed)) {
    return {
      valid: false,
      error: "Formato de API key incorrecto. Verifica que la copiaste completa.",
      errorEn: "Incorrect API key format. Verify you copied it completely.",
    };
  }

  return { valid: true };
}

export function validateWhatsAppNumber(number: string): ValidationResult {
  const trimmed = number.trim();
  if (!trimmed) {
    return { valid: false, error: "El número no puede estar vacío", errorEn: "Number cannot be empty" };
  }
  // E.164 format: +[country code][number], 7-15 digits
  if (!/^\+[1-9]\d{6,14}$/.test(trimmed)) {
    return {
      valid: false,
      error: "Formato inválido. Usa el formato internacional: +521234567890",
      errorEn: "Invalid format. Use international format: +11234567890",
    };
  }
  return { valid: true };
}

export function validateTelegramToken(token: string): ValidationResult {
  const trimmed = token.trim();
  if (!trimmed) {
    return { valid: false, error: "El token no puede estar vacío", errorEn: "Token cannot be empty" };
  }
  // Format: 123456789:ABCdefGHIjklMNOpqrstUVwxyz
  if (!/^\d{8,12}:[a-zA-Z0-9_-]{35}$/.test(trimmed)) {
    return {
      valid: false,
      error: "Formato inválido. Debe ser: 123456789:ABCdef...",
      errorEn: "Invalid format. Should be: 123456789:ABCdef...",
    };
  }
  return { valid: true };
}

export function validateDiscordToken(token: string): ValidationResult {
  const trimmed = token.trim();
  if (!trimmed) {
    return { valid: false, error: "El token no puede estar vacío", errorEn: "Token cannot be empty" };
  }
  if (trimmed.length < 50) {
    return {
      valid: false,
      error: "El token parece muy corto. Verifica que lo copiaste completo.",
      errorEn: "Token seems too short. Verify you copied it completely.",
    };
  }
  return { valid: true };
}

export function validateSlackToken(token: string): ValidationResult {
  const trimmed = token.trim();
  if (!trimmed) {
    return { valid: false, error: "El token no puede estar vacío", errorEn: "Token cannot be empty" };
  }
  if (!trimmed.startsWith("xoxb-")) {
    return {
      valid: false,
      error: "El token debe comenzar con 'xoxb-'",
      errorEn: "Token must start with 'xoxb-'",
    };
  }
  return { valid: true };
}
