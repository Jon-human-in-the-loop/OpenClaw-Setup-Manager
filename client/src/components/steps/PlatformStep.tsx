/*
 * DESIGN: Terminal Noir — Platform selection step
 */

import { motion } from "framer-motion";
import { Monitor, Terminal, Apple } from "lucide-react";
import { PLATFORMS, type Platform } from "@/lib/openclaw-data";

interface PlatformStepProps {
  platform: Platform;
  setPlatform: (p: Platform) => void;
}

const ICONS: Record<string, React.ReactNode> = {
  apple: <Apple className="w-8 h-8" />,
  terminal: <Terminal className="w-8 h-8" />,
  monitor: <Monitor className="w-8 h-8" />,
};

export default function PlatformStep({ platform, setPlatform }: PlatformStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-neon-green">$</span>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Selecciona tu sistema operativo
          </h2>
        </div>
        <p className="text-muted-foreground text-sm pl-4">
          OpenClaw se ejecuta en macOS, Linux y Windows (via WSL2). El script de instalación se adaptará a tu plataforma.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PLATFORMS.map((p) => {
          const isSelected = platform === p.id;
          return (
            <motion.button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative p-6 rounded border text-left transition-all
                ${isSelected
                  ? "border-[oklch(0.85_0.25_145)] bg-[oklch(0.85_0.25_145_/_0.05)] glow-green"
                  : "border-border bg-card hover:border-[oklch(0.85_0.25_145_/_0.3)]"
                }
              `}
            >
              <div className={`mb-4 ${isSelected ? "text-neon-green" : "text-muted-foreground"}`}>
                {ICONS[p.icon]}
              </div>
              <h3 className={`font-display font-semibold text-lg ${isSelected ? "text-neon-green" : "text-foreground"}`}>
                {p.name}
              </h3>
              {p.id === "windows" && (
                <p className="text-xs text-muted-foreground mt-1">
                  Requiere WSL2 habilitado
                </p>
              )}
              {isSelected && (
                <motion.div
                  layoutId="platform-indicator"
                  className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[oklch(0.85_0.25_145)]"
                  style={{ boxShadow: "0 0 8px oklch(0.85 0.25 145)" }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="p-4 rounded border border-border bg-[oklch(0.1_0.006_260)]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-neon-cyan text-xs">INFO</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="text-neon-green">Requisitos:</span> Node.js 22+ (el instalador lo detecta e instala automáticamente).
          En Windows, OpenClaw se ejecuta dentro de WSL2 para máxima compatibilidad.
          Se recomienda al menos 4GB de RAM disponible.
        </p>
      </div>
    </motion.div>
  );
}
