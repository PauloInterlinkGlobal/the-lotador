import React, { useState, useEffect, useRef } from 'react';
import { Passenger, RouteType, Taxi } from '../types/game';
import { GameEngine } from '../game/GameEngine';

interface WorldSpaceCanvasProps {
  engine?: GameEngine | null;
  passengers: Passenger[];
  taxis?: Taxi[];
}

interface ProjectedPassengerBadge {
  id: string;
  name: string;
  destination: RouteType;
  x: number;
  y: number;
  visible: boolean;
  state: Passenger['state'];
  isRefused: boolean;
  refusalReason?: string;
  followedBy: string | null;
}

interface ProjectedTaxiBadge {
  id: string;
  route: RouteType;
  x: number;
  y: number;
  visible: boolean;
  state: Taxi['state'];
  currentPassengers: number;
  capacity: number;
  isTargetForFollowed: boolean;
}

const ROUTE_THEMES: Record<
  RouteType,
  {
    border: string;
    glow: string;
    dot: string;
    text: string;
    bgBadge: string;
  }
> = {
  VIANA: {
    border: 'border-amber-400',
    glow: 'shadow-amber-500/40',
    dot: 'bg-amber-400',
    text: 'text-amber-300',
    bgBadge: 'bg-amber-950/40',
  },
  'GOLFE 2': {
    border: 'border-purple-400',
    glow: 'shadow-purple-500/40',
    dot: 'bg-purple-400',
    text: 'text-purple-300',
    bgBadge: 'bg-purple-950/40',
  },
  TALATONA: {
    border: 'border-cyan-400',
    glow: 'shadow-cyan-500/40',
    dot: 'bg-cyan-400',
    text: 'text-cyan-300',
    bgBadge: 'bg-cyan-950/40',
  },
  CENTRO: {
    border: 'border-emerald-400',
    glow: 'shadow-emerald-500/40',
    dot: 'bg-emerald-400',
    text: 'text-emerald-300',
    bgBadge: 'bg-emerald-950/40',
  },
  CACUACO: {
    border: 'border-orange-500',
    glow: 'shadow-orange-500/40',
    dot: 'bg-orange-500',
    text: 'text-orange-300',
    bgBadge: 'bg-orange-950/40',
  },
  CAMAMA: {
    border: 'border-blue-400',
    glow: 'shadow-blue-500/40',
    dot: 'bg-blue-400',
    text: 'text-blue-300',
    bgBadge: 'bg-blue-950/40',
  },
};

/**
 * WorldSpaceCanvas Component
 * Projects 3D world coordinates for both Passengers and Taxis to screen space,
 * rendering floating destination badges ("World Space Canvas"):
 * - Passengers: destination label (ex: VIANA, GOLFE 2), refusal alert with ❌ error icon
 * - Taxis: candongueiro destination sign, seat counter (ex: 2/4 vagas), matching highlights
 */
