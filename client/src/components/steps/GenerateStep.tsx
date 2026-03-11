/*
 * DESIGN: Terminal Noir — Generate step with script output and download
 */

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Download,
  Copy,
  Check,
  FileCode,
  FileJson,
  Container,
  Terminal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import type { Skill } from "@/lib/openclaw-data";

interface GenerateStepProps {
  generatedScript: string;
  generatedConfig: string;
  generatedDocker: string;
  generatedExecutable: string;
  downloadScript: () => void;
  downloadConfig: () => void;
  downloadDocker: () => void;
  downloadExecutable: () => void;
  copyToClipboard: (text: string) => Promise<boolean>;
  selectedSkills: Skill[];
  agentName: string;
  primaryModel: string;
  platform: string;
}

type Tab = "script" | "config" | "docker" | "oneliner";

export default function GenerateStep({
  generatedScript,
  generatedConfig,
  generatedDocker,
  generatedExecutable,
  downloadScript,
  downloadConfig,
  downloadDocker,
  downloadExecutable,
  copyToClipboard,
  selectedSkills,
  agentName,
  primaryModel,
  platform,
}: GenerateStepProps) {
  const [activeTab, setActiveTab] = useState<Tab>("script");
  const [copied, setCopied] = useState(false);
  const [showFullScript, setShowFullScript] = useState(false);

  const handleCopy = useCallback(async (text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      toast.success("Copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    }
  }, [copyToClipboard]);

  const oneLiner = `curl -fsSL https://openclaw.ai/install.sh | bash`;

  const getActiveContent = () => {
    switch (activeTab) {
      case "script": return generatedScript;
      case "config": return generatedConfig;
      case "docker": return generatedDocker;
      case "oneliner": return oneLiner;
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "script", label: "install.sh", icon: <FileCode className="w-3.5 h-3.5" /> },
    { id: "config", label: "openclaw.json", icon: <FileJson className="w-3.5 h-3.5" /> },
    { id: "docker", label: "docker-compose", icon: <Container className="w-3.5 h-3.5" /> },
    { id: "oneliner", label: "one-liner", icon: <Terminal className="w-3.5 h-3.5" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-neon-green">$</span>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Tu instalación está lista
          </h2>
        </div>
        <p className="text-muted-foreground text-sm pl-4">
          Descarga los archivos o copia los comandos para instalar OpenClaw con tu configuración personalizada.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Agente", value: agentName, color: "neon-green" },
          { label: "Skills", value: `${selectedSkills.length}`, color: "neon-cyan" },
          { label: "Modelo", value: primaryModel.split("/").pop() || "", color: "neon-green" },
          { label: "Sistema", value: platform, color: "neon-cyan" },
        ].map((item) => (
          <div key={item.label} className="p-3 rounded border border-border bg-card">
            <p className="text-[10px] text-terminal-dim uppercase tracking-wider">{item.label}</p>
            <p className={`text-sm font-mono font-semibold text-${item.color} truncate`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Quick install */}
      <div className="p-4 rounded border border-[oklch(0.85_0.25_145_/_0.3)] bg-[oklch(0.85_0.25_145_/_0.03)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-display font-semibold text-neon-green flex items-center gap-2">
            <Terminal className="w-4 h-4" /> Instalación rápida
          </h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCopy(oneLiner)}
            className="h-7 text-xs border-[oklch(0.85_0.25_145_/_0.3)] text-neon-green hover:bg-[oklch(0.85_0.25_145_/_0.1)]"
          >
            {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
            Copiar
          </Button>
        </div>
        <div className="bg-[oklch(0.08_0.005_260)] rounded p-3 font-mono text-sm">
          <span className="text-neon-green">$</span>{" "}
          <span className="text-foreground">{oneLiner}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Ejecuta esto en tu terminal. Luego descarga los archivos de configuración y colócalos en <span className="text-neon-cyan font-mono">~/.openclaw/</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="border border-border rounded overflow-hidden">
        {/* Tab header */}
        <div className="flex border-b border-border bg-[oklch(0.1_0.006_260)]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-1.5 px-4 py-2.5 text-xs font-mono transition-all border-b-2
                ${activeTab === tab.id
                  ? "border-[oklch(0.85_0.25_145)] text-neon-green bg-[oklch(0.85_0.25_145_/_0.05)]"
                  : "border-transparent text-terminal-dim hover:text-foreground"
                }
              `}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab actions */}
        <div className="flex items-center justify-between px-4 py-2 bg-[oklch(0.1_0.006_260)] border-b border-border">
          <span className="text-[10px] text-terminal-dim font-mono">
            {activeTab === "script" && "#!/bin/bash — Script de instalación completo"}
            {activeTab === "config" && "~/.openclaw/openclaw.json — Configuración del agente"}
            {activeTab === "docker" && "docker-compose.yml — Despliegue con Docker"}
            {activeTab === "oneliner" && "Comando de instalación rápida"}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCopy(getActiveContent())}
              className="h-6 text-[10px] text-terminal-dim hover:text-neon-green"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </Button>
            {activeTab === "script" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={downloadScript}
                className="h-6 text-[10px] text-terminal-dim hover:text-neon-green"
              >
                <Download className="w-3 h-3" />
              </Button>
            )}
            {activeTab === "config" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={downloadConfig}
                className="h-6 text-[10px] text-terminal-dim hover:text-neon-green"
              >
                <Download className="w-3 h-3" />
              </Button>
            )}
            {activeTab === "docker" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={downloadDocker}
                className="h-6 text-[10px] text-terminal-dim hover:text-neon-green"
              >
                <Download className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Code content */}
        <div className={`relative bg-[oklch(0.08_0.005_260)] ${activeTab === "script" && !showFullScript ? "max-h-[350px]" : "max-h-[500px]"} overflow-y-auto`}>
          <pre className="p-4 text-xs leading-relaxed font-mono">
            <code className="text-foreground/90 whitespace-pre">
              {activeTab === "script" && !showFullScript
                ? generatedScript.split("\n").slice(0, 30).join("\n") + "\n..."
                : getActiveContent()
              }
            </code>
          </pre>
          {activeTab === "script" && (
            <button
              onClick={() => setShowFullScript(!showFullScript)}
              className="sticky bottom-0 w-full py-2 bg-gradient-to-t from-[oklch(0.08_0.005_260)] to-transparent text-xs text-neon-green flex items-center justify-center gap-1 hover:text-neon-green/80"
            >
              {showFullScript ? (
                <><ChevronUp className="w-3 h-3" /> Mostrar menos</>
              ) : (
                <><ChevronDown className="w-3 h-3" /> Ver script completo ({generatedScript.split("\n").length} líneas)</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Download all */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={downloadExecutable}
          className="flex-1 bg-[oklch(0.65_0.25_25)] text-white hover:bg-[oklch(0.6_0.22_25)] font-display font-semibold glow-red"
        >
          <Download className="w-4 h-4 mr-2" />
          📥 Descargar Ejecutable Completo
        </Button>
        <Button
          onClick={downloadScript}
          variant="outline"
          className="flex-1 border-[oklch(0.85_0.25_145_/_0.3)] text-neon-green hover:bg-[oklch(0.85_0.25_145_/_0.1)]"
        >
          <Download className="w-4 h-4 mr-2" />
          Script Separado
        </Button>
        <Button
          onClick={downloadConfig}
          variant="outline"
          className="flex-1 border-[oklch(0.78_0.15_210_/_0.3)] text-neon-cyan hover:bg-[oklch(0.78_0.15_210_/_0.1)]"
        >
          <Download className="w-4 h-4 mr-2" />
          Descargar openclaw.json
        </Button>
        <Button
          onClick={downloadDocker}
          variant="outline"
          className="flex-1 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <Container className="w-4 h-4 mr-2" />
          Docker Compose
        </Button>
      </div>

      {/* Post-install instructions */}
      <div className="p-4 rounded border border-border bg-card space-y-3">
        <h3 className="text-sm font-display font-semibold text-neon-green">Después de instalar</h3>
        <div className="space-y-2 text-xs text-muted-foreground font-mono">
          <div className="flex gap-2">
            <span className="text-neon-green shrink-0">1.</span>
            <span>Ejecuta <span className="text-neon-cyan">chmod +x install-openclaw.sh && ./install-openclaw.sh</span></span>
          </div>
          <div className="flex gap-2">
            <span className="text-neon-green shrink-0">2.</span>
            <span>Verifica con <span className="text-neon-cyan">openclaw doctor</span></span>
          </div>
          <div className="flex gap-2">
            <span className="text-neon-green shrink-0">3.</span>
            <span>Abre el dashboard: <span className="text-neon-cyan">openclaw dashboard</span></span>
          </div>
          <div className="flex gap-2">
            <span className="text-neon-green shrink-0">4.</span>
            <span>Envía un mensaje por WhatsApp/Telegram para probar</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
