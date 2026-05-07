import Link from "next/link";

export interface RoleCardProps {
  icon: string;
  title: string;
  desc: string;
  href?: string;
  cta?: string;
  highlight?: boolean;
}

export default function RoleCard({ icon, title, desc, href, cta, highlight }: RoleCardProps) {
  const inner = (
    <div
      className={`group h-full rounded-3xl border bg-white p-8 shadow-sm transition hover:shadow-xl hover:-translate-y-1 ${
        highlight ? "border-2 border-blue-200" : "border-slate-200"
      }`}
    >
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-black text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed mb-4">{desc}</p>
      {cta ? (
        <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-700 group-hover:gap-2 transition-all">
          {cta} <span aria-hidden>→</span>
        </span>
      ) : null}
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block h-full">
        {inner}
      </Link>
    );
  }
  return inner;
}
