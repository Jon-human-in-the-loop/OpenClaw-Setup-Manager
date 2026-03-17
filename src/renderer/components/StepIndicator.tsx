import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { useInstallation, type WizardStep } from "@/context/InstallationContext";

const VISIBLE_STEPS: WizardStep[] = [
  "welcome",
  "system-check",
  "setup-type",
  "agent-name",
  "model",
  "channels",
  "installing",
  "success",
];

const STEP_NUMBERS: Record<WizardStep, number> = {
  "welcome": 1,
  "system-check": 2,
  "deployment": 3,
  "security": 3,
  "setup-type": 3,
  "agent-name": 4,
  "model": 5,
  "api-key": 5,
  "channels": 6,
  "credentials": 6,
  "installing": 7,
  "success": 8,
};

export function StepIndicator(): JSX.Element {
  const { step } = useInstallation();
  const currentNumber = STEP_NUMBERS[step];

  return (
    <div className="flex items-center gap-1.5 py-2">
      {VISIBLE_STEPS.map((s, i) => {
        const number = i + 1;
        const isDone = number < currentNumber;
        const isCurrent = number === currentNumber;

        return (
          <div key={s} className="flex items-center gap-1.5">
            <motion.div
              initial={false}
              animate={{
                scale: isCurrent ? 1.1 : 1,
              }}
              className={[
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                isDone
                  ? "bg-primary text-primary-foreground"
                  : isCurrent
                    ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                    : "bg-muted text-muted-foreground",
              ].join(" ")}
            >
              {isDone ? <Check size={11} strokeWidth={3} /> : number}
            </motion.div>
            {i < VISIBLE_STEPS.length - 1 && (
              <div
                className={[
                  "h-px w-4 transition-colors",
                  number < currentNumber ? "bg-primary" : "bg-border",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
