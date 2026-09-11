/**
 * LOTADOR - Interactive Tutorial Controller & Overlay
 * Guides the player step-by-step through Level 1 core mechanics using real gameplay systems.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameEngine } from '../game/GameEngine';
import { Passenger, Taxi } from '../types/game';
import { soundManager } from '../utils/audio';
import { SpriteIcon } from './SpriteIcon';

export enum TutorialStep {
  INTRO = 'INTRO',
  MOVE = 'MOVE',
  APPROACH_PASSENGER = 'APPROACH_PASSENGER',
  CALL_PASSENGER = 'CALL_PASSENGER',
  LEAD_TO_TAXI = 'LEAD_TO_TAXI',
  BOARD_TAXI = 'BOARD_TAXI',
  SCORE_MONEY = 'SCORE_MONEY',
  RUN_STAMINA = 'RUN_STAMINA',
  OBJECTIVES = 'OBJECTIVES',
  TIMER = 'TIMER',
  FREE_PLAY = 'FREE_PLAY',
}

interface TutorialOverlayProps {
  engine: GameEngine | null;
  currentStep: TutorialStep;
  passengersServed: number;
  taxisLoaded: number;
  money: number;
  onStepChange: (nextStep: TutorialStep) => void;
  onOpenObjectives: () => void;
  onCompleteTutorial: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  engine,
  currentStep,
  passengersServed,
  taxisLoaded,
  money,
  onStepChange,
  onOpenObjectives,
  onCompleteTutorial,
}) => {
  // 3D projected screen positions for dynamic markers
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
  const [staminaExplained, setStaminaExplained] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const animFrameRef = useRef<number | null>(null);

  // Trigger feedback with sound and haptic
  const showFeedback = useCallback((text: string) => {
    setFeedbackToast(text);
    soundManager.playCoin();
    soundManager.vibrate(40);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 2400);
  }, []);

  // Update in-world 3D pointer projections
  useEffect(() => {
    if (!engine) return;

    const updatePointers = () => {
      // Find tutorial passenger
      const targetPassenger =
        engine.passengers.find((p) => p.id === engine.tutorialPassengerId) ||
        engine.passengers.find((p) => p.destination === 'VIANA');

      if (targetPassenger && (currentStep === TutorialStep.APPROACH_PASSENGER || currentStep === TutorialStep.CALL_PASSENGER)) {
        const pScreen = engine.toScreenPosition(targetPassenger.position);
        setPassengerMarker(pScreen);
      } else {
        setPassengerMarker((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      }

      // Find VIANA taxi
      const targetTaxi = engine.taxis.find((t) => t.route === 'VIANA' && t.state === 'WAITING');
      if (targetTaxi && (currentStep === TutorialStep.LEAD_TO_TAXI || currentStep === TutorialStep.BOARD_TAXI)) {
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

  // Step 2: Check Distance to Passenger in APPROACH_PASSENGER
  useEffect(() => {
    if (!engine || currentStep !== TutorialStep.APPROACH_PASSENGER) return;

    const checkInterval = setInterval(() => {
      const targetPassenger =
        engine.passengers.find((p) => p.id === engine.tutorialPassengerId) ||
        engine.passengers.find((p) => p.destination === 'VIANA');

      if (targetPassenger) {
        const dist = Math.hypot(
          engine.playerPos.x - targetPassenger.position.x,
          engine.playerPos.z - targetPassenger.position.z
        );
        if (dist <= 4.0) {
          showFeedback('Perfeito! Estás perto do passageiro.');
          clearInterval(checkInterval);
          setTimeout(() => {
            onStepChange(TutorialStep.CALL_PASSENGER);
          }, 900);
        }
      }
    }, 150);

    return () => clearInterval(checkInterval);
  }, [engine, currentStep, onStepChange, showFeedback]);

  // Step 4: Check distance to Taxi with follower in LEAD_TO_TAXI
  useEffect(() => {
    if (!engine || currentStep !== TutorialStep.LEAD_TO_TAXI) return;

    const checkInterval = setInterval(() => {
      const hasFollower = engine.passengers.some(
        (p) => p.followedBy === 'PLAYER' && p.state === 'FOLLOWING'
      );
      const targetTaxi = engine.taxis.find((t) => t.route === 'VIANA' && t.state === 'WAITING');

      if (hasFollower && targetTaxi) {
        const dist = Math.hypot(
          engine.playerPos.x - targetTaxi.position.x,
          engine.playerPos.z - targetTaxi.position.z
        );
        if (dist <= 4.2) {
          showFeedback('Chegaste à paragem do táxi!');
          clearInterval(checkInterval);
          setTimeout(() => {
            onStepChange(TutorialStep.BOARD_TAXI);
          }, 900);
        }
      }
    }, 150);

    return () => clearInterval(checkInterval);
  }, [engine, currentStep, onStepChange, showFeedback]);

  // Check victory condition in FREE_PLAY
  useEffect(() => {
    if (currentStep === TutorialStep.FREE_PLAY) {
      // Level 1 tutorial objective: serve at least 2 passengers and load 1 taxi
      if (passengersServed >= 2 || taxisLoaded >= 1) {
        showFeedback('🏆 TODOS OS OBJETIVOS CUMPRIDOS!');
        setTimeout(() => {
          onCompleteTutorial();
        }, 1200);
      }
    }
  }, [currentStep, passengersServed, taxisLoaded, onCompleteTutorial, showFeedback]);

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden select-none">
      {/* ─────────────────────────────────────────────────────────────
          IN-WORLD 3D POINTER MARKERS (Screen projected)
          ───────────────────────────────────────────────────────────── */}

      {/* Target Passenger Marker */}
      {passengerMarker.visible && (
        <div
          className="absolute -translate-x-1/2 -translate-y-full transition-transform duration-75 flex flex-col items-center pointer-events-none"
          style={{ left: `${passengerMarker.x}px`, top: `${passengerMarker.y - 12}px` }}
        >
          <div className="bg-[#161c28] border-2 border-[#ffd700] text-white px-2.5 py-1 rounded-full text-[11px] font-space font-bold shadow-lg flex items-center gap-1.5 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-[#ffd700] animate-ping inline-block" />
            <span>PASSAGEIRO VIANA</span>
          </div>
          <div className="w-0 h-0 border-x-6 border-x-transparent border-t-8 border-t-[#ffd700] mt-0.5" />
        </div>
      )}

      {/* Target Taxi Marker */}
      {taxiMarker.visible && (
        <div
          className="absolute -translate-x-1/2 -translate-y-full transition-transform duration-75 flex flex-col items-center pointer-events-none"
          style={{ left: `${taxiMarker.x}px`, top: `${taxiMarker.y - 12}px` }}
        >
          <div className="bg-[#006399] border-2 border-white text-white px-3 py-1 rounded-full text-[11px] font-space font-bold shadow-lg flex items-center gap-1.5 animate-bounce">
            <SpriteIcon name="taxi_candongueiro_drive_0" className="w-4 h-3 object-contain" />
            <span>TÁXI VIANA</span>
          </div>
          <div className="w-0 h-0 border-x-6 border-x-transparent border-t-8 border-t-[#006399] mt-0.5" />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ACTION CONFIRMATION TOAST
          ───────────────────────────────────────────────────────────── */}
      {feedbackToast && (
        <div className="absolute top-[18vh] left-1/2 -translate-x-1/2 bg-[#ffd700] text-[#161c28] border-2 border-[#161c28] font-anybody font-black text-xs md:text-sm uppercase px-5 py-2 rounded-2xl shadow-xl animate-bounce pointer-events-none flex items-center gap-2">
          <span>✨</span>
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 0: INTRO SPEECH BUBBLE (Discreet, Top-Right, Non-blocking)
          ───────────────────────────────────────────────────────────── */}
      {currentStep === TutorialStep.INTRO && (
        <div className="absolute top-[clamp(44px,6.5vh,54px)] right-3 md:right-5 max-w-[320px] w-[88vw] sm:w-[310px] pointer-events-auto z-40">
          <div className="bg-[#161c28]/85 backdrop-blur-md border border-[#ffd700] rounded-2xl p-3 shadow-2xl text-white flex flex-col gap-2 relative">
            <div className="flex items-center justify-between">
              <span className="bg-[#ffd700] text-[#161c28] font-space font-extrabold text-[9px] uppercase px-2 py-0.5 rounded-md border border-[#161c28]">
                TUTORIAL • INÍCIO
              </span>
              <span className="text-[11px] text-[#ffd700] font-mono font-bold">Nível 1</span>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#ffd700] border border-[#161c28] flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <SpriteIcon name="logo_lotador" className="w-7 h-7 object-contain" />
              </div>
              <div>
                <h3 className="font-anybody font-black text-xs text-white uppercase">
                  BEM-VINDO AO LOTADOR!
                </h3>
                <p className="font-work text-[11px] text-slate-200 mt-0.5 leading-snug">
                  Chama passageiros e conduz-os aos candongueiros certos da paragem.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onStepChange(TutorialStep.MOVE);
              }}
              className="w-full py-2 bg-[#ffd700] hover:bg-[#ffe16d] text-[#161c28] font-anybody font-black text-xs uppercase rounded-xl border border-[#161c28] shadow-sm btn-press cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>COMEÇAR TUTORIAL</span>
              <span>➔</span>
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          IN-GAME GUIDANCE CARD / SPEECH BUBBLE (Compact, Top-Right Corner)
          ───────────────────────────────────────────────────────────── */}
      {currentStep !== TutorialStep.INTRO && currentStep !== TutorialStep.FREE_PLAY && (
        <div className="absolute top-[clamp(44px,6.5vh,54px)] right-3 md:right-5 max-w-[320px] w-[88vw] sm:w-[310px] pointer-events-auto z-40">
          {isMinimized ? (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setIsMinimized(false);
              }}
              className="bg-[#161c28]/90 hover:bg-[#161c28] border border-[#ffd700] text-white px-3 py-1.5 rounded-full shadow-lg text-[11px] font-space font-bold flex items-center gap-2 cursor-pointer ml-auto"
            >
              <span className="w-2 h-2 rounded-full bg-[#ffd700] animate-ping" />
              <span>PASSO {getStepIndex(currentStep)}/9</span>
              <span className="text-[#ffd700] text-xs">▼</span>
            </button>
          ) : (
            <div className="bg-[#161c28]/85 backdrop-blur-md border border-[#ffd700]/70 rounded-2xl p-2.5 md:p-3 shadow-xl text-white flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="bg-[#ffd700] text-[#161c28] font-space font-extrabold text-[9px] uppercase px-2 py-0.5 rounded-md border border-[#161c28]">
                  TUTORIAL • PASSO {getStepIndex(currentStep)}/9
                </span>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setIsMinimized(true);
                  }}
                  className="text-white/60 hover:text-white text-xs px-1.5 py-0.5 rounded-md hover:bg-white/10 cursor-pointer"
                  title="Minimizar dica"
                >
                  −
                </button>
              </div>

              {/* Instruction content based on current step */}
              {currentStep === TutorialStep.MOVE && (
                <div>
                  <h4 className="font-anybody font-black text-xs text-[#ffd700] uppercase flex items-center gap-1">
                    <span>🕹️</span>
                    <span>MOVIMENTAÇÃO</span>
                  </h4>
                  <p className="text-[11px] text-slate-200 font-work mt-0.5 leading-snug">
                    Usa o <strong className="text-[#ffd700]">joystick</strong> ou teclas <strong className="text-[#ffd700]">WASD</strong> para te mover pela paragem.
                  </p>
                </div>
              )}

              {currentStep === TutorialStep.APPROACH_PASSENGER && (
                <div>
                  <h4 className="font-anybody font-black text-xs text-[#ffd700] uppercase flex items-center gap-1">
                    <span>👤</span>
                    <span>ENCONTRAR PASSAGEIRO</span>
                  </h4>
                  <p className="text-[11px] text-slate-200 font-work mt-0.5 leading-snug">
                    Caminha até perto do passageiro com indicador <strong className="text-[#ffd700]">VIANA</strong>.
                  </p>
                </div>
              )}

              {currentStep === TutorialStep.CALL_PASSENGER && (
                <div>
                  <h4 className="font-anybody font-black text-xs text-[#ffd700] uppercase flex items-center gap-1">
                    <span>📢</span>
                    <span>CHAMAR PASSAGEIRO</span>
                  </h4>
                  <p className="text-[11px] text-slate-200 font-work mt-0.5 leading-snug">
                    Toca no botão amarelo <strong className="text-[#ffd700]">CHAMAR [E]</strong> para o passageiro te seguir!
                  </p>
                </div>
              )}

              {currentStep === TutorialStep.LEAD_TO_TAXI && (
                <div>
                  <h4 className="font-anybody font-black text-xs text-[#ffd700] uppercase flex items-center gap-1">
                    <span>🚐</span>
                    <span>LEVAR AO TÁXI</span>
                  </h4>
                  <p className="text-[11px] text-slate-200 font-work mt-0.5 leading-snug">
                    Caminha com o passageiro até à carrinha azul <strong className="text-[#ffd700]">TÁXI VIANA</strong>.
                  </p>
                </div>
              )}

              {currentStep === TutorialStep.BOARD_TAXI && (
                <div>
                  <h4 className="font-anybody font-black text-xs text-[#ffd700] uppercase flex items-center gap-1">
                    <span>🤝</span>
                    <span>EMBARQUE</span>
                  </h4>
                  <p className="text-[11px] text-slate-200 font-work mt-0.5 leading-snug">
                    Toca em <strong className="text-[#ffd700]">EMBARCAR [Espaço]</strong> junto ao táxi para o passageiro entrar.
                  </p>
                </div>
              )}

              {currentStep === TutorialStep.SCORE_MONEY && (
                <div>
                  <h4 className="font-anybody font-black text-xs text-[#ffd700] uppercase flex items-center gap-1">
                    <span>💰</span>
                    <span>GANHOS EM KWANZAS</span>
                  </h4>
                  <p className="text-[11px] text-slate-200 font-work mt-0.5 leading-snug">
                    Excelente! Ganhaste <strong className="text-[#ffd700]">Kz</strong> e <strong className="text-[#ffd700]">XP</strong> por cada passageiro!
                  </p>
                  <div className="flex justify-end mt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        onStepChange(TutorialStep.RUN_STAMINA);
                      }}
                      className="bg-[#ffd700] text-[#161c28] font-space font-bold text-[11px] uppercase px-2.5 py-1 rounded-lg border border-[#161c28] btn-press cursor-pointer"
                    >
                      CONTINUAR ➔
                    </button>
                  </div>
                </div>
              )}

              {currentStep === TutorialStep.RUN_STAMINA && (
                <div>
                  <h4 className="font-anybody font-black text-xs text-[#ffd700] uppercase flex items-center gap-1">
                    <span>⚡</span>
                    <span>{staminaExplained ? 'ENERGIA E RECUPERAÇÃO' : 'CORRER COM VELOCIDADE'}</span>
                  </h4>
                  {!staminaExplained ? (
                    <p className="text-[11px] text-slate-200 font-work mt-0.5 leading-snug">
                      Pressiona o botão azul <strong className="text-cyan-300">CORRER [Shift]</strong> para acelerar.
                    </p>
                  ) : (
                    <div>
                      <p className="text-[11px] text-slate-200 font-work mt-0.5 leading-snug">
                        A barra superior mostra a tua <strong className="text-[#ffd700]">Energia</strong>. Ela esgota ao correr e recupera ao andar.
                      </p>
                      <div className="flex justify-end mt-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            soundManager.playClick();
                            onStepChange(TutorialStep.OBJECTIVES);
                          }}
                          className="bg-[#ffd700] text-[#161c28] font-space font-bold text-[11px] uppercase px-2.5 py-1 rounded-lg border border-[#161c28] btn-press cursor-pointer"
                        >
                          ENTENDIDO ➔
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === TutorialStep.OBJECTIVES && (
                <div>
                  <h4 className="font-anybody font-black text-xs text-[#ffd700] uppercase flex items-center gap-1">
                    <span>🎯</span>
                    <span>CONSULTAR OBJETIVOS</span>
                  </h4>
                  <p className="text-[11px] text-slate-200 font-work mt-0.5 leading-snug">
                    Toca em <strong className="text-[#ffd700]">OBJ.</strong> no topo para ver as missões do dia.
                  </p>
                  <div className="flex justify-end gap-1.5 mt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        onOpenObjectives();
                      }}
                      className="bg-[#161c28] text-white font-space font-bold text-[10px] uppercase px-2 py-1 rounded-lg border border-white/30 btn-press cursor-pointer"
                    >
                      OBJETIVOS
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        onStepChange(TutorialStep.TIMER);
                      }}
                      className="bg-[#ffd700] text-[#161c28] font-space font-bold text-[10px] uppercase px-2.5 py-1 rounded-lg border border-[#161c28] btn-press cursor-pointer"
                    >
                      AVANÇAR ➔
                    </button>
                  </div>
                </div>
              )}

              {currentStep === TutorialStep.TIMER && (
                <div>
                  <h4 className="font-anybody font-black text-xs text-[#fe6b00] uppercase flex items-center gap-1">
                    <span>⏱️</span>
                    <span>CRONÔMETRO E VITÓRIA</span>
                  </h4>
                  <p className="text-[11px] text-slate-200 font-work mt-0.5 leading-snug">
                    Cumpre os objetivos antes do <strong className="text-[#fe6b00]">tempo acabar</strong>!
                  </p>
                  <div className="flex justify-end mt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        showFeedback('Bons clientes! Conclui o Nível 1!');
                        onStepChange(TutorialStep.FREE_PLAY);
                      }}
                      className="bg-[#ffd700] text-[#161c28] font-space font-bold text-[11px] uppercase px-3 py-1 rounded-lg border border-[#161c28] btn-press cursor-pointer"
                    >
                      JOGAR AGORA! 🚀
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 10: FREE PLAY LEVEL 1 OBJECTIVE TRACKER (Compact Top-Right Badge)
          ───────────────────────────────────────────────────────────── */}
      {currentStep === TutorialStep.FREE_PLAY && (
        <div className="absolute top-[clamp(44px,6.5vh,54px)] right-3 md:right-5 pointer-events-none z-40">
          <div className="bg-[#161c28]/85 backdrop-blur-xs border border-[#ffd700]/70 rounded-full px-3 py-1 shadow-md text-white flex items-center gap-2">
            <span className="text-[#ffd700] text-xs font-space font-bold">🎯 NÍVEL 1:</span>
            <span className="text-[11px] font-space text-slate-200">Passageiros ({Math.min(2, passengersServed)}/2)</span>
            <span className="text-[9px] font-mono bg-[#ffd700] text-[#161c28] px-1.5 py-0.5 rounded-full font-bold">
              {passengersServed >= 2 ? 'PRONTO!' : 'EM CURSO'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

function getStepIndex(step: TutorialStep): number {
  switch (step) {
    case TutorialStep.MOVE:
      return 1;
    case TutorialStep.APPROACH_PASSENGER:
      return 2;
    case TutorialStep.CALL_PASSENGER:
      return 3;
    case TutorialStep.LEAD_TO_TAXI:
      return 4;
    case TutorialStep.BOARD_TAXI:
      return 5;
    case TutorialStep.SCORE_MONEY:
      return 6;
    case TutorialStep.RUN_STAMINA:
      return 7;
    case TutorialStep.OBJECTIVES:
      return 8;
    case TutorialStep.TIMER:
      return 9;
    default:
      return 1;
  }
}
