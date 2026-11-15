/**
 * LOTADOR In-Game HUD
 * Refined compact layout matching the arcade reference with safe-area insets
 * and responsive relative CSS units (vw, vh, clamp) across 16:9 to 20:9 viewports:
 * - Top Left: Logo -> Compact Energy Bar [⚡ ▬▬ 100%] -> Objectives Button [🎯 OBJ. 3]
 * - Top Right: Compact [💰 0 Kz | ⏱ 2:56] Card + Separate [Ⅱ] Pause Button
 * - Bottom Left: Compact semi-transparent joystick with subtle gold accent
 * - Bottom Right: Stacked circular buttons: CHAMAR (upper, yellow) & CORRER (lower, blue)
 * - Center: 85-90% clean area reserved for 3D gameplay
 */

import React, { useState, useEffect, useRef } from 'react';
import { Passenger, Taxi, PassengerDispute, OffScreenTaxiIndicator } from '../types/game';
import { GameEngine } from '../game/GameEngine';
import { LevelObjective } from '../types/levelObjectives';
import { InGameObjectivesHUD } from './InGameObjectivesHUD';
import { SpriteIcon } from './SpriteIcon';
import { ParagemEvent } from '../types/events';
import { WorldSpaceCanvas } from './WorldSpaceCanvas';

interface HUDProps {
  money: number;
  level: number;
  timerSeconds: number;
  combo: number;
  stamina: number;
  maxStamina: number;
  taxis: Taxi[];
  passengers: Passenger[];
  taxisLoadedCount?: number;
  activeDispute?: PassengerDispute | null;
  engine?: GameEngine | null;
  levelObjectives?: LevelObjective[];
  currentLevelNumber?: number;
  currentLevelTitle?: string;
  onCallAction: () => void;
  onInteractAction: () => void;
  onJoystickMove: (dir: { x: number; z: number }) => void;
  onRunToggle: (running: boolean) => void;
  onPowerUpTrigger?: () => void;
  onPause?: () => void;
  onOpenObjectives?: () => void;
  objectivesCount?: number;
  tutorialHighlight?: 'JOYSTICK' | 'CALL' | 'RUN' | 'MONEY' | 'ENERGY' | 'OBJECTIVES' | 'TIMER' | null;
  isTutorial?: boolean;
  paragemEvent?: ParagemEvent | null;
  onResolveParagemEvent?: () => void;
}

