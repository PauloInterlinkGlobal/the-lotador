/**
 * Mentor NPC Mestre Zé Dialog Box
 */

import React from 'react';
import { soundManager } from '../utils/audio';
import { SpriteIcon } from './SpriteIcon';

interface MentorDialogProps {
  onClose: () => void;
}

export const MentorDialog: React.FC<MentorDialogProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white sticker-border hard-shadow-lg p-5 rounded-3xl max-w-sm w-full flex flex-col items-center text-center relative">
        {/* Avatar Graphic from Atlas */}
        <div className="w-20 h-20 bg-[#ffd700] rounded-full sticker-border hard-shadow flex items-center justify-center mb-3 -mt-10 border-4 border-[#161c28] overflow-hidden">
          <SpriteIcon name="npc_mestre_ze" className="w-14 h-16" />
        </div>

        <h3 className="font-anybody font-black text-xl text-[#161c28] uppercase mb-1">
          MESTRE ZÉ
        </h3>
        <span className="bg-[#fe6b00] text-white font-space font-bold text-[10px] uppercase px-3 py-0.5 rounded-full mb-3">
          MENTOR DA PARAGEM
        </span>

        <p className="font-work text-sm text-slate-700 leading-relaxed mb-5 bg-[#f1f3ff] p-3 rounded-2xl border border-slate-300">
          "Olá miúdo! Na paragem de Luanda quem não corre não come! Pressiona no botão{' '}
          <strong className="text-[#fe6b00]">CHAMA 📢</strong> para chamar passageiros com a mesma rota do Kandongueiro e leva-os até ao táxi. Cuidado com o Kito e o Manuel!"
        </p>

        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="w-full bg-[#ffd700] hover:bg-[#ffe16d] text-[#161c28] font-anybody font-black py-3 rounded-2xl sticker-border hard-shadow btn-press uppercase"
        >
          ENTENDI, MESTRE!
        </button>
      </div>
    </div>
  );
};
