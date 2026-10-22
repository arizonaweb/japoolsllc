import { ALL_ADDONS, ESTIMATE_NOTE, TRAVEL_OPTIONS, getService, type EstimateInput } from '@/data/brand';

interface Props extends EstimateInput {
  tone?: 'dark' | 'light';
  compact?: boolean;
}

export default function EstimateSummary({ tone = 'light', compact = false, ...input }: Props) {
  const service = getService(input.serviceId);
  const chosen = ALL_ADDONS.filter((a) => input.addOnIds.includes(a.id));
  const areaLabel = TRAVEL_OPTIONS.find((t) => t.id === input.travel)?.label ?? 'Phoenix, AZ 85031';
  const muted = tone === 'dark' ? 'text-espresso/70' : 'text-espresso/70';
  const line = 'border-espresso/20';

  return (
    <div>
      <div className={`space-y-3 border-b pb-5 text-[14px] ${line}`}>
        <div className="flex justify-between gap-4">
          <span className="font-semibold text-espresso">{service.name}</span>
          <span className="font-semibold text-bronze">{service.priceLabel}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className={muted}>Property Scope</span>
          <span className={muted}>{input.guests > 1 ? `Commercial / Multi-Pool (${input.guests})` : 'Residential Pool'}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className={muted}>Service Zone</span>
          <span className="text-right text-[13px] text-espresso/80">{areaLabel}</span>
        </div>
        {chosen.map((a) => (
          <div key={a.id} className="flex justify-between gap-4">
            <span className={muted}>{a.name}</span>
            <span className="shrink-0 text-[12px] font-semibold uppercase tracking-[0.14em] text-bronze">
              {a.badge}
            </span>
          </div>
        ))}
        {!compact && chosen.length === 0 && (
          <p className={`text-[13px] italic ${muted}`}>
            Standard cleaning, brushing &amp; water balancing included. Select any extra focus items on the left.
          </p>
        )}
      </div>
      <div className="flex items-end justify-between pt-5">
        <span className={`text-[10px] font-semibold uppercase tracking-[0.28em] ${muted}`}>Selected Plan</span>
        <span className={`font-serif ${compact ? 'text-2xl' : 'text-3xl'} font-semibold leading-none text-bronze`}>
          {service.priceLabel}
        </span>
      </div>
      {!compact && <p className={`mt-4 text-[12px] leading-relaxed ${muted}`}>{ESTIMATE_NOTE}</p>}
    </div>
  );
}
