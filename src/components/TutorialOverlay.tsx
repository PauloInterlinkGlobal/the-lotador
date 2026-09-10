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
          STEP 0: INTRO MODAL CARD
          ───────────────────────────────────────────────────────────── */}
      {currentStep === TutorialStep.INTRO && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-white border-3 border-[#161c28] p-6 md:p-8 rounded-3xl max-w-sm w-full text-center flex flex-col items-center shadow-2xl relative">
            <div className="w-16 h-16 rounded-2xl bg-[#ffd700] border-2 border-[#161c28] flex items-center justify-center -mt-12 mb-3 shadow-md">
              <SpriteIcon name="logo_lotador" className="w-12 h-12 object-contain" />
            </div>

            <h3 className="font-anybody font-black text-xl text-[#161c28] uppercase mb-2">
              BEM-VINDO AO LOTADOR!
            </h3>

            <p className="font-work text-xs md:text-sm text-slate-600 mb-5 leading-relaxed">
              O teu trabalho na paragem é simples: chamar passageiros, conduzi-los aos candongueiros certos e cumprir as metas antes do tempo esgotar!
            </p>

            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onStepChange(TutorialStep.MOVE);
              }}
              className="w-full py-3.5 bg-[#ffd700] hover:bg-[#ffe16d] text-[#161c28] font-anybody font-black text-base uppercase rounded-2xl border-2 border-[#161c28] shadow-md btn-press cursor-pointer flex items-center justify-center gap-2"
            >
              <span>COMEÇAR TUTORIAL</span>
              <span>➔</span>
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          IN-GAME GUIDANCE CARD (Compact, non-blocking)
          ───────────────────────────────────────────────────────────── */}
      {currentStep !== TutorialStep.INTRO && currentStep !== TutorialStep.FREE_PLAY && (
        <div className="absolute top-[clamp(65px,11vh,95px)] left-1/2 -translate-x-1/2 max-w-md w-[92%] pointer-events-auto">
          <div className="bg-[#161c28]/95 backdrop-blur-md border-2 border-[#ffd700] rounded-2xl p-3 md:p-4 shadow-xl text-white flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="bg-[#ffd700] text-[#161c28] font-space font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-md border border-[#161c28]">
                TUTORIAL • PASSO {getStepIndex(currentStep)}/9
              </span>
              <span className="text-xs text-white/60 font-mono">Nível 1</span>
            </div>

            {/* Instruction content based on current step */}
            {currentStep === TutorialStep.MOVE && (
              <div>
                <h4 className="font-anybody font-black text-sm text-[#ffd700] uppercase flex items-center gap-1.5">
                  <span>🕹️</span>
                  <span>MOVIMENTAÇÃO</span>
                </h4>
                <p className="text-xs text-slate-200 font-work mt-1">
                  Usa o <strong className="text-[#ffd700]">joystick</strong> no canto inferior esquerdo (ou as teclas <strong className="text-[#ffd700]">WASD</strong>) para te mover pela paragem.
                </p>
              </div>
            )}

            {currentStep === TutorialStep.APPROACH_PASSENGER && (
              <div>
                <h4 className="font-anybody font-black text-sm text-[#ffd700] uppercase flex items-center gap-1.5">
                  <span>👤</span>
                  <span>ENCONTRAR PASSAGEIRO</span>
                </h4>
                <p className="text-xs text-slate-200 font-work mt-1">
                  Caminha até perto do passageiro com o indicador dourado <strong className="text-[#ffd700]">VIANA</strong>.
                </p>
              </div>
            )}

            {currentStep === TutorialStep.CALL_PASSENGER && (
              <div>
                <h4 className="font-anybody font-black text-sm text-[#ffd700] uppercase flex items-center gap-1.5">
                  <span>📢</span>
                  <span>CHAMAR PASSAGEIRO</span>
                </h4>
                <p className="text-xs text-slate-200 font-work mt-1">
                  Toca no botão amarelo <strong className="text-[#ffd700]">CHAMAR [E]</strong> para convencer o passageiro a seguir-te!
                </p>
              </div>
            )}

            {currentStep === TutorialStep.LEAD_TO_TAXI && (
              <div>
                <h4 className="font-anybody font-black text-sm text-[#ffd700] uppercase flex items-center gap-1.5">
                  <span>🚐</span>
                  <span>LEVAR AO TÁXI</span>
                </h4>
                <p className="text-xs text-slate-200 font-work mt-1">
                  O passageiro está a seguir-te! Caminha com ele até à carrinha azul <strong className="text-[#ffd700]">TÁXI VIANA</strong>.
                </p>
              </div>
            )}

            {currentStep === TutorialStep.BOARD_TAXI && (
              <div>
                <h4 className="font-anybody font-black text-sm text-[#ffd700] uppercase flex items-center gap-1.5">
                  <span>🤝</span>
                  <span>EMBARQUE</span>
                </h4>
                <p className="text-xs text-slate-200 font-work mt-1">
                  Toca no botão <strong className="text-[#ffd700]">EMBARCAR [Espaço]</strong> junto ao táxi para o passageiro entrar.
                </p>
              </div>
            )}

            {currentStep === TutorialStep.SCORE_MONEY && (
              <div>
                <h4 className="font-anybody font-black text-sm text-[#ffd700] uppercase flex items-center gap-1.5">
                  <span>💰</span>
                  <span>GANHOS EM KWANZAS</span>
                </h4>
                <p className="text-xs text-slate-200 font-work mt-1">
                  Excelente! Ganhaste <strong className="text-[#ffd700]">Kz</strong>. Cada passageiro embarcado rende dinheiro e experiência (XP) para melhorias!
                </p>
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      onStepChange(TutorialStep.RUN_STAMINA);
                    }}
                    className="bg-[#ffd700] text-[#161c28] font-space font-bold text-xs uppercase px-3 py-1.5 rounded-xl border border-[#161c28] btn-press cursor-pointer"
                  >
                    CONTINUAR ➔
                  </button>
                </div>
              </div>
            )}

            {currentStep === TutorialStep.RUN_STAMINA && (
              <div>
                <h4 className="font-anybody font-black text-sm text-[#ffd700] uppercase flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>{staminaExplained ? 'ENERGIA E RECUPERAÇÃO' : 'CORRER COM VELOCIDADE'}</span>
                </h4>
                {!staminaExplained ? (
                  <p className="text-xs text-slate-200 font-work mt-1">
                    Pressiona o botão azul <strong className="text-cyan-300">CORRER [Shift]</strong> enquanto andas para acelerar.
                  </p>
                ) : (
                  <div>
                    <p className="text-xs text-slate-200 font-work mt-1">
                      A barra superior mostra a tua <strong className="text-[#ffd700]">Energia</strong>. Ela esgota ao correr e recupera quando andas devagar ou paras.
                    </p>
                    <div className="flex justify-end mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          soundManager.playClick();
                          onStepChange(TutorialStep.OBJECTIVES);
                        }}
                        className="bg-[#ffd700] text-[#161c28] font-space font-bold text-xs uppercase px-3 py-1.5 rounded-xl border border-[#161c28] btn-press cursor-pointer"
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
                <h4 className="font-anybody font-black text-sm text-[#ffd700] uppercase flex items-center gap-1.5">
                  <span>🎯</span>
                  <span>CONSULTAR OBJETIVOS</span>
                </h4>
                <p className="text-xs text-slate-200 font-work mt-1">
                  Toca no botão <strong className="text-[#ffd700]">OBJ.</strong> no canto superior esquerdo para ver as missões que tens de cumprir para vencer.
                </p>
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      onOpenObjectives();
                    }}
                    className="bg-[#161c28] text-white font-space font-bold text-xs uppercase px-3 py-1.5 rounded-xl border border-white/30 btn-press cursor-pointer"
                  >
                    ABRIR OBJETIVOS
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      onStepChange(TutorialStep.TIMER);
                    }}
                    className="bg-[#ffd700] text-[#161c28] font-space font-bold text-xs uppercase px-3 py-1.5 rounded-xl border border-[#161c28] btn-press cursor-pointer"
                  >
                    AVANÇAR ➔
                  </button>
                </div>
              </div>
            )}

            {currentStep === TutorialStep.TIMER && (
              <div>
                <h4 className="font-anybody font-black text-sm text-[#fe6b00] uppercase flex items-center gap-1.5">
                  <span>⏱️</span>
                  <span>CRONÔMETRO E VITÓRIA</span>
                </h4>
                <p className="text-xs text-slate-200 font-work mt-1">
                  Tens de cumprir todos os objetivos antes do <strong className="text-[#fe6b00]">tempo acabar</strong>! Se o tempo esgotar, a partida é perdida.
                </p>
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      showFeedback('Bons clientes! Conclui o Nível 1!');
                      onStepChange(TutorialStep.FREE_PLAY);
                    }}
                    className="bg-[#ffd700] text-[#161c28] font-space font-bold text-xs uppercase px-4 py-1.5 rounded-xl border border-[#161c28] btn-press cursor-pointer"
                  >
                    JOGAR AGORA! 🚀
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 10: FREE PLAY LEVEL 1 OBJECTIVE TRACKER
          ───────────────────────────────────────────────────────────── */}
      {currentStep === TutorialStep.FREE_PLAY && (
        <div className="absolute top-[clamp(65px,10.5vh,90px)] left-1/2 -translate-x-1/2 max-w-sm w-[90%] pointer-events-none">
          <div className="bg-[#161c28]/85 backdrop-blur-xs border border-[#ffd700]/70 rounded-full px-4 py-1.5 shadow-md text-white flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-space font-bold">
              <span className="text-[#ffd700]">🎯 OBJETIVO NÍVEL 1:</span>
              <span>Passageiros ({Math.min(2, passengersServed)}/2)</span>
            </div>
            <span className="text-[10px] font-mono bg-[#ffd700] text-[#161c28] px-2 py-0.5 rounded-full font-bold">
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
