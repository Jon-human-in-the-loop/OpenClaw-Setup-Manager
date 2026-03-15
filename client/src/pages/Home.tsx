/*
 * ============================================================
 * DESIGN: Terminal Noir — Main page
 * Dark terminal aesthetic, neon green accents, monospace type
 * Hero with generated background, wizard below
 * ============================================================
 */

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, ArrowDown } from "lucide-react";
import TerminalHeader from "@/components/TerminalHeader";
import StepIndicator from "@/components/StepIndicator";
import PlatformStep from "@/components/steps/PlatformStep";
import IdentityStep from "@/components/steps/IdentityStep";
import ModelStep from "@/components/steps/ModelStep";
import SkillsStep from "@/components/steps/SkillsStep";
import ChannelsStep from "@/components/steps/ChannelsStep";
import GenerateStep from "@/components/steps/GenerateStep";
import { useInstaller } from "@/hooks/useInstaller";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663304144987/jGPtcnubRShEmU2GfHpyLr/hero-bg-VFZMG9ZALVp74UtDhETrZA.webp";
const MASCOT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663304144987/jGPtcnubRShEmU2GfHpyLr/lobster-mascot-AZsn6Bhy6fzY46SeS3NHSy.webp";

const BG_WORDS = [
  "ACCESS_DENIED", "SYSTEM_BREACH", "OVERRIDE", "INIT_AGENT",
  "CONNECTED", "DEPLOY_OK", "SECURE_SHELL", "KERNEL_LOAD",
  "AI_ONLINE", "SYNC_ACTIVE", "ROOT_ACCESS", "AGENT_BOOT",
  "FIREWALL_OK", "TOKEN_VALID", "EXEC_READY", "NODE_UP",
  "DOCKER_RUN", "CONFIG_SET", "AUTH_PASS", "STREAM_OK",
];

