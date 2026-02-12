type TrackingOptions = {
  analytics: boolean;
  marketing: boolean;
};

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || "";
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

let gaLoaded = false;
let metaLoaded = false;

export function loadGA4() {
  if (gaLoaded || !GA4_ID || typeof window === "undefined") return;
  gaLoaded = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script);

  (window as any).dataLayer = (window as any).dataLayer || [];
  const gtag = (...args: any[]) => {
    (window as any).dataLayer.push(args);
  };
  (window as any).gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA4_ID, { anonymize_ip: true });
}

export function loadMetaPixel() {
  if (metaLoaded || !META_PIXEL_ID || typeof window === "undefined") return;
  metaLoaded = true;

  const w = window as any;
  if (!w.fbq) {
    const fbq = function (...args: any[]) {
      fbq.callMethod ? fbq.callMethod.apply(fbq, args) : fbq.queue.push(args);
    } as any;
    fbq.queue = [];
    fbq.version = "2.0";
    w.fbq = fbq;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  w.fbq("init", META_PIXEL_ID);
  w.fbq("consent", "grant");
}

export function disableGA4() {
  if (typeof window === "undefined") return;
  if (GA4_ID) {
    (window as any)[`ga-disable-${GA4_ID}`] = true;
  }
}

export function disableMetaPixel() {
  if (typeof window === "undefined") return;
  const w = window as any;
  if (w.fbq) {
    try {
      w.fbq("consent", "revoke");
    } catch {
      // ignore revoke errors
    }
  }
}

export function applyTracking(consent: TrackingOptions) {
  if (consent.analytics) {
    loadGA4();
  } else {
    disableGA4();
  }

  if (consent.marketing) {
    loadMetaPixel();
  } else {
    disableMetaPixel();
  }
}
