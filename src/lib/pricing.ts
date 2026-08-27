import { PLANS } from "@/data/catalog";

export type PlanView = (typeof PLANS)[number];

export function annualDiscountPercent(plan: Pick<PlanView, "monthlyPriceTry" | "annualPriceTry">) {
  const fullYear = plan.monthlyPriceTry * 12;
  if (fullYear <= 0) return 0;
  return Math.round((1 - plan.annualPriceTry / fullYear) * 100);
}

export function formatTry(amount: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function perLocationMonthly(plan: Pick<PlanView, "monthlyPriceTry" | "maxLocations">) {
  const locations = Math.max(1, Math.min(plan.maxLocations, 99));
  return Math.round(plan.monthlyPriceTry / locations);
}

export function canAddLocation(currentCount: number, maxLocations: number) {
  return currentCount < maxLocations;
}

export function planBySlug(slug: string) {
  return PLANS.find((p) => p.slug === slug) ?? null;
}