const HUDComponent: React.FC<HUDProps> = ({
  money,
  level,
  timerSeconds,
  combo,
  stamina,
  maxStamina,
  taxis,
  passengers,
  taxisLoadedCount = 0,
  activeDispute,
  engine,
  levelObjectives,
  currentLevelNumber,
  currentLevelTitle,
  onCallAction,
  onInteractAction,
  onJoystickMove,
  onRunToggle,
  onPowerUpTrigger,
  onPause,
  onOpenObjectives,
  objectivesCount = 3,
  tutorialHighlight = null,
  isTutorial = false,
  paragemEvent = null,
  onResolveParagemEvent,
}) => {
  // Dynamic Floating Joystick State
  const [isTouchActive, setIsTouchActive] = useState(false);
  const [touchOrigin, setTouchOrigin] = useState<{ x: number; y: number } | null>(null);
  const [joystickOffset, setJoystickOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);
  const isMouseDownRef = useRef(false);

  // Auto-detection of Touch vs Keyboard controls
  const [inputMethod, setInputMethod] = useState<'TOUCH' | 'KEYBOARD'>(() => {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      return 'TOUCH';
    }
    return 'KEYBOARD';
  });

  // Edge Indicators & Contextual Action State
  const [edgeIndicators, setEdgeIndicators] = useState<OffScreenTaxiIndicator[]>([]);
  const [canBoard, setCanBoard] = useState(false);

  // Periodic polling for edge indicators and contextual boarding proximity
  useEffect(() => {
    let animId: number;
    let lastCheck = 0;

    const check = (now: number) => {
      if (now - lastCheck > 120) {
        lastCheck = now;
        if (engine) {
          setEdgeIndicators(engine.getOffScreenTaxiIndicators());
          setCanBoard(engine.canBoardAnyTaxi().canBoard);
        } else {
          setEdgeIndicators([]);
          setCanBoard(false);
        }
      }
      animId = requestAnimationFrame(check);
    };

    animId = requestAnimationFrame(check);
    return () => cancelAnimationFrame(animId);
  }, [engine]);

  // Format timer MM:SS
  const mins = Math.floor(timerSeconds / 60);
  const secs = timerSeconds % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // Count active followers
  const followersCount = passengers.filter(
    (p) => p.followedBy === 'PLAYER' && p.state === 'FOLLOWING'
  ).length;

  // Active taxi waiting or loading
  const activeTaxi = taxis.find((t) => t.state === 'WAITING' || t.state === 'LOADING');

  // Keyboard controls listener for Desktop play (Auto-switches to KEYBOARD mode)
  useEffect(() => {
    const keysPressed = new Set<string>();

    const updateDir = () => {
      let x = 0;
      let z = 0;
      if (keysPressed.has('KeyA') || keysPressed.has('ArrowLeft')) x -= 1;
      if (keysPressed.has('KeyD') || keysPressed.has('ArrowRight')) x += 1;
      if (keysPressed.has('KeyW') || keysPressed.has('ArrowUp')) z += 1;
      if (keysPressed.has('KeyS') || keysPressed.has('ArrowDown')) z -= 1;

      // Normalize diagonal speed
      if (x !== 0 && z !== 0) {
        x *= 0.7071;
        z *= 0.7071;
      }

      onJoystickMove({ x, z });
      onRunToggle(keysPressed.has('ShiftLeft') || keysPressed.has('ShiftRight'));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      setInputMethod('KEYBOARD');
      keysPressed.add(e.code);
      if (e.code === 'KeyE') onCallAction();
      if (e.code === 'Space') onInteractAction();
      if (e.code === 'Escape' || e.code === 'KeyP') onPause?.();
      updateDir();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.delete(e.code);
      updateDir();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onJoystickMove, onRunToggle, onCallAction, onInteractAction, onPause]);

  // Dynamic Floating Joystick Calculation
  const processJoystickDelta = (clientX: number, clientY: number, originX: number, originY: number) => {
    const dx = clientX - originX;
    const dy = clientY - originY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = 45; // Ergonomic thumb distance

    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const nx = Math.cos(angle) * clampedDist;
    const ny = Math.sin(angle) * clampedDist;

    setJoystickOffset({ x: nx, y: ny });

    const normX = nx / maxRadius;
    const normZ = -ny / maxRadius;
    onJoystickMove({ x: normX, z: normZ });
  };

  const handleTouchZoneStart = (e: React.TouchEvent) => {
    setInputMethod('TOUCH');
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setTouchOrigin({ x: touch.clientX, y: touch.clientY });
    setJoystickOffset({ x: 0, y: 0 });
    setIsTouchActive(true);
  };

  const handleTouchZoneMove = (e: React.TouchEvent) => {
    if (!isTouchActive || !touchOrigin || touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        processJoystickDelta(touch.clientX, touch.clientY, touchOrigin.x, touchOrigin.y);
        break;
      }
    }
  };

  const handleTouchZoneEnd = (e: React.TouchEvent) => {
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        setIsTouchActive(false);
        setTouchOrigin(null);
        setJoystickOffset({ x: 0, y: 0 });
        touchIdRef.current = null;
        onJoystickMove({ x: 0, z: 0 });
        break;
      }
    }
  };

  // Mouse drag support for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDownRef.current = true;
    setTouchOrigin({ x: e.clientX, y: e.clientY });
    setJoystickOffset({ x: 0, y: 0 });
    setIsTouchActive(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !touchOrigin) return;
    processJoystickDelta(e.clientX, e.clientY, touchOrigin.x, touchOrigin.y);
  };

  const handleMouseUp = () => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    setIsTouchActive(false);
    setTouchOrigin(null);
    setJoystickOffset({ x: 0, y: 0 });
    onJoystickMove({ x: 0, z: 0 });
  };

  const staminaPercent = Math.max(0, Math.min(100, (stamina / maxStamina) * 100));
  const activeTaxisAtStop = taxis.filter((t) => t.state === 'WAITING' || t.state === 'LOADING');
  const followedPassenger = passengers.find((p) => p.followedBy === 'PLAYER' && p.state === 'FOLLOWING');

  return (
    <div
      className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between select-none overflow-hidden pt-safe pb-safe pl-safe pr-safe"
      style={{
        paddingTop: 'max(clamp(8px, 1.8vh, 18px), env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(clamp(8px, 2.0vh, 20px), env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'max(clamp(10px, 2.2vw, 24px), env(safe-area-inset-left, 0px))',
        paddingRight: 'max(clamp(10px, 2.2vw, 24px), env(safe-area-inset-right, 0px))',
      }}
    >
      {/* World Space Floating Passenger Badges (3D coordinates projected above character heads) */}
      <WorldSpaceCanvas engine={engine} passengers={passengers} taxis={taxis} />

      {/* ─────────────────────────────────────────────────────────────
          TOP ROW:
          [Left: Logo -> Energy -> Objectives]  |  [Right: Money+Time  Pause]
          ───────────────────────────────────────────────────────────── */}
      <header className="flex justify-between items-start w-full pointer-events-auto">
        {/* Top-Left Stack */}
        <div className="flex flex-col items-start gap-[clamp(4px,0.9vh,8px)]">
          {/* 1. Logo LOTADOR (8% - 12% width, no heavy card behind, safe margins) */}
          <div className="w-[clamp(64px,9.0vw,105px)] max-h-[clamp(32px,8.0vh,60px)] aspect-[270/210] flex items-center justify-start filter drop-shadow-md">
            <SpriteIcon name="logo_lotador" className="w-full h-full object-contain" />
          </div>

          {/* 2. Compact Energy Bar: [⚡] [barra curta] [100%] (14% - 18% width) */}
          <div
            className={`w-[clamp(112px,15.5vw,165px)] h-[clamp(22px,4.8vh,30px)] bg-[#161c28]/85 backdrop-blur-xs border border-white/15 rounded-full px-[clamp(6px,1.0vw,10px)] py-[clamp(2px,0.5vh,4px)] flex items-center gap-[clamp(4px,0.7vw,8px)] shadow-md transition-all ${
              tutorialHighlight === 'ENERGY' ? 'ring-2 ring-[#ffd700] ring-offset-2 ring-offset-black animate-pulse scale-105' : ''
            }`}
            title="Energia / Stamina"
          >
            <span className="text-[#ffd700] text-[clamp(10px,1.1vw,13px)] leading-none select-none font-black">
              ⚡
            </span>
            <div className="flex-1 h-[clamp(5px,1.1vh,8px)] bg-slate-900/80 rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full transition-all duration-150 rounded-full ${
                  stamina < 30 ? 'bg-[#ba1a1a]' : 'bg-[#ffd700]'
                }`}
                style={{ width: `${staminaPercent}%` }}
              />
            </div>
            <span className="text-[clamp(9px,0.95vw,11px)] font-bold text-white/90 tabular-nums leading-none tracking-tight">
              {Math.round(staminaPercent)}%
            </span>
          </div>

          {/* 3. Compact Objectives Button: [🎯] OBJ. [3] (8% - 12% width) */}
          <button
            type="button"
            onClick={onOpenObjectives}
            className={`w-[clamp(78px,10vw,112px)] h-[clamp(22px,4.8vh,30px)] bg-[#161c28]/85 hover:bg-[#161c28] active:scale-95 border border-white/15 rounded-full px-[clamp(6px,1.0vw,10px)] py-[clamp(2px,0.5vh,4px)] flex items-center gap-[clamp(4px,0.7vw,8px)] shadow-md cursor-pointer transition-all text-left ${
              tutorialHighlight === 'OBJECTIVES' ? 'ring-2 ring-[#ffd700] ring-offset-2 ring-offset-black animate-pulse scale-105' : ''
            }`}
            title="Ver Objetivos do Dia"
          >
            <span className="text-[clamp(10px,1.1vw,13px)] leading-none select-none">🎯</span>
            <span className="text-[clamp(9px,0.95vw,11px)] font-black text-white font-space tracking-wider leading-none">
              OBJ.
            </span>
            <span className="ml-auto w-[clamp(14px,1.8vw,18px)] h-[clamp(14px,1.8vw,18px)] rounded-full bg-[#ffd700] text-[#161c28] font-mono text-[clamp(8px,0.85vw,10px)] font-black flex items-center justify-center shadow-xs">
              {objectivesCount}
            </span>
          </button>

          {/* 4. Active Paragem Taxis & 3 Fixed Baias (Viana, Cacuaco, Kilamba) */}
          <div className="flex flex-col gap-1 pointer-events-auto">
            {/* 3 Baias de Candongueiros Fixas no Topo */}
            <div className="flex items-center gap-1 px-2 py-0.8 rounded-full bg-[#161c28]/90 backdrop-blur-xs border border-white/10 shadow-md">
              <span className="text-[9px] font-space font-black text-slate-300 mr-0.5">🚐 BAIAS:</span>
              {[
                { slot: 0, name: 'B1', defaultRoute: 'VIANA' },
                { slot: 1, name: 'B2', defaultRoute: 'CACUACO' },
                { slot: 2, name: 'B3', defaultRoute: 'KILAMBA' },
              ].map((bay) => {
                const taxiAtBay = taxis.find(
                  (t) => t.stopSlot === bay.slot && (t.state === 'WAITING' || t.state === 'LOADING')
                );
                const currentRoute = taxiAtBay ? taxiAtBay.route : bay.defaultRoute;
                const free = taxiAtBay ? Math.max(0, taxiAtBay.capacity - taxiAtBay.currentPassengers) : 0;
                const isMatch = followedPassenger && followedPassenger.destination === currentRoute && taxiAtBay && free > 0;

                return (
                  <div
                    key={bay.slot}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-space font-bold transition-all ${
                      isMatch
                        ? 'bg-[#fe6b00] text-white ring-2 ring-[#ffd700] animate-bounce scale-105 shadow-md'
                        : !taxiAtBay
                        ? 'bg-slate-900/80 text-slate-500 border border-white/5'
                        : free === 0
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-slate-800/90 text-white'
                    }`}
                    title={`${bay.name}: ${currentRoute} ${taxiAtBay ? `(${free} vagas)` : '(A chegar...)'}`}
                  >
                    <span className="text-[7.5px] font-mono opacity-70">{bay.name}</span>
                    <span className="font-black font-anybody">{currentRoute}</span>
                    <span className="text-[8px] opacity-85">
                      {taxiAtBay ? `(${free})` : '...'}
                    </span>
                  </div>
                );
              })}
            </div>
            {paragemEvent && (
              <div className="flex items-center gap-1.5 self-start px-2 py-1 rounded-lg bg-[#161c28]/90 border border-[#ffd700]/50 text-white text-[9px] shadow-sm">
                <span className="text-[#ffd700]">{paragemEvent.icon}</span>
                <span className="font-bold uppercase truncate max-w-[110px]">{paragemEvent.title}</span>
                <span className="font-mono text-[#ffd700]">{Math.ceil(paragemEvent.remainingSeconds)}s</span>
                {paragemEvent.type === 'TROCO_COMPLICADO' && onResolveParagemEvent && (
                  <button type="button" onClick={onResolveParagemEvent} className="px-1.5 py-0.5 rounded bg-[#ffd700] text-[#161c28] font-black">
                    RESOLVER
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Top-Center Objectives HUD (Displays up to 4 active objectives in real-time) */}
        {levelObjectives && levelObjectives.length > 0 && (
          <div className="flex-1 flex justify-center px-1 md:px-2 pointer-events-auto">
            <InGameObjectivesHUD
              objectives={levelObjectives}
              levelNumber={currentLevelNumber}
              levelTitle={currentLevelTitle}
            />
          </div>
        )}

        {/* Top-Right Group: [💰 0 Kz | ⏱ 2:56] and [Ⅱ] */}
        <div className="flex items-center gap-[clamp(6px,1.0vw,10px)]">
          {/* 4 & 5. Money + Time Horizontal Compact Card (15% - 20% width) */}
          <div
            className={`h-[clamp(26px,5.4vh,34px)] bg-[#161c28]/85 backdrop-blur-xs border border-white/15 rounded-full px-[clamp(8px,1.2vw,14px)] flex items-center gap-[clamp(6px,1.0vw,10px)] shadow-md transition-all ${
              tutorialHighlight === 'MONEY'
                ? 'ring-2 ring-[#ffd700] ring-offset-2 ring-offset-black animate-pulse'
                : tutorialHighlight === 'TIMER'
                ? 'ring-2 ring-[#fe6b00] ring-offset-2 ring-offset-black animate-pulse'
                : ''
            }`}
          >
            {/* Money */}
            <div className="flex items-center gap-[clamp(3px,0.5vw,6px)]">
              <SpriteIcon name="ui_coin" className="w-[clamp(13px,1.5vw,16px)] h-[clamp(13px,1.5vw,16px)]" />
              <span className="text-[clamp(10px,1.15vw,13px)] font-extrabold text-white font-space tracking-tight tabular-nums">
                {money.toLocaleString()}{' '}
                <span className="text-[#ffd700] text-[clamp(8px,0.9vw,11px)] font-bold">Kz</span>
              </span>
            </div>

            {/* Fine Vertical Divider */}
            <div className="h-[clamp(10px,2.2vh,15px)] w-px bg-white/20" />

            {/* Stopwatch or Tutorial Indicator */}
            <div className="flex items-center gap-[clamp(3px,0.5vw,6px)]">
              <span className="material-symbols-outlined text-[clamp(12px,1.3vw,15px)] text-white/75 leading-none select-none">
                {isTutorial ? 'school' : 'schedule'}
              </span>
              <span className="text-[clamp(10px,1.15vw,13px)] font-extrabold text-white font-mono tracking-tight tabular-nums">
                {isTutorial ? 'TUTORIAL' : timeFormatted}
              </span>
            </div>
            {combo > 1 && <span className="text-[9px] font-black text-[#ffd700]">×{combo}</span>}
          </div>

          {/* 6. Pause Button [Ⅱ] */}
          <button
            type="button"
            onClick={onPause}
            className="w-[clamp(26px,5.4vh,34px)] h-[clamp(26px,5.4vh,34px)] rounded-full bg-[#161c28]/85 hover:bg-[#161c28] active:scale-95 border border-white/15 flex items-center justify-center cursor-pointer shadow-md text-white transition-transform"
            title="Pausar Jogo"
          >
            <span className="font-bold text-[clamp(10px,1.1vw,13px)] tracking-tighter leading-none select-none">
              Ⅱ
            </span>
          </button>
        </div>
      </header>

      {/* Central play area intentionally stays free of informational overlays. */}
      <div className="flex-1 pointer-events-none" />

      {/* Compact rival challenge kept outside the central play area. */}
      {activeDispute && !activeDispute.resolved && (
        <div className="absolute top-[clamp(52px,9vh,76px)] right-2 md:right-5 w-[clamp(210px,25vw,270px)] bg-[#161c28]/95 border border-[#fe6b00]/70 rounded-xl px-2.5 py-2 z-40 pointer-events-auto shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase text-white truncate">{activeDispute.npcName} disputa o passageiro</span>
            <span className="text-[10px] font-mono font-bold text-[#ffd700] shrink-0">{Math.max(0, activeDispute.timer).toFixed(1)}s</span>
          </div>
          <div className="h-1.5 bg-white/15 rounded-full overflow-hidden my-1.5">
            <div className="h-full bg-gradient-to-r from-[#fe6b00] to-[#ffd700]" style={{ width: `${activeDispute.playerProgress}%` }} />
          </div>
          <button type="button" onClick={onCallAction} className="w-full rounded-lg bg-[#ffd700] text-[#161c28] font-black uppercase text-[10px] py-1.5">
            CHAMAR [E]
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          EDGE SCREEN TAXI INDICATORS (Left & Right Margins)
          Directs players immediately towards off-screen taxis with open vacancies!
          ───────────────────────────────────────────────────────────── */}
      {/* Left Edge Indicators */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-auto z-25">
        {edgeIndicators
          .filter((ind) => ind.side === 'LEFT')
          .map((ind) => (
            <div
              key={ind.id}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 border-[#161c28] shadow-md transition-all ${
                ind.isDestinationMatching
                  ? 'bg-[#fe6b00] text-white ring-2 ring-[#ffd700] animate-pulse scale-105 shadow-orange-500/50'
                  : 'bg-[#161c28]/90 text-white backdrop-blur-xs'
              }`}
            >
              <span className="text-xs font-black animate-bounce text-[#ffd700]">◀</span>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/40 inline-block"
                    style={{ backgroundColor: ind.color }}
                  />
                  <span className="text-[10px] font-anybody font-black uppercase tracking-wider">
                    {ind.route}
                  </span>
                  {ind.isDestinationMatching && (
                    <span className="text-[8px] font-space font-black bg-[#ffd700] text-[#161c28] px-1 rounded-sm uppercase ml-0.5">
                      VAGA!
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[9px] font-space text-slate-200">
                  <span className="font-bold text-[#ffd700]">{ind.distanceMeters}m</span>
                  <span>•</span>
                  <span>{ind.availableSeats} vag{ind.availableSeats === 1 ? 'a' : 'as'}</span>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Right Edge Indicators */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-auto z-25">
        {edgeIndicators
          .filter((ind) => ind.side === 'RIGHT')
          .map((ind) => (
            <div
              key={ind.id}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 border-[#161c28] shadow-md transition-all ${
                ind.isDestinationMatching
                  ? 'bg-[#fe6b00] text-white ring-2 ring-[#ffd700] animate-pulse scale-105 shadow-orange-500/50'
                  : 'bg-[#161c28]/90 text-white backdrop-blur-xs'
              }`}
            >
              <div className="flex flex-col text-right">
                <div className="flex items-center justify-end gap-1">
                  {ind.isDestinationMatching && (
                    <span className="text-[8px] font-space font-black bg-[#ffd700] text-[#161c28] px-1 rounded-sm uppercase mr-0.5">
                      VAGA!
                    </span>
                  )}
                  <span className="text-[10px] font-anybody font-black uppercase tracking-wider">
                    {ind.route}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/40 inline-block"
                    style={{ backgroundColor: ind.color }}
                  />
                </div>
                <div className="flex items-center justify-end gap-1 text-[9px] font-space text-slate-200">
                  <span>{ind.availableSeats} vag{ind.availableSeats === 1 ? 'a' : 'as'}</span>
                  <span>•</span>
                  <span className="font-bold text-[#ffd700]">{ind.distanceMeters}m</span>
                </div>
              </div>
              <span className="text-xs font-black animate-bounce text-[#ffd700]">▶</span>
            </div>
          ))}
      </div>

      {/* Dynamic Floating Touch Zone (Captures touch on bottom-left 48% of screen) */}
      <div
        onTouchStart={handleTouchZoneStart}
        onTouchMove={handleTouchZoneMove}
        onTouchEnd={handleTouchZoneEnd}
        onTouchCancel={handleTouchZoneEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="absolute bottom-0 left-0 w-[48vw] max-w-[420px] h-[55vh] z-20 touch-none pointer-events-auto"
        title="Área do Joystick Tátil Dinâmico"
      />

      {/* Dynamic Floating Joystick Base (Rendered exactly where thumb touched) */}
      {isTouchActive && touchOrigin && (
        <div
          className="fixed pointer-events-none z-30 flex items-center justify-center transition-opacity duration-75"
          style={{
            left: `${touchOrigin.x}px`,
            top: `${touchOrigin.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-[96px] h-[96px] rounded-full bg-slate-950/40 backdrop-blur-xs border-2 border-[#ffd700] flex items-center justify-center relative shadow-xl">
            {/* Inner Ring */}
            <div className="w-[60px] h-[60px] rounded-full border border-dashed border-[#ffd700]/50 absolute" />
            {/* Knob */}
            <div
              className="w-[42px] h-[42px] bg-[#ffd700] rounded-full border-2 border-[#161c28] absolute flex items-center justify-center shadow-lg"
              style={{
                transform: `translate(${joystickOffset.x}px, ${joystickOffset.y}px)`,
              }}
            >
              <div className="w-3 h-3 bg-[#161c28]/80 rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM ROW:
          [Left: Joystick Rest Position]  |  [Right: Stacked LOTAR/CHAMAR & CORRER]
          ───────────────────────────────────────────────────────────── */}
      <footer className="flex justify-between items-end w-full pointer-events-auto pb-[clamp(1px,0.5vh,4px)]">
        {/* Joystick Rest Base (Visible in bottom-left when idle, guides the player's thumb) */}
        <div className="flex flex-col items-start select-none">
          <div
            className={`w-[clamp(76px,11.5vw,104px)] h-[clamp(76px,11.5vw,104px)] max-w-[26vh] max-h-[26vh] rounded-full bg-slate-950/25 backdrop-blur-xs border-2 border-[#ffd700]/75 flex items-center justify-center relative touch-none shadow-md transition-all ${
              isTouchActive ? 'opacity-30' : inputMethod === 'KEYBOARD' ? 'opacity-35 hover:opacity-85' : 'opacity-75'
            } ${
              tutorialHighlight === 'JOYSTICK' ? 'ring-4 ring-[#ffd700] ring-offset-2 ring-offset-black animate-pulse scale-105' : ''
            }`}
            title="Área do Manípulo (Toque em qualquer ponto desta zona ou use WASD)"
          >
            {/* Rest Knob */}
            <div
              className="w-[clamp(32px,4.5vw,42px)] h-[clamp(32px,4.5vw,42px)] max-w-[11vh] max-h-[11vh] bg-[#ffd700] rounded-full border-2 border-[#161c28] absolute top-1/2 left-1/2 flex flex-col items-center justify-center shadow-md transition-transform pointer-events-none"
              style={{
                transform: isTouchActive ? 'translate(-50%, -50%) scale(0.85)' : 'translate(-50%, -50%)',
              }}
            >
              <div className="w-[clamp(8px,1.1vw,11px)] h-[clamp(8px,1.1vw,11px)] bg-[#161c28]/70 rounded-full" />
            </div>
          </div>
        </div>

        {/* Contextual Boarding helper (shows when player has followers and taxi is waiting) */}
        {followersCount > 0 && activeTaxi && !canBoard && (
          <button
            type="button"
            onClick={onInteractAction}
            className="mb-1 bg-[#006399]/90 hover:bg-[#006399] active:scale-95 border border-white/25 rounded-full px-[clamp(8px,1.4vw,14px)] py-[clamp(4px,0.9vh,8px)] flex items-center gap-1.5 shadow-md animate-pulse cursor-pointer"
            title="Embarcar passageiros no táxi [ESPAÇO]"
          >
            <SpriteIcon name="taxi_candongueiro_drive_0" className="w-[clamp(16px,2.0vw,20px)] h-[clamp(12px,1.5vw,16px)]" />
            <span className="text-[clamp(9px,1.0vw,11px)] font-black text-white font-space uppercase">
              EMBARCAR ({followersCount})
            </span>
          </button>
        )}

        {/* Two Stacked Circular Action Buttons (Bottom-Right) */}
        <div className="flex flex-col items-center gap-[clamp(6px,1.5vh,12px)] z-30">
          {/* Contextual Action Button: CHAMAR or LOTAR */}
          <button
            type="button"
            onClick={canBoard ? onInteractAction : onCallAction}
            onTouchStart={() => setInputMethod('TOUCH')}
            className={`w-[clamp(54px,7.5vw,76px)] h-[clamp(54px,7.5vw,76px)] max-w-[16vh] max-h-[16vh] rounded-full active:scale-90 border-2 border-[#161c28] shadow-md flex flex-col items-center justify-center cursor-pointer transition-all select-none relative ${
              canBoard
                ? 'bg-[#fe6b00] hover:bg-[#ff7d1a] ring-4 ring-[#ffd700] ring-offset-2 ring-offset-black animate-pulse shadow-xl scale-105'
                : 'bg-[#ffd700] hover:bg-[#ffe066]'
            } ${
              tutorialHighlight === 'CALL' ? 'ring-4 ring-[#ffd700] ring-offset-2 ring-offset-black animate-bounce scale-110 shadow-2xl' : ''
            }`}
            title={canBoard ? 'LOTAR TÁXI [ESPAÇO]' : 'CHAMAR PASSAGEIROS [E]'}
          >
            {/* Keyboard Hotkey Badge */}
            {inputMethod === 'KEYBOARD' && (
              <span className="absolute -top-1.5 px-1 py-0.2 bg-[#161c28] border border-white/40 text-[8px] font-mono font-black text-[#ffd700] rounded-sm leading-none pointer-events-none shadow-xs">
                {canBoard ? 'ESPAÇO' : 'E'}
              </span>
            )}
            <SpriteIcon
              name="taxi_candongueiro_drive_0"
              className="w-[clamp(24px,3.2vw,32px)] h-[clamp(16px,2.2vw,22px)] max-h-[6vh] pointer-events-none"
            />
            <span
              className={`text-[clamp(9px,1.15vw,12px)] font-anybody font-black uppercase tracking-wider leading-none mt-0.5 pointer-events-none ${
                canBoard ? 'text-white' : 'text-[#161c28]'
              }`}
            >
              {canBoard ? 'LOTAR!' : 'CHAMAR'}
            </span>
          </button>

          {/* Botão CORRER (Inferior, Azul) */}
          <button
            type="button"
            onTouchStart={() => {
              setInputMethod('TOUCH');
              onRunToggle(true);
            }}
            onTouchEnd={() => onRunToggle(false)}
            onMouseDown={() => onRunToggle(true)}
            onMouseUp={() => onRunToggle(false)}
            className={`w-[clamp(52px,7.0vw,72px)] h-[clamp(52px,7.0vw,72px)] max-w-[15vh] max-h-[15vh] rounded-full bg-[#006399] hover:bg-[#0077b6] active:scale-90 border-2 border-white/80 shadow-md flex flex-col items-center justify-center cursor-pointer transition-all select-none relative ${
              tutorialHighlight === 'RUN' ? 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-black animate-bounce scale-110 shadow-2xl' : ''
            }`}
            title="CORRER [SHIFT]"
          >
            {/* Keyboard Hotkey Badge */}
            {inputMethod === 'KEYBOARD' && (
              <span className="absolute -top-1.5 px-1 py-0.2 bg-[#161c28] border border-cyan-400/50 text-[8px] font-mono font-black text-cyan-300 rounded-sm leading-none pointer-events-none shadow-xs">
                SHIFT
              </span>
            )}
            <SpriteIcon
              name="effect_turbo"
              className="w-[clamp(20px,2.8vw,28px)] h-[clamp(16px,2.2vw,22px)] max-h-[6vh] pointer-events-none"
            />
            <span className="text-[clamp(9px,1.1vw,11px)] font-anybody font-black uppercase text-white tracking-wider leading-none mt-0.5 pointer-events-none">
              CORRER
            </span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export const HUD = React.memo(HUDComponent);
