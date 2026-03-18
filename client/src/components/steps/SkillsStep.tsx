/*
 * DESIGN: Terminal Noir — Skills selection step with packs and categories
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SKILLS,
  SKILL_PACKS,
  CATEGORY_META,
  type Skill,
  type SkillCategory,
} from "@/lib/openclaw-data";
import {
  Search,
  Package,
  Check,
  Shield,
  Zap,
  Terminal as TerminalIcon,
  Layers,
  Download,
  Key,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface SkillsStepProps {
  selectedSkillIds: Set<string>;
  toggleSkill: (id: string) => void;
  selectSkillPack: (ids: string[]) => void;
}

const PACK_ICONS: Record<string, React.ReactNode> = {
  terminal: <TerminalIcon className="w-5 h-5" />,
  zap: <Zap className="w-5 h-5" />,
  shield: <Shield className="w-5 h-5" />,
  layers: <Layers className="w-5 h-5" />,
};

const PACK_COLORS: Record<string, string> = {
  green: "oklch(0.85 0.25 145)",
  red: "oklch(0.65 0.25 25)",
  cyan: "oklch(0.78 0.15 210)",
};

export default function SkillsStep({
  selectedSkillIds,
  toggleSkill,
  selectSkillPack,
}: SkillsStepProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<SkillCategory | "all">("all");

  const categories = useMemo(() => {
    const cats = Object.keys(CATEGORY_META) as SkillCategory[];
    return cats;
  }, []);

  const filteredSkills = useMemo(() => {
    let skills = SKILLS;
    if (activeCategory !== "all") {
      skills = skills.filter((s) => s.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      skills = skills.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.slug.toLowerCase().includes(q)
      );
    }
    return skills;
  }, [activeCategory, searchQuery]);

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
            Selecciona tus skills
          </h2>
        </div>
        <p className="text-muted-foreground text-sm pl-4">
          Elige skills individuales o usa un pack pre-configurado. Las skills marcadas como esenciales ya están seleccionadas.
        </p>
        <div className="flex items-center gap-3 pl-4 mt-2">
          <span className="text-xs text-neon-green font-mono">
            {selectedSkillIds.size} skills seleccionadas
          </span>
          <span className="text-xs text-terminal-dim">|</span>
          <span className="text-xs text-terminal-dim font-mono">
            {SKILLS.length} disponibles
          </span>
        </div>
      </div>

      {/* Skill Packs */}
      <div className="space-y-3">
        <h3 className="text-xs text-neon-cyan uppercase tracking-wider font-semibold flex items-center gap-2">
          <Package className="w-3.5 h-3.5" /> Packs rápidos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SKILL_PACKS.map((pack) => {
            const allSelected = pack.skills.every((id) => selectedSkillIds.has(id));
            const color = PACK_COLORS[pack.color];
            return (
              <button
                key={pack.id}
                onClick={() => selectSkillPack(pack.skills)}
                className={`
                  p-4 rounded border text-left transition-all group
                  ${allSelected
                    ? `border-[${color}] bg-[${color}]/5`
                    : "border-border bg-card hover:border-[oklch(0.85_0.25_145_/_0.3)]"
                  }
                `}
                style={allSelected ? {
                  borderColor: color,
                  backgroundColor: `color-mix(in oklch, ${color} 5%, transparent)`,
                } : {}}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ color: allSelected ? color : undefined }} className={allSelected ? "" : "text-muted-foreground"}>
                      {PACK_ICONS[pack.icon]}
                    </span>
                    <span className={`font-display font-semibold text-sm ${allSelected ? "" : "text-foreground"}`}
                      style={allSelected ? { color } : {}}>
                      {pack.name}
                    </span>
                  </div>
                  {allSelected && (
                    <Check className="w-4 h-4" style={{ color }} />
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{pack.description}</p>
                <p className="text-[10px] text-terminal-dim mt-2 font-mono">{pack.skills.length} skills</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-terminal-dim" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar skills..."
            className="pl-9 bg-input border-border text-foreground font-mono text-sm focus:border-[oklch(0.85_0.25_145)] focus:ring-[oklch(0.85_0.25_145_/_0.2)]"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 flex-wrap">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
            activeCategory === "all"
              ? "bg-[oklch(0.85_0.25_145_/_0.15)] text-neon-green border border-[oklch(0.85_0.25_145_/_0.3)]"
              : "text-terminal-dim hover:text-foreground border border-transparent"
          }`}
        >
          Todas ({SKILLS.length})
        </button>
        {categories.map((cat) => {
          const meta = CATEGORY_META[cat];
          const count = SKILLS.filter((s) => s.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                activeCategory === cat
                  ? "bg-[oklch(0.85_0.25_145_/_0.15)] text-neon-green border border-[oklch(0.85_0.25_145_/_0.3)]"
                  : "text-terminal-dim hover:text-foreground border border-transparent"
              }`}
            >
              {meta.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Skills grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
        <AnimatePresence mode="popLayout">
          {filteredSkills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              isSelected={selectedSkillIds.has(skill.id)}
              onToggle={() => toggleSkill(skill.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function SkillCard({
  skill,
  isSelected,
  onToggle,
}: {
  skill: Skill;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onToggle}
      className={`
        p-3 rounded border text-left transition-all w-full
        ${isSelected
          ? "border-[oklch(0.85_0.25_145_/_0.5)] bg-[oklch(0.85_0.25_145_/_0.05)]"
          : "border-border bg-card hover:border-[oklch(0.85_0.25_145_/_0.2)]"
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-mono font-medium truncate ${isSelected ? "text-neon-green" : "text-foreground"}`}>
              {skill.name}
            </span>
            {skill.essential && (
              <span className="text-[9px] bg-[oklch(0.65_0.25_25_/_0.15)] text-[oklch(0.65_0.25_25)] px-1 py-0.5 rounded font-mono shrink-0">
                ESENCIAL
              </span>
            )}
            {skill.recommended && !skill.essential && (
              <span className="text-[9px] bg-[oklch(0.78_0.15_210_/_0.15)] text-neon-cyan px-1 py-0.5 rounded font-mono shrink-0">
                REC
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
            {skill.description}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[10px] text-terminal-dim font-mono">{skill.slug}</span>
            {skill.downloads && (
              <span className="flex items-center gap-0.5 text-[10px] text-terminal-dim">
                <Download className="w-2.5 h-2.5" /> {skill.downloads}
              </span>
            )}
            {skill.requiresApiKey && (
              <span className="flex items-center gap-0.5 text-[10px] text-[oklch(0.8_0.2_85)]">
                <Key className="w-2.5 h-2.5" /> API Key
              </span>
            )}
          </div>
        </div>
        <div
          className={`
            w-5 h-5 rounded-sm border flex items-center justify-center shrink-0 mt-0.5 transition-all
            ${isSelected
              ? "bg-[oklch(0.85_0.25_145)] border-[oklch(0.85_0.25_145)]"
              : "border-[oklch(0.3_0.02_260)] bg-transparent"
            }
          `}
        >
          {isSelected && <Check className="w-3 h-3 text-[oklch(0.08_0.005_260)]" />}
        </div>
      </div>
    </motion.button>
  );
}
