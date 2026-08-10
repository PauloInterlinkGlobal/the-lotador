/**
 * LOTADOR Main Menu Screen
 */

import React from 'react';
import { PlayerStats } from '../types/game';
import { getLevelTitle } from '../utils/storage';
import { soundManager } from '../utils/audio';
import { SpriteIcon } from './SpriteIcon';

interface MainMenuProps {
  stats: PlayerStats;
  onStartGame: () => void;
  onOpenUpgrades: () => void;
  onOpenCharacter: () => void;
  onOpenMaps: () => void;
  onOpenMissions: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  stats,
  onStartGame,
  onOpenUpgrades,
  onOpenCharacter,
  onOpenMaps,
  onOpenMissions,
  onOpenSettings,
}) => {
  const levelTitle = getLevelTitle(stats.level);

  const handleClick = (action: () => void) => {
    soundManager.playClick();
    action();
  };

  return (
    <div className="relative w-full h-screen bg-[#f9f9ff] flex flex-col justify-between p-4 md:p-8 select-none overflow-hidden">
      {/* Dynamic Background Decorative Bus Graphic */}
      <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
        <span className="material-symbols-outlined text-[300px] text-[#006399]">
          airport_shuttle
        </span>
      </div>

      {/* Top Header Bar */}
      <header className="flex justify-between items-center z-10">
        <div className="flex items-center bg-white rounded-full px-4 py-1.5 sticker-border hard-shadow">
          <div className="w-7 h-7 rounded-full bg-[#ffd700] flex items-center justify-center mr-2 border-2 border-[#161c28]">
            <span className="font-space font-bold text-xs text-[#705e00]">Kz</span>
          </div>
          <span className="font-space font-bold text-lg text-[#161c28]">
            {stats.money.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-[#ffd700] px-4 py-1.5 rounded-full sticker-border hard-shadow">
          <span className="material-symbols-outlined text-xl text-[#705e00]">star</span>
          <span className="font-space font-bold text-sm text-[#161c28]">
            LVL {stats.level} • {levelTitle}
          </span>
        </div>
      </header>

      {/* Main Branding Title */}
      <main className="flex-1 flex flex-col items-center justify-center text-center z-10 py-4">
        <div className="mb-2">
          <SpriteIcon name="logo_lotador" className="w-64 h-48 md:w-80 md:h-56 filter drop-shadow-md" />
        </div>

        {/* Primary Play Button */}
        <button
          onClick={() => handleClick(onStartGame)}
          className="w-full max-w-xs bg-[#ffd700] hover:bg-[#ffe16d] text-[#161c28] font-anybody font-black text-2xl py-4 rounded-2xl sticker-border hard-shadow-lg btn-press flex items-center justify-center gap-3 mb-6 transition-transform transform active:scale-95"
        >
          <SpriteIcon name="ui_play" className="w-8 h-8" />
          <span>▶ JOGAR</span>
        </button>

        {/* Secondary Menu Buttons Grid */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          <button
            onClick={() => handleClick(onOpenUpgrades)}
            className="bg-white hover:bg-slate-50 text-[#161c28] font-space font-bold py-3 rounded-xl sticker-border hard-shadow btn-press flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[#fe6b00]">bolt</span>
            UPGRADES
          </button>

          <button
            onClick={() => handleClick(onOpenMaps)}
            className="bg-white hover:bg-slate-50 text-[#161c28] font-space font-bold py-3 rounded-xl sticker-border hard-shadow btn-press flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[#006399]">map</span>
            MAPAS
          </button>

          <button
            onClick={() => handleClick(onOpenCharacter)}
            className="bg-white hover:bg-slate-50 text-[#161c28] font-space font-bold py-3 rounded-xl sticker-border hard-shadow btn-press flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[#705d00]">checkroom</span>
            PERSONAGEM
          </button>

          <button
            onClick={() => handleClick(onOpenMissions)}
            className="bg-white hover:bg-slate-50 text-[#161c28] font-space font-bold py-3 rounded-xl sticker-border hard-shadow btn-press flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[#ba1a1a]">target</span>
            MISSÕES
          </button>
        </div>
      </main>

      {/* Footer Settings Button */}
      <footer className="flex justify-between items-center z-10 pt-2">
        <span className="font-space text-xs text-slate-500 font-semibold">
          Luanda Arcade • v1.0 MVP
        </span>
        <button
          onClick={() => handleClick(onOpenSettings)}
          className="w-10 h-10 rounded-full bg-white sticker-border hard-shadow btn-press flex items-center justify-center text-[#161c28]"
          title="Definições"
        >
          <span className="material-symbols-outlined text-xl">settings</span>
        </button>
      </footer>
    </div>
  );
};
