/**
 * LOTADOR - Máquina de Estados do Tutorial Interativo
 * 
 * Sequência estrita de 6 estados:
 * 1. INTRO: Apresentação do papel do Lotador na paragem de Luanda (Jogo e Timer pausados)
 * 2. CHAMAR: Chamar o passageiro com o botão amarelo CHAMAR [E]
 * 3. EMBARCAR: Conduzir o passageiro até ao candongueiro azul (Táxi de Viana)
 * 4. CONDUZIR: Posicionar-se na porta do táxi e acionar LOTAR [Espaço]
 * 5. ENTREGAR: Confirmação de embarque e recolha de Kz/XP
 * 6. CONCLUIDO: Celebração com confetes, recompensa e início de jogo normal
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { GameEngine } from '../game/GameEngine';
import { soundManager } from '../utils/audio';
import { SpriteIcon } from './SpriteIcon';

export enum TutorialStep {
  INTRO = 'INTRO',
  CHAMAR = 'CHAMAR',
  EMBARCAR = 'EMBARCAR',
  CONDUZIR = 'CONDUZIR',
  ENTREGAR = 'ENTREGAR',
  CONCLUIDO = 'CONCLUIDO',
}

interface TutorialOverlayProps {
  engine: GameEngine | null;
  currentStep: TutorialStep;
  passengersServed: number;
  taxisLoaded: number;
  money: number;
  onStepChange: (nextStep: TutorialStep) => void;
  onCompleteTutorial: () => void;
  onSkipTutorial?: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  engine,
  currentStep,
  passengersServed,
  taxisLoaded: _taxisLoaded,
  money: _money,
  onStepChange,
  onCompleteTutorial,
  onSkipTutorial,
}) => {
  // Posições 3D projetadas na tela para os indicadores visuais
  const [passengerMarker, setPassengerMarker] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });
  const [taxiMarker, setTaxiMarker] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });

  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  const hasTriggeredVictoryRef = useRef(false);

  // Som ao mudar de etapa e reset de minimização
  useEffect(() => {
    setIsMinimized(false);
    if (currentStep === TutorialStep.INTRO) {
      setFeedbackToast(null);
      hasTriggeredVictoryRef.current = false;
      soundManager.playLevelUp();
    } else if (currentStep === TutorialStep.CONCLUIDO) {
      soundManager.playTaxiFull();
    } else {
      soundManager.playClick();
    }
  }, [currentStep]);

  // Mensagem temporária com som de moeda
  const showFeedback = useCallback((text: string) => {
    setFeedbackToast(text);
    soundManager.playCoin();
    soundManager.vibrate(40);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 2400);
  }, []);

  // Projeção contínua dos marcadores 3D no ecrã
  useEffect(() => {
    if (!engine) return;

    const updatePointers = () => {
      // 1. Marcador do Passageiro de Viana (Ativo em CHAMAR)
      const targetPassenger =
        engine.passengers.find((p) => p.id === engine.tutorialPassengerId) ||
        engine.passengers.find((p) => p.destination === 'VIANA');

      const shouldShowPassenger = targetPassenger && currentStep === TutorialStep.CHAMAR;

      if (shouldShowPassenger && targetPassenger) {
        const pScreen = engine.toScreenPosition(targetPassenger.position);
        setPassengerMarker(pScreen);
      } else {
        setPassengerMarker((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      }

      // 2. Marcador do Candongueiro de Viana (Ativo em EMBARCAR e CONDUZIR)
      const targetTaxi = engine.taxis.find(
        (t) => t.route === 'VIANA' && (t.state === 'WAITING' || t.state === 'LOADING')
      );

      const shouldShowTaxi =
        targetTaxi && (currentStep === TutorialStep.EMBARCAR || currentStep === TutorialStep.CONDUZIR);

      if (shouldShowTaxi && targetTaxi) {
        const tScreen = engine.toScreenPosition(targetTaxi.position);
        setTaxiMarker(tScreen);
      } else {
        setTaxiMarker((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      }

      animFrameRef.current = requestAnimationFrame(updatePointers);
    };

    animFrameRef.current = requestAnimationFrame(updatePointers);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [engine, currentStep]);

  // Observador contínuo de estado para transições automáticas resilientes
  useEffect(() => {
    if (!engine) return;

    const interval = setInterval(() => {
      // Se em CHAMAR e o passageiro já começou a seguir o jogador:
      if (currentStep === TutorialStep.CHAMAR) {
        const hasFollower = engine.passengers.some(
          (p) => p.followedBy === 'PLAYER' && p.state === 'FOLLOWING'
        );
        if (hasFollower) {
          showFeedback('Passageiro a seguir-te! Leva-o ao táxi.');
          onStepChange(TutorialStep.EMBARCAR);
        }
      }

      // Se em EMBARCAR e o jogador aproxima-se do táxi de Viana (<= 4.8m):
      if (currentStep === TutorialStep.EMBARCAR) {
        if (passengersServed >= 1) {
          onStepChange(TutorialStep.ENTREGAR);
          return;
        }

        const targetTaxi = engine.taxis.find(
          (t) => t.route === 'VIANA' && (t.state === 'WAITING' || t.state === 'LOADING')
        );

        if (targetTaxi) {
          const dist = Math.hypot(
            engine.playerPos.x - targetTaxi.position.x,
            engine.playerPos.z - targetTaxi.position.z
          );
          if (dist <= 4.8) {
            showFeedback('Chegaste à carrinha! Toca em LOTAR!');
            onStepChange(TutorialStep.CONDUZIR);
          }
        }
      }

      // Se em CONDUZIR e o passageiro embarcou:
      if (currentStep === TutorialStep.CONDUZIR) {
        if (passengersServed >= 1) {
          showFeedback('Embarque concluído! +150 Kz!');
          onStepChange(TutorialStep.ENTREGAR);
        }
      }
    }, 120);

    return () => clearInterval(interval);
  }, [engine, currentStep, passengersServed, onStepChange, showFeedback]);

  // Efeito comemorativo ao atingir CONCLUIDO
  useEffect(() => {
    if (currentStep === TutorialStep.CONCLUIDO && !hasTriggeredVictoryRef.current) {
      hasTriggeredVictoryRef.current = true;
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ffd700', '#fe6b00', '#006399', '#ffffff'],
      });
    }
  }, [currentStep]);

  // Transição suave automática de ENTREGAR para CONCLUIDO
  useEffect(() => {
    if (currentStep === TutorialStep.ENTREGAR) {
      const timer = setTimeout(() => {
        onStepChange(TutorialStep.CONCLUIDO);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, onStepChange]);

  return (
    <div className="absolute inset-0 pointer-events-none z-50 select-none overflow-hidden font-work">
      {/* ─────────────────────────────────────────────────────────────
          MARCADORES 3D PROJETADOS NO ECRÃ
          ───────────────────────────────────────────────────────────── */}

      {/* Marcador do Passageiro Alvo */}
      {passengerMarker.visible && (
        <div
          className="absolute -translate-x-1/2 -translate-y-full transition-transform duration-75 flex flex-col items-center pointer-events-none z-30"
          style={{ left: `${passengerMarker.x}px`, top: `${passengerMarker.y - 12}px` }}
        >
          <div className="bg-[#161c28] border-2 border-[#ffd700] text-white px-2.5 py-1 rounded-full text-[11px] font-space font-bold shadow-xl flex items-center gap-1.5 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-[#ffd700] animate-ping inline-block" />
            <span>PASSAGEIRO VIANA 📢</span>
          </div>
          <div className="w-0 h-0 border-x-6 border-x-transparent border-t-8 border-t-[#ffd700] mt-0.5" />
        </div>
      )}

      {/* Marcador do Candongueiro Alvo */}
      {taxiMarker.visible && (
        <div
          className="absolute -translate-x-1/2 -translate-y-full transition-transform duration-75 flex flex-col items-center pointer-events-none z-30"
          style={{ left: `${taxiMarker.x}px`, top: `${taxiMarker.y - 12}px` }}
        >
          <div className="bg-[#006399] border-2 border-white text-white px-3 py-1 rounded-full text-[11px] font-space font-bold shadow-xl flex items-center gap-1.5 animate-bounce">
            <SpriteIcon name="taxi_candongueiro_drive_0" className="w-4 h-3 object-contain" />
            <span>CANDONGUEIRO VIANA 🚐</span>
          </div>
          <div className="w-0 h-0 border-x-6 border-x-transparent border-t-8 border-t-[#006399] mt-0.5" />
        </div>
      )}

      {/* Toast de Confirmação Rápida */}
      {feedbackToast && (
        <div className="absolute top-[16vh] left-1/2 -translate-x-1/2 bg-[#ffd700] text-[#161c28] border-2 border-[#161c28] font-anybody font-black text-xs md:text-sm uppercase px-5 py-2 rounded-2xl shadow-xl animate-bounce pointer-events-none flex items-center gap-2 z-50">
          <span>✨</span>
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. ETAPA INTRO: MODAL INICIAL (Pausa do jogo e timer)
          ───────────────────────────────────────────────────────────── */}
      {currentStep === TutorialStep.INTRO && (
        <div className="absolute inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 pointer-events-auto z-50">
          <div className="bg-[#161c28] border-2 border-[#ffd700] rounded-3xl p-5 md:p-6 shadow-2xl max-w-sm w-full text-center flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
            {/* Badge de cabeçalho */}
            <div className="flex items-center gap-2">
              <span className="bg-[#ffd700] text-[#161c28] font-space font-black text-[10px] uppercase px-3 py-1 rounded-full border border-[#161c28] tracking-wider">
                TUTORIAL • INICIAÇÃO (VIANA)
              </span>
            </div>

            {/* Ícone */}
            <div className="w-16 h-16 rounded-2xl bg-[#ffd700] border-2 border-[#161c28] flex items-center justify-center shadow-lg">
              <SpriteIcon name="logo_lotador" className="w-12 h-12 object-contain" />
            </div>

            {/* Mensagem e Papel */}
            <div>
              <h3 className="font-anybody font-black text-lg md:text-xl text-white uppercase tracking-wide">
                BEM-VINDO AO LOTADOR!
              </h3>
              <p className="font-work text-xs md:text-sm text-slate-200 mt-1 leading-relaxed">
                Na paragem de Luanda, o teu trabalho é <strong className="text-[#ffd700]">chamar os passageiros</strong>, organizar o embarque rápido e lotar os candongueiros antes dos rivais!
              </p>
            </div>

            {/* Botão COMEÇAR TUTORIAL */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                soundManager.playClick();
                if (engine) {
                  engine.isPaused = false;
                }
                onStepChange(TutorialStep.CHAMAR);
              }}
              className="w-full py-3.5 bg-[#ffd700] hover:bg-[#ffe16d] text-[#161c28] font-anybody font-black text-sm uppercase rounded-2xl sticker-border hard-shadow btn-press cursor-pointer flex items-center justify-center gap-2 shadow-lg mt-1 touch-manipulation"
            >
              <span>COMEÇAR TUTORIAL</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>

            {/* Botão Saltar Tutorial */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                soundManager.playClick();
                if (onSkipTutorial) {
                  onSkipTutorial();
                } else {
                  onCompleteTutorial();
                }
              }}
              className="text-xs font-space font-semibold text-slate-400 hover:text-white underline cursor-pointer mt-0.5 py-1 touch-manipulation"
            >
              Saltar Tutorial e Jogar
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ETAPAS 2 A 5: CARTÃO COMPACTO DE ORIENTAÇÃO (Canto Superior Direito)
          ───────────────────────────────────────────────────────────── */}
      {currentStep !== TutorialStep.INTRO && currentStep !== TutorialStep.CONCLUIDO && (
        <div className="absolute top-[clamp(48px,10vh,68px)] right-3 md:right-5 max-w-[310px] w-[86vw] sm:w-[300px] pointer-events-auto z-40">
          {isMinimized ? (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setIsMinimized(false);
              }}
              className="bg-[#161c28]/95 hover:bg-[#161c28] border-2 border-[#ffd700] text-white px-3 py-1.5 rounded-full shadow-lg text-[11px] font-space font-bold flex items-center gap-2 cursor-pointer ml-auto touch-manipulation"
            >
              <span className="w-2 h-2 rounded-full bg-[#ffd700] animate-ping" />
              <span>PASSO {getStepNumber(currentStep)}/4</span>
              <span className="text-[#ffd700] text-xs">▼</span>
            </button>
          ) : (
            <div className="bg-[#161c28]/95 backdrop-blur-md border-2 border-[#ffd700]/80 rounded-2xl p-3.5 shadow-2xl text-white flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="bg-[#ffd700] text-[#161c28] font-space font-extrabold text-[9px] uppercase px-2 py-0.5 rounded-md border border-[#161c28]">
                  TUTORIAL • PASSO {getStepNumber(currentStep)}/4
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      if (onSkipTutorial) {
                        onSkipTutorial();
                      } else {
                        onCompleteTutorial();
                      }
                    }}
                    className="text-slate-400 hover:text-white text-[10px] font-space underline px-1.5 py-0.5 cursor-pointer touch-manipulation"
                    title="Saltar Tutorial"
                  >
                    Saltar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setIsMinimized(true);
                    }}
                    className="text-white/60 hover:text-white text-xs px-1.5 py-0.5 rounded-md hover:bg-white/10 cursor-pointer touch-manipulation"
                    title="Minimizar dica"
                  >
                    −
                  </button>
                </div>
              </div>

              {/* 2. ETAPA CHAMAR */}
              {currentStep === TutorialStep.CHAMAR && (
                <div>
                  <h4 className="font-anybody font-black text-xs text-[#ffd700] uppercase flex items-center gap-1.5">
                    <span>📢</span>
                    <span>CHAMAR PASSAGEIRO</span>
                  </h4>
                  <p className="text-[11px] text-slate-200 font-work mt-1 leading-snug">
                    Aproxima-te do passageiro de Viana e clica no botão amarelo <strong className="text-[#ffd700]">CHAMAR [E]</strong> para ele te seguir!
                  </p>
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => onStepChange(TutorialStep.EMBARCAR)}
                      className="bg-white/10 hover:bg-white/20 text-[#ffd700] font-space font-bold text-[10px] uppercase px-2.5 py-1 rounded-lg border border-[#ffd700]/30 btn-press cursor-pointer touch-manipulation"
                    >
                      Avançar ➔
                    </button>
                  </div>
                </div>
              )}

              {/* 3. ETAPA EMBARCAR (Levar ao táxi) */}
              {currentStep === TutorialStep.EMBARCAR && (
                <div>
                  <h4 className="font-anybody font-black text-xs text-[#ffd700] uppercase flex items-center gap-1.5">
                    <span>🚐</span>
                    <span>LEVAR AO CANDONGUEIRO</span>
                  </h4>
                  <p className="text-[11px] text-slate-200 font-work mt-1 leading-snug">
                    O passageiro está a seguir-te! Caminha em direção ao candongueiro azul <strong className="text-[#ffd700]">TÁXI VIANA</strong>.
                  </p>
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => onStepChange(TutorialStep.CONDUZIR)}
                      className="bg-white/10 hover:bg-white/20 text-[#ffd700] font-space font-bold text-[10px] uppercase px-2.5 py-1 rounded-lg border border-[#ffd700]/30 btn-press cursor-pointer touch-manipulation"
                    >
                      Cheguei ➔
                    </button>
                  </div>
                </div>
              )}

              {/* 4. ETAPA CONDUZIR (Embarque) */}
              {currentStep === TutorialStep.CONDUZIR && (
                <div>
                  <h4 className="font-anybody font-black text-xs text-[#ffd700] uppercase flex items-center gap-1.5">
                    <span>🤝</span>
                    <span>LOTAR O TÁXI</span>
                  </h4>
                  <p className="text-[11px] text-slate-200 font-work mt-1 leading-snug">
                    Estás na porta da carrinha! O botão mudou para <strong className="text-[#fe6b00]">LOTAR! [Espaço]</strong>. Toca nele para embarcar o passageiro!
                  </p>
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => onStepChange(TutorialStep.ENTREGAR)}
                      className="bg-white/10 hover:bg-white/20 text-[#ffd700] font-space font-bold text-[10px] uppercase px-2.5 py-1 rounded-lg border border-[#ffd700]/30 btn-press cursor-pointer touch-manipulation"
                    >
                      Embarcar ➔
                    </button>
                  </div>
                </div>
              )}

              {/* 5. ETAPA ENTREGAR (Confirmação de pagamento) */}
              {currentStep === TutorialStep.ENTREGAR && (
                <div>
                  <h4 className="font-anybody font-black text-xs text-[#ffd700] uppercase flex items-center gap-1.5">
                    <span>💰</span>
                    <span>PAGAMENTO RECEBIDO!</span>
                  </h4>
                  <p className="text-[11px] text-slate-200 font-work mt-1 leading-snug">
                    Perfeito! O passageiro subiu na carrinha e recebeste <strong className="text-emerald-400">+150 Kz</strong> e <strong className="text-[#ffd700]">+15 XP</strong>!
                  </p>
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        onStepChange(TutorialStep.CONCLUIDO);
                      }}
                      className="bg-[#ffd700] hover:bg-[#ffe16d] text-[#161c28] font-space font-black text-[11px] uppercase px-3 py-1.5 rounded-lg border border-[#161c28] btn-press cursor-pointer touch-manipulation shadow-md flex items-center gap-1"
                    >
                      <span>CONCLUIR</span>
                      <span className="material-symbols-outlined text-sm">check</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. ETAPA CONCLUIDO: MODAL DE VITÓRIA E TRANSIÇÃO
          ───────────────────────────────────────────────────────────── */}
      {currentStep === TutorialStep.CONCLUIDO && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 pointer-events-auto z-50">
          <div className="bg-[#161c28] border-2 border-[#ffd700] rounded-3xl p-5 md:p-6 shadow-2xl max-w-sm w-full text-center flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
            {/* Header Badge */}
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500 text-white font-space font-black text-[10px] uppercase px-3 py-1 rounded-full border border-[#161c28] tracking-wider animate-pulse">
                🏆 TUTORIAL CONCLUÍDO COM SUCESSO!
              </span>
            </div>

            {/* Ícone */}
            <div className="w-16 h-16 rounded-2xl bg-[#ffd700] border-2 border-[#161c28] flex items-center justify-center shadow-lg">
              <span className="text-3xl">🚐</span>
            </div>

            {/* Mensagem e Recompensa */}
            <div>
              <h3 className="font-anybody font-black text-lg md:text-xl text-white uppercase tracking-wide">
                PARABÉNS, NOVO LOTADOR!
              </h3>
              <p className="font-work text-xs md:text-sm text-slate-200 mt-1 leading-relaxed">
                Já sabes a rotina: <strong className="text-[#ffd700]">Chamar</strong>, <strong className="text-[#ffd700]">Conduzir</strong> e <strong className="text-[#ffd700]">Lotar</strong>! Agora conclui os objetivos da fase antes do tempo esgotar!
              </p>
            </div>

            {/* Recompensa */}
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-2.5 flex items-center justify-around">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-space text-slate-400 uppercase">Bónus de Fase</span>
                <span className="font-space font-black text-sm text-[#ffd700]">+500 Kz</span>
              </div>
              <div className="w-px h-7 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-space text-slate-400 uppercase">Fase 2</span>
                <span className="font-space font-black text-sm text-emerald-400">DESBLOQUEADA</span>
              </div>
            </div>

            {/* Botão de Conclusão */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                soundManager.playClick();
                onCompleteTutorial();
              }}
              className="w-full py-3.5 bg-[#ffd700] hover:bg-[#ffe16d] text-[#161c28] font-anybody font-black text-sm uppercase rounded-2xl sticker-border hard-shadow btn-press cursor-pointer flex items-center justify-center gap-2 shadow-lg mt-1 touch-manipulation"
            >
              <span>JOGAR PARTIDA NORMAL</span>
              <span className="material-symbols-outlined text-lg">play_arrow</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function getStepNumber(step: TutorialStep): number {
  switch (step) {
    case TutorialStep.CHAMAR:
      return 1;
    case TutorialStep.EMBARCAR:
      return 2;
    case TutorialStep.CONDUZIR:
      return 3;
    case TutorialStep.ENTREGAR:
      return 4;
    default:
      return 1;
  }
}
