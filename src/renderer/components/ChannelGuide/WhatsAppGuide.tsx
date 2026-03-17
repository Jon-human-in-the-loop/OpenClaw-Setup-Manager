import { GuideModal } from "@/components/GuideModal";

interface Props {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    title: "Accede a Meta for Developers",
    titleEn: "Go to Meta for Developers",
    description: "Ve a developers.facebook.com e inicia sesión con tu cuenta de Facebook.",
    descriptionEn: "Go to developers.facebook.com and sign in with your Facebook account.",
    url: "https://developers.facebook.com/",
  },
  {
    title: "Crea o selecciona una app",
    titleEn: "Create or select an app",
    description: "En 'My Apps', click en 'Create App' → selecciona tipo 'Business'.",
    descriptionEn: "In 'My Apps', click 'Create App' → select type 'Business'.",
  },
  {
    title: "Agrega el producto WhatsApp",
    titleEn: "Add the WhatsApp product",
    description: "En el dashboard de la app, busca 'WhatsApp' en la lista de productos y click en 'Set up'.",
    descriptionEn: "In the app dashboard, find 'WhatsApp' in the products list and click 'Set up'.",
  },
  {
    title: "Ve a WhatsApp > API Setup",
    titleEn: "Go to WhatsApp > API Setup",
    description: "En el menú lateral verás 'WhatsApp > API Setup'. Ahí aparece tu número de teléfono de prueba.",
    descriptionEn: "In the left menu you'll see 'WhatsApp > API Setup'. Your test phone number appears there.",
    url: "https://business.facebook.com/wa/manage/phone-numbers",
  },
  {
    title: "Copia el número en formato internacional",
    titleEn: "Copy the number in international format",
    description: "Copia el número incluyendo el código de país. Ejemplo: +521234567890 (México), +11234567890 (USA).",
    descriptionEn: "Copy the number including country code. Example: +521234567890 (Mexico), +11234567890 (USA).",
  },
];

export function WhatsAppGuide({ open, onClose }: Props): JSX.Element {
  return (
    <GuideModal
      open={open}
      onClose={onClose}
      title="Cómo obtener tu número de WhatsApp Business"
      titleEn="How to get your WhatsApp Business number"
      steps={STEPS}
    />
  );
}
