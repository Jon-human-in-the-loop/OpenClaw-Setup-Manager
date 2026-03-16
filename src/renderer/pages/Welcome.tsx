import { motion } from "framer-motion";
import { useInstallation } from "@/context/InstallationContext";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useEffect, useState } from "react";

// ─── Terminal background texts ────────────────────────────────────────────────

const BG_WORDS = [
  "ACCESS_DENIED", "SYSTEM_BREACH", "OVERRIDE", "INIT_AGENT",
  "CONNECTED", "DEPLOY_OK", "SECURE_SHELL", "KERNEL_LOAD",
  "AI_ONLINE", "SYNC_ACTIVE", "ROOT_ACCESS", "AGENT_BOOT",
  "FIREWALL_OK", "TOKEN_VALID", "EXEC_READY", "NODE_UP",
  "DOCKER_RUN", "CONFIG_SET", "AUTH_PASS", "STREAM_OK",
];

function FloatingTerminalText(): JSX.Element {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
      {BG_WORDS.map((word, i) => (
        <motion.span
          key={word}
          className="absolute font-mono font-bold text-xs whitespace-nowrap"
          style={{
            left: `${(i * 13.7 + 5) % 88}%`,
            top: `${(i * 17.3 + 3) % 88}%`,
            color: "rgba(34,197,94,0.08)",
          }}
          animate={{
            opacity: [0.4, 1, 0.4],
            y: [0, -14, 0],
          }}
          transition={{
            duration: 3.5 + (i % 5) * 0.8,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeInOut",
          }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}

// ─── Blinking cursor ──────────────────────────────────────────────────────────

function TerminalCursor(): JSX.Element {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setVisible((v) => !v), 530);
    return () => clearInterval(timer);
  }, []);

  return (
    <span
      className="inline-block w-[7px] h-[14px] align-middle ml-0.5 transition-opacity duration-75"
      style={{
        background: "hsl(142 76% 55%)",
        opacity: visible ? 1 : 0,
      }}
    />
  );
}

// ─── Welcome page ─────────────────────────────────────────────────────────────

export function Welcome(): JSX.Element {
  const { goNext } = useInstallation();
  const { language } = useLanguage();

  const stats: { value: string; labelKey: "welcome.stats.stars" | "welcome.stats.skills" | "welcome.stats.channels" | "welcome.stats.providers" }[] = [
    { value: "200K+", labelKey: "welcome.stats.stars" },
    { value: "40+",   labelKey: "welcome.stats.skills" },
    { value: "6",     labelKey: "welcome.stats.channels" },
    { value: "5+",    labelKey: "welcome.stats.providers" },
  ];

  return (
    <div className="relative flex flex-col h-full overflow-hidden" style={{ background: "#080a08" }}>

      {/* ── Floating background text ── */}
      <FloatingTerminalText />

      {/* ── Scan line overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)",
        }}
        aria-hidden
      />

      {/* ── Language toggle ── */}
      <div className="relative flex justify-end px-5 pt-4 z-10">
        <LanguageToggle />
      </div>

      {/* ── Main content ── */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 z-10">

        {/* Glowing lobster */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, type: "spring", stiffness: 160 }}
          className="text-6xl mb-4"
          style={{ filter: "drop-shadow(0 0 18px rgba(34,197,94,0.55)) drop-shadow(0 0 36px rgba(34,197,94,0.25))" }}
        >
          🦞
        </motion.div>

        {/* Terminal prompt */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-1.5 mb-5 px-3 py-1.5 rounded-md font-mono text-[11px]"
          style={{
            background: "rgba(34,197,94,0.06)",
            border: "1px solid rgba(34,197,94,0.18)",
          }}
        >
          <span style={{ color: "hsl(142 76% 55%)" }}>●</span>
          <span style={{ color: "#71717a" }}>openclaw@installer</span>
          <span style={{ color: "#3f3f46" }}>~</span>
          <span style={{ color: "#52525b" }}>$</span>
          <span style={{ color: "rgba(34,197,94,0.7)" }}>ready</span>
          <TerminalCursor />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="text-center mb-2"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] mb-2" style={{ color: "#52525b" }}>
            {language === "es" ? "// instala" : "// install"}
          </p>
          <h1 className="text-[2.8rem] font-black tracking-tight leading-none">
            <span style={{ color: "#f4f4f5" }}>Open</span>
            <span
              style={{
                color: "hsl(142 76% 55%)",
                textShadow: "0 0 16px rgba(34,197,94,0.7), 0 0 32px rgba(34,197,94,0.35)",
              }}
            >
              Claw
            </span>
          </h1>
          <p
            className="text-xl font-bold font-mono mt-1.5"
            style={{ color: "hsl(142 76% 55%)" }}
          >
            {language === "es" ? "en un solo clic" : "in one click"}
          </p>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.32 }}
          className="font-mono text-[11px] text-center max-w-xs mb-6 leading-relaxed"
          style={{ color: "#3f3f46" }}
        >
          {language === "es"
            ? "// Agente IA • Docker • Seguridad • Multi-canal"
            : "// AI Agent • Docker • Security • Multi-channel"}
        </motion.p>

        {/* CTA button */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          whileHover={{
            scale: 1.04,
            boxShadow: "0 0 28px rgba(34,197,94,0.5), 0 0 8px rgba(34,197,94,0.3)",
          }}
          whileTap={{ scale: 0.96 }}
          onClick={goNext}
          className="no-drag flex items-center gap-2.5 px-9 py-3 font-bold font-mono rounded-lg text-[13px] transition-shadow"
          style={{
            background: "hsl(142 76% 55%)",
            color: "#080a08",
            boxShadow: "0 0 16px rgba(34,197,94,0.32)",
          }}
        >
          <span>{language === "es" ? "INICIAR_INSTALACIÓN" : "START_INSTALL"}</span>
          <span style={{ opacity: 0.65 }}>&gt;</span>
        </motion.button>
      </div>

      {/* ── Stats bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="relative z-10"
        style={{ borderTop: "1px solid rgba(34,197,94,0.1)", background: "rgba(8,10,8,0.9)" }}
      >
        <div className="flex items-center justify-around px-4 py-2.5">
          {stats.map((stat) => (
            <div key={stat.labelKey} className="flex flex-col items-center gap-0.5">
              <span
                className="text-sm font-black font-mono"
                style={{ color: "hsl(142 76% 55%)" }}
              >
                {stat.value}
              </span>
              <span className="font-mono uppercase tracking-wide" style={{ fontSize: "9px", color: "#3f3f46" }}>
                {t(language, stat.labelKey)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
