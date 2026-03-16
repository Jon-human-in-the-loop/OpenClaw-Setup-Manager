import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Key, Eye, EyeOff, RefreshCw, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle } from "lucide-react";
import { useInstallation } from "@/context/InstallationContext";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/i18n";
import { maskToken, validateGatewayToken } from "@/lib/security";
import { StepIndicator } from "@/components/StepIndicator";
import { LanguageToggle } from "@/components/LanguageToggle";

export function SecuritySetup(): JSX.Element {
  const {
    goNext, goPrev,
    gatewayToken, setGatewayToken, regenerateToken,
    gatewayAuthEnabled, setGatewayAuthEnabled,
    deploymentType,
  } = useInstallation();
  const { language } = useLanguage();

  const [showToken, setShowToken] = useState(false);
  const [tokenError, setTokenError] = useState("");

  const validation = validateGatewayToken(gatewayToken);
  const isDocker = deploymentType === "docker" || deploymentType === "wsl2-docker";

  const handleTokenChange = (value: string) => {
    setGatewayToken(value);
    const result = validateGatewayToken(value);
    setTokenError(result.error ?? "");
  };

  const handleRegenerate = () => {
    regenerateToken();
    setTokenError("");
  };

  const canContinue = !gatewayAuthEnabled || validation.valid;

  const securityItems = [
    {
      icon: "🔒",
      titleKey: "security.item.localhost.title",
      descKey: "security.item.localhost.desc",
      ok: true,
    },
    {
      icon: "🐳",
      titleKey: "security.item.isolation.title",
      descKey: isDocker ? "security.item.isolation.docker" : "security.item.isolation.local",
      ok: isDocker,
    },
    {
      icon: "🔑",
      titleKey: "security.item.auth.title",
      descKey: "security.item.auth.desc",
      ok: gatewayAuthEnabled,
    },
    {
      icon: "⚡",
      titleKey: "security.item.update.title",
      descKey: "security.item.update.desc",
      ok: true,
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2">
        <StepIndicator />
        <LanguageToggle />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-3 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Título */}
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              {t(language, "security.title")}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {t(language, "security.subtitle")}
          </p>

          {/* Estado de seguridad */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {securityItems.map((item, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs ${
                  item.ok
                    ? "border-primary/20 bg-primary/5"
                    : "border-yellow-500/20 bg-yellow-500/5"
                }`}
              >
                <span className="text-base leading-none mt-0.5">{item.icon}</span>
                <div>
                  <p className={`font-medium ${item.ok ? "text-foreground" : "text-yellow-300"}`}>
                    {t(language, item.titleKey as any)}
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    {t(language, item.descKey as any)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Token de gateway */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  {t(language, "security.token.title")}
                </span>
              </div>
              {/* Toggle auth */}
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-muted-foreground">
                  {t(language, "security.token.enable")}
                </span>
                <button
                  onClick={() => setGatewayAuthEnabled(!gatewayAuthEnabled)}
                  className={`relative w-9 h-5 rounded-full transition-colors ${
                    gatewayAuthEnabled ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      gatewayAuthEnabled ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </label>
            </div>

            <p className="text-xs text-muted-foreground">
              {t(language, "security.token.desc")}
            </p>

            {gatewayAuthEnabled && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type={showToken ? "text" : "password"}
                      value={gatewayToken}
                      onChange={(e) => handleTokenChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary pr-8"
                      placeholder="Token de acceso..."
                    />
                    <button
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showToken
                        ? <EyeOff className="w-3.5 h-3.5" />
                        : <Eye className="w-3.5 h-3.5" />
                      }
                    </button>
                  </div>
                  <button
                    onClick={handleRegenerate}
                    title={t(language, "security.token.regenerate")}
                    className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {tokenError && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {tokenError}
                  </p>
                )}

                {!tokenError && validation.valid && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {t(language, "security.token.ok")}
                    {!showToken && (
                      <span className="font-mono text-muted-foreground ml-1">
                        {maskToken(gatewayToken)}
                      </span>
                    )}
                  </p>
                )}
              </div>
            )}

            {!gatewayAuthEnabled && (
              <div className="flex items-start gap-1.5 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">
                  {t(language, "security.token.disabled.warning")}
                </p>
              </div>
            )}
          </div>

          {/* Nota adicional sobre seguridad */}
          <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 mt-3">
            <p className="font-medium text-foreground mb-1">
              {t(language, "security.note.title")}
            </p>
            <p>{t(language, "security.note.desc")}</p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-5 flex justify-between">
        <button
          onClick={goPrev}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {t(language, "common.back")}
        </button>
        <button
          onClick={goNext}
          disabled={!canContinue}
          className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {t(language, "common.next")}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
