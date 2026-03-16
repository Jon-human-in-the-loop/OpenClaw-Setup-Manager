import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, Eye, EyeOff, HelpCircle } from "lucide-react";
import { useInstallation } from "@/context/InstallationContext";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/i18n";
import { StepIndicator } from "@/components/StepIndicator";
import { LanguageToggle } from "@/components/LanguageToggle";
import {
  WhatsAppGuide,
  TelegramGuide,
  DiscordGuide,
  SlackGuide,
} from "@/components/ChannelGuide";
import {
  validateWhatsAppNumber,
  validateTelegramToken,
  validateDiscordToken,
  validateSlackToken,
} from "@/lib/validation";

interface CredentialField {
  channelId: string;
  labelKey: string;
  placeholderKey: string;
  hintKey: string;
  value: string;
  onChange: (v: string) => void;
  validate: (v: string) => { valid: boolean; error?: string; errorEn?: string };
}

export function ChannelCredentials(): JSX.Element {
  const {
    channels,
    phoneNumber, setPhoneNumber,
    telegramToken, setTelegramToken,
    discordToken, setDiscordToken,
    slackToken, setSlackToken,
    goNext, goPrev,
  } = useInstallation();
  const { language } = useLanguage();
  const [showFields, setShowFields] = useState<Record<string, boolean>>({});
  const [openGuide, setOpenGuide] = useState<string | null>(null);

  const toggle = (id: string) => setShowFields((p) => ({ ...p, [id]: !p[id] }));

  const fields: CredentialField[] = [
    channels.has("whatsapp") && {
      channelId: "whatsapp",
      labelKey: "credentials.whatsapp.label",
      placeholderKey: "credentials.whatsapp.placeholder",
      hintKey: "credentials.whatsapp.hint",
      value: phoneNumber,
      onChange: setPhoneNumber,
      validate: validateWhatsAppNumber,
    },
    channels.has("telegram") && {
      channelId: "telegram",
      labelKey: "credentials.telegram.label",
      placeholderKey: "credentials.telegram.placeholder",
      hintKey: "credentials.telegram.hint",
      value: telegramToken,
      onChange: setTelegramToken,
      validate: validateTelegramToken,
    },
    channels.has("discord") && {
      channelId: "discord",
      labelKey: "credentials.discord.label",
      placeholderKey: "credentials.discord.placeholder",
      hintKey: "credentials.discord.hint",
      value: discordToken,
      onChange: setDiscordToken,
      validate: validateDiscordToken,
    },
    channels.has("slack") && {
      channelId: "slack",
      labelKey: "credentials.slack.label",
      placeholderKey: "credentials.slack.placeholder",
      hintKey: "credentials.slack.hint",
      value: slackToken,
      onChange: setSlackToken,
      validate: validateSlackToken,
    },
  ].filter(Boolean) as CredentialField[];

  const canContinue = fields.every((f) => {
    const val = f.value.trim();
    return val.length > 0 && f.validate(val).valid;
  });

  return (
    <div className="flex flex-col h-full px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <StepIndicator />
        <LanguageToggle />
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        <div className="mb-2">
          <h2 className="text-lg font-bold text-foreground mb-1">
            {t(language, "credentials.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t(language, "credentials.subtitle")}
          </p>
        </div>

        {fields.map((field, i) => {
          const validation = field.value ? field.validate(field.value.trim()) : null;
          return (
            <motion.div
              key={field.channelId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 bg-card rounded-xl border border-border space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground capitalize">
                  {t(language, field.labelKey as Parameters<typeof t>[1])}
                </label>
                <button
                  onClick={() => setOpenGuide(field.channelId)}
                  className="no-drag flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <HelpCircle size={11} />
                  {t(language, "common.guide")}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showFields[field.channelId] ? "text" : "password"}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={t(language, field.placeholderKey as Parameters<typeof t>[1])}
                  spellCheck={false}
                  autoComplete="off"
                  className={[
                    "no-drag w-full pr-10 pl-3.5 py-2.5 rounded-lg bg-muted border text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors",
                    field.value && validation && (validation.valid ? "border-primary/50" : "border-destructive/50"),
                    (!field.value || !validation) && "border-border",
                  ].join(" ")}
                />
                <button
                  onClick={() => toggle(field.channelId)}
                  className="no-drag absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  {showFields[field.channelId] ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                {t(language, field.hintKey as Parameters<typeof t>[1])}
              </p>

              {field.value && validation && !validation.valid && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/30 flex gap-2"
                >
                  <span className="text-destructive text-xs leading-none mt-0.5">⚠</span>
                  <p className="text-xs text-destructive">
                    {language === "es" ? validation.error : validation.errorEn}
                  </p>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 pt-4 border-t border-border mt-4">
        <button
          onClick={goPrev}
          className="no-drag flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={14} />
          {t(language, "common.back")}
        </button>
        <div className="flex-1" />
        <button
          onClick={goNext}
          disabled={!canContinue}
          className="no-drag flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {t(language, "common.install")}
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Dedicated channel guides */}
      <WhatsAppGuide open={openGuide === "whatsapp"} onClose={() => setOpenGuide(null)} />
      <TelegramGuide open={openGuide === "telegram"} onClose={() => setOpenGuide(null)} />
      <DiscordGuide open={openGuide === "discord"} onClose={() => setOpenGuide(null)} />
      <SlackGuide open={openGuide === "slack"} onClose={() => setOpenGuide(null)} />
    </div>
  );
}