function FloatingTerminalText() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
      {BG_WORDS.map((word, i) => (
        <motion.span
          key={word}
          className="absolute font-mono font-bold text-xs whitespace-nowrap"
          style={{
            left: `${(i * 13.7 + 5) % 88}%`,
            top: `${(i * 17.3 + 3) % 88}%`,
            color: "oklch(0.85 0.25 145 / 0.07)",
          }}
          animate={{
            opacity: [0.4, 1, 0.4],
            y: [0, -12, 0],
          }}
          transition={{
            duration: 3.5 + (i % 5) * 0.8,
            repeat: Infinity,
            delay: i * 0.35,
            ease: "easeInOut",
          }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}

export default function Home() {
  const installer = useInstaller();
  const wizardRef = useRef<HTMLDivElement>(null);

  const scrollToWizard = () => {
    wizardRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const renderStep = () => {
    switch (installer.currentStep) {
      case "platform":
        return (
          <PlatformStep
            platform={installer.platform}
            setPlatform={installer.setPlatform}
          />
        );
      case "identity":
        return (
          <IdentityStep
            agentName={installer.agentName}
            setAgentName={installer.setAgentName}
            agentTheme={installer.agentTheme}
            setAgentTheme={installer.setAgentTheme}
            agentEmoji={installer.agentEmoji}
            setAgentEmoji={installer.setAgentEmoji}
          />
        );
      case "model":
        return (
          <ModelStep
            primaryModel={installer.primaryModel}
            setPrimaryModel={installer.setPrimaryModel}
            fallbackModel={installer.fallbackModel}
            setFallbackModel={installer.setFallbackModel}
            apiKeys={installer.apiKeys}
            setApiKey={installer.setApiKey}
          />
        );
      case "skills":
        return (
          <SkillsStep
            selectedSkillIds={installer.selectedSkillIds}
            toggleSkill={installer.toggleSkill}
            selectSkillPack={installer.selectSkillPack}
          />
        );
      case "channels":
        return (
          <ChannelsStep
            selectedChannels={installer.selectedChannels}
            toggleChannel={installer.toggleChannel}
            phoneNumber={installer.phoneNumber}
            setPhoneNumber={installer.setPhoneNumber}
            apiKeys={installer.apiKeys}
            setApiKey={installer.setApiKey}
          />
        );
      case "generate":
        return (
          <GenerateStep
            generatedScript={installer.generatedScript}
            generatedConfig={installer.generatedConfig}
            generatedDocker={installer.generatedDocker}
            generatedExecutable={installer.generatedExecutable}
            downloadScript={installer.downloadScript}
            downloadConfig={installer.downloadConfig}
            downloadDocker={installer.downloadDocker}
            downloadExecutable={installer.downloadExecutable}
            copyToClipboard={installer.copyToClipboard}
            selectedSkills={installer.selectedSkills}
            agentName={installer.agentName}
            primaryModel={installer.primaryModel}
            platform={installer.platform}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TerminalHeader />

      {/* ─── HERO SECTION ──────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-14">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={HERO_BG}
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        </div>

        {/* Floating terminal text */}
        <FloatingTerminalText />

        {/* Scanline overlay */}
        <div className="absolute inset-0 scanline pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 container text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl mx-auto"
          >
            {/* Mascot */}
            <motion.img
              src={MASCOT}
              alt="OpenClaw Mascot"
              className="w-28 h-28 mx-auto mb-6 drop-shadow-[0_0_30px_oklch(0.65_0.25_25_/_0.4)]"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            />

            {/* Terminal prompt */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[oklch(0.85_0.25_145_/_0.2)] bg-[oklch(0.85_0.25_145_/_0.05)] mb-6">
              <span className="w-2 h-2 rounded-full bg-[oklch(0.85_0.25_145)] glow-pulse" />
              <span className="text-xs font-mono text-neon-green">
                openclaw@installer ~ $
              </span>
              <span className="text-xs font-mono text-foreground">
                ready
              </span>
              <span className="w-1.5 h-4 bg-[oklch(0.85_0.25_145)] cursor-blink" />
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              <span className="text-foreground">Instala </span>
              <span className="text-neon-red text-glow-red">OpenClaw</span>
              <br />
              <span className="text-neon-green text-glow-green">en un solo clic</span>
            </h1>

            {/* Subtitle */}
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
              Configura tu asistente IA personal con las mejores skills y bots
              de la comunidad. Genera un script de instalación personalizado
              listo para ejecutar.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={scrollToWizard}
                size="lg"
                className="bg-[oklch(0.85_0.25_145)] text-[oklch(0.08_0.005_260)] hover:bg-[oklch(0.8_0.22_145)] font-display font-semibold text-base px-8 glow-green"
              >
                Comenzar configuración
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
              <a
                href="https://openclaw.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-neon-green transition-colors font-mono"
              >
                ¿Qué es OpenClaw?
              </a>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-12">
              {[
                { value: "200K+", label: "GitHub Stars" },
                { value: "40+", label: "Skills curadas" },
                { value: "6", label: "Canales" },
                { value: "5+", label: "Proveedores IA" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-lg sm:text-xl font-display font-bold text-neon-green">{stat.value}</p>
                  <p className="text-[10px] text-terminal-dim uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <ArrowDown className="w-5 h-5 text-terminal-dim" />
          </motion.div>
        </div>
      </section>

      {/* ─── WIZARD SECTION ────────────────────────────────── */}
      <section ref={wizardRef} className="py-16 sm:py-24">
        <div className="container max-w-4xl">
          {/* Section header */}
          <div className="text-center mb-10">
            <p className="text-xs font-mono text-neon-green mb-2">// configuración interactiva</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Configura tu instalación
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Sigue los pasos para personalizar OpenClaw. Al final, generaremos todos los archivos que necesitas.
            </p>
          </div>

          {/* Step indicator */}
          <div className="mb-8">
            <StepIndicator
              steps={installer.steps}
              currentStep={installer.currentStep}
              stepLabels={installer.stepLabels}
              onStepClick={installer.goToStep}
              currentStepIndex={installer.currentStepIndex}
            />
          </div>

          {/* Step content */}
          <div className="min-h-[500px]">
            <AnimatePresence mode="wait">
              <div key={installer.currentStep}>
                {renderStep()}
              </div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              onClick={installer.goPrev}
              variant="outline"
              disabled={installer.currentStepIndex === 0}
              className="border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>

            <span className="text-xs text-terminal-dim font-mono">
              {installer.currentStepIndex + 1} / {installer.steps.length}
            </span>

            {installer.currentStep !== "generate" ? (
              <Button
                onClick={installer.goNext}
                className="bg-[oklch(0.85_0.25_145)] text-[oklch(0.08_0.005_260)] hover:bg-[oklch(0.8_0.22_145)] font-display font-semibold"
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={installer.downloadExecutable}
                className="bg-[oklch(0.65_0.25_25)] text-white hover:bg-[oklch(0.6_0.22_25)] font-display font-semibold glow-red"
              >
                📥 Descargar Ejecutable
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────── */}
      <section className="py-16 border-t border-border bg-[oklch(0.06_0.004_260)]">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-xs font-mono text-neon-red mb-2">// cómo funciona</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              3 pasos para tu agente IA
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Configura",
                desc: "Elige tu sistema, modelo de IA, skills y canales de comunicación usando el wizard interactivo.",
              },
              {
                step: "02",
                title: "Descarga",
                desc: "Genera y descarga tu script de instalación personalizado, configuración JSON y Docker Compose.",
              },
              {
                step: "03",
                title: "Ejecuta",
                desc: "Corre el script en tu terminal. OpenClaw se instala con todas tus skills y queda listo para usar.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded border border-[oklch(0.85_0.25_145_/_0.3)] bg-[oklch(0.85_0.25_145_/_0.05)] mb-4">
                  <span className="text-neon-green font-display font-bold text-lg">{item.step}</span>
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* One-liner highlight */}
          <div className="mt-12 p-4 rounded border border-[oklch(0.85_0.25_145_/_0.2)] bg-[oklch(0.08_0.005_260)] text-center">
            <p className="text-xs text-terminal-dim mb-2">O si prefieres la vía rápida:</p>
            <code className="text-sm text-neon-green font-mono">
              curl -fsSL https://openclaw.ai/install.sh | bash
            </code>
          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ──────────────────────────────── */}
      <section className="py-16 border-t border-border">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs font-mono text-neon-cyan mb-2">// qué incluye</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Todo lo que necesitas para empezar
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Script de instalación",
                desc: "Un script bash completo que instala Node.js, OpenClaw, ClawHub CLI, y todas tus skills seleccionadas automáticamente.",
                color: "neon-green",
              },
              {
                title: "Configuración JSON",
                desc: "Archivo openclaw.json pre-configurado con tu identidad, modelo de IA, canales y preferencias de sesión.",
                color: "neon-cyan",
              },
              {
                title: "Docker Compose",
                desc: "Archivo docker-compose.yml para desplegar OpenClaw en contenedores con todas las variables de entorno.",
                color: "neon-red",
              },
              {
                title: "Skills curadas",
                desc: "Más de 40 skills verificadas por la comunidad, organizadas en packs temáticos: Developer, Productivity, Security y Full Stack.",
                color: "neon-green",
              },
              {
                title: "Multi-modelo",
                desc: "Soporte para Claude, GPT, Gemini, DeepSeek y modelos locales via Ollama. Configura primario y fallback.",
                color: "neon-cyan",
              },
              {
                title: "Multi-canal",
                desc: "Conecta WhatsApp, Telegram, Discord, Slack, Signal y WebChat. Tu agente disponible donde lo necesites.",
                color: "neon-red",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-5 rounded border border-border bg-card hover:border-[oklch(0.85_0.25_145_/_0.2)] transition-all group"
              >
                <div className={`w-1.5 h-1.5 rounded-full bg-${feature.color} mb-3`}
                  style={{ backgroundColor: feature.color === "neon-green" ? "oklch(0.85 0.25 145)" : feature.color === "neon-cyan" ? "oklch(0.78 0.15 210)" : "oklch(0.65 0.25 25)" }}
                />
                <h3 className="font-display font-semibold text-foreground mb-2 group-hover:text-neon-green transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ─── FOOTER ──────────────────────────────────────────── */}
      <footer className="py-10 border-t border-border bg-[oklch(0.06_0.004_260)]">
        <div className="container">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-neon-green font-display font-bold text-lg text-glow-green">openclaw</span>
              <span className="text-terminal-dim text-sm">installer</span>
            </div>
            <p className="text-xs text-terminal-dim font-mono text-center max-w-md">
              Herramienta de la comunidad para simplificar la instalación de OpenClaw.
              OpenClaw es un proyecto open-source creado por Peter Steinberger.
            </p>
            <div className="flex items-center gap-6">
              <a href="https://openclaw.ai" target="_blank" rel="noopener noreferrer" className="text-xs text-terminal-dim hover:text-neon-green transition-colors">
                openclaw.ai
              </a>
              <a href="https://docs.openclaw.ai" target="_blank" rel="noopener noreferrer" className="text-xs text-terminal-dim hover:text-neon-green transition-colors">
                docs
              </a>
              <a href="https://github.com/openclaw/openclaw" target="_blank" rel="noopener noreferrer" className="text-xs text-terminal-dim hover:text-neon-green transition-colors">
                github
              </a>
              <a href="https://clawhub.ai" target="_blank" rel="noopener noreferrer" className="text-xs text-terminal-dim hover:text-neon-green transition-colors">
                clawhub
              </a>
            </div>
            <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-[oklch(0.85_0.25_145_/_0.2)] to-transparent" />
            <p className="text-[10px] text-terminal-dim font-mono">
              v1.0.0 — Hecho con 🦞 por la comunidad OpenClaw
            </p>
          </div>
        </div>
      </footer>    </div>
  );
}
