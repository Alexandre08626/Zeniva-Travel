export function getZenivaEmailFromCookie(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("zeniva_email="));
  return match ? decodeURIComponent(match.split("=")[1] || "").trim().toLowerCase() : "";
}

export async function persistWorkflowStatePatch(workflowStatePatch: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const email = getZenivaEmailFromCookie();
  if (!email || !workflowStatePatch || Object.keys(workflowStatePatch).length === 0) return;
  try {
    await fetch("/api/user-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, workflowStatePatch }),
    });
  } catch {
    // Non-blocking persistence
  }
}

export async function loadTripWorkflowState(tripId: string): Promise<Record<string, unknown> | null> {
  if (!tripId) return null;
  try {
    const response = await fetch("/api/user-data", { method: "GET" });
    if (!response.ok) return null;
    const payload = await response.json();
    const workflowState = payload?.workflowState;
    if (!workflowState || typeof workflowState !== "object") return null;
    const tripState = workflowState[tripId];
    return tripState && typeof tripState === "object" ? tripState : null;
  } catch {
    return null;
  }
}
