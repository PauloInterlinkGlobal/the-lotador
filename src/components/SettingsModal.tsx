/**
 * LOTADOR Settings Modal
 */

import React, { useState } from 'react';
import { GameSettings } from '../types/game';
import { loadSettings, saveSettings } from '../utils/storage';
import { soundManager } from '../utils/audio';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<GameSettings>(loadSettings());

  const handleToggleSound = () => {
    soundManager.playClick();
    const updated = { ...settings, soundEnabled: !settings.soundEnabled };
    soundManager.setMuted(!updated.soundEnabled);
    setSettings(updated);
    saveSettings(updated);
  };

  const handleToggleMusic = () => {
    soundManager.playClick();
    const updated = { ...settings, musicEnabled: !settings.musicEnabled };
    soundManager.setMusicMuted(!updated.musicEnabled);
    setSettings(updated);
    saveSettings(updated);
  };

  const handleToggleVibration = () => {
    soundManager.playClick();
    const updated = { ...settings, vibrationEnabled: !settings.vibrationEnabled };
    setSettings(updated);
    saveSettings(updated);
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white sticker-border hard-shadow-lg p-5 md:p-6 rounded-3xl max-w-sm w-full flex flex-col items-center">
        <div className="flex justify-between items-center w-full mb-4">
          <h2 className="font-anybody font-black text-2xl text-[#161c28] uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-[#161c28]">settings</span>
            DEFINIÇÕES
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

        <div className="flex flex-col gap-3 w-full mb-6">
          <div className="flex justify-between items-center bg-[#f1f3ff] p-3 rounded-2xl border border-slate-300">
            <span className="font-space font-bold text-sm text-[#161c28] flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">volume_up</span>
              Efeitos Sonoros (SFX)
            </span>
            <button
              onClick={handleToggleSound}
              className={`px-3 py-1 rounded-xl border-2 border-[#161c28] font-space font-bold text-xs uppercase ${
                settings.soundEnabled ? 'bg-[#ffd700]' : 'bg-slate-200'
              }`}
            >
              {settings.soundEnabled ? 'LIGADO' : 'DESLIGADO'}
            </button>
          </div>

          <div className="flex justify-between items-center bg-[#f1f3ff] p-3 rounded-2xl border border-slate-300">
            <span className="font-space font-bold text-sm text-[#161c28] flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">music_note</span>
              Música de Fundo
            </span>
            <button
              onClick={handleToggleMusic}
              className={`px-3 py-1 rounded-xl border-2 border-[#161c28] font-space font-bold text-xs uppercase ${
                settings.musicEnabled ? 'bg-[#ffd700]' : 'bg-slate-200'
              }`}
            >
              {settings.musicEnabled ? 'LIGADO' : 'DESLIGADO'}
            </button>
          </div>

          <div className="flex justify-between items-center bg-[#f1f3ff] p-3 rounded-2xl border border-slate-300">
            <span className="font-space font-bold text-sm text-[#161c28] flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">vibration</span>
              Vibração Hática
            </span>
            <button
              onClick={handleToggleVibration}
              className={`px-3 py-1 rounded-xl border-2 border-[#161c28] font-space font-bold text-xs uppercase ${
                settings.vibrationEnabled ? 'bg-[#ffd700]' : 'bg-slate-200'
              }`}
            >
              {settings.vibrationEnabled ? 'LIGADO' : 'DESLIGADO'}
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="w-full bg-[#161c28] text-white font-space font-bold py-3 rounded-2xl sticker-border hard-shadow uppercase text-sm"
        >
          CONCLUÍDO
        </button>
      </div>
    </div>
  );
};
