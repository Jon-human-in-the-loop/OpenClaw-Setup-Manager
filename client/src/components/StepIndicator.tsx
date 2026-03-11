/*
 * DESIGN: Terminal Noir — Step indicator with terminal pipe characters
 */

import { motion } from "framer-motion";
import type { WizardStep } from "@/hooks/useInstaller";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: WizardStep[];
  currentStep: WizardStep;
  stepLabels: Record<WizardStep, string>;
  onStepClick: (step: WizardStep) => void;
  currentStepIndex: number;
}

export default function StepIndicator({
  steps,
  currentStep,
  stepLabels,
  onStepClick,
  currentStepIndex,
}: StepIndicatorProps) {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex items-center gap-0 min-w-max mx-auto justify-center">
        {steps.map((step, i) => {
          const isActive = step === currentStep;
          const isCompleted = i < currentStepIndex;
          const isClickable = i <= currentStepIndex;

          return (
            <div key={step} className="flex items-center">
              <button
                onClick={() => isClickable && onStepClick(step)}
                disabled={!isClickable}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono transition-all
                  ${isActive
                    ? "text-neon-green bg-[oklch(0.85_0.25_145_/_0.1)] border border-[oklch(0.85_0.25_145_/_0.3)]"
                    : isCompleted
                      ? "text-neon-green/70 hover:text-neon-green"
                      : "text-terminal-dim"
                  }
                  ${isClickable ? "cursor-pointer" : "cursor-default"}
                `}
              >
                <span
                  className={`
                    w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-bold
                    ${isActive
                      ? "bg-[oklch(0.85_0.25_145)] text-[oklch(0.08_0.005_260)]"
                      : isCompleted
                        ? "bg-[oklch(0.85_0.25_145_/_0.2)] text-neon-green"
                        : "bg-[oklch(0.18_0.008_260)] text-terminal-dim"
                    }
                  `}
                >
                  {isCompleted ? <Check className="w-3 h-3" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{stepLabels[step]}</span>
              </button>
              {i < steps.length - 1 && (
                <div
                  className={`w-6 h-px mx-1 ${
                    i < currentStepIndex
                      ? "bg-[oklch(0.85_0.25_145_/_0.4)]"
                      : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
