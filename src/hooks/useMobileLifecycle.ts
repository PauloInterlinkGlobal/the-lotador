/**
 * LOTADOR Mobile Lifecycle & Environment Hook
 * Handles:
 * - Capacitor App Lifecycle (Background, Resume, Android Back Button)
 * - Screen Orientation Lock to Landscape
 * - System Status Bar overlay
 * - Low-end hardware detection (auto-downgrade graphics)
 * - Safe area & visibility change handlers
 */

import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { StatusBar, Style } from '@capacitor/status-bar';

export interface MobileEnvironment {
  isNative: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  isPWA: boolean;
  isTouch: boolean;
  isLowEnd: boolean;
  isOnline: boolean;
}

interface UseMobileLifecycleOptions {
  onPauseGame?: () => void;
  onResumeGame?: () => void;
  onBackPressed?: () => boolean; // return true if handled
}

export function useMobileLifecycle(options: UseMobileLifecycleOptions = {}) {
  const [env, setEnv] = useState<MobileEnvironment>(() => {
    const isNative = Capacitor.isNativePlatform();
    const platform = Capacitor.getPlatform();
    const isAndroid = platform === 'android';
    const isIOS = platform === 'ios';

    const isPWA =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true);

    const isTouch =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    // Hardware heuristic for low-end devices: <= 4 cores or <= 3GB RAM
    const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
    const memory = typeof (navigator as any) !== 'undefined' ? (navigator as any).deviceMemory || 4 : 4;
    const isLowEnd = cores <= 4 || memory <= 3;

    return {
      isNative,
      isAndroid,
      isIOS,
      isPWA,
      isTouch,
      isLowEnd,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    };
  });

  // Track network status
  useEffect(() => {
    const handleOnline = () => setEnv((prev) => ({ ...prev, isOnline: true }));
    const handleOffline = () => setEnv((prev) => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Configure Native Mobile settings (Orientation, StatusBar, BackButton, StateChange)
  useEffect(() => {
    let backButtonHandle: any = null;
    let appStateHandle: any = null;

    async function initNativeMobile() {
      if (Capacitor.isNativePlatform()) {
        try {
          // Hide / style status bar for immersive arcade landscape
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setOverlaysWebView({ overlay: true });
          await StatusBar.hide();
        } catch (e) {
          console.warn('[MobileLifecycle] StatusBar init ignored:', e);
        }

        try {
          // Lock to landscape for arcade experience
          await ScreenOrientation.lock({ orientation: 'landscape' });
        } catch (e) {
          console.warn('[MobileLifecycle] ScreenOrientation lock ignored:', e);
        }

        try {
          // Listen for Android hardware back button
          backButtonHandle = await CapApp.addListener('backButton', () => {
            if (options.onBackPressed) {
              const handled = options.onBackPressed();
              if (handled) return;
            }
            // If at root and not handled, minimize app instead of abruptly killing it
            CapApp.minimizeApp().catch(() => {});
          });
        } catch (e) {
          console.warn('[MobileLifecycle] BackButton listener error:', e);
        }

        try {
          // Listen for app state changes (background/foreground)
          appStateHandle = await CapApp.addListener('appStateChange', (state) => {
            if (!state.isActive) {
              console.log('[MobileLifecycle] App moving to background -> auto-pause');
              if (options.onPauseGame) options.onPauseGame();
            } else {
              console.log('[MobileLifecycle] App returned to foreground');
              if (options.onResumeGame) options.onResumeGame();
            }
          });
        } catch (e) {
          console.warn('[MobileLifecycle] AppStateChange listener error:', e);
        }
      }
    }

    initNativeMobile();

    // Web visibility change fallback
    const handleVisibility = () => {
      if (document.hidden) {
        if (options.onPauseGame) options.onPauseGame();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (backButtonHandle) backButtonHandle.remove();
      if (appStateHandle) appStateHandle.remove();
    };
  }, [options.onBackPressed, options.onPauseGame, options.onResumeGame]);

  return env;
}
