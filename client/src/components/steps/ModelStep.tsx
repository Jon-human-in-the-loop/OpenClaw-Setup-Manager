/*
 * DESIGN: Terminal Noir — Model selection step
 */

import { motion } from "framer-motion";
import { MODEL_PROVIDERS } from "@/lib/openclaw-data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, Star, AlertTriangle, ShieldAlert } from "lucide-react";

interface ModelStepProps {
  primaryModel: string;
  setPrimaryModel: (v: string) => void;
  fallbackModel?: string;
  setFallbackModel: (v: string | undefined) => void;
  apiKeys: Record<string, string>;
  setApiKey: (key: string, value: string) => void;
}

export default function ModelStep({
  primaryModel,
  setPrimaryModel,
  fallbackModel,
  setFallbackModel,
  apiKeys,
  setApiKey,
}: ModelStepProps) {
  const selectedProvider = MODEL_PROVIDERS.find((p) =>
    p.models.some((m) => m.id === primaryModel)
  );

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
            Elige tu modelo de IA
          </h2>
        </div>
        <p className="text-muted-foreground text-sm pl-4">
          OpenClaw es agnóstico al modelo. Soporta Claude, GPT, Gemini, DeepSeek y modelos locales via Ollama.
        </p>
      </div>

      {/* Provider selection */}
      <div className="space-y-4">
        <Label className="text-neon-green text-xs uppercase tracking-wider">
          Proveedor
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {MODEL_PROVIDERS.map((provider) => {
            const isSelected = provider.models.some((m) => m.id === primaryModel);
            return (
              <button
                key={provider.id}
                onClick={() => {
                  const rec = provider.models.find((m) => m.recommended);
                  setPrimaryModel(rec?.id || provider.models[0].id);
                }}
                className={`
                  p-3 rounded border text-center transition-all
                  ${isSelected
                    ? "border-[oklch(0.85_0.25_145)] bg-[oklch(0.85_0.25_145_/_0.05)] text-neon-green"
                    : "border-border bg-card text-muted-foreground hover:border-[oklch(0.85_0.25_145_/_0.3)] hover:text-foreground"
                  }
                `}
              >
                <span className="text-sm font-display font-semibold">{provider.name}</span>
                {!provider.requiresApiKey && (
                  <span className="block text-[10px] text-neon-cyan mt-1">LOCAL</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Model selection */}
      {selectedProvider && (
        <div className="space-y-4">
          <Label className="text-neon-green text-xs uppercase tracking-wider">
            Modelo principal
          </Label>
          <div className="space-y-2">
            {selectedProvider.models.map((model) => (
              <button
                key={model.id}
                onClick={() => setPrimaryModel(model.id)}
                className={`
                  w-full flex items-center justify-between p-3 rounded border text-left transition-all
                  ${primaryModel === model.id
                    ? "border-[oklch(0.85_0.25_145)] bg-[oklch(0.85_0.25_145_/_0.05)]"
                    : "border-border bg-card hover:border-[oklch(0.85_0.25_145_/_0.3)]"
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-mono ${primaryModel === model.id ? "text-neon-green" : "text-foreground"}`}>
                    {model.name}
                  </span>
                  {model.recommended && (
                    <span className="flex items-center gap-1 text-[10px] text-neon-cyan bg-[oklch(0.78_0.15_210_/_0.1)] px-1.5 py-0.5 rounded">
                      <Star className="w-2.5 h-2.5" /> RECOMENDADO
                    </span>
                  )}
                </div>
                <span className="text-xs text-terminal-dim font-mono">{model.id}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ban risk warning for Anthropic */}
      {selectedProvider?.id === "anthropic" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded border border-red-500/60 bg-red-950/30"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-red-400 font-display uppercase tracking-wide">
                ⚠ Advertencia: Riesgo de Baneo de Cuenta Anthropic
              </h4>
              <p className="text-xs text-red-300/80 leading-relaxed">
                Se han reportado casos de <strong className="text-red-300">baneos permanentes de cuentas</strong> de Anthropic por usar OpenClaw con autenticación OAuth o métodos no oficiales. Usuarios con suscripciones pagadas (Claude Max) también han sido afectados.
              </p>
              <ul className="text-xs text-red-300/70 space-y-1 list-none">
                <li className="flex items-start gap-1.5"><span className="text-red-400 shrink-0">•</span> Anthropic detecta clientes de terceros que usan contextos de larga duración</li>
                <li className="flex items-start gap-1.5"><span className="text-red-400 shrink-0">•</span> El uso puede violar los Términos de Servicio (ToS) de Anthropic</li>
                <li className="flex items-start gap-1.5"><span className="text-red-400 shrink-0">•</span> No hay proceso claro de apelación una vez baneado</li>
              </ul>
              <p className="text-xs text-red-300/60 font-mono">
                Alternativa segura: Usa tu <strong className="text-red-300">API Key oficial</strong> de console.anthropic.com en lugar de OAuth
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Ban risk warning for Google Gemini */}
      {selectedProvider?.id === "google" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded border border-red-500/60 bg-red-950/30"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-red-400 font-display uppercase tracking-wide">
                ⚠ Advertencia: Riesgo de Baneo de Cuenta Google
              </h4>
              <p className="text-xs text-red-300/80 leading-relaxed">
                Múltiples usuarios han reportado <strong className="text-red-300">baneos permanentes de sus cuentas de Google</strong> por integrar Gemini con herramientas de terceros como OpenClaw. Esto puede causar la pérdida de acceso a Gmail, Drive y todos los servicios de Google.
              </p>
              <ul className="text-xs text-red-300/70 space-y-1 list-none">
                <li className="flex items-start gap-1.5"><span className="text-red-400 shrink-0">•</span> El baneo afecta toda la cuenta Google, no solo Gemini</li>
                <li className="flex items-start gap-1.5"><span className="text-red-400 shrink-0">•</span> Cuentas antiguas (+5 años) y premium (ULTRA) también han sido baneadas</li>
                <li className="flex items-start gap-1.5"><span className="text-red-400 shrink-0">•</span> El error típico: "Gemini has been disabled for violation of Terms of Service"</li>
              </ul>
              <p className="text-xs text-red-300/60 font-mono">
                Alternativa segura: Usa tu <strong className="text-red-300">API Key de Google AI Studio</strong> (aistudio.google.com) — nunca OAuth de Gemini CLI
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* API Key */}
      {selectedProvider?.requiresApiKey && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-neon-green text-xs uppercase tracking-wider">
              API Key — {selectedProvider.apiKeyName}
            </Label>
            {selectedProvider.apiKeyUrl && (
              <a
                href={selectedProvider.apiKeyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-neon-cyan hover:underline"
              >
                Obtener key <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
          <Input
            type="password"
            value={apiKeys[selectedProvider.apiKeyName] || ""}
            onChange={(e) => setApiKey(selectedProvider.apiKeyName, e.target.value)}
            placeholder={`${selectedProvider.apiKeyName}=sk-...`}
            className="bg-input border-border text-foreground font-mono text-sm focus:border-[oklch(0.85_0.25_145)] focus:ring-[oklch(0.85_0.25_145_/_0.2)]"
          />
          <p className="text-xs text-muted-foreground">
            Opcional ahora — puedes configurarla después en <span className="text-neon-cyan font-mono">~/.openclaw/openclaw.json</span>
          </p>
        </div>
      )}

      {/* Fallback model */}
      <div className="p-4 rounded border border-border bg-[oklch(0.1_0.006_260)]">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-neon-cyan text-xs">FALLBACK (OPCIONAL)</span>
        </div>
        <select
          value={fallbackModel || ""}
          onChange={(e) => setFallbackModel(e.target.value || undefined)}
          className="w-full bg-input border border-border text-foreground font-mono text-sm rounded p-2 focus:border-[oklch(0.85_0.25_145)] focus:outline-none"
        >
          <option value="">Sin modelo fallback</option>
          {MODEL_PROVIDERS.flatMap((p) =>
            p.models
              .filter((m) => m.id !== primaryModel)
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {p.name} — {m.name}
                </option>
              ))
          )}
        </select>
      </div>
    </motion.div>
  );
}
