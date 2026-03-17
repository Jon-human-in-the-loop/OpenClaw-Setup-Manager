// ─── Structured error messages with solutions ────────────────────────────────

export interface ErrorMessage {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  solutions: string[];
  solutionsEn: string[];
  docsUrl?: string;
}

export const ERROR_MESSAGES: Record<string, ErrorMessage> = {
  NODEJS_NOT_FOUND: {
    title: "Node.js no está instalado",
    titleEn: "Node.js is not installed",
    description: "OpenClaw requiere Node.js versión 22 o superior.",
    descriptionEn: "OpenClaw requires Node.js version 22 or higher.",
    solutions: [
      "1. Ve a https://nodejs.org/",
      "2. Descarga la versión LTS más reciente (v22+)",
      "3. Instala el archivo descargado",
      "4. Reinicia esta aplicación",
    ],
    solutionsEn: [
      "1. Go to https://nodejs.org/",
      "2. Download the latest LTS version (v22+)",
      "3. Install the downloaded file",
      "4. Restart this application",
    ],
    docsUrl: "https://nodejs.org/en/download",
  },

  NODEJS_OUTDATED: {
    title: "Node.js necesita actualizarse",
    titleEn: "Node.js needs to be updated",
    description: "Tienes una versión antigua de Node.js. Se necesita v22 o superior.",
    descriptionEn: "You have an old version of Node.js. v22 or higher is needed.",
    solutions: [
      "1. Ve a https://nodejs.org/",
      "2. Descarga Node.js v22 LTS",
      "3. Instala sobre la versión existente",
      "4. Reinicia esta aplicación",
    ],
    solutionsEn: [
      "1. Go to https://nodejs.org/",
      "2. Download Node.js v22 LTS",
      "3. Install over the existing version",
      "4. Restart this application",
    ],
    docsUrl: "https://nodejs.org/en/download",
  },

  PORT_IN_USE: {
    title: "Puerto 18789 ocupado",
    titleEn: "Port 18789 is in use",
    description: "Otro programa está usando el puerto 18789 que necesita OpenClaw.",
    descriptionEn: "Another program is using port 18789 that OpenClaw needs.",
    solutions: [
      "1. Cierra otras aplicaciones abiertas",
      "2. Si OpenClaw ya está instalado, detén el servicio existente",
      "3. Reinicia tu computadora y vuelve a intentar",
    ],
    solutionsEn: [
      "1. Close other open applications",
      "2. If OpenClaw is already installed, stop the existing service",
      "3. Restart your computer and try again",
    ],
  },

  DISK_SPACE_LOW: {
    title: "Poco espacio en disco",
    titleEn: "Low disk space",
    description: "OpenClaw necesita al menos 5GB de espacio libre en disco.",
    descriptionEn: "OpenClaw needs at least 5GB of free disk space.",
    solutions: [
      "1. Abre el explorador de archivos",
      "2. Elimina archivos o programas que no uses",
      "3. Vacía la papelera de reciclaje",
      "4. Vuelve a verificar cuando tengas más espacio",
    ],
    solutionsEn: [
      "1. Open your file explorer",
      "2. Delete files or programs you don't use",
      "3. Empty the recycle bin",
      "4. Re-check when you have more space",
    ],
  },

  INSTALL_FAILED: {
    title: "Error en la instalación",
    titleEn: "Installation failed",
    description: "Algo salió mal durante la instalación de OpenClaw.",
    descriptionEn: "Something went wrong during OpenClaw installation.",
    solutions: [
      "1. Verifica tu conexión a internet",
      "2. Asegúrate de que Node.js v22+ esté instalado",
      "3. Intenta reiniciar la instalación",
      "4. Si el error persiste, contacta soporte",
    ],
    solutionsEn: [
      "1. Check your internet connection",
      "2. Make sure Node.js v22+ is installed",
      "3. Try restarting the installation",
      "4. If the error persists, contact support",
    ],
    docsUrl: "https://github.com/openclaw/openclaw/issues",
  },

  INVALID_API_KEY: {
    title: "API Key inválida",
    titleEn: "Invalid API Key",
    description: "El formato de la API key no es correcto o no tiene permisos suficientes.",
    descriptionEn: "The API key format is incorrect or doesn't have sufficient permissions.",
    solutions: [
      "1. Verifica que copiaste la API key completa",
      "2. No incluyas espacios al principio o al final",
      "3. Asegúrate de que la key no haya expirado",
      "4. Revisa que tenga los permisos necesarios",
    ],
    solutionsEn: [
      "1. Verify you copied the complete API key",
      "2. Don't include spaces at the beginning or end",
      "3. Make sure the key hasn't expired",
      "4. Check that it has the necessary permissions",
    ],
  },
};

export function getError(code: string): ErrorMessage {
  return ERROR_MESSAGES[code] ?? {
    title: "Error desconocido",
    titleEn: "Unknown error",
    description: "Ocurrió un error inesperado.",
    descriptionEn: "An unexpected error occurred.",
    solutions: ["Reinicia la aplicación e intenta de nuevo."],
    solutionsEn: ["Restart the application and try again."],
  };
}
