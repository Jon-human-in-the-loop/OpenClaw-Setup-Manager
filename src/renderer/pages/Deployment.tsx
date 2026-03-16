import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Server, Container, Terminal, AlertTriangle, CheckCircle, Loader2, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useInstallation } from "@/context/InstallationContext";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/i18n";
import { StepIndicator } from "@/components/StepIndicator";
import { LanguageToggle } from "@/components/LanguageToggle";
import type { DeploymentType, PlatformCapabilities } from "../../types";

interface DeploymentOption {
  id: DeploymentType;
  titleKey: string;
  descKey: string;
  icon: React.ReactNode;
  badgeKey?: string;
  badgeColor?: string;
  warningKey?: string;
  requiresDocker?: boolean;
}

export function Deployment(): JSX.Element {
  const {
    goNext, goPrev,
    deploymentType, setDeploymentType,
    platformCapabilities, setPlatformCapabilities,
  } = useInstallation();
  const { language } = useLanguage();

  const [loading, setLoading] = useState(!platformCapabilities);

  // Cargar capabilities si aún no se cargaron (puede que SystemCheck las haya cargado ya)
  useEffect(() => {
    if (!platformCapabilities) {
      setLoading(true);
      window.api.system.check().then((result) => {
        setPlatformCapabilities(result.platformCapabilities);
        setDeploymentType(result.platformCapabilities.recommendedDeployment);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [platformCapabilities, setPlatformCapabilities, setDeploymentType]);

  const caps: PlatformCapabilities | null = platformCapabilities;
  const isWindows = caps?.os === "win32";
  const isMacOrLinux = caps?.os === "darwin" || caps?.os === "linux";
  const dockerInstalled = caps?.docker.installed ?? false;
  const dockerRunning = caps?.docker.running ?? false;

  const options: DeploymentOption[] = [];

  // Opción local (siempre disponible)
  options.push({
    id: "local",
    titleKey: "deployment.local.title",
    descKey: isWindows ? "deployment.local.desc.windows" : "deployment.local.desc",
    icon: <Terminal className="w-6 h-6" />,
    badgeKey: isWindows ? "deployment.local.badge.windows" : undefined,
    badgeColor: isWindows ? "text-emerald-400" : undefined,
    warningKey: isWindows ? "deployment.local.warning.windows" : "deployment.local.warning",
  });

  // Opción Docker (solo macOS/Linux)
  if (isMacOrLinux) {
    options.push({
      id: "docker",
      titleKey: "deployment.docker.title",
      descKey: "deployment.docker.desc",
      icon: <Container className="w-6 h-6" />,
      badgeKey: "deployment.docker.badge",
      badgeColor: "text-emerald-400",
      requiresDocker: true,
    });
  }

  // Opción WSL2 (solo Windows con WSL2 disponible)
  if (isWindows && caps?.wsl2Available) {
    options.push({
      id: "wsl2-docker",
      titleKey: "deployment.wsl2.title",
      descKey: "deployment.wsl2.desc",
      icon: <Server className="w-6 h-6" />,
      badgeKey: "deployment.wsl2.badge",
      badgeColor: "text-yellow-400",
      warningKey: "deployment.wsl2.warning",
      requiresDocker: true,
    });
  }

  const canContinue = !!deploymentType;

  // Si seleccionó Docker pero no está activo, mostrar aviso
  const dockerWarning =
    (deploymentType === "docker" || deploymentType === "wsl2-docker") &&
    dockerInstalled && !dockerRunning;

  const dockerMissing =
    (deploymentType === "docker" || deploymentType === "wsl2-docker") &&
    !dockerInstalled;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2">
        <StepIndicator />
        <LanguageToggle />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h2 className="text-xl font-bold text-foreground mb-1">
            {t(language, "deployment.title")}
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            {t(language, "deployment.subtitle")}
          </p>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t(language, "common.loading")}
            </div>
          ) : (
            <div className="space-y-3">
              {options.map((opt) => {
                const isSelected = deploymentType === opt.id;
                const unavailable = opt.requiresDocker && !dockerInstalled && opt.id !== "wsl2-docker";

                return (
                  <button
                    key={opt.id}
                    onClick={() => !unavailable && setDeploymentType(opt.id)}
                    disabled={unavailable}
                    className={[
                      "w-full text-left rounded-xl border p-4 transition-all duration-200",
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border bg-card hover:border-primary/50",
                      unavailable ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icono */}
                      <div className={`mt-0.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                        {opt.icon}
                      </div>

                      {/* Texto */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="font-semibold text-sm text-foreground">
                            {t(language, opt.titleKey as any)}
                          </span>
                          {opt.badgeKey && (
                            <span className={`text-xs font-medium ${opt.badgeColor ?? "text-primary"}`}>
                              ✦ {t(language, opt.badgeKey as any)}
                            </span>
                          )}
                          {isSelected && (
                            <CheckCircle className="w-3.5 h-3.5 text-primary ml-auto flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {t(language, opt.descKey as any)}
                        </p>
                        {opt.warningKey && isSelected && (
                          <div className="flex items-start gap-1.5 mt-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                            <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-300">
                              {t(language, opt.warningKey as any)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Aviso Docker no instalado */}
              {dockerMissing && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <AlertTriangle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-300">
                    <p className="font-medium mb-0.5">{t(language, "deployment.docker.missing.title")}</p>
                    <p>{t(language, "deployment.docker.missing.desc")}</p>
                    <button
                      onClick={() => window.api.system.openUrl("https://docs.docker.com/get-docker/")}
                      className="mt-1 underline text-blue-400 hover:text-blue-300"
                    >
                      {t(language, "deployment.docker.missing.link")}
                    </button>
                  </div>
                </div>
              )}

              {/* Aviso Docker instalado pero no activo */}
              {dockerWarning && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <RefreshCw className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-300">
                    {t(language, "deployment.docker.notrunning")}
                  </p>
                </div>
              )}

              {/* Info de plataforma */}
              {caps && (
                <p className="text-xs text-muted-foreground text-center pt-1">
                  {t(language, "deployment.platform")}: <span className="text-foreground font-medium">{caps.os} {caps.arch}</span>
                  {caps.docker.installed && (
                    <> · Docker {caps.docker.version ?? ""} {caps.docker.running ? "✓" : "(inactivo)"}</>
                  )}
                </p>
              )}
            </div>
          )}
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
          disabled={!canContinue || loading}
          className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {t(language, "common.next")}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
