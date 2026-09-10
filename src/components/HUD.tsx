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
import { Passenger, Taxi, PassengerDispute } from '../types/game';
import { SpriteIcon } from './SpriteIcon';

interface HUDProps {
  money: number;
  level: number;
  timerSeconds: number;
  combo: number;
  stamina: number;
  maxStamina: number;
  isRushHour: boolean;
  taxis: Taxi[];
  passengers: Passenger[];
  taxisLoadedCount?: number;
  activeDispute?: PassengerDispute | null;
  floatingToasts?: { id: number; text: string; color: string }[];
  onCallAction: () => void;
  onInteractAction: () => void;
  onJoystickMove: (dir: { x: number; z: number }) => void;
  onRunToggle: (running: boolean) => void;
  onPowerUpTrigger?: () => void;
  onPause?: () => void;
  onOpenObjectives?: () => void;
  objectivesCount?: number;
  tutorialHighlight?: 'JOYSTICK' | 'CALL' | 'RUN' | 'MONEY' | 'ENERGY' | 'OBJECTIVES' | 'TIMER' | null;
}

export const HUD: React.FC<HUDProps> = ({
  money,
  level,
  timerSeconds,
  combo,
  stamina,
  maxStamina,
  isRushHour,
  taxis,
  passengers,
  taxisLoadedCount = 0,
  activeDispute,
  floatingToasts,
  onCallAction,
  onInteractAction,
  onJoystickMove,
  onRunToggle,
  onPowerUpTrigger,
  onPause,
  onOpenObjectives,
  objectivesCount = 3,
  tutorialHighlight = null,
}) => {
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const joystickRef = useRef<HTMLDivElement>(null);
  const touchIdRef = useRef<number | null>(null);

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

  // Keyboard controls listener for Desktop play!
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

  // Touch Joystick Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchIdRef.current = touch.identifier;
    setJoystickActive(true);
    updateJoystickPos(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!joystickActive) return;
    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === touchIdRef.current) {
        updateJoystickPos(e.touches[i].clientX, e.touches[i].clientY);
        break;
      }
    }
  };

  const handleTouchEnd = () => {
    setJoystickActive(false);
    setJoystickPos({ x: 0, y: 0 });
    touchIdRef.current = null;
    onJoystickMove({ x: 0, z: 0 });
  };

  const updateJoystickPos = (clientX: number, clientY: number) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = rect.width / 2;

    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const nx = Math.cos(angle) * clampedDist;
    const ny = Math.sin(angle) * clampedDist;

    setJoystickPos({ x: nx, y: ny });

    const normX = nx / maxRadius;
    const normZ = -ny / maxRadius;
    onJoystickMove({ x: normX, z: normZ });
  };

  const staminaPercent = Math.max(0, Math.min(100, (stamina / maxStamina) * 100));

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
        </div>

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

            {/* Stopwatch */}
            <div className="flex items-center gap-[clamp(3px,0.5vw,6px)]">
              <span className="material-symbols-outlined text-[clamp(12px,1.3vw,15px)] text-white/75 leading-none select-none">
                schedule
              </span>
              <span className="text-[clamp(10px,1.15vw,13px)] font-extrabold text-white font-mono tracking-tight tabular-nums">
                {timeFormatted}
              </span>
            </div>
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

      {/* ─────────────────────────────────────────────────────────────
          CENTER SCREEN:
          Reserved 85-90% for gameplay. NO permanent cards or bars!
          Only brief transient banners or active dispute modal.
          ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 relative flex flex-col items-center justify-start pt-[clamp(2px,0.8vh,6px)] pointer-events-none">
        {/* Rush Hour Event Banner (only when active) */}
        {isRushHour && (
          <div className="bg-[#fe6b00]/90 backdrop-blur-xs border border-white/20 px-[clamp(8px,1.4vw,14px)] py-[clamp(3px,0.7vh,6px)] rounded-full mb-1 rush-pulse flex items-center gap-1.5 shadow-md">
            <SpriteIcon name="effect_combo" className="w-[clamp(13px,1.5vw,16px)] h-[clamp(13px,1.5vw,16px)]" />
            <span className="font-anybody font-black text-white text-[clamp(10px,1.1vw,12px)] uppercase tracking-wider">
              🔥 HORA DE PONTA!
            </span>
          </div>
        )}

        {/* Combo Multiplier Badge (only when combo > 1) */}
        {combo > 1 && (
          <div className="combo-float">
            <div className="bg-[#fe6b00]/90 border border-white/20 px-[clamp(8px,1.2vw,12px)] py-[clamp(2px,0.5vh,4px)] rounded-full flex items-center gap-1 shadow-md">
              <span className="font-anybody font-black text-white text-[clamp(10px,1.1vw,12px)] uppercase">
                COMBO x{combo}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Notifications Toasts (Brief, auto-fading) */}
      <div
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center gap-1 z-40 w-full max-w-xs px-2"
        style={{
          top: 'max(clamp(46px, 10.5vh, 68px), calc(env(safe-area-inset-top, 0px) + 36px))',
        }}
      >
        {floatingToasts?.map((toast) => (
          <div
            key={toast.id}
            className="animate-bounce-in px-[clamp(8px,1.2vw,14px)] py-[clamp(3px,0.6vh,6px)] rounded-full text-[clamp(9px,1.0vw,11px)] font-black font-space tracking-wide text-white uppercase text-center shadow-md border border-white/20"
            style={{ backgroundColor: toast.color || '#161c28' }}
          >
            {toast.text}
          </div>
        ))}
      </div>

      {/* Direct Passenger Dispute ("É MEU!") Interactive Overlay (only during dispute) */}
      {activeDispute && !activeDispute.resolved && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[clamp(260px,85vw,360px)] max-h-[85vh] overflow-y-auto bg-white/95 backdrop-blur-md sticker-border hard-shadow p-[clamp(10px,1.5vw,14px)] z-50 pointer-events-auto rounded-2xl animate-scale-in flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-xl bg-[#ba1a1a] flex items-center justify-center text-white border border-[#161c28] font-black font-anybody text-xs">
                VS
              </div>
              <div>
                <span className="text-xs font-black font-space uppercase text-[#161c28]">
                  {activeDispute.npcName}
                </span>
                <p className="text-[9px] text-slate-500 font-bold leading-none">
                  Destino: <strong className="text-[#006399]">{activeDispute.passengerDestination}</strong>
                </p>
              </div>
            </div>
            <div className="bg-[#ffd700] px-2 py-0.5 rounded-full border border-[#161c28] font-mono text-[10px] font-black">
              {Math.max(0, activeDispute.timer).toFixed(1)}s
            </div>
          </div>

          <div className="w-full bg-[#fde8e8] border border-[#ba1a1a] rounded-xl px-2.5 py-1 mb-2 text-center">
            <span className="text-[11px] font-black text-[#ba1a1a] font-space italic">
              "{activeDispute.npcSpeech}"
            </span>
          </div>

          <div className="w-full flex flex-col gap-0.5 mb-2.5">
            <div className="flex justify-between text-[10px] font-black font-space">
              <span className="text-[#ba1a1a]">{activeDispute.npcName}</span>
              <span className="text-[#fe6b00]">{Math.round(activeDispute.playerProgress)}% TU</span>
            </div>
            <div className="w-full h-3 bg-slate-200 border border-[#161c28] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#ba1a1a] via-[#fe6b00] to-[#ffd700] transition-all duration-75"
                style={{ width: `${activeDispute.playerProgress}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onCallAction}
            className="w-full py-2 bg-[#ffd700] hover:bg-[#ffdf33] active:scale-95 border-2 border-[#161c28] rounded-xl flex items-center justify-center gap-1.5 text-[#161c28] font-anybody font-black uppercase text-xs animate-pulse cursor-pointer shadow-sm"
          >
            <SpriteIcon name="effect_megaphone" className="w-4 h-4" />
            <span>PRESSIONA RÁPIDO [E] / CHAMA!</span>
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM ROW:
          [Left: Joystick]  |  [Right: Stacked CHAMAR & CORRER]
          ───────────────────────────────────────────────────────────── */}
      <footer className="flex justify-between items-end w-full pointer-events-auto pb-[clamp(1px,0.5vh,4px)]">
        {/* 10. Joystick (Bottom-Left, 10% - 13% width, capped on ultra-wide aspect ratios) */}
        <div className="flex flex-col items-start">
          <div
            ref={joystickRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`w-[clamp(76px,11.5vw,110px)] h-[clamp(76px,11.5vw,110px)] max-w-[28vh] max-h-[28vh] rounded-full bg-slate-950/25 backdrop-blur-xs border-2 border-[#ffd700]/75 flex items-center justify-center relative touch-none shadow-md transition-all ${
              tutorialHighlight === 'JOYSTICK' ? 'ring-4 ring-[#ffd700] ring-offset-2 ring-offset-black animate-pulse scale-105' : ''
            }`}
            title="Manípulo Direcional (Toque ou WASD)"
          >
            {/* Knob */}
            <div
              className="w-[clamp(30px,4.5vw,42px)] h-[clamp(30px,4.5vw,42px)] max-w-[11vh] max-h-[11vh] bg-[#ffd700] rounded-full border-2 border-[#161c28] absolute top-1/2 left-1/2 flex items-center justify-center shadow-md transition-transform pointer-events-none"
              style={{
                transform: `translate(calc(-50% + ${joystickPos.x}px), calc(-50% + ${joystickPos.y}px))`,
              }}
            >
              <div className="w-[clamp(8px,1.1vw,11px)] h-[clamp(8px,1.1vw,11px)] bg-[#161c28]/70 rounded-full" />
            </div>
          </div>
        </div>

        {/* Contextual Boarding helper (shows only when player has followers and a taxi is waiting) */}
        {followersCount > 0 && activeTaxi && (
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

        {/* 7, 8, 9. Two Stacked Circular Buttons (Bottom-Right) */}
        <div className="flex flex-col items-center gap-[clamp(6px,1.5vh,12px)]">
          {/* 8. Botão CHAMAR (Superior, Amarelo/Dourado) */}
          <button
            type="button"
            onClick={onCallAction}
            className={`w-[clamp(52px,7.0vw,72px)] h-[clamp(52px,7.0vw,72px)] max-w-[15vh] max-h-[15vh] rounded-full bg-[#ffd700] hover:bg-[#ffe066] active:scale-90 border-2 border-[#161c28] shadow-md flex flex-col items-center justify-center cursor-pointer transition-all select-none ${
              tutorialHighlight === 'CALL' ? 'ring-4 ring-[#ffd700] ring-offset-2 ring-offset-black animate-bounce scale-110 shadow-2xl' : ''
            }`}
            title="CHAMAR PASSAGEIROS [E]"
          >
            <SpriteIcon
              name="taxi_candongueiro_drive_0"
              className="w-[clamp(22px,3.0vw,30px)] h-[clamp(14px,2.0vw,20px)] max-h-[6vh] pointer-events-none"
            />
            <span className="text-[clamp(7px,0.85vw,9px)] font-anybody font-black uppercase text-[#161c28] tracking-wider leading-none mt-0.5 pointer-events-none">
              CHAMAR
            </span>
          </button>

          {/* 9. Botão CORRER (Inferior, Azul) */}
          <button
            type="button"
            onTouchStart={() => onRunToggle(true)}
            onTouchEnd={() => onRunToggle(false)}
            onMouseDown={() => onRunToggle(true)}
            onMouseUp={() => onRunToggle(false)}
            className={`w-[clamp(52px,7.0vw,72px)] h-[clamp(52px,7.0vw,72px)] max-w-[15vh] max-h-[15vh] rounded-full bg-[#006399] hover:bg-[#0077b6] active:scale-90 border-2 border-white/80 shadow-md flex flex-col items-center justify-center cursor-pointer transition-all select-none ${
              tutorialHighlight === 'RUN' ? 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-black animate-bounce scale-110 shadow-2xl' : ''
            }`}
            title="CORRER [SHIFT]"
          >
            <SpriteIcon
              name="effect_turbo"
              className="w-[clamp(19px,2.6vw,26px)] h-[clamp(15px,2.1vw,20px)] max-h-[6vh] pointer-events-none"
            />
            <span className="text-[clamp(7px,0.85vw,9px)] font-anybody font-black uppercase text-white tracking-wider leading-none mt-0.5 pointer-events-none">
              CORRER
            </span>
          </button>
        </div>
      </footer>
    </div>
  );
};
