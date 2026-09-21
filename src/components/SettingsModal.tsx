/**
 * LOTADOR Settings Modal
 */

import React, { useState } from 'react';
import { GameSettings } from '../types/game';
import { loadSettings, saveSettings } from '../utils/storage';
import { soundManager } from '../utils/audio';

interface SettingsModalProps {
  onClose: () => void;
  onSettingsChange?: (newSettings: GameSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onSettingsChange }) => {
  const [settings, setSettings] = useState<GameSettings>(loadSettings());

  const handleToggleSound = () => {
    soundManager.playClick();
    const updated = { ...settings, soundEnabled: !settings.soundEnabled };
    soundManager.setMuted(!updated.soundEnabled);
    setSettings(updated);
    saveSettings(updated);
    onSettingsChange?.(updated);
  };

  const handleToggleMusic = () => {
    soundManager.playClick();
    const updated = { ...settings, musicEnabled: !settings.musicEnabled };
    soundManager.setMusicMuted(!updated.musicEnabled);
    setSettings(updated);
    saveSettings(updated);
    onSettingsChange?.(updated);
  };

  const handleToggleVibration = () => {
    soundManager.playClick();
    const updated = { ...settings, vibrationEnabled: !settings.vibrationEnabled };
    setSettings(updated);
    saveSettings(updated);
    onSettingsChange?.(updated);
  };

  const handleQualitySelect = (quality: 'LOW' | 'MEDIUM' | 'HIGH') => {
    soundManager.playClick();
    const updated = { ...settings, graphicsQuality: quality };
    setSettings(updated);
    saveSettings(updated);
    onSettingsChange?.(updated);
  };

  const handleToggleFpsOverlay = () => {
    soundManager.playClick();
    const updated = { ...settings, showFpsOverlay: !settings.showFpsOverlay };
    setSettings(updated);
    saveSettings(updated);
    onSettingsChange?.(updated);
  };

  const handleLanguageToggle = (lang: 'PT' | 'EN') => {
    soundManager.playClick();
    const updated = { ...settings, language: lang };
    setSettings(updated);
    saveSettings(updated);
    onSettingsChange?.(updated);
  };

  const isPT = settings.language === 'PT';

  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white sticker-border hard-shadow-lg p-5 md:p-6 rounded-3xl max-w-md w-full flex flex-col items-center max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center w-full mb-3">
          <h2 className="font-anybody font-black text-2xl text-[#161c28] uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-[#161c28]">settings</span>
            {isPT ? 'DEFINIÇÕES' : 'SETTINGS'}
          </h2>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 border border-[#161c28] flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-2.5 w-full mb-4">
          <div className="flex justify-between items-center bg-[#f1f3ff] p-3 rounded-2xl border border-slate-300">
            <span className="font-space font-bold text-xs md:text-sm text-[#161c28] flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">volume_up</span>
              {isPT ? 'Efeitos Sonoros (SFX)' : 'Sound Effects (SFX)'}
            </span>
            <button
              onClick={handleToggleSound}
              className={`px-3 py-1 rounded-xl border-2 border-[#161c28] font-space font-bold text-xs uppercase ${
                settings.soundEnabled ? 'bg-[#ffd700]' : 'bg-slate-200'
              }`}
            >
              {settings.soundEnabled ? (isPT ? 'LIGADO' : 'ON') : isPT ? 'DESLIGADO' : 'OFF'}
            </button>
          </div>

          <div className="flex justify-between items-center bg-[#f1f3ff] p-3 rounded-2xl border border-slate-300">
            <span className="font-space font-bold text-xs md:text-sm text-[#161c28] flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">music_note</span>
              {isPT ? 'Música de Fundo' : 'Background Music'}
            </span>
            <button
              onClick={handleToggleMusic}
              className={`px-3 py-1 rounded-xl border-2 border-[#161c28] font-space font-bold text-xs uppercase ${
                settings.musicEnabled ? 'bg-[#ffd700]' : 'bg-slate-200'
              }`}
            >
              {settings.musicEnabled ? (isPT ? 'LIGADO' : 'ON') : isPT ? 'DESLIGADO' : 'OFF'}
            </button>
          </div>

          <div className="flex justify-between items-center bg-[#f1f3ff] p-3 rounded-2xl border border-slate-300">
            <span className="font-space font-bold text-xs md:text-sm text-[#161c28] flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">vibration</span>
              {isPT ? 'Vibração Hática' : 'Haptic Vibration'}
            </span>
            <button
              onClick={handleToggleVibration}
              className={`px-3 py-1 rounded-xl border-2 border-[#161c28] font-space font-bold text-xs uppercase ${
                settings.vibrationEnabled ? 'bg-[#ffd700]' : 'bg-slate-200'
              }`}
            >
              {settings.vibrationEnabled ? (isPT ? 'LIGADO' : 'ON') : isPT ? 'DESLIGADO' : 'OFF'}
            </button>
          </div>

          <div className="flex justify-between items-center bg-[#f1f3ff] p-3 rounded-2xl border border-slate-300">
            <span className="font-space font-bold text-xs md:text-sm text-[#161c28] flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">language</span>
              {isPT ? 'Idioma / Language' : 'Language'}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => handleLanguageToggle('PT')}
                className={`px-2.5 py-1 rounded-xl border-2 border-[#161c28] font-space font-bold text-xs ${
                  settings.language === 'PT' ? 'bg-[#ffd700]' : 'bg-white'
                }`}
              >
                🇦🇴 PT
              </button>
              <button
                onClick={() => handleLanguageToggle('EN')}
                className={`px-2.5 py-1 rounded-xl border-2 border-[#161c28] font-space font-bold text-xs ${
                  settings.language === 'EN' ? 'bg-[#ffd700]' : 'bg-white'
                }`}
              >
                🇬🇧 EN
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 bg-[#f1f3ff] p-3 rounded-2xl border border-slate-300">
            <div className="flex justify-between items-center">
              <span className="font-space font-bold text-xs text-[#161c28] uppercase">
                {isPT ? 'Qualidade Gráfica:' : 'Graphic Quality:'}
              </span>
              <span className="font-space text-[10px] font-semibold text-slate-500">
                {settings.graphicsQuality === 'LOW'
                  ? isPT
                    ? '⚡ Max Fluidez (60 FPS)'
                    : '⚡ Max Speed (60 FPS)'
                  : settings.graphicsQuality === 'MEDIUM'
                  ? isPT
                    ? '⚖️ Balanceado'
                    : '⚖️ Balanced'
                  : isPT
                  ? '✨ Sombras HD'
                  : '✨ HD Shadows'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(['LOW', 'MEDIUM', 'HIGH'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => handleQualitySelect(q)}
                  className={`py-1.5 rounded-xl border-2 border-[#161c28] font-space font-bold text-xs uppercase ${
                    settings.graphicsQuality === q ? 'bg-[#fe6b00] text-white' : 'bg-white'
                  }`}
                >
                  {q === 'LOW' ? (isPT ? 'BAIXA' : 'LOW') : q === 'MEDIUM' ? (isPT ? 'MÉDIA' : 'MED') : (isPT ? 'ALTA' : 'HIGH')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center bg-[#f1f3ff] p-3 rounded-2xl border border-slate-300">
            <div className="flex flex-col">
              <span className="font-space font-bold text-xs md:text-sm text-[#161c28] flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">monitoring</span>
                {isPT ? 'Overlay de Desempenho' : 'Performance Overlay'}
              </span>
              <span className="text-[10px] text-slate-500 font-work pl-6">
                {isPT ? 'Mostra FPS, draw calls e memória' : 'Shows FPS, draw calls and memory'}
              </span>
            </div>
            <button
              onClick={handleToggleFpsOverlay}
              className={`px-3 py-1 rounded-xl border-2 border-[#161c28] font-space font-bold text-xs uppercase ${
                settings.showFpsOverlay ? 'bg-[#ffd700]' : 'bg-slate-200'
              }`}
            >
              {settings.showFpsOverlay ? (isPT ? 'LIGADO' : 'ON') : isPT ? 'DESLIGADO' : 'OFF'}
            </button>
          </div>

          <div className="bg-[#fffbeb] border-2 border-[#fe6b00] p-3 rounded-2xl flex flex-col gap-1 hard-shadow-sm">
            <span className="font-anybody font-black text-xs text-[#161c28] uppercase flex items-center gap-1">
              💡 {isPT ? 'DICAS PARA MOBILE:' : 'MOBILE GAMEPLAY TIPS:'}
            </span>
            <ul className="text-[11px] text-slate-700 font-work list-disc pl-4 space-y-0.5">
              <li>{isPT ? 'Usa o Joystick Virtual à esquerda para controlar o teu Lotador.' : 'Use the Virtual Joystick on the left to move your Lotador.'}</li>
              <li>{isPT ? 'Usa o botão CHAMA [📢] para atrair passageiros com destino compatível.' : 'Use the CALL button [📢] to attract passengers to matching taxis.'}</li>
              <li>{isPT ? 'Usa o botão METER [🤝] perto do táxi para embarcar passageiros e somar Combos!' : 'Use INTERACT [🤝] near taxis to load passengers and boost Combos!'}</li>
            </ul>
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="w-full bg-[#161c28] text-white font-space font-bold py-3 rounded-2xl sticker-border hard-shadow uppercase text-sm"
        >
          {isPT ? 'GUARDAR E VOLTAR' : 'SAVE AND CLOSE'}
        </button>
      </div>
    </div>
  );
};
