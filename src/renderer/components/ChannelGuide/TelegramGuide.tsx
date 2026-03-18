import { GuideModal } from "@/components/GuideModal";

interface Props {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    title: "Abre Telegram y busca @BotFather",
    titleEn: "Open Telegram and search for @BotFather",
    description: "En la barra de búsqueda de Telegram escribe '@BotFather' y abre la conversación oficial (tiene checkmark azul).",
    descriptionEn: "In Telegram's search bar type '@BotFather' and open the official conversation (has blue checkmark).",
    url: "https://t.me/BotFather",
  },
  {
    title: "Envía el comando /newbot",
    titleEn: "Send the /newbot command",
    description: "Escribe /newbot y presiona enviar. BotFather te pedirá un nombre para tu bot.",
    descriptionEn: "Type /newbot and press send. BotFather will ask for a name for your bot.",
  },
  {
    title: "Elige el nombre de tu bot",
    titleEn: "Choose your bot's name",
    description: "Escribe el nombre que quieras mostrar (ej: 'Mi Asistente'). Puede ser cualquier nombre.",
    descriptionEn: "Type the name you want to display (e.g.: 'My Assistant'). Can be any name.",
  },
  {
    title: "Elige el username del bot",
    titleEn: "Choose the bot's username",
    description: "El username debe terminar en 'bot' (ej: 'mi_asistente_bot'). Este será el @nombre del bot.",
    descriptionEn: "The username must end in 'bot' (e.g.: 'my_assistant_bot'). This will be the bot's @name.",
  },
  {
    title: "Copia el token",
    titleEn: "Copy the token",
    description: "BotFather te enviará un mensaje con el token. Tiene el formato: 1234567890:ABCdefGHIjklMNOpqrst. Copia todo ese texto.",
    descriptionEn: "BotFather will send a message with the token. It has the format: 1234567890:ABCdefGHIjklMNOpqrst. Copy all that text.",
  },
];

export function TelegramGuide({ open, onClose }: Props): JSX.Element {
  return (
    <GuideModal
      open={open}
      onClose={onClose}
      title="Cómo crear un bot de Telegram"
      titleEn="How to create a Telegram bot"
      steps={STEPS}
    />
  );
}
