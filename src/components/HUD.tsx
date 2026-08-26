/**
 * LOTADOR In-Game HUD
 */

import React, { useState, useEffect, useRef } from 'react';
import { Passenger, Taxi, RouteType } from '../types/game';
import { soundManager } from '../utils/audio';
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
  onCallAction: () => void;
  onInteractAction: () => void;
  onJoystickMove: (dir: { x: number; z: number }) => void;
  onRunToggle: (running: boolean) => void;
  onPowerUpTrigger?: () => void;
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
  onCallAction,
  onInteractAction,
  onJoystickMove,
  onRunToggle,
  onPowerUpTrigger,
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
  }, [onJoystickMove, onRunToggle, onCallAction, onInteractAction]);

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

  const activeTaxi = taxis.find((t) => t.state === 'WAITING' || t.state === 'LOADING');

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-2 md:p-5 select-none overflow-hidden pb-safe">
      {/* HUD Top Bar */}
      <header className="flex justify-between items-center pointer-events-auto gap-2">
        {/* Currency Pill */}
        <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-full pr-3 pl-1 py-1 sticker-border hard-shadow">
          <SpriteIcon name="ui_coin" className="w-7 h-7 mr-1" />
          <span className="font-space font-extrabold text-base md:text-lg text-[#161c28] tracking-tight">
            {money.toLocaleString()} <span className="text-xs text-[#fe6b00]">Kz</span>
          </span>
        </div>

        {/* Mission / Followers & Taxis Tracker */}
        <div className="flex items-center bg-[#ffd700]/95 backdrop-blur-sm px-3 py-1 rounded-full sticker-border hard-shadow gap-2">
          <span className="font-space font-bold text-xs text-[#161c28] uppercase flex items-center gap-1">
            <SpriteIcon name="taxi_candongueiro_drive_0" className="w-5 h-4" />
            <span>Táxis: <strong className="text-sm text-[#006399]">{taxisLoadedCount}</strong></span>
          </span>
          <span className="text-slate-400 font-bold">|</span>
          <span className="font-space font-bold text-xs text-[#161c28] uppercase flex items-center gap-1">
            <SpriteIcon name="passenger_normal_walk_0" className="w-4 h-5" />
            <span>Fila: <strong className="text-sm text-[#2e7d32]">{followersCount}</strong></span>
          </span>
        </div>

        {/* Timer & Level */}
        <div className="flex gap-1.5 items-center">
          <div className="bg-[#006399] sticker-border hard-shadow px-2.5 py-1 -rotate-2 rounded-lg flex items-center gap-1">
            <SpriteIcon name="ui_xp" className="w-4 h-4" />
            <span className="font-space font-bold text-white text-xs md:text-sm">LVL {level}</span>
          </div>
          <div className="bg-white/95 backdrop-blur-sm sticker-border hard-shadow px-2.5 py-1 rounded-lg flex items-center gap-1">
            <span className="material-symbols-outlined text-[#ba1a1a] text-sm">timer</span>
            <span className="font-space font-extrabold text-[#161c28] text-xs md:text-sm">{timeFormatted}</span>
          </div>
        </div>
      </header>

      {/* Center Screen Elements (Combo Badge & Rush Hour Banner) */}
      <div className="flex-1 relative flex flex-col items-center justify-start pt-2 pointer-events-none">
        {/* Rush Hour Event Banner */}
        {isRushHour && (
          <div className="bg-[#fe6b00] sticker-border hard-shadow px-4 py-1.5 rounded-xl mb-2 rush-pulse flex items-center gap-2">
            <SpriteIcon name="effect_combo" className="w-6 h-6" />
            <span className="font-anybody font-black text-white text-sm md:text-base tracking-wider uppercase">
              🔥 HORA DE PONTA!
            </span>
          </div>
        )}

        {/* Combo Multiplier Badge */}
        {combo > 1 && (
          <div className="combo-float">
            <div className="bg-[#fe6b00] sticker-border hard-shadow px-3.5 py-1 rounded-xl flex items-center gap-1.5">
              <SpriteIcon name="effect_combo" className="w-6 h-6" />
              <span className="font-anybody font-black text-white text-lg md:text-xl uppercase">
                COMBO x{combo}
              </span>
            </div>
          </div>
        )}

        {/* Floating Active Taxi Indicator Overlay */}
        {activeTaxi && (
          <div className="mt-auto mb-16 md:mb-20 bg-white/95 sticker-border hard-shadow p-2 rounded-2xl w-48 md:w-56 flex flex-col gap-1 pointer-events-auto">
            <div className="flex justify-between items-center font-space font-bold text-xs">
              <span className="flex items-center gap-1 text-[#161c28]">
                <SpriteIcon name="destination_viana" className="w-10 h-4" />
                <span>{activeTaxi.route}</span>
              </span>
              <span className="bg-[#ffd700] text-[#705e00] px-2 py-0.5 rounded-full border border-[#161c28] text-xs">
                {activeTaxi.currentPassengers}/{activeTaxi.capacity}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="h-3.5 w-full bg-slate-200 border-2 border-[#161c28] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#ffd700] transition-all duration-300 border-r-2 border-[#161c28]"
                style={{
                  width: `${(activeTaxi.currentPassengers / activeTaxi.capacity) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Controls & Stamina Bar Bottom Area */}
      <div className="flex justify-between items-end pb-1 md:pb-3 pointer-events-auto gap-2">
        {/* Joystick (Left) */}
        <div className="flex flex-col items-center gap-1">
          <div
            ref={joystickRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-28 h-28 md:w-36 md:h-36 bg-slate-900/30 backdrop-blur-md rounded-full border-4 border-[#161c28] flex items-center justify-center relative touch-none hard-shadow"
          >
            {/* Knob */}
            <div
              className="w-12 h-12 md:w-14 md:h-14 bg-[#ffd700] rounded-full sticker-border hard-shadow-sm absolute top-1/2 left-1/2 flex items-center justify-center transition-transform"
              style={{
                transform: `translate(calc(-50% + ${joystickPos.x}px), calc(-50% + ${joystickPos.y}px))`,
              }}
            >
              <div className="w-4 h-4 bg-[#161c28] rounded-full" />
            </div>
            <span className="material-symbols-outlined absolute top-1 text-white/70 text-xs">
              arrow_drop_up
            </span>
            <span className="material-symbols-outlined absolute bottom-1 text-white/70 text-xs">
              arrow_drop_down
            </span>
            <span className="material-symbols-outlined absolute left-1 text-white/70 text-xs">
              arrow_left
            </span>
            <span className="material-symbols-outlined absolute right-1 text-white/70 text-xs">
              arrow_right
            </span>
          </div>
        </div>

        {/* Action Buttons (Right) */}
        <div className="flex flex-col items-end gap-1.5">
          {/* Stamina Bar */}
          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full border-2 border-[#161c28] hard-shadow-sm">
            <SpriteIcon name="ui_stamina" className="w-5 h-5" />
            <div className="w-28 md:w-36 bg-slate-200 border border-[#161c28] rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ${
                  stamina < 30 ? 'bg-[#ba1a1a]' : 'bg-[#fe6b00]'
                }`}
                style={{ width: `${(stamina / maxStamina) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2 md:gap-3 items-end">
            {/* Interact Button 🤝 */}
            <button
              onClick={onInteractAction}
              className="w-13 h-13 md:w-16 md:h-16 rounded-2xl bg-[#006399] sticker-border hard-shadow btn-press flex flex-col items-center justify-center text-white active:scale-95 p-1"
              title="INTERAGIR / METER NO TÁXI [ESPAÇO]"
            >
              <SpriteIcon name="ui_confirm" className="w-6 h-6 md:w-7 md:h-7" />
              <span className="text-[9px] font-space font-black uppercase">METER</span>
            </button>

            {/* Run Button 🏃 */}
            <button
              onTouchStart={() => onRunToggle(true)}
              onTouchEnd={() => onRunToggle(false)}
              onMouseDown={() => onRunToggle(true)}
              onMouseUp={() => onRunToggle(false)}
              className="w-13 h-13 md:w-16 md:h-16 rounded-2xl bg-[#fe6b00] sticker-border hard-shadow btn-press flex flex-col items-center justify-center text-white active:scale-95 mb-2 p-1"
              title="CORRER [SHIFT]"
            >
              <SpriteIcon name="effect_turbo" className="w-6 h-6 md:w-7 md:h-7" />
              <span className="text-[9px] font-space font-black uppercase">CORRE</span>
            </button>

            {/* Call Button 📢 (Primary) */}
            <button
              onClick={onCallAction}
              className="w-18 h-18 md:w-22 md:h-22 rounded-3xl bg-[#ffd700] sticker-border hard-shadow-lg btn-press flex flex-col items-center justify-center text-[#161c28] active:scale-95 p-1.5"
              title="CHAMAR PASSAGEIROS [E]"
            >
              <SpriteIcon name="effect_megaphone" className="w-9 h-9 md:w-11 md:h-11" />
              <span className="text-[10px] md:text-xs font-anybody font-black uppercase mt-0.5">CHAMA!</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

