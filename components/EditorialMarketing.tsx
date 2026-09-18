"use client";
import React from 'react';
import SmoothScroll from './SmoothScroll';
import Nav from './Nav';
import Hero from './Hero';
import Manifesto from './Manifesto';
import Technology from './Technology';
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
      <Nav onStart={onStart} />

      <main>
        <Hero onStart={onStart} />

        <Marquee
          items={[
            'Sub-millisecond',
            'Fourier dampening',
            'Magnetic geometry',
            'Zero telemetry',
            '14KB WASM',
            'Open core',
            'No permissions',
            'For 6 million hands',
          ]}
          className="border-y border-line bg-bone"
        />

        <Manifesto />
        <Technology />
        <Playground />
        <Extension />
      </main>

      <Footer />
    </SmoothScroll>
  );
}
