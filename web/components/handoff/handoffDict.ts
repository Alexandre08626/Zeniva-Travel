export type HandoffLocale = "en" | "fr";

export interface HandoffDict {
  primaryButton: string;
  modalTitle: string;
  modalSub: string;
  optionChat: string;
  optionChatDesc: string;
  optionCall: string;
  optionCallDesc: string;
  agentsAvailable: (n: number) => string;
  noneAvailable: string;
  estimatedWait: (mins: number) => string;
  loadingAvailability: string;
  cancel: string;
  noAgentTitle: string;
  noAgentDesc: string;
  nameLabel: string;
  emailLabel: string;
  phoneLabel: string;
  messageLabel: string;
  submit: string;
  submitting: string;
  leadSuccessTitle: string;
  leadSuccessDesc: string;
  preCallTitle: string;
  preCallSub: string;
  cameraOn: string;
  cameraOff: string;
  micOn: string;
  micOff: string;
  joinCall: string;
  joining: string;
  selectCamera: string;
  selectMicrophone: string;
  permissionDenied: string;
  inCallStatus: { connecting: string; connected: string; reconnecting: string; failed: string };
  hangUp: string;
  postCallTitle: string;
  postCallDesc: string;
  goToPayment: string;
  resumeCall: string;
  // Chat waiting room (salle d'attente)
  waitingTitle: string;
  waitingSub: string;
  waitingChecking: string;
  waitingBusy: string;
  waitingEstimate: (mins: number) => string;
  startChatting: string;
  backToPage: string;
}

export const HANDOFF_EN: HandoffDict = {
  primaryButton: "Confirm with a human agent",
  modalTitle: "Talk to a human",
  modalSub: "Pick how you'd like to wrap up your booking — chat or video call.",
  optionChat: "Chat",
  optionChatDesc: "Message an agent — they see your full cart while you talk.",
  optionCall: "Video / audio call",
  optionCallDesc: "Hop on a real-time call right in your browser. No app needed.",
  agentsAvailable: (n) => (n === 1 ? "1 agent available" : `${n} agents available`),
  noneAvailable: "No agent is online right now",
  estimatedWait: (m) => (m <= 1 ? "Usual wait: under a minute" : `Usual wait: about ${m} min`),
  loadingAvailability: "Checking who's online…",
  cancel: "Cancel",
  noAgentTitle: "No one is online right now",
  noAgentDesc: "Leave us your contact and an agent will reach out within 15 minutes.",
  nameLabel: "Full name",
  emailLabel: "Email",
  phoneLabel: "Phone (optional)",
  messageLabel: "What can we help with? (optional)",
  submit: "Send my contact",
  submitting: "Sending…",
  leadSuccessTitle: "Got it!",
  leadSuccessDesc: "An agent will reach out shortly. We've also emailed you a confirmation.",
  preCallTitle: "Get ready for your call",
  preCallSub: "Test your camera and microphone before joining.",
  cameraOn: "Camera on",
  cameraOff: "Camera off",
  micOn: "Mic on",
  micOff: "Mic off",
  joinCall: "Join the call",
  joining: "Joining…",
  selectCamera: "Camera",
  selectMicrophone: "Microphone",
  permissionDenied: "Permission denied. Please allow camera & microphone in your browser settings, then refresh.",
  inCallStatus: {
    connecting: "Connecting…",
    connected: "Live",
    reconnecting: "Reconnecting…",
    failed: "Connection lost",
  },
  hangUp: "Hang up",
  postCallTitle: "Thanks for the call",
  postCallDesc: "Your agent has sent you a payment link. Click below to finish your booking.",
  goToPayment: "Go to payment",
  resumeCall: "Something wrong? Resume call",
  waitingTitle: "Connecting you to a Zeniva agent",
  waitingSub: "We are notifying our team. You can start chatting right now — your message will reach a real human.",
  waitingChecking: "Checking availability…",
  waitingBusy: "All agents are busy — leave us a message and we'll reply by email",
  waitingEstimate: (m) => (m <= 1 ? "est. wait under a minute" : `est. wait ${m} min`),
  startChatting: "Start chatting",
  backToPage: "Back to my page",
};

export const HANDOFF_FR: HandoffDict = {
  primaryButton: "Confirmer avec un agent humain",
  modalTitle: "Parle à un humain",
  modalSub: "Choisis comment tu veux finaliser ta réservation — chat ou appel vidéo.",
  optionChat: "Chat",
  optionChatDesc: "Discute avec un agent — il voit ton panier complet pendant la conversation.",
  optionCall: "Appel vidéo / audio",
  optionCallDesc: "Lance un appel en direct dans ton navigateur. Aucune application requise.",
  agentsAvailable: (n) => (n === 1 ? "1 agent disponible" : `${n} agents disponibles`),
  noneAvailable: "Aucun agent en ligne pour le moment",
  estimatedWait: (m) => (m <= 1 ? "Attente habituelle : moins d'une minute" : `Attente habituelle : environ ${m} min`),
  loadingAvailability: "Vérification des agents en ligne…",
  cancel: "Annuler",
  noAgentTitle: "Aucun agent disponible",
  noAgentDesc: "Laisse-nous tes coordonnées et un agent te recontacte dans les 15 minutes.",
  nameLabel: "Nom complet",
  emailLabel: "Courriel",
  phoneLabel: "Téléphone (optionnel)",
  messageLabel: "Comment peut-on t'aider ? (optionnel)",
  submit: "Envoyer mes coordonnées",
  submitting: "Envoi…",
  leadSuccessTitle: "Bien reçu !",
  leadSuccessDesc: "Un agent te recontacte sous peu. Une confirmation t'a aussi été envoyée par courriel.",
  preCallTitle: "Prêt pour l'appel ?",
  preCallSub: "Teste ta caméra et ton micro avant de rejoindre.",
  cameraOn: "Caméra activée",
  cameraOff: "Caméra coupée",
  micOn: "Micro activé",
  micOff: "Micro coupé",
  joinCall: "Rejoindre l'appel",
  joining: "Connexion…",
  selectCamera: "Caméra",
  selectMicrophone: "Microphone",
  permissionDenied: "Permission refusée. Active la caméra et le micro dans ton navigateur, puis recharge la page.",
  inCallStatus: {
    connecting: "Connexion…",
    connected: "En direct",
    reconnecting: "Reconnexion…",
    failed: "Connexion perdue",
  },
  hangUp: "Raccrocher",
  postCallTitle: "Merci pour l'appel",
  postCallDesc: "Ton agent t'a envoyé un lien de paiement. Clique ci-dessous pour finaliser ta réservation.",
  goToPayment: "Aller au paiement",
  resumeCall: "Quelque chose ne va pas ? Reprendre l'appel",
  waitingTitle: "On te connecte à un agent Zeniva",
  waitingSub: "On prévient notre équipe. Tu peux commencer à écrire dès maintenant — ton message arrive à un vrai humain.",
  waitingChecking: "Vérification des disponibilités…",
  waitingBusy: "Tous nos agents sont occupés — laisse-nous un message, on te répond par courriel",
  waitingEstimate: (m) => (m <= 1 ? "attente moins d'une minute" : `attente ~${m} min`),
  startChatting: "Démarrer le chat",
  backToPage: "Retour à ma page",
};

export function getHandoffDict(locale: HandoffLocale): HandoffDict {
  return locale === "fr" ? HANDOFF_FR : HANDOFF_EN;
}
