export interface ProcessStep {
  step: string | number;
  title: string;
  desc: string;
}

export interface ProcessStepsProps {
  title?: string;
  subtitle?: string;
  steps: ProcessStep[];
  accentStart?: string;
  accentEnd?: string;
  background?: "white" | "slate";
}

export default function ProcessSteps({
  title,
  subtitle,
  steps,
  accentStart = "#0B1B4D",
  accentEnd = "#0F6CF5",
  background = "slate",
}: ProcessStepsProps) {
  const bgClass = background === "slate" ? "bg-slate-50" : "bg-white";
  const cols = steps.length === 4 ? "lg:grid-cols-4" : steps.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";
  return (
    <section className={`${bgClass} py-16 sm:py-20`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {title ? (
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">{title}</h2>
            {subtitle ? <p className="text-lg text-slate-600">{subtitle}</p> : null}
          </div>
        ) : null}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${cols} gap-8`}>
          {steps.map((s) => (
            <div key={String(s.step)} className="text-center">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-black text-white mb-4"
                style={{ background: `linear-gradient(135deg, ${accentStart}, ${accentEnd})` }}
              >
                {s.step}
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">{s.title}</h3>
              <p className="text-slate-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
