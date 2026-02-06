export type CommissionPlan = {
  id: string;
  startDate: string;
  endDate?: string;
  influencerPct: number;
  createdAt: string;
};

const STORAGE_KEY = "zeniva_commission_plans_v1";

const defaultPlans: CommissionPlan[] = [
  {
    id: "plan-2026-01",
    startDate: "2026-01-01",
    endDate: undefined,
    influencerPct: 5,
    createdAt: new Date("2026-01-01T00:00:00Z").toISOString(),
  },
];

function readStorage(): CommissionPlan[] {
  if (typeof window === "undefined") return [...defaultPlans];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...defaultPlans];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...defaultPlans];
    return parsed as CommissionPlan[];
  } catch {
    return [...defaultPlans];
  }
}

function writeStorage(plans: CommissionPlan[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch {
    // ignore
  }
}

export function listCommissionPlans(): CommissionPlan[] {
  return readStorage();
}

export function saveCommissionPlans(plans: CommissionPlan[]) {
  writeStorage(plans);
}

export function getActiveCommissionPlan(date: Date = new Date()): CommissionPlan {
  const plans = readStorage();
  const target = date.getTime();
  const sorted = [...plans].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  for (const plan of sorted) {
    const start = new Date(plan.startDate).getTime();
    const end = plan.endDate ? new Date(plan.endDate).getTime() : Number.POSITIVE_INFINITY;
    if (target >= start && target <= end) return plan;
  }
  return sorted[0] || defaultPlans[0];
}

export function upsertCommissionPlan(next: CommissionPlan) {
  const plans = readStorage();
  const idx = plans.findIndex((p) => p.id === next.id);
  if (idx >= 0) {
    plans[idx] = next;
  } else {
    plans.push(next);
  }
  writeStorage(plans);
}
