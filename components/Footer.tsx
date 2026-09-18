"use client";

export default function Footer() {
  return (
    <footer className="py-8 px-6 lg:px-10 bg-ink text-bone text-xs flex items-center justify-between">
      <div className="flex gap-4">
        <span>© 2026 Stead</span>
        <a href="#" className="hover:text-copper transition-colors">GitHub</a>
      </div>
      <div>
        Built for 6 million hands.
      </div>
    </footer>
  );
}
