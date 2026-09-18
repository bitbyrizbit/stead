"use client";
export default function Marquee({ items, className = '' }: { items: string[]; className?: string }) {
  const doubled = [...items, ...items];
  return (
    <div className={`relative overflow-hidden py-5 ${className}`}>
      <div className="marquee-track flex items-center gap-10 whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="font-serif text-xl lg:text-2xl tracking-tight text-ink/70 italic">
              {item}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-copper/40 shrink-0" />
          </span>
        ))}
      </div>
    </div>
  );
}

