import { GuideModal } from "@/components/GuideModal";

interface Props {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    title: "Ve a la Slack API",
    titleEn: "Go to the Slack API",
    description: "Abre api.slack.com/apps en tu navegador e inicia sesión con tu workspace de Slack.",
    descriptionEn: "Open api.slack.com/apps in your browser and sign in with your Slack workspace.",
    url: "https://api.slack.com/apps",
  },
  {
    title: "Crea una nueva App",
    titleEn: "Create a new App",
    description: "Click en 'Create New App' → selecciona 'From scratch' → dale un nombre y elige tu workspace.",
    descriptionEn: "Click 'Create New App' → select 'From scratch' → give it a name and choose your workspace.",
  },
  {
    title: "Configura los OAuth Scopes",
    titleEn: "Configure OAuth Scopes",
    description: "Ve a 'OAuth & Permissions' → en 'Bot Token Scopes' agrega: chat:write, channels:read, im:read, im:write.",
    descriptionEn: "Go to 'OAuth & Permissions' → in 'Bot Token Scopes' add: chat:write, channels:read, im:read, im:write.",
  },
  {
    title: "Instala la App en tu workspace",
    titleEn: "Install the App to your workspace",
    description: "Sube en la misma página y click en 'Install to Workspace' → autoriza los permisos.",
    descriptionEn: "Scroll up on the same page and click 'Install to Workspace' → authorize the permissions.",
  },
  {
    title: "Copia el Bot User OAuth Token",
    titleEn: "Copy the Bot User OAuth Token",
    description: "Después de instalar, el token aparece en la sección 'OAuth Tokens'. Empieza con 'xoxb-'. Cópialo.",
    descriptionEn: "After installing, the token appears in the 'OAuth Tokens' section. It starts with 'xoxb-'. Copy it.",
  },
];

export function SlackGuide({ open, onClose }: Props): JSX.Element {
  return (
    <GuideModal
      open={open}
      onClose={onClose}
      title="Cómo crear un bot de Slack"
      titleEn="How to create a Slack bot"
      steps={STEPS}
    />
  );
}
