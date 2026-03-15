import { GuideModal } from "@/components/GuideModal";

interface Props {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    title: "Ve al Discord Developer Portal",
    titleEn: "Go to the Discord Developer Portal",
    description: "Abre discord.com/developers/applications en tu navegador e inicia sesión con tu cuenta de Discord.",
    descriptionEn: "Open discord.com/developers/applications in your browser and sign in with your Discord account.",
    url: "https://discord.com/developers/applications",
  },
  {
    title: "Crea una nueva aplicación",
    titleEn: "Create a new application",
    description: "Click en el botón 'New Application' (arriba a la derecha). Dale un nombre a tu aplicación.",
    descriptionEn: "Click the 'New Application' button (top right). Give your application a name.",
  },
  {
    title: "Ve a la sección 'Bot'",
    titleEn: "Go to the 'Bot' section",
    description: "En el menú lateral izquierdo, click en 'Bot'.",
    descriptionEn: "In the left side menu, click on 'Bot'.",
  },
  {
    title: "Crea el bot y obtén el token",
    titleEn: "Create the bot and get the token",
    description: "Click en 'Reset Token' → confirma la acción. El token aparecerá, solo se muestra una vez.",
    descriptionEn: "Click 'Reset Token' → confirm the action. The token will appear, it's only shown once.",
  },
  {
    title: "Activa los Privileged Gateway Intents",
    titleEn: "Enable Privileged Gateway Intents",
    description: "Más abajo en la página 'Bot', activa 'Message Content Intent' para que el bot pueda leer mensajes.",
    descriptionEn: "Further down on the 'Bot' page, enable 'Message Content Intent' so the bot can read messages.",
  },
  {
    title: "Invita el bot a tu servidor",
    titleEn: "Invite the bot to your server",
    description: "Ve a OAuth2 > URL Generator, selecciona scopes 'bot' + permissions 'Send Messages'. Abre la URL generada.",
    descriptionEn: "Go to OAuth2 > URL Generator, select scopes 'bot' + permissions 'Send Messages'. Open the generated URL.",
  },
];

export function DiscordGuide({ open, onClose }: Props): JSX.Element {
  return (
    <GuideModal
      open={open}
      onClose={onClose}
      title="Cómo crear un bot de Discord"
      titleEn="How to create a Discord bot"
      steps={STEPS}
    />
  );
}
