/*
 * DESIGN: Terminal Noir — Identity configuration step
 */

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface IdentityStepProps {
  agentName: string;
  setAgentName: (v: string) => void;
  agentTheme: string;
  setAgentTheme: (v: string) => void;
  agentEmoji: string;
  setAgentEmoji: (v: string) => void;
}

const EMOJI_OPTIONS = ["🦞", "🤖", "🧠", "⚡", "🔮", "🐙", "🦾", "🌊"];

const THEME_PRESETS = [
  { label: "Asistente útil", value: "helpful assistant" },
  { label: "Ingeniero senior", value: "senior software engineer" },
  { label: "Investigador", value: "research analyst" },
  { label: "Escritor creativo", value: "creative writer" },
  { label: "Analista de datos", value: "data analyst" },
  { label: "DevOps experto", value: "devops expert" },
];

export default function IdentityStep({
  agentName,
  setAgentName,
  agentTheme,
  setAgentTheme,
  agentEmoji,
  setAgentEmoji,
}: IdentityStepProps) {
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
            Configura la identidad de tu agente
          </h2>
        </div>
        <p className="text-muted-foreground text-sm pl-4">
          Dale un nombre, personalidad y emoji a tu asistente. Esto define cómo se presenta en los mensajes.
        </p>
      </div>

      {/* Name */}
      <div className="space-y-3">
        <Label className="text-neon-green text-xs uppercase tracking-wider">
          Nombre del agente
        </Label>
        <Input
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          placeholder="Clawd"
          className="bg-input border-border text-foreground font-mono focus:border-[oklch(0.85_0.25_145)] focus:ring-[oklch(0.85_0.25_145_/_0.2)]"
        />
        <p className="text-xs text-muted-foreground">
          Este nombre aparecerá en los mensajes: <span className="text-neon-green">[{agentName || "Clawd"}]</span>
        </p>
      </div>

      {/* Emoji */}
      <div className="space-y-3">
        <Label className="text-neon-green text-xs uppercase tracking-wider">
          Emoji del agente
        </Label>
        <div className="flex gap-2 flex-wrap">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setAgentEmoji(emoji)}
              className={`
                w-12 h-12 rounded border text-2xl flex items-center justify-center transition-all
                ${agentEmoji === emoji
                  ? "border-[oklch(0.85_0.25_145)] bg-[oklch(0.85_0.25_145_/_0.1)] glow-green"
                  : "border-border bg-card hover:border-[oklch(0.85_0.25_145_/_0.3)]"
                }
              `}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div className="space-y-3">
        <Label className="text-neon-green text-xs uppercase tracking-wider">
          Personalidad / Tema
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setAgentTheme(preset.value)}
              className={`
                px-3 py-2 rounded border text-xs text-left transition-all
                ${agentTheme === preset.value
                  ? "border-[oklch(0.85_0.25_145)] bg-[oklch(0.85_0.25_145_/_0.05)] text-neon-green"
                  : "border-border bg-card text-muted-foreground hover:border-[oklch(0.85_0.25_145_/_0.3)] hover:text-foreground"
                }
              `}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <Input
          value={agentTheme}
          onChange={(e) => setAgentTheme(e.target.value)}
          placeholder="O escribe tu propio tema..."
          className="bg-input border-border text-foreground font-mono text-sm focus:border-[oklch(0.85_0.25_145)] focus:ring-[oklch(0.85_0.25_145_/_0.2)]"
        />
      </div>

      {/* Preview */}
      <div className="p-4 rounded border border-border bg-[oklch(0.1_0.006_260)]">
        <p className="text-xs text-terminal-dim mb-2">// preview de openclaw.json</p>
        <pre className="text-xs leading-relaxed">
          <span className="text-muted-foreground">{"{"}</span>{"\n"}
          <span className="text-muted-foreground">{"  "}</span>
          <span className="text-neon-cyan">"identity"</span>
          <span className="text-muted-foreground">: {"{"}</span>{"\n"}
          <span className="text-muted-foreground">{"    "}</span>
          <span className="text-neon-cyan">"name"</span>
          <span className="text-muted-foreground">: </span>
          <span className="text-neon-green">"{agentName || "Clawd"}"</span>{"\n"}
          <span className="text-muted-foreground">{"    "}</span>
          <span className="text-neon-cyan">"theme"</span>
          <span className="text-muted-foreground">: </span>
          <span className="text-neon-green">"{agentTheme}"</span>{"\n"}
          <span className="text-muted-foreground">{"    "}</span>
          <span className="text-neon-cyan">"emoji"</span>
          <span className="text-muted-foreground">: </span>
          <span className="text-neon-green">"{agentEmoji}"</span>{"\n"}
          <span className="text-muted-foreground">{"  }"}</span>{"\n"}
          <span className="text-muted-foreground">{"}"}</span>
        </pre>
      </div>
    </motion.div>
  );
}
