export interface FAQItem {
  q: string;
  a: string;
}

export interface FAQProps {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
}

export default function FAQ({ title, subtitle, items }: FAQProps) {
  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20">
      {title ? (
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">{title}</h2>
          {subtitle ? <p className="text-lg text-slate-600">{subtitle}</p> : null}
        </div>
      ) : null}
      <div className="space-y-3">
        {items.map((item, i) => (
          <details
            key={i}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm open:shadow-md transition"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 text-left text-base font-bold text-slate-900 list-none">
              <span>{item.q}</span>
              <span
                aria-hidden
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition group-open:rotate-180"
              >
                ⌄
              </span>
            </summary>
            <div className="mt-3 text-slate-600 leading-relaxed">{item.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
