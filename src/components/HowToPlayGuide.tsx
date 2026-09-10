/**
 * LOTADOR - Animated How to Play & Controls Guide for New Players
 * Features animated visual demonstrations of movement, calling mechanics, disputes, and boarding.
 */

import React, { useState } from 'react';
import { soundManager } from '../utils/audio';
import { SpriteIcon } from './SpriteIcon';

interface HowToPlayGuideProps {
  onClose: () => void;
  onStartGame?: () => void;
}

export const HowToPlayGuide: React.FC<HowToPlayGuideProps> = ({ onClose, onStartGame }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTestCalling, setIsTestCalling] = useState(false);
  const [testSpeech, setTestSpeech] = useState('VIANA! VIANA DIRETO!');
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);

  const steps = [
    {
      id: 'call',
      title: 'Como Chamar Passageiros',
      badge: 'MECÂNICA PRINCIPAL',
      badgeColor: '#fe6b00',
      icon: 'effect_megaphone',
    },
    {
      id: 'controls',
      title: 'Controlos & Movimento',
      badge: 'PC & TELEMÓVEL',
      badgeColor: '#006399',
      icon: 'ui_play',
    },
    {
      id: 'dispute',
      title: 'Disputa de Passageiros ("É Meu!")',
      badge: 'CONFRONTO RIVAL',
      badgeColor: '#ba1a1a',
      icon: 'npc_kito',
    },
    {
      id: 'board',
      title: 'Embarcar no Candongueiro',
      badge: 'LOTAÇÃO & BÓNUS',
      badgeColor: '#705d00',
      icon: 'taxi_blue_white_side',
    },
    {
      id: 'obstacles',
      title: 'Obstáculos de Luanda',
      badge: 'ZUNGUEIRAS & FISCAL',
      badgeColor: '#e65100',
      icon: 'obstacle_zungueira',
    },
  ];

  const handleTestCall = () => {
    soundManager.playCall();
    soundManager.vibrate(60);
    setIsTestCalling(true);

    const phrases = [
      'VIANA! VIANA DIRETO!',
      'BENFICA JÁ VAI!',
      'TALATONA! SÓ FALTA UM!',
      'VAMOS SUBIR! CARRO CHEIO!',
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    setTestSpeech(phrase);
    soundManager.speakPhrase(phrase.split('!')[0]);

    setTestSuccessMessage('+1 Passageiro Atraído! 📢');

    setTimeout(() => {
      setIsTestCalling(false);
    }, 900);

    setTimeout(() => {
      setTestSuccessMessage(null);
    }, 2200);
  };

  const nextStep = () => {
    soundManager.playClick();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    soundManager.playClick();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 select-none overflow-y-auto">
      <div className="bg-white sticker-border hard-shadow-lg rounded-3xl max-w-xl w-full flex flex-col relative overflow-hidden my-auto max-h-[95vh]">
        {/* Top Header */}
        <div className="bg-[#ffd700] px-4 md:px-6 py-3.5 border-b-3 border-[#161c28] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white sticker-border hard-shadow-sm flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-[#161c28]">school</span>
            </div>
            <div>
              <h2 className="font-anybody font-black text-lg md:text-xl text-[#161c28] uppercase tracking-wide leading-tight">
                GUIA DO LOTADOR
              </h2>
              <p className="font-space text-xs text-[#705e00] font-bold">
                Passo {currentStep + 1} de {steps.length} • {steps[currentStep].title}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white sticker-border hard-shadow-sm flex items-center justify-center text-[#161c28] hover:bg-slate-100 btn-press cursor-pointer"
            aria-label="Fechar Guia"
          >
            <span className="material-symbols-outlined text-xl font-black">close</span>
          </button>
        </div>

        {/* Interactive Step Navigation Tabs */}
        <div className="flex items-center justify-between gap-1.5 px-4 pt-3 pb-1 border-b border-slate-200 bg-[#f9f9ff] overflow-x-auto">
          {steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => {
                soundManager.playClick();
                setCurrentStep(idx);
              }}
              className={`flex-1 min-w-[55px] py-1.5 px-2 rounded-xl text-center font-space font-bold text-[11px] transition-all cursor-pointer ${
                currentStep === idx
                  ? 'bg-[#161c28] text-[#ffd700] hard-shadow-sm scale-102'
                  : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <span>{idx + 1}.</span>
                <span className="hidden sm:inline truncate">{step.title.split(' ')[0]}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Modal Body Container with Step Content */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* STEP 1: COMO CHAMAR PASSAGEIROS */}
          {currentStep === 0 && (
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <span
                  className="text-white font-space font-black text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: steps[0].badgeColor }}
                >
                  {steps[0].badge}
                </span>
                <span className="font-space text-xs font-bold text-slate-500">
                  Tecla [E] ou Botão CHAMA
                </span>
              </div>

              {/* Animated Mini Stage: Shouting Demonstration */}
              <div className="relative h-44 md:h-48 w-full bg-gradient-to-b from-[#e8ecff] to-[#d6dcfa] rounded-2xl sticker-border hard-shadow overflow-hidden flex items-end justify-between px-6 pb-4">
                {/* Sidewalk & Road markings */}
                <div className="absolute inset-x-0 bottom-0 h-10 bg-[#3a4454] border-t-2 border-[#161c28]">
                  <div className="w-full h-1 border-t-2 border-dashed border-[#ffd700] mt-4 opacity-75" />
                </div>

                {/* Concentric Sound Waves from Lotador */}
                <div className="absolute left-16 bottom-8 pointer-events-none flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-[#fe6b00] sound-wave-anim" />
                  <div className="w-16 h-16 rounded-full border-2 border-[#ffd700] sound-wave-anim-delayed" />
                  {isTestCalling && (
                    <div className="absolute w-24 h-24 rounded-full border-4 border-[#ffd700] animate-ping" />
                  )}
                </div>

                {/* Animated Speech Bubble */}
                <div className="absolute left-10 bottom-24 bg-white sticker-border hard-shadow-sm px-3 py-1.5 rounded-2xl shout-anim z-20 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#fe6b00] text-sm animate-spin">campaign</span>
                  <span className="font-anybody font-black text-xs md:text-sm text-[#161c28]">
                    "{testSpeech}"
                  </span>
                </div>

                {/* Floating feedback text */}
                {testSuccessMessage && (
                  <div className="absolute top-3 right-6 bg-[#ffd700] text-[#161c28] font-space font-black text-xs px-3 py-1 rounded-full sticker-border hard-shadow animate-bounce z-30">
                    {testSuccessMessage}
                  </div>
                )}

                {/* Lotador Character Sprite */}
                <div className="relative z-10 flex flex-col items-center walk-anim">
                  <SpriteIcon name="player_front_stand" className="w-16 h-24 filter drop-shadow-md" />
                  <span className="bg-[#ffd700] text-[#161c28] text-[9px] font-black font-space px-2 py-0.5 rounded-full border border-[#161c28] -mt-1">
                    TU (LOTADOR)
                  </span>
                </div>

                {/* Animated Sound Ripple Icons */}
                <div className="relative z-10 flex flex-col items-center gap-1 pb-6">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#fe6b00] animate-pulse" />
                    <span className="w-2 h-2 rounded-full bg-[#ffd700] animate-pulse delay-100" />
                    <span className="w-2 h-2 rounded-full bg-[#006399] animate-pulse delay-200" />
                  </div>
                  <span className="text-[10px] font-black font-space text-slate-600 uppercase">
                    RAIO DE VOZ
                  </span>
                </div>

                {/* Approaching Passenger Sprite */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative">
                    <SpriteIcon name="passenger_man_idle" className="w-14 h-22 filter drop-shadow-md" />
                    <div className="absolute -top-3 right-0 bg-[#006399] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black border border-white animate-bounce">
                      ✓
                    </div>
                  </div>
                  <span className="bg-white text-slate-800 text-[9px] font-bold font-space px-2 py-0.5 rounded-full border border-slate-400 -mt-1">
                    PASSAGEIRO
                  </span>
                </div>
              </div>

              {/* Interactive Test Button */}
              <button
                onClick={handleTestCall}
                className="w-full py-2.5 bg-[#ffd700] hover:bg-[#ffe16d] text-[#161c28] font-anybody font-black text-sm rounded-2xl sticker-border hard-shadow btn-press flex items-center justify-center gap-2 cursor-pointer transition-transform"
              >
                <span className="material-symbols-outlined text-xl text-[#fe6b00]">volume_up</span>
                <span>EXPERIMENTAR GRITO DE CHAMADA 📢</span>
              </button>

              {/* Bullet Explanations */}
              <div className="bg-[#f1f3ff] p-3.5 rounded-2xl border-2 border-slate-200 flex flex-col gap-2 font-work text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#ffd700] text-[#161c28] font-black flex items-center justify-center shrink-0 text-xs border border-[#161c28]">
                    1
                  </span>
                  <p>
                    <strong>Aproxima-te dos clientes:</strong> Anda até perto das pessoas que estão paradas à espera na paragem de táxis.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#fe6b00] text-white font-black flex items-center justify-center shrink-0 text-xs border border-[#161c28]">
                    2
                  </span>
                  <p>
                    <strong>Pressiona [E] ou o botão CHAMA 📢:</strong> O teu grito ecoa pela paragem. Os passageiros que querem a rota dos candongueiros estacionados passam a seguir-te!
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#006399] text-white font-black flex items-center justify-center shrink-0 text-xs border border-[#161c28]">
                    3
                  </span>
                  <p>
                    <strong>Evolui a tua voz:</strong> No menu de <em>Upgrades</em>, aumenta o alcance da voz e compra o megafone para atrair grupos inteiros de longe!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CONTROLOS & MOVIMENTO */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <span
                  className="text-white font-space font-black text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: steps[1].badgeColor }}
                >
                  {steps[1].badge}
                </span>
                <span className="font-space text-xs font-bold text-slate-500">
                  Totalmente compatível com Teclado e Touch
                </span>
              </div>

              {/* Controls Interactive Showcase */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Desktop Keyboard Controls */}
                <div className="bg-[#f9f9ff] p-3.5 rounded-2xl border-2 border-slate-300 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#006399]">keyboard</span>
                    <h4 className="font-space font-black text-xs text-[#161c28] uppercase">
                      Teclado (PC / Portátil)
                    </h4>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 my-1">
                    {/* WASD Layout */}
                    <div className="flex justify-center">
                      <kbd className="w-9 h-9 bg-white sticker-border hard-shadow-sm rounded-lg flex items-center justify-center font-space font-black text-sm text-[#161c28] key-press-anim">
                        W
                      </kbd>
                    </div>
                    <div className="flex gap-1.5">
                      <kbd className="w-9 h-9 bg-white sticker-border hard-shadow-sm rounded-lg flex items-center justify-center font-space font-black text-sm text-[#161c28]">
                        A
                      </kbd>
                      <kbd className="w-9 h-9 bg-white sticker-border hard-shadow-sm rounded-lg flex items-center justify-center font-space font-black text-sm text-[#161c28]">
                        S
                      </kbd>
                      <kbd className="w-9 h-9 bg-white sticker-border hard-shadow-sm rounded-lg flex items-center justify-center font-space font-black text-sm text-[#161c28]">
                        D
                      </kbd>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 font-space mt-1">
                      Mover o Lotador
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs font-work">
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-slate-200">
                      <span className="text-slate-600 font-bold">Chamar Clientes:</span>
                      <kbd className="bg-[#ffd700] text-[#161c28] font-space font-black px-2 py-0.5 rounded border border-[#161c28]">
                        [E]
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-slate-200">
                      <span className="text-slate-600 font-bold">Embarcar no Táxi:</span>
                      <kbd className="bg-[#ffd700] text-[#161c28] font-space font-black px-2 py-0.5 rounded border border-[#161c28]">
                        [ESPAÇO]
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-slate-200">
                      <span className="text-slate-600 font-bold">Correr Rápido:</span>
                      <kbd className="bg-[#fe6b00] text-white font-space font-black px-2 py-0.5 rounded border border-[#161c28]">
                        [SHIFT]
                      </kbd>
                    </div>
                  </div>
                </div>

                {/* Mobile Touch Controls */}
                <div className="bg-[#f9f9ff] p-3.5 rounded-2xl border-2 border-slate-300 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#705d00]">smartphone</span>
                    <h4 className="font-space font-black text-xs text-[#161c28] uppercase">
                      Telemóvel & Ecrã Tátil
                    </h4>
                  </div>

                  <div className="flex items-center justify-around my-2">
                    {/* Joystick preview */}
                    <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-dashed border-[#161c28] flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-[#161c28] flex items-center justify-center text-white text-[9px] font-black animate-pulse">
                        STICK
                      </div>
                    </div>

                    {/* Action buttons preview */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-7 h-7 rounded-full bg-[#ffd700] sticker-border flex items-center justify-center text-[11px]">
                          📢
                        </div>
                        <span className="text-[10px] font-black font-space">CHAMA</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-7 h-7 rounded-full bg-[#006399] text-white sticker-border flex items-center justify-center text-[11px]">
                          🚪
                        </div>
                        <span className="text-[10px] font-black font-space">ENTRA</span>
                      </div>
                    </div>
                  </div>

                  {/* Stamina Meter info */}
                  <div className="bg-white p-2 rounded-xl border border-slate-200 flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-black font-space">
                      <span className="text-[#fe6b00]">ENERGIA / STAMINA</span>
                      <span className="text-emerald-600">100%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden border border-[#161c28]">
                      <div className="h-full bg-gradient-to-r from-[#ffd700] to-emerald-500 w-full" />
                    </div>
                    <p className="text-[10px] text-slate-500 font-work leading-tight">
                      Correr consome energia. Ao andar normal ou parar, a barra recarrega sozinha!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: DISPUTA DE PASSAGEIROS */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <span
                  className="text-white font-space font-black text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: steps[2].badgeColor }}
                >
                  {steps[2].badge}
                </span>
                <span className="font-space text-xs font-bold text-slate-500">
                  Rival Kito & Manuel da Paragem
                </span>
              </div>

              {/* Animated Dispute Confrontation Box */}
              <div className="bg-gradient-to-r from-[#ffe4e4] via-white to-[#fff8d4] p-4 rounded-2xl sticker-border hard-shadow flex flex-col items-center gap-2.5">
                <div className="flex items-center justify-between w-full">
                  {/* Rival NPC */}
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-[#ba1a1a] flex items-center justify-center text-white sticker-border hard-shadow-sm font-black text-sm">
                      KITO
                    </div>
                    <div>
                      <span className="font-space font-black text-xs text-[#ba1a1a]">Rival</span>
                      <p className="text-[10px] text-slate-600 font-bold italic">"É MEU! Já vi primeiro!"</p>
                    </div>
                  </div>

                  <span className="text-xl font-black font-anybody text-[#161c28]">VS</span>

                  {/* Player */}
                  <div className="flex items-center gap-2 flex-row-reverse text-right">
                    <div className="w-12 h-12 rounded-2xl bg-[#ffd700] flex items-center justify-center text-[#161c28] sticker-border hard-shadow-sm font-black text-sm">
                      TU
                    </div>
                    <div>
                      <span className="font-space font-black text-xs text-[#705e00]">Lotador</span>
                      <p className="text-[10px] text-slate-600 font-bold italic">"Aqui é Viana Direto!"</p>
                    </div>
                  </div>
                </div>

                {/* Persuasion Tug-of-war Bar */}
                <div className="w-full flex flex-col gap-1 mt-1">
                  <div className="flex justify-between text-[11px] font-black font-space">
                    <span className="text-[#ba1a1a]">RIVAL</span>
                    <span className="text-[#705e00]">TU (65%)</span>
                  </div>
                  <div className="w-full h-5 bg-slate-200 border-2 border-[#161c28] rounded-full overflow-hidden relative">
                    <div className="h-full bg-gradient-to-r from-[#ba1a1a] via-[#fe6b00] to-[#ffd700] w-[65%]" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-[9px] font-black tracking-wider text-[#161c28] uppercase">
                        CARREGA RÁPIDO NO [E] / [CHAMA!]
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-[#fff4eb] p-3.5 rounded-2xl border-2 border-[#fe6b00] flex flex-col gap-2 font-work text-xs text-slate-800">
                <p>
                  <strong>Como vencer a disputa:</strong> Quando tu e um rival tentam o mesmo cliente, ativa-se o minijogo! Pressiona repetidamente na tecla <strong>[E]</strong> ou no botão <strong>CHAMA</strong> o mais rápido possível para puxar a barra até aos 100%.
                </p>
                <div className="flex items-center gap-2 font-space font-bold text-xs text-[#705e00] bg-white p-2 rounded-xl border border-amber-300">
                  <span>🏆</span>
                  <span>Vitória: Ganhas o passageiro + Bónus de +150 Kz e +50 XP!</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: EMBARCAR NO CANDONGUEIRO */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <span
                  className="text-white font-space font-black text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: steps[3].badgeColor }}
                >
                  {steps[3].badge}
                </span>
                <span className="font-space text-xs font-bold text-slate-500">
                  Capacidade de 12 Lugares por Carrinha
                </span>
              </div>

              {/* Candongueiro Graphic Showcase */}
              <div className="bg-gradient-to-b from-[#e3f2fd] to-[#bbdefb] p-4 rounded-2xl sticker-border hard-shadow flex flex-col items-center gap-3">
                <div className="flex items-center justify-between w-full">
                  <div className="bg-[#006399] text-white px-3 py-1 rounded-full font-space font-black text-xs border border-white">
                    DESTINO: VIANA
                  </div>
                  <div className="bg-[#ffd700] text-[#161c28] px-3 py-1 rounded-full font-space font-black text-xs border border-[#161c28] animate-pulse">
                    11 / 12 PASSAGEIROS
                  </div>
                </div>

                <div className="py-2">
                  <SpriteIcon name="taxi_blue_white_side" className="w-48 h-28 filter drop-shadow-lg" />
                </div>

                <span className="text-xs font-bold font-space text-[#006399]">
                  HIACE AZUL E BRANCO • O CLÁSSICO DE LUANDA
                </span>
              </div>

              {/* Instructions */}
              <div className="bg-[#f1f3ff] p-3.5 rounded-2xl border-2 border-slate-300 flex flex-col gap-2 font-work text-xs text-slate-700">
                <p>
                  <strong>Correspondência de Rota:</strong> Cada carrinha tem uma tabuleta com o destino (ex: <em>Viana, Talatona, Centro</em>). Certifica-te de levar passageiros com a rota certa!
                </p>
                <p>
                  <strong>Grande Lotação (12/12):</strong> Quando colocas o 12º passageiro, a carrinha fica cheia, buzina e arranca com fumo de escape! Recebes um <strong>Grande Prémio em Kwanzas</strong> e ativas o teu <strong>Combo Multiplicador x2 / x3</strong>!
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: OBSTÁCULOS DE LUANDA */}
          {currentStep === 4 && (
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <span
                  className="text-white font-space font-black text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: steps[4].badgeColor }}
                >
                  {steps[4].badge}
                </span>
                <span className="font-space text-xs font-bold text-slate-500">
                  Atenção aos Perigos da Rua!
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Zungueiras */}
                <div className="bg-[#fff8f0] p-3.5 rounded-2xl border-2 border-[#e65100] flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🥭</span>
                    <div>
                      <h4 className="font-space font-black text-xs text-[#e65100] uppercase">
                        Zungueiras & Ambulantes
                      </h4>
                      <p className="text-[10px] text-slate-500">Vendedoras de frutas e doces</p>
                    </div>
                  </div>
                  <p className="text-xs font-work text-slate-700 leading-relaxed">
                    Circulam pelos passeios com grandes bacias na cabeça. Se colidires com elas, <strong>tropeças</strong> e perdes velocidade temporariamente!
                  </p>
                  <div className="bg-white p-2 rounded-xl border border-amber-300 text-[10px] font-space italic text-[#e65100]">
                    "Eish! Cuidado com a bacia, moço!"
                  </div>
                </div>

                {/* Fiscal da Paragem */}
                <div className="bg-[#fde8e8] p-3.5 rounded-2xl border-2 border-[#ba1a1a] flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">👮</span>
                    <div>
                      <h4 className="font-space font-black text-xs text-[#ba1a1a] uppercase">
                        Fiscal da Paragem
                      </h4>
                      <p className="text-[10px] text-slate-500">Inspetor de trânsito fardado</p>
                    </div>
                  </div>
                  <p className="text-xs font-work text-slate-700 leading-relaxed">
                    Patrulha a via dos táxis. Se passares em <strong>corrida disparada</strong> colado a ele, ele <strong>apita</strong> e drena 25 pontos da tua stamina!
                  </p>
                  <div className="bg-white p-2 rounded-xl border border-red-300 text-[10px] font-space italic text-[#ba1a1a]">
                    "Calma na paragem! Muita pressa dá multa!"
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-300 flex items-center gap-2.5 font-work text-xs text-emerald-900">
                <span className="text-xl">✨</span>
                <span>
                  <strong>Dica de Mestre:</strong> Mantém-te atento ao fluxo da rua e planeia a tua rota entre os candongueiros para maximizar as gorjetas!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Footer with Navigation Buttons */}
        <div className="bg-slate-50 p-3.5 md:p-4 border-t-2 border-[#161c28] flex items-center justify-between gap-2.5">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-4 py-2.5 rounded-2xl font-space font-bold text-xs flex items-center gap-1.5 transition-all ${
              currentStep === 0
                ? 'opacity-40 cursor-not-allowed bg-slate-200 text-slate-500'
                : 'bg-white text-[#161c28] sticker-border hard-shadow-sm btn-press cursor-pointer hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>ANTERIOR</span>
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                onClick={() => {
                  soundManager.playClick();
                  setCurrentStep(i);
                }}
                className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${
                  currentStep === i ? 'bg-[#fe6b00] w-5' : 'bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={nextStep}
              className="px-5 py-2.5 rounded-2xl bg-[#ffd700] hover:bg-[#ffe16d] text-[#161c28] font-space font-black text-xs sticker-border hard-shadow-sm btn-press flex items-center gap-1.5 cursor-pointer"
            >
              <span>SEGUINTE</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={() => {
                soundManager.playClick();
                if (onStartGame) {
                  onStartGame();
                } else {
                  onClose();
                }
              }}
              className="px-5 py-2.5 rounded-2xl bg-[#ffd700] hover:bg-[#ffe16d] text-[#161c28] font-anybody font-black text-xs md:text-sm sticker-border hard-shadow-sm btn-press flex items-center gap-1.5 cursor-pointer animate-pulse"
            >
              <span>VAMOS JOGAR! ▶</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
