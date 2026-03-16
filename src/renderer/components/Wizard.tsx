import { AnimatePresence, motion } from "framer-motion";
import { useInstallation } from "@/context/InstallationContext";
import { Welcome } from "@/pages/Welcome";
import { SystemCheck } from "@/pages/SystemCheck";
import { Deployment } from "@/pages/Deployment";
import { SecuritySetup } from "@/pages/SecuritySetup";
import { SetupType } from "@/pages/SetupType";
import { AgentName } from "@/pages/AgentName";
import { ModelSelection } from "@/pages/ModelSelection";
import { ApiKey } from "@/pages/ApiKey";
import { Channels } from "@/pages/Channels";
import { ChannelCredentials } from "@/pages/ChannelCredentials";
import { Installing } from "@/pages/Installing";
import { Success } from "@/pages/Success";

const PAGE_COMPONENTS = {
  "welcome": Welcome,
  "system-check": SystemCheck,
  "deployment": Deployment,
  "security": SecuritySetup,
  "setup-type": SetupType,
  "agent-name": AgentName,
  "model": ModelSelection,
  "api-key": ApiKey,
  "channels": Channels,
  "credentials": ChannelCredentials,
  "installing": Installing,
  "success": Success,
} as const;

export function Wizard(): JSX.Element {
  const { step } = useInstallation();
  const PageComponent = PAGE_COMPONENTS[step];

  return (
    <div className="h-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="h-full"
        >
          <PageComponent />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