export const WorldSpaceCanvas: React.FC<WorldSpaceCanvasProps> = ({
  engine,
  passengers,
  taxis = [],
}) => {
  const [projectedBadges, setProjectedBadges] = useState<ProjectedPassengerBadge[]>([]);
  const [projectedTaxis, setProjectedTaxis] = useState<ProjectedTaxiBadge[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    const updateProjections = () => {
      if (!active) return;

      if (!engine) {
        setProjectedBadges([]);
        setProjectedTaxis([]);
        animFrameRef.current = requestAnimationFrame(updateProjections);
        return;
      }

      // Query active passengers from engine or props
      const activePassengers = engine.passengers || passengers;
      const activeTaxis = engine.taxis || taxis;

      // Check if player has any followers and what their destinations are
      const followedPassenger = activePassengers.find(
        (p) => p.followedBy === 'PLAYER' && p.state === 'FOLLOWING'
      );
      const followedRoute = followedPassenger ? followedPassenger.destination : null;

      // 1. Project Passenger Badges
      const nextBadges: ProjectedPassengerBadge[] = [];
      for (const p of activePassengers) {
        if (p.state === 'BOARDING' || p.state === 'COMPLETED' || p.state === 'LEAVING') {
          continue;
        }

        const screenPos = engine.toScreenPosition(p.position, 1.35);

        if (screenPos.visible) {
          const isRefused = !!(p.refusalTimer && p.refusalTimer > 0);
          nextBadges.push({
            id: p.id,
            name: p.name,
            destination: p.destination,
            x: screenPos.x,
            y: screenPos.y,
            visible: true,
            state: p.state,
            isRefused,
            refusalReason: p.refusalReason,
            followedBy: p.followedBy,
          });
        }
      }

      // 2. Project Taxi Badges
      const nextTaxiBadges: ProjectedTaxiBadge[] = [];
      for (const t of activeTaxis) {
        if (t.state === 'DEPARTING' || t.state === 'GONE') {
          continue;
        }

        // Project slightly above the van roof rack (y offset ~2.6)
        const screenPos = engine.toScreenPosition(t.position, 2.6);

        if (screenPos.visible) {
          const isTargetForFollowed = !!(
            followedRoute &&
            t.route === followedRoute &&
            t.currentPassengers < t.capacity &&
            (t.state === 'WAITING' || t.state === 'LOADING')
          );

          nextTaxiBadges.push({
            id: t.id,
            route: t.route,
            x: screenPos.x,
            y: screenPos.y,
            visible: true,
            state: t.state,
            currentPassengers: t.currentPassengers,
            capacity: t.capacity,
            isTargetForFollowed,
          });
        }
      }

      setProjectedBadges(nextBadges);
      setProjectedTaxis(nextTaxiBadges);
      animFrameRef.current = requestAnimationFrame(updateProjections);
    };

    animFrameRef.current = requestAnimationFrame(updateProjections);

    return () => {
      active = false;
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [engine, passengers, taxis]);

  if (!engine || (projectedBadges.length === 0 && projectedTaxis.length === 0)) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden z-25 select-none"
      aria-hidden="true"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. TAXI DESTINATION & CAPACITY BADGES (World Space Above Van)
          ───────────────────────────────────────────────────────────── */}
      {projectedTaxis.map((taxi) => {
        const theme = ROUTE_THEMES[taxi.route] || ROUTE_THEMES.VIANA;
        const freeSeats = Math.max(0, taxi.capacity - taxi.currentPassengers);
        const isFull = freeSeats === 0;

        return (
          <div
            key={taxi.id}
            className="absolute -translate-x-1/2 -translate-y-full transition-transform duration-75 will-change-transform"
            style={{
              left: `${taxi.x}px`,
              top: `${taxi.y}px`,
            }}
          >
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border-2 shadow-lg backdrop-blur-xs transition-all ${
                  taxi.isTargetForFollowed
                    ? 'bg-[#006dae] text-white border-[#ffd700] ring-3 ring-[#ffd700] ring-offset-1 ring-offset-black scale-110 animate-pulse'
                    : isFull
                    ? 'bg-[#1e293b]/90 text-slate-300 border-slate-600'
                    : `bg-[#0f172a]/95 text-white ${theme.border} ${theme.glow}`
                }`}
              >
                <span className="text-[11px] leading-none">🚐</span>
                <span className="font-anybody font-black text-[11px] tracking-wider uppercase">
                  {taxi.route}
                </span>
                <span className="text-[9px] font-space font-bold px-1.5 py-0.2 rounded-full bg-black/40 text-slate-200">
                  {isFull ? (
                    <span className="text-red-400 font-black">LOTADO</span>
                  ) : (
                    <span>
                      <strong className="text-[#ffd700]">{freeSeats}</strong>/{taxi.capacity}
                    </span>
                  )}
                </span>
                {taxi.isTargetForFollowed && (
                  <span className="text-[9px] font-anybody font-black bg-[#ffd700] text-[#161c28] px-1.5 py-0.2 rounded uppercase animate-bounce">
                    LOTAR!
                  </span>
                )}
              </div>
              {/* Pointer Arrow pointing to van roof */}
              <div
                className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] ${
                  taxi.isTargetForFollowed
                    ? 'border-t-[#ffd700]'
                    : theme.border.replace('border-', 'border-t-')
                } -mt-[1px]`}
              />
            </div>
          </div>
        );
      })}

      {/* ─────────────────────────────────────────────────────────────
          2. PASSENGER DESTINATION BADGES (World Space Above Head)
          ───────────────────────────────────────────────────────────── */}
      {projectedBadges.map((badge) => {
        const theme = ROUTE_THEMES[badge.destination] || ROUTE_THEMES.VIANA;

        return (
          <div
            key={badge.id}
            className="absolute -translate-x-1/2 -translate-y-full transition-transform duration-75 will-change-transform"
            style={{
              left: `${badge.x}px`,
              top: `${badge.y}px`,
            }}
          >
            {badge.isRefused ? (
              /* Refusal Error Badge ❌ */
              <div className="flex flex-col items-center animate-bounce">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/95 border-2 border-red-500 text-white shadow-xl shadow-red-500/50 backdrop-blur-xs scale-105">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-black leading-none">
                    ✕
                  </span>
                  <span className="font-anybody font-black text-[10px] tracking-wide text-red-200 uppercase">
                    {badge.destination}
                  </span>
                  <span className="text-[9px] font-space font-bold bg-red-600/80 px-1 py-0.2 rounded text-white uppercase">
                    SEM TÁXI!
                  </span>
                </div>
                {/* Pointer Arrow */}
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-red-500 -mt-[1px]" />
              </div>
            ) : badge.state === 'FOLLOWING' ? (
              /* Following Player Badge ✓ */
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 px-2.5 py-0.8 rounded-full bg-emerald-950/95 border-2 border-emerald-400 text-emerald-200 shadow-md shadow-emerald-500/30 backdrop-blur-xs">
                  <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-500 text-black text-[9px] font-black leading-none">
                    ✓
                  </span>
                  <span className="font-anybody font-black text-[10px] tracking-wide uppercase text-white">
                    {badge.destination}
                  </span>
                  <span className="text-[8px] font-space font-bold text-emerald-300 uppercase">
                    A CAMINHO
                  </span>
                </div>
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-emerald-400 -mt-[1px]" />
              </div>
            ) : (
              /* Normal Waiting World Space Badge 📍 */
              <div className="flex flex-col items-center group">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-0.8 rounded-full bg-[#0d1522]/95 border-2 ${theme.border} shadow-md ${theme.glow} backdrop-blur-xs transition-transform duration-100 hover:scale-110`}
                >
                  <span className={`w-2 h-2 rounded-full ${theme.dot} animate-pulse`} />
                  <span
                    className={`font-anybody font-black text-[10px] tracking-wider uppercase ${theme.text}`}
                  >
                    {badge.destination}
                  </span>
                </div>
                {/* Subtle downward pointer to head */}
                <div
                  className={`w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] ${theme.border.replace('border-', 'border-t-')} -mt-[1px]`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
