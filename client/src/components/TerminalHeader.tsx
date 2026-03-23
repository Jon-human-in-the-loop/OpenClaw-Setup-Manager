/*
 * DESIGN: Terminal Noir — Header with terminal aesthetic
 * Blinking cursor, neon green accents, monospace typography
 */

import { motion } from "framer-motion";

export default function TerminalHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="container flex items-center justify-between h-14">
        <div className="flex items-center gap-3">
          {/* Terminal dots */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[oklch(0.65_0.25_25)]" />
            <div className="w-3 h-3 rounded-full bg-[oklch(0.8_0.2_85)]" />
            <div className="w-3 h-3 rounded-full bg-[oklch(0.85_0.25_145)]" />
          </div>
          <div className="h-4 w-px bg-border mx-1" />
          <motion.span
            className="font-display text-lg font-bold tracking-tight text-neon-green text-glow-green"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            openclaw
          </motion.span>
          <span className="text-terminal-dim text-xs">installer</span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://openclaw.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-terminal-dim hover:text-neon-green transition-colors"
          >
            openclaw.ai
          </a>
          <a
            href="https://github.com/openclaw/openclaw"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-terminal-dim hover:text-neon-green transition-colors"
          >
            github
          </a>
          <a
            href="https://docs.openclaw.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-terminal-dim hover:text-neon-green transition-colors"
          >
            docs
          </a>
        </div>
      </div>
    </header>
  );
}
