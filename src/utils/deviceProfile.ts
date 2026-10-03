/**
 * Device Profile and Dynamic Resolution Scaling for LOTADOR
 * 
 * Classifies the device into LOW-END, MID-RANGE, or HIGH-END based on:
 * - CPU Concurrency (navigator.hardwareConcurrency)
 * - RAM / deviceMemory
 * - Touch & viewport dimensions
 * - User agent & Capacitor detection
 * 
 * Provides Dynamic Resolution Scaling (DRS) with hysteresis to prevent oscillation:
 * - Measures FPS over 1.5s windows
 * - Clamps DPR to strict mobile bounds (0.75 - 1.25 max)
 */

export type DeviceTier = 'LOW_END' | 'MID_RANGE' | 'HIGH_END';

export interface DeviceClassification {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  tier: DeviceTier;
  hardwareConcurrency: number;
  deviceMemoryGb: number | null;
  nativeDpr: number;
  maxRecommendedDpr: number;
  minRecommendedDpr: number;
}

export function classifyDevice(): DeviceClassification {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      tier: 'MID_RANGE',
      hardwareConcurrency: 4,
      deviceMemoryGb: null,
      nativeDpr: 1,
      maxRecommendedDpr: 1.0,
      minRecommendedDpr: 0.75,
    };
  }

  const ua = navigator.userAgent || '';
  const isMobileUa = /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
  const isIpad = /iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isTablet = isIpad || (/Android/i.test(ua) && !/Mobile/i.test(ua));
  const isMobile = isMobileUa || (navigator.maxTouchPoints > 0 && Math.min(window.screen.width, window.screen.height) < 768);
  const isDesktop = !isMobile && !isTablet;

  const cores = typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : 4;
  const memory = typeof (navigator as any).deviceMemory === 'number' ? (navigator as any).deviceMemory : null;
  const nativeDpr = window.devicePixelRatio || 1;

  let tier: DeviceTier = 'MID_RANGE';

  if (isMobile) {
    if (cores <= 4 || (memory !== null && memory <= 3)) {
      tier = 'LOW_END';
    } else if (cores >= 8 && (memory === null || memory >= 6)) {
      tier = 'MID_RANGE'; // On mobile, even strong phones are capped at MID_RANGE for fillrate safety
    } else {
      tier = 'MID_RANGE';
    }
  } else if (isTablet) {
    tier = cores <= 4 ? 'LOW_END' : 'MID_RANGE';
  } else {
    // Desktop
    if (cores >= 8 && (memory === null || memory >= 8)) {
      tier = 'HIGH_END';
    } else if (cores <= 4) {
      tier = 'LOW_END';
    } else {
      tier = 'MID_RANGE';
    }
  }

  // Determine safe DPR bounds according to FASE 3:
  // Mobile LOW: 0.75 - 1.0
  // Mobile MEDIUM: 1.0
  // Mobile HIGH: 1.25 max (never 1.75+ on mobile)
  // Desktop: 1.0 - 1.5 max
  let minRecommendedDpr = 0.75;
  let maxRecommendedDpr = 1.0;

  if (isDesktop) {
    minRecommendedDpr = 1.0;
    maxRecommendedDpr = tier === 'HIGH_END' ? Math.min(nativeDpr, 1.5) : 1.25;
  } else {
    // Mobile / Tablet
    if (tier === 'LOW_END') {
      minRecommendedDpr = 0.75;
      maxRecommendedDpr = 1.0;
    } else {
      minRecommendedDpr = 0.85;
      maxRecommendedDpr = 1.15;
    }
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
    tier,
    hardwareConcurrency: cores,
    deviceMemoryGb: memory,
    nativeDpr,
    maxRecommendedDpr,
    minRecommendedDpr,
  };
}

/**
 * Dynamic Resolution Scaler with Hysteresis
 * Evaluates FPS periodically (every 1.5 - 2.0s) and nudges DPR smoothly.
 */
export class DynamicResolutionScaler {
  private currentDpr: number;
  private minDpr: number;
  private maxDpr: number;
  private lastEvaluationTime: number = 0;
  private consecutiveLowFpsCount: number = 0;
  private consecutiveHighFpsCount: number = 0;

  constructor(initialDpr: number, minDpr: number, maxDpr: number) {
    this.minDpr = minDpr;
    this.maxDpr = maxDpr;
    this.currentDpr = Math.min(Math.max(initialDpr, minDpr), maxDpr);
  }

  public getCurrentDpr(): number {
    return this.currentDpr;
  }

  public setQualityBounds(minDpr: number, maxDpr: number) {
    this.minDpr = minDpr;
    this.maxDpr = maxDpr;
    this.currentDpr = Math.min(Math.max(this.currentDpr, minDpr), maxDpr);
  }

  /**
   * Evaluates current FPS and returns new DPR if adjusted, or null if unchanged.
   * Uses hysteresis to prevent oscillation:
   * - FPS < 28 for 2 consecutive checks -> aggressive drop (-0.15)
   * - FPS 28-40 for 2 consecutive checks -> moderate drop (-0.08)
   * - FPS > 56 for 4 consecutive checks -> careful raise (+0.05)
   */
  public update(currentFps: number, timestamp: number): number | null {
    // Check at most every 1800ms
    if (timestamp - this.lastEvaluationTime < 1800) {
      return null;
    }
    this.lastEvaluationTime = timestamp;

    if (currentFps < 28) {
      this.consecutiveLowFpsCount++;
      this.consecutiveHighFpsCount = 0;

      if (this.consecutiveLowFpsCount >= 2 && this.currentDpr > this.minDpr) {
        const nextDpr = Math.max(this.minDpr, Number((this.currentDpr - 0.15).toFixed(2)));
        if (nextDpr !== this.currentDpr) {
          this.currentDpr = nextDpr;
          this.consecutiveLowFpsCount = 0;
          return this.currentDpr;
        }
      }
    } else if (currentFps < 42) {
      this.consecutiveLowFpsCount++;
      this.consecutiveHighFpsCount = 0;

      if (this.consecutiveLowFpsCount >= 3 && this.currentDpr > this.minDpr) {
        const nextDpr = Math.max(this.minDpr, Number((this.currentDpr - 0.08).toFixed(2)));
        if (nextDpr !== this.currentDpr) {
          this.currentDpr = nextDpr;
          this.consecutiveLowFpsCount = 0;
          return this.currentDpr;
        }
      }
    } else if (currentFps >= 56) {
      this.consecutiveHighFpsCount++;
      this.consecutiveLowFpsCount = 0;

      // Hysteresis: requires 4 stable checks (approx 7.2 seconds of rock-solid 56+ FPS)
      if (this.consecutiveHighFpsCount >= 4 && this.currentDpr < this.maxDpr) {
        const nextDpr = Math.min(this.maxDpr, Number((this.currentDpr + 0.05).toFixed(2)));
        if (nextDpr !== this.currentDpr) {
          this.currentDpr = nextDpr;
          this.consecutiveHighFpsCount = 0;
          return this.currentDpr;
        }
      }
    } else {
      // In comfortable zone (42 - 55 FPS) -> stabilize
      this.consecutiveLowFpsCount = 0;
      this.consecutiveHighFpsCount = 0;
    }

    return null;
  }
}
