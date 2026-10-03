"use client";
import React from 'react';
import SmoothScroll from './SmoothScroll';
import ScrollProgress from './ScrollProgress';
import Nav from './Nav';
import Hero from './Hero';
import Manifesto from './Manifesto';
import Technology from './Technology';
import SplitLensDemo from './SplitLensDemo';
import Specs from './Specs';
import Playground from './Playground';
import Extension from './Extension';
import Footer from './Footer';
import Marquee from './Marquee';

interface EditorialMarketingProps {
  onStart: () => void;
}

export function EditorialMarketing({ onStart }: EditorialMarketingProps) {
  return (
    <SmoothScroll>
      <div className="noise-overlay" />
      <ScrollProgress />
      <Nav onStart={onStart} />

      <main>
        <Hero onStart={onStart} />

        <Marquee
          items={[
            'Your intent, not your tremor',
            'Nothing leaves your screen',
            'A gentler web for every hand',
            'Quietly brilliant',
            'Free, forever',
            'One install, the whole web gentled',
          ]}
          className="border-y-2 border-ink/15 bg-cream"
        />

        <Manifesto />
        <Technology />
        <SplitLensDemo />
        <Specs />
        <Playground />
        <Extension onStart={onStart} />
      </main>

      <Footer />
    </SmoothScroll>
  );
}
