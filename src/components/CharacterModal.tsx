import React, { useState, useEffect } from 'react';
import { PlayerStats } from '../types/game';
import { savePlayerStats } from '../utils/storage';
import { soundManager } from '../utils/audio';
import { SpriteIcon } from './SpriteIcon';

interface CharacterModalProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  onClose: () => void;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({
  stats,
  onUpdateStats,
  onClose,
}) => {
  const shirtColors = ['#ffd700', '#fe6b00', '#006399', '#ba1a1a', '#2e7d32'];
  const pantsColors = ['#006399', '#161c28', '#572000', '#4d4732'];

  const [testAnim, setTestAnim] = useState<'idle' | 'walk' | 'run' | 'call'>('idle');
  const [animFrame, setAnimFrame] = useState(0);

  // Animate character preview stage
  useEffect(() => {
    const intervalMs = testAnim === 'run' ? 80 : testAnim === 'walk' ? 120 : 300;
    const interval = setInterval(() => {
      setAnimFrame((prev) => (prev + 1) % (testAnim === 'idle' ? 2 : 8));
      if (testAnim === 'walk' || testAnim === 'run') {
        soundManager.playStep(testAnim === 'run');
      }
    }, intervalMs);
    return () => clearInterval(interval);
  }, [testAnim]);

  const handleGenderSelect = (gender: 'M' | 'F' | 'NELO') => {
    soundManager.playClick();
    const updated = { ...stats, selectedGender: gender };
    savePlayerStats(updated);
    onUpdateStats(updated);
  };

  const handleShirtSelect = (index: number) => {
    soundManager.playClick();
    const updated = { ...stats, selectedShirt: index };
    savePlayerStats(updated);
    onUpdateStats(updated);
  };

  const handlePantsSelect = (index: number) => {
    soundManager.playClick();
    const updated = { ...stats, selectedPants: index };
    savePlayerStats(updated);
    onUpdateStats(updated);
  };

  const isNelo = stats.selectedGender === 'NELO';
  const genderPrefix = stats.selectedGender === 'F' ? 'player_female' : 'player_male';
  const previewFrameKey = isNelo
    ? testAnim === 'idle'
      ? 'player_front_idle_0'
      : testAnim === 'call'
      ? 'player_front_run_0'
      : `player_front_run_${animFrame % 2}`
    : testAnim === 'idle'
    ? `${genderPrefix}_idle_${animFrame % 2}`
    : testAnim === 'call'
    ? `${genderPrefix}_walk_2`
    : `${genderPrefix}_${testAnim}_${animFrame}`;

  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white sticker-border hard-shadow-lg p-5 md:p-6 rounded-3xl max-w-md w-full flex flex-col items-center max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center w-full mb-3">
          <h2 className="font-anybody font-black text-2xl text-[#161c28] uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-[#705d00]">checkroom</span>
            PERSONALIZAÇÃO
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

        {/* Live Character Animation Preview Stage */}
        <div className="w-full bg-[#f8fafc] border-2 border-[#161c28] rounded-2xl p-4 flex flex-col items-center mb-4 hard-shadow-sm relative overflow-hidden">
          <div className="w-24 h-28 flex items-center justify-center relative">
            {/* Ground Shadow */}
            <div className="w-16 h-3 bg-black/20 rounded-full absolute bottom-1" />
            <SpriteIcon name={previewFrameKey} className="w-20 h-28 relative z-10" />
          </div>

          <div className="text-center font-space font-bold text-xs text-[#161c28] uppercase my-1">
            TESTAR ANIMAÇÃO:
          </div>

          <div className="flex gap-1.5 justify-center w-full">
            <button
              onClick={() => {
                soundManager.playClick();
                setTestAnim('idle');
              }}
              className={`px-3 py-1 rounded-xl border border-[#161c28] font-space font-bold text-[11px] uppercase ${
                testAnim === 'idle' ? 'bg-[#ffd700]' : 'bg-white'
              }`}
            >
              Parado
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setTestAnim('walk');
              }}
              className={`px-3 py-1 rounded-xl border border-[#161c28] font-space font-bold text-[11px] uppercase ${
                testAnim === 'walk' ? 'bg-[#ffd700]' : 'bg-white'
              }`}
            >
              Andar
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setTestAnim('run');
              }}
              className={`px-3 py-1 rounded-xl border border-[#161c28] font-space font-bold text-[11px] uppercase ${
                testAnim === 'run' ? 'bg-[#fe6b00] text-white' : 'bg-white'
              }`}
            >
              Correr
            </button>
            <button
              onClick={() => {
                soundManager.playCall();
                setTestAnim('call');
              }}
              className={`px-3 py-1 rounded-xl border border-[#161c28] font-space font-bold text-[11px] uppercase ${
                testAnim === 'call' ? 'bg-[#006399] text-white' : 'bg-white'
              }`}
            >
              Gritar
            </button>
          </div>
        </div>

        {/* Gender / Character Selection */}
        <div className="w-full mb-3">
          <span className="font-space font-bold text-xs text-slate-600 block mb-1.5 uppercase">
            Personagem:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleGenderSelect('M')}
              className={`py-2 px-2 rounded-xl border-2 border-[#161c28] font-space font-bold text-[11px] flex flex-col items-center justify-center gap-1 ${
                stats.selectedGender === 'M' ? 'bg-[#ffd700] hard-shadow-sm' : 'bg-slate-100'
              }`}
            >
              <SpriteIcon name="player_male_idle_0" className="w-7 h-9" />
              <span>LOTADOR</span>
            </button>
            <button
              onClick={() => handleGenderSelect('F')}
              className={`py-2 px-2 rounded-xl border-2 border-[#161c28] font-space font-bold text-[11px] flex flex-col items-center justify-center gap-1 ${
                stats.selectedGender === 'F' ? 'bg-[#ffd700] hard-shadow-sm' : 'bg-slate-100'
              }`}
            >
              <SpriteIcon name="player_female_idle_0" className="w-7 h-9" />
              <span>LOTADORA</span>
            </button>
            <button
              onClick={() => handleGenderSelect('NELO')}
              className={`py-2 px-2 rounded-xl border-2 border-[#161c28] font-space font-bold text-[11px] flex flex-col items-center justify-center gap-1 ${
                stats.selectedGender === 'NELO' ? 'bg-[#ffd700] hard-shadow-sm' : 'bg-slate-100'
              }`}
            >
              <SpriteIcon name="player_front_idle_0" className="w-7 h-9" />
              <span>NELO</span>
            </button>
          </div>
        </div>

        {/* Shirt Color Selection */}
        <div className="w-full mb-3">
          <span className="font-space font-bold text-xs text-slate-600 block mb-1.5 uppercase">
            Cor da Camisola:
          </span>
          <div className="flex gap-2 justify-between">
            {shirtColors.map((color, idx) => (
              <button
                key={color}
                onClick={() => handleShirtSelect(idx)}
                className={`w-9 h-9 rounded-full border-2 border-[#161c28] transition-transform ${
                  stats.selectedShirt === idx ? 'scale-110 ring-4 ring-[#fe6b00]' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Pants Color Selection */}
        <div className="w-full mb-5">
          <span className="font-space font-bold text-xs text-slate-600 block mb-1.5 uppercase">
            Cor das Calças:
          </span>
          <div className="flex gap-2 justify-between">
            {pantsColors.map((color, idx) => (
              <button
                key={color}
                onClick={() => handlePantsSelect(idx)}
                className={`w-9 h-9 rounded-full border-2 border-[#161c28] transition-transform ${
                  stats.selectedPants === idx ? 'scale-110 ring-4 ring-[#fe6b00]' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="w-full bg-[#ffd700] hover:bg-[#ffe16d] text-[#161c28] font-anybody font-black py-3 rounded-2xl sticker-border hard-shadow btn-press uppercase"
        >
          GUARDAR VISUAL
        </button>
      </div>
    </div>
  );
};
