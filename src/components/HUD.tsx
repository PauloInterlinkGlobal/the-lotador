/**
 * LOTADOR In-Game HUD
 */

import React, { useState, useEffect, useRef } from 'react';
import { Passenger, Taxi, RouteType } from '../types/game';
import { soundManager } from '../utils/audio';

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

  // Keyboard controls listener for Desktop play!
  useEffect(() => {
    const keysPressed = new Set<string>();

    const updateDir = () => {
      let x = 0;
      let z = 0;
      if (keysPressed.has('KeyA') || keysPressed.has('ArrowLeft')) x -= 1;
      if (keysPressed.has('KeyD') || keysPressed.has('ArrowRight')) x += 1;
      if (keysPressed.has('KeyW') || keysPressed.has('ArrowUp')) z -= 1;
      if (keysPressed.has('KeyS') || keysPressed.has('ArrowDown')) z += 1;

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
    const normZ = ny / maxRadius;
    onJoystickMove({ x: normX, z: normZ });
  };

  const activeTaxi = taxis.find((t) => t.state === 'WAITING' || t.state === 'LOADING');

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-3 md:p-6 select-none">
      {/* HUD Top Bar */}
      <header className="flex justify-between items-start pointer-events-auto">
        {/* Currency Pill */}
        <div className="flex items-center bg-[#f9f9ff]/90 backdrop-blur-sm rounded-full pr-4 pl-1 py-1 sticker-border hard-shadow">
          <div className="w-8 h-8 rounded-full bg-[#ffd700] flex items-center justify-center mr-2 border-2 border-[#161c28]">
            <span className="font-space font-bold text-xs text-[#705e00]">Kz</span>
          </div>
          <span className="font-space font-bold text-lg text-[#161c28] tracking-tight">
            {money.toLocaleString()}
          </span>
        </div>

        {/* Timer & Level */}
        <div className="flex gap-2 items-center">
          <div className="bg-[#006399] sticker-border hard-shadow px-3 py-1 -rotate-2">
            <span className="font-space font-bold text-white text-sm">LVL {level}</span>
          </div>
          <div className="bg-[#f9f9ff]/90 backdrop-blur-sm sticker-border hard-shadow px-3 py-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[#ba1a1a] text-lg">timer</span>
            <span className="font-space font-bold text-[#161c28] text-sm">{timeFormatted}</span>
          </div>
        </div>
      </header>

      {/* Center Screen Elements (Combo Badge & Rush Hour Banner) */}
      <div className="flex-1 relative flex flex-col items-center justify-start pt-4 pointer-events-none">
        {/* Rush Hour Event Banner */}
        {isRushHour && (
          <div className="bg-[#fe6b00] sticker-border hard-shadow px-5 py-2 rounded-xl mb-3 rush-pulse">
            <span className="font-anybody font-black text-white text-lg tracking-wider uppercase">
              🔥 HORA DE PONTA!
            </span>
          </div>
        )}

        {/* Combo Multiplier Badge */}
        {combo > 1 && (
          <div className="combo-float">
            <div className="bg-[#fe6b00] sticker-border hard-shadow px-4 py-1 rounded-xl">
              <span className="font-anybody font-black text-white text-xl uppercase">
                🔥 x{combo}
              </span>
            </div>
          </div>
        )}

        {/* Floating Active Taxi Indicator Overlay */}
        {activeTaxi && (
          <div className="mt-auto mb-20 bg-[#f9f9ff]/95 sticker-border hard-shadow p-2 rounded-xl w-52 flex flex-col gap-1 pointer-events-auto">
            <div className="flex justify-between items-center font-space font-bold text-xs">
              <span className="flex items-center gap-1 text-[#161c28]">
                <span className="material-symbols-outlined text-base">directions_car</span>
                TÁXI {activeTaxi.route}
              </span>
              <span className="bg-[#ffd700] text-[#705e00] px-1.5 py-0.5 rounded border border-[#161c28]">
                {activeTaxi.currentPassengers}/{activeTaxi.capacity}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="h-3 w-full bg-slate-200 border-2 border-[#161c28] rounded-full overflow-hidden">
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
      <div className="flex justify-between items-end pb-2 pointer-events-auto">
        {/* Joystick (Left) */}
        <div className="flex flex-col items-center gap-2">
          <div
            ref={joystickRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-32 h-32 bg-slate-800/20 backdrop-blur-sm rounded-full border-4 border-[#161c28]/30 flex items-center justify-center relative touch-none"
          >
            {/* Knob */}
            <div
              className="w-12 h-12 bg-white rounded-full sticker-border hard-shadow-sm absolute top-1/2 left-1/2 flex items-center justify-center transition-transform"
              style={{
                transform: `translate(calc(-50% + ${joystickPos.x}px), calc(-50% + ${joystickPos.y}px))`,
              }}
            >
              <div className="w-4 h-4 bg-slate-300 rounded-full" />
            </div>
            <span className="material-symbols-outlined absolute top-1 text-slate-700/50 text-sm">
              arrow_drop_up
            </span>
            <span className="material-symbols-outlined absolute bottom-1 text-slate-700/50 text-sm">
              arrow_drop_down
            </span>
            <span className="material-symbols-outlined absolute left-1 text-slate-700/50 text-sm">
              arrow_left
            </span>
            <span className="material-symbols-outlined absolute right-1 text-slate-700/50 text-sm">
              arrow_right
            </span>
          </div>
          <span className="text-[10px] font-space font-bold text-slate-600 bg-white/80 px-2 py-0.5 rounded-full border border-slate-400">
            WASD / JOYSTICK
          </span>
        </div>

        {/* Action Buttons (Right) */}
        <div className="flex flex-col items-end gap-2">
          {/* Stamina Bar */}
          <div className="w-36 bg-slate-200 border-2 border-[#161c28] rounded-full h-3 overflow-hidden hard-shadow-sm">
            <div
              className={`h-full transition-all duration-100 ${
                stamina < 30 ? 'bg-[#ba1a1a]' : 'bg-[#fe6b00]'
              }`}
              style={{ width: `${(stamina / maxStamina) * 100}%` }}
            />
          </div>

          <div className="flex gap-3 items-end">
            {/* Interact Button 🤝 */}
            <button
              onClick={onInteractAction}
              className="w-14 h-14 rounded-full bg-[#006399] sticker-border hard-shadow btn-press flex flex-col items-center justify-center text-white active:scale-95"
              title="INTERAGIR / METER NO TÁXI [ESPAÇO]"
            >
              <span className="material-symbols-outlined text-2xl">handshake</span>
              <span className="text-[9px] font-space font-bold">ESPAÇO</span>
            </button>

            {/* Run Button 🏃 */}
            <button
              onTouchStart={() => onRunToggle(true)}
              onTouchEnd={() => onRunToggle(false)}
              onMouseDown={() => onRunToggle(true)}
              onMouseUp={() => onRunToggle(false)}
              className="w-14 h-14 rounded-full bg-[#fe6b00] sticker-border hard-shadow btn-press flex flex-col items-center justify-center text-white active:scale-95 mb-4"
              title="CORRER [SHIFT]"
            >
              <span className="material-symbols-outlined text-2xl">directions_run</span>
              <span className="text-[9px] font-space font-bold">SHIFT</span>
            </button>

            {/* Call Button 📢 (Primary) */}
            <button
              onClick={onCallAction}
              className="w-20 h-20 rounded-full bg-[#ffd700] sticker-border hard-shadow-lg btn-press flex flex-col items-center justify-center text-[#705e00] active:scale-95"
              title="CHAMAR PASSAGEIROS [E]"
            >
              <span className="material-symbols-outlined text-3xl font-black">campaign</span>
              <span className="text-[10px] font-space font-bold uppercase mt-0.5">CHAMA [E]</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
