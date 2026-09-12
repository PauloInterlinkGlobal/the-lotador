/**
 * LOTADOR - Rotate Device Overlay
 * Forces landscape orientation on mobile/tablet browser viewports.
 * Displays an animated prompt when a handheld touch device is held in portrait mode.
 */

import React, { useState, useEffect } from 'react';

export const RotateDeviceOverlay: React.FC = () => {
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);

  useEffect(() => {
    // Only apply on touch/mobile/tablet devices
    const checkOrientation = () => {
      if (typeof window === 'undefined') return;

      const hasTouch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

      if (!hasTouch) {
        setIsPortraitMobile(false);
        return;
      }

      // Check portrait condition
      const mql = window.matchMedia('(orientation: portrait)');
      const isPortraitByMql = mql.matches;
      const isPortraitByDimensions = window.innerHeight > window.innerWidth;

      setIsPortraitMobile(isPortraitByMql || isPortraitByDimensions);
    };

    // Initial check
    checkOrientation();

    // Listeners
    const mql = window.matchMedia('(orientation: portrait)');
    const handleMqlChange = () => checkOrientation();

    if (mql.addEventListener) {
      mql.addEventListener('change', handleMqlChange);
    } else {
      mql.addListener(handleMqlChange);
    }

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handleMqlChange);
      } else {
        mql.removeListener(handleMqlChange);
      }
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortraitMobile) {
    return null;
  }

  return (
    <div
      id="rotate-device-overlay"
      className="fixed inset-0 z-[99999] bg-[#0a192f] text-white flex flex-col items-center justify-center p-6 select-none touch-none text-center"
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0a192f',
      }}
    >
      {/* Background Decorative Ambient Radial Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,109,174,0.22)_0%,transparent_70%)]" />

      {/* Brand Header */}
      <div className="relative z-10 mb-8 flex flex-col items-center">
        <span className="text-[11px] font-bold tracking-[0.25em] text-amber-400/90 uppercase font-space">
          Luanda Taxi Craze
        </span>
        <h1 className="font-anybody font-black text-3xl sm:text-4xl tracking-wider text-white uppercase mt-1">
          LOTADOR
        </h1>
      </div>

      {/* Animated Phone Rotation Graphic (Pure CSS & SVG) */}
      <div className="relative z-10 mb-8 flex items-center justify-center">
        <div className="w-28 h-28 rounded-3xl bg-slate-900/90 border-2 border-amber-400/40 flex items-center justify-center shadow-[0_0_35px_rgba(245,158,11,0.25)]">
          <svg
            className="w-14 h-14 text-amber-400 animate-phone-rotate"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Phone outline */}
            <rect x="5" y="2" width="14" height="20" rx="3" ry="3" />
            {/* Screen indicator line / speaker */}
            <line x1="10" y1="5" x2="14" y2="5" />
            {/* Home button/indicator */}
            <circle cx="12" cy="18" r="1" fill="currentColor" />
          </svg>
        </div>

        {/* Circular Curved Rotation Indicator Arrow */}
        <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shadow-md animate-pulse">
          <span className="material-symbols-outlined text-xl">screen_rotation</span>
        </div>
      </div>

      {/* Main Instructions in Portuguese */}
      <div className="relative z-10 max-w-sm flex flex-col items-center gap-2">
        <h2 className="font-anybody font-black text-2xl text-amber-400 uppercase tracking-wide">
          Posição Horizontal Obrigatória
        </h2>
        <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed font-work">
          Por favor, vire o seu dispositivo para a posição horizontal (paisagem) para jogar.
        </p>
      </div>

      {/* Bottom Route / Aesthetic Pill */}
      <div className="relative z-10 mt-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] font-bold text-slate-400 font-space uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          Modo Paisagem Obrigatório
        </div>
      </div>
    </div>
  );
};
