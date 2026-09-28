// Notification centrale "compte créé" (courriel + SMS) via le service Zenitech.
// Ne lance jamais d'exception : un échec de notification ne doit pas bloquer la création du compte.
// Ne jamais transmettre de mot de passe dans ces notifications.

const NOTIFY_URL = "https://zenitech.dev/api/notify/account-created";
const DEFAULT_LOGIN_URL = "https://www.zenivatravel.com/login";
const TIMEOUT_MS = 6000;

export type AccountCreatedChannel = "email" | "sms";

export type NotifyAccountCreatedOptions = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  accountLabel?: string;
  loginUrl?: string;
  channels?: AccountCreatedChannel[];
};

export type NotifyAccountCreatedResult = {
  success: boolean;
  skipped?: boolean;
  email?: unknown;
  sms?: unknown;
  errors?: unknown;
};

export async function notifyAccountCreated(opts: NotifyAccountCreatedOptions): Promise<NotifyAccountCreatedResult> {
  try {
    const key = process.env.NOTIFY_KEY;
    if (!key) {
      console.warn("[notify-account-created] NOTIFY_KEY manquant — notification ignorée");
      return { success: false, skipped: true };
    }
    const email = (opts.email || "").trim();
    const phone = (opts.phone || "").trim();
    if (!email && !phone) return { success: false, skipped: true };

    const payload: Record<string, unknown> = {
      division: "zeniva-travel",
      name: (opts.name || "").trim() || undefined,
      email: email || undefined,
      phone: phone || undefined,
      loginUrl: opts.loginUrl || DEFAULT_LOGIN_URL,
    };
    if (opts.accountLabel) payload.accountLabel = opts.accountLabel;
    if (opts.channels && opts.channels.length) payload.channels = opts.channels;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(NOTIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-notify-key": key },
        body: JSON.stringify(payload),
        signal: controller.signal,
        cache: "no-store",
      });
      const data = (await res.json().catch(() => null)) as NotifyAccountCreatedResult | null;
      if (!res.ok || !data?.success) {
        console.warn("[notify-account-created] échec", { status: res.status, errors: data?.errors ?? null });
      }
      return data || { success: false };
    } finally {
      clearTimeout(timer);
    }
  } catch (err: any) {
    console.warn("[notify-account-created] erreur", err?.name === "AbortError" ? "timeout" : err?.message || err);
    return { success: false };
  }
}
