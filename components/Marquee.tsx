"use client";
import { useEffect, useRef, useState } from 'react';

export default function Marquee({ items, className = '' }: { items: string[]; className?: string }) {
  return (
    <div className={`overflow-hidden py-4 ${className}`}>
      <div className="flex whitespace-nowrap marquee-track">
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center mx-6">
            <span className="font-serif text-sm tracking-widest text-ink/70">{item}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-copper/30 mx-12"></span>
          </div>
        ))}
      </div>
    </div>
  );
}
