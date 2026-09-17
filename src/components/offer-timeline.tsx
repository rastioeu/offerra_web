import { offerSteps, type Offer } from "@/lib/offers";
import { formatDate } from "@/lib/property";
import { getLocale, getT } from "@/i18n/server";

/**
 * Zvislá os s bodkami — port appkového `offer-timeline.tsx` (appka:
 * „Tvarom nadväzuje na ActivityTimeline v Profile"). Čistý render,
 * žiadny vlastný stav ani dopyt — kroky prídu hotové z `offerSteps`.
 */
export async function OfferTimeline({ offer }: { offer: Offer }) {
  const [t, language] = await Promise.all([getT(), getLocale()]);
  const steps = offerSteps(t, offer);

  return (
    <div className="flex flex-col">
      {steps.map((step, i) => (
        <div key={step.label} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={`h-2.5 w-2.5 rounded-full border-2 ${
                step.done ? "border-accent-deep bg-accent-deep" : "border-border-strong bg-transparent"
              }`}
            />
            {i < steps.length - 1 ? (
              <span className={`w-0.5 flex-1 ${steps[i + 1].done ? "bg-accent-deep" : "bg-border"}`} style={{ minHeight: 20 }} />
            ) : null}
          </div>
          <div className="pb-4">
            <p className={`text-sm font-medium ${step.done ? "text-text-primary" : "text-text-muted"}`}>{step.label}</p>
            {step.at ? <p className="text-xs text-text-muted">{formatDate(language, step.at)}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
