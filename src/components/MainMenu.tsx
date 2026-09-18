/**
 * LOTADOR Main Menu Screen
 */

import React, { useState } from 'react';
import { PlayerStats } from '../types/game';
import { getLevelTitle } from '../utils/storage';
import { soundManager } from '../utils/audio';
import { SpriteIcon } from './SpriteIcon';

interface MainMenuProps {
  stats: PlayerStats;
  onStartGame: () => void;
  onStartTutorial?: () => void;
  onOpenUpgrades: () => void;
  onOpenCharacter: () => void;
  onOpenMaps: () => void;
  onOpenMissions: () => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  stats,
  onStartGame,
  onStartTutorial,
  onOpenUpgrades,
  onOpenCharacter,
  onOpenMaps,
  onOpenMissions,
  onOpenSettings,
  onOpenGuide,
}) => {
  const levelTitle = getLevelTitle(stats.level);
  const [isTestCalling, setIsTestCalling] = useState(false);
  const [shoutText, setShoutText] = useState('VIANA DIRETO!');

  const handleClick = (action: () => void) => {
    soundManager.playClick();
    action();
  };

  const handleMiniShout = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playCall();
    soundManager.vibrate(60);
    setIsTestCalling(true);

    const shouts = ['VIANA DIRETO!', 'BENFICA JÁ VAI!', 'TALATONA CHEIO!', 'SÓ FALTA UM!'];
    const text = shouts[Math.floor(Math.random() * shouts.length)];
    setShoutText(text);
    soundManager.speakPhrase(text.split('!')[0]);

    setTimeout(() => setIsTestCalling(false), 800);
  };

  return (
    <div className="relative w-full h-screen bg-[#f9f9ff] flex flex-col justify-between p-3 md:p-6 select-none overflow-y-auto">
      {/* Dynamic Background Decorative Bus Graphic */}
      <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
        <span className="material-symbols-outlined text-[300px] text-[#006399]">
          airport_shuttle
        </span>
      </div>

      {/* Top Header Bar */}
      <header className="flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center bg-white rounded-full px-4 py-1.5 sticker-border hard-shadow">
          <div className="w-7 h-7 rounded-full bg-[#ffd700] flex items-center justify-center mr-2 border-2 border-[#161c28]">
            <span className="font-space font-bold text-xs text-[#705e00]">Kz</span>
          </div>
          <span className="font-space font-bold text-lg text-[#161c28]">
            {stats.money.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Guide Trigger in Header */}
          <button
            onClick={() => handleClick(onOpenGuide)}
            className="flex items-center gap-1.5 bg-[#fe6b00] hover:bg-[#e05a00] text-white px-3 py-1.5 rounded-full sticker-border hard-shadow btn-press cursor-pointer"
            title="Como Jogar & Controlos"
          >
            <span className="material-symbols-outlined text-base">school</span>
            <span className="font-space font-bold text-xs uppercase hidden sm:inline">COMO JOGAR</span>
          </button>

          <div className="flex items-center gap-1.5 bg-[#ffd700] px-3.5 py-1.5 rounded-full sticker-border hard-shadow">
            <span className="material-symbols-outlined text-lg text-[#705e00]">star</span>
            <span className="font-space font-bold text-xs md:text-sm text-[#161c28]">
              LVL {stats.level} • {levelTitle}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center text-center z-10 py-2">
        <div className="mb-1">
          <SpriteIcon name="logo_lotador" className="w-56 h-36 md:w-72 md:h-44 filter drop-shadow-md" />
        </div>

        {/* Primary Play Button */}
        <button
          onClick={() => handleClick(stats.tutorialCompleted ? onStartGame : (onStartTutorial || onStartGame))}
          className="w-full max-w-xs bg-[#ffd700] hover:bg-[#ffe16d] text-[#161c28] font-anybody font-black text-xl md:text-2xl py-3.5 rounded-2xl sticker-border hard-shadow-lg btn-press flex flex-col items-center justify-center gap-1 mb-2 transition-transform transform active:scale-95 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <SpriteIcon name="ui_play" className="w-7 h-7" />
            <span>{stats.tutorialCompleted ? '▶ JOGAR' : 'COMEÇAR JOGO'}</span>
          </div>
          {!stats.tutorialCompleted && (
            <span className="text-[10px] font-space font-extrabold uppercase bg-[#161c28] text-[#ffd700] px-2 py-0.5 rounded-full">
              NÍVEL 1 • TUTORIAL INTERATIVO
            </span>
          )}
        </button>

        {stats.tutorialCompleted && onStartTutorial && (
          <button
            onClick={() => handleClick(onStartTutorial)}
            className="text-xs font-space font-bold text-slate-500 hover:text-[#161c28] underline cursor-pointer mb-3"
          >
            Repetir Tutorial do Nível 1
          </button>
        )}

        {/* Animated Visual Guide Widget on Main Menu */}
        <div
          onClick={() => handleClick(onOpenGuide)}
          className="w-full max-w-sm bg-white hover:bg-[#fffdf2] rounded-2xl sticker-border hard-shadow p-3 mb-3 cursor-pointer transition-all hover:scale-[1.02] text-left relative overflow-hidden group"
        >
          {/* Subtle accent border bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#fe6b00] via-[#ffd700] to-[#006399]" />

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-[#fe6b00] animate-bounce">
                campaign
              </span>
              <span className="font-space font-black text-xs text-[#161c28] uppercase tracking-wide">
                GUIA RÁPIDO DO LOTADOR
              </span>
            </div>
            <span className="bg-[#fe6b00] text-white font-space font-black text-[9px] uppercase px-2 py-0.5 rounded-full tracking-wider animate-pulse">
              APRENDE AQUI
            </span>
          </div>

          {/* Animated Mini Demonstration Box */}
          <div className="relative h-20 w-full bg-gradient-to-r from-[#eef2ff] to-[#fffde6] rounded-xl border border-slate-300 overflow-hidden flex items-center justify-between px-3">
            {/* Animated Concentric Waves */}
            <div className="absolute left-10 pointer-events-none flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border-2 border-[#fe6b00] sound-wave-anim opacity-80" />
              <div className="w-10 h-10 rounded-full border-2 border-[#ffd700] sound-wave-anim-delayed opacity-80" />
              {isTestCalling && (
                <div className="absolute w-14 h-14 rounded-full border-2 border-[#fe6b00] animate-ping" />
              )}
            </div>

            {/* Mini Lotador Character */}
            <div className="relative z-10 flex items-center gap-2 walk-anim">
              <SpriteIcon name="player_front_stand" className="w-10 h-14 filter drop-shadow" />
              {/* Floating Speech Bubble */}
              <div className="bg-white sticker-border-sm hard-shadow-sm px-2 py-0.5 rounded-xl shout-anim flex items-center gap-1">
                <span className="text-[10px] font-black font-anybody text-[#161c28] whitespace-nowrap">
                  "{shoutText}"
                </span>
              </div>
            </div>

            {/* Test Call Audio Button */}
            <button
              onClick={handleMiniShout}
              className="relative z-20 px-2.5 py-1.5 bg-[#ffd700] hover:bg-[#ffe16d] text-[#161c28] text-[10px] font-space font-black rounded-xl sticker-border-sm hard-shadow-sm flex items-center gap-1 btn-press cursor-pointer"
              title="Experimentar chamada de voz"
            >
              <span>CHAMA!</span>
              <span>📢</span>
            </button>
          </div>

          {/* Controls Mini Ribbon */}
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200 text-[10px] font-space font-bold text-slate-600">
            <div className="flex items-center gap-1">
              <kbd className="bg-slate-100 text-[#161c28] px-1.5 py-0.5 rounded border border-slate-300 font-mono">
                [WASD]
              </kbd>
              <span>Mover</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="bg-[#ffd700] text-[#161c28] px-1.5 py-0.5 rounded border border-[#161c28] font-mono">
                [E]
              </kbd>
              <span className="text-[#fe6b00] font-black">Chamar</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="bg-slate-100 text-[#161c28] px-1.5 py-0.5 rounded border border-slate-300 font-mono">
                [ESPAÇO]
              </kbd>
              <span>Embarcar</span>
            </div>
          </div>
        </div>

        {/* Secondary Menu Buttons Grid */}
        <div className="grid grid-cols-2 gap-2.5 w-full max-w-sm">
          <button
            onClick={() => handleClick(onOpenUpgrades)}
            className="bg-white hover:bg-slate-50 text-[#161c28] font-space font-bold py-2.5 rounded-xl sticker-border hard-shadow btn-press flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#fe6b00] text-lg">bolt</span>
            <span className="text-xs">UPGRADES</span>
          </button>

          <button
            onClick={() => handleClick(onOpenMaps)}
            className="bg-white hover:bg-slate-50 text-[#161c28] font-space font-bold py-2.5 rounded-xl sticker-border hard-shadow btn-press flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#006399] text-lg">map</span>
            <span className="text-xs">FASES & MAPAS</span>
          </button>

          <button
            onClick={() => handleClick(onOpenCharacter)}
            className="bg-white hover:bg-slate-50 text-[#161c28] font-space font-bold py-2.5 rounded-xl sticker-border hard-shadow btn-press flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#705d00] text-lg">checkroom</span>
            <span className="text-xs">PERSONAGEM</span>
          </button>

          <button
            onClick={() => handleClick(onOpenMissions)}
            className="bg-white hover:bg-slate-50 text-[#161c28] font-space font-bold py-2.5 rounded-xl sticker-border hard-shadow btn-press flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#ba1a1a] text-lg">target</span>
            <span className="text-xs">MISSÕES</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex justify-between items-center z-10 pt-1 shrink-0">
        <span className="font-space text-[11px] text-slate-500 font-semibold">
          Luanda Arcade • v1.0 MVP
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleClick(onOpenGuide)}
            className="px-3 py-1 bg-white sticker-border hard-shadow-sm btn-press rounded-full text-[#161c28] font-space font-bold text-xs flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-[#fe6b00]">help</span>
            <span>Ajuda</span>
          </button>
          <button
            onClick={() => handleClick(onOpenSettings)}
            className="w-8 h-8 rounded-full bg-white sticker-border hard-shadow btn-press flex items-center justify-center text-[#161c28] cursor-pointer"
            title="Definições"
          >
            <span className="material-symbols-outlined text-lg">settings</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

