/*
 * DESIGN: Terminal Noir — Channel selection step
 */

import { motion } from "framer-motion";
import { CHANNELS } from "@/lib/openclaw-data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MessageCircle,
  Send,
  Hash,
  Lock,
  Globe,
  Check,
} from "lucide-react";

interface ChannelsStepProps {
  selectedChannels: Set<string>;
  toggleChannel: (id: string) => void;
  phoneNumber: string;
  setPhoneNumber: (v: string) => void;
  apiKeys: Record<string, string>;
  setApiKey: (key: string, value: string) => void;
}

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  "message-circle": <MessageCircle className="w-6 h-6" />,
  send: <Send className="w-6 h-6" />,
  hash: <Hash className="w-6 h-6" />,
  slack: <Hash className="w-6 h-6" />,
  lock: <Lock className="w-6 h-6" />,
  globe: <Globe className="w-6 h-6" />,
};

export default function ChannelsStep({
  selectedChannels,
  toggleChannel,
  phoneNumber,
  setPhoneNumber,
  apiKeys,
  setApiKey,
}: ChannelsStepProps) {
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
            Conecta tus canales
          </h2>
        </div>
        <p className="text-muted-foreground text-sm pl-4">
          OpenClaw se conecta a WhatsApp, Telegram, Discord, Slack, Signal y WebChat. Selecciona los canales que usarás.
        </p>
      </div>

      {/* Channel cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CHANNELS.map((channel) => {
          const isSelected = selectedChannels.has(channel.id);
          return (
            <motion.button
              key={channel.id}
              onClick={() => toggleChannel(channel.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`
                relative p-4 rounded border text-left transition-all
                ${isSelected
                  ? "border-[oklch(0.85_0.25_145)] bg-[oklch(0.85_0.25_145_/_0.05)]"
                  : "border-border bg-card hover:border-[oklch(0.85_0.25_145_/_0.3)]"
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className={`mb-3 ${isSelected ? "text-neon-green" : "text-muted-foreground"}`}>
                  {CHANNEL_ICONS[channel.icon]}
                </div>
                <div
                  className={`
                    w-5 h-5 rounded-sm border flex items-center justify-center transition-all
                    ${isSelected
                      ? "bg-[oklch(0.85_0.25_145)] border-[oklch(0.85_0.25_145)]"
                      : "border-[oklch(0.3_0.02_260)]"
                    }
                  `}
                >
                  {isSelected && <Check className="w-3 h-3 text-[oklch(0.08_0.005_260)]" />}
                </div>
              </div>
              <h3 className={`font-display font-semibold ${isSelected ? "text-neon-green" : "text-foreground"}`}>
                {channel.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">{channel.description}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Channel-specific config */}
      {selectedChannels.has("whatsapp") && (
        <div className="p-4 rounded border border-border bg-[oklch(0.1_0.006_260)] space-y-3">
          <Label className="text-neon-green text-xs uppercase tracking-wider">
            WhatsApp — Tu número de teléfono
          </Label>
          <Input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1234567890"
            className="bg-input border-border text-foreground font-mono text-sm focus:border-[oklch(0.85_0.25_145)] focus:ring-[oklch(0.85_0.25_145_/_0.2)]"
          />
          <p className="text-xs text-muted-foreground">
            El número desde el que enviarás mensajes al agente. Formato internacional con +
          </p>
        </div>
      )}

      {selectedChannels.has("telegram") && (
        <div className="p-4 rounded border border-border bg-[oklch(0.1_0.006_260)] space-y-3">
          <Label className="text-neon-green text-xs uppercase tracking-wider">
            Telegram — Bot Token
          </Label>
          <Input
            type="password"
            value={apiKeys["TELEGRAM_BOT_TOKEN"] || ""}
            onChange={(e) => setApiKey("TELEGRAM_BOT_TOKEN", e.target.value)}
            placeholder="123456:ABC-DEF..."
            className="bg-input border-border text-foreground font-mono text-sm focus:border-[oklch(0.85_0.25_145)] focus:ring-[oklch(0.85_0.25_145_/_0.2)]"
          />
          <p className="text-xs text-muted-foreground">
            Obtén tu token de <span className="text-neon-cyan">@BotFather</span> en Telegram. Opcional ahora.
          </p>
        </div>
      )}

      {selectedChannels.has("discord") && (
        <div className="p-4 rounded border border-border bg-[oklch(0.1_0.006_260)] space-y-3">
          <Label className="text-neon-green text-xs uppercase tracking-wider">
            Discord — Bot Token
          </Label>
          <Input
            type="password"
            value={apiKeys["DISCORD_BOT_TOKEN"] || ""}
            onChange={(e) => setApiKey("DISCORD_BOT_TOKEN", e.target.value)}
            placeholder="MTk..."
            className="bg-input border-border text-foreground font-mono text-sm focus:border-[oklch(0.85_0.25_145)] focus:ring-[oklch(0.85_0.25_145_/_0.2)]"
          />
          <p className="text-xs text-muted-foreground">
            Crea un bot en <span className="text-neon-cyan">Discord Developer Portal</span>. Opcional ahora.
          </p>
        </div>
      )}

      {selectedChannels.size === 0 && (
        <div className="p-4 rounded border border-[oklch(0.8_0.2_85_/_0.3)] bg-[oklch(0.8_0.2_85_/_0.05)]">
          <p className="text-xs text-[oklch(0.8_0.2_85)]">
            Selecciona al menos un canal. WebChat siempre está disponible como fallback.
          </p>
        </div>
      )}
    </motion.div>
  );
}
