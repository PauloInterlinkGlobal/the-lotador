/**
 * LOTADOR - Main Application Controller
 */

import React, { useState, useEffect, useRef } from 'react';
import { PlayerStats, MatchResults, Taxi, Passenger, PassengerDispute } from './types/game';
import { loadPlayerStats, savePlayerStats, getXpForNextLevel, DEFAULT_MISSIONS } from './utils/storage';
import { storageManager } from './services/storageService';
import { soundManager } from './utils/audio';
import { GameEngine } from './game/GameEngine';

import { MainMenu } from './components/MainMenu';
import { HUD } from './components/HUD';
import { ResultScreen } from './components/ResultScreen';
import { MentorDialog } from './components/MentorDialog';
import { UpgradesModal } from './components/UpgradesModal';
import { CharacterModal } from './components/CharacterModal';
import { MapSelectModal } from './components/MapSelectModal';
import { MissionsModal } from './components/MissionsModal';
import { SettingsModal } from './components/SettingsModal';
import { HowToPlayGuide } from './components/HowToPlayGuide';
import { PauseModal } from './components/PauseModal';
import { PWAStatusBanner } from './components/PWAStatusBanner';
import { TutorialOverlay, TutorialStep } from './components/TutorialOverlay';

type AppScreen = 'MENU' | 'GAME' | 'RESULT';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('MENU');
  const [stats, setStats] = useState<PlayerStats>(loadPlayerStats());

  // Tutorial State
  const [isTutorial, setIsTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState<TutorialStep>(TutorialStep.INTRO);

  // Game Engine State
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Match HUD State
  const [matchKz, setMatchKz] = useState(0);
  const [matchXp, setMatchXp] = useState(0);
  const [matchCombo, setMatchCombo] = useState(1);
  const [stamina, setStamina] = useState(100);
  const [maxStamina, setMaxStamina] = useState(100);
  const [timerSeconds, setTimerSeconds] = useState(180); // 3-minute match
  const [isRushHour, setIsRushHour] = useState(false);
  const [taxis, setTaxis] = useState<Taxi[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [activeDispute, setActiveDispute] = useState<PassengerDispute | null>(null);
  const [floatingToasts, setFloatingToasts] = useState<{ id: number; text: string; color: string }[]>([]);

  // Results State
  const [matchResults, setMatchResults] = useState<MatchResults | null>(null);

  // Modals
  const [activeModal, setActiveModal] = useState<
    'UPGRADES' | 'CHARACTER' | 'MAPS' | 'MISSIONS' | 'SETTINGS' | 'MENTOR' | 'GUIDE' | null
  >(null);
  const [isPaused, setIsPaused] = useState(false);

  // Request persistent storage on mount (prevents browser data eviction)
  useEffect(() => {
    storageManager.requestPersistentStorage();
  }, []);

  // Sync engine pause state
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.isPaused = isPaused || activeModal !== null;
    }
  }, [isPaused, activeModal]);

  // Match Timer Interval
  useEffect(() => {
    let timer: any = null;
    if (
      screen === 'GAME' &&
      !isPaused &&
      !activeModal &&
      timerSeconds > 0 &&
      !(isTutorial && tutorialStep === TutorialStep.INTRO)
    ) {
      timer = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            endMatch(false);
            return 0;
          }

          // Trigger "Hora de Ponta" at 90 seconds (01:30)
          if (prev === 90 && engineRef.current) {
            engineRef.current.toggleRushHour(true);
          }

          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [screen, isPaused, activeModal, timerSeconds, isTutorial, tutorialStep]);

  // Sync Taxis and Passengers for HUD overlay
  useEffect(() => {
    let interval: any = null;
    if (screen === 'GAME') {
      interval = setInterval(() => {
        if (engineRef.current) {
          setTaxis([...engineRef.current.taxis]);
          setPassengers([...engineRef.current.passengers]);
        }
      }, 300);
    }
    return () => clearInterval(interval);
  }, [screen]);

  const startMatch = (forceTutorial = false) => {
    soundManager.playClick();
    const runTutorial = forceTutorial || (!stats.tutorialCompleted && stats.level === 1);
    setIsTutorial(runTutorial);
    setTutorialStep(TutorialStep.INTRO);

    setMatchKz(0);
    setMatchXp(0);
    setMatchCombo(1);
    setTimerSeconds(180);
    setIsRushHour(false);
    setActiveDispute(null);
    setFloatingToasts([]);
    setIsPaused(false);
    setScreen('GAME');

    soundManager.startBackgroundRhythm(false);

    // Initialize 3D Game Engine after canvas mount
    setTimeout(() => {
      if (canvasContainerRef.current) {
        engineRef.current = new GameEngine(
          canvasContainerRef.current,
          stats,
          {
            onScoreUpdate: (kz, xp, combo) => {
              setMatchKz(kz);
              setMatchXp(xp);
              setMatchCombo(combo);
            },
            onTaxiLoaded: (taxi, reward, xp) => {
              // Check for rush hour condition
              if (engineRef.current && engineRef.current.taxisLoadedCount >= 5 && !engineRef.current.isRushHour) {
                engineRef.current.toggleRushHour(true);
              }
            },
            onFloatingText: (text, color, pos) => {
              const id = Date.now() + Math.random();
              setFloatingToasts((prev) => [...prev.slice(-3), { id, text, color }]);
              setTimeout(() => {
                setFloatingToasts((prev) => prev.filter((t) => t.id !== id));
              }, 2600);
            },
            onRushHourState: (isRush) => setIsRushHour(isRush),
            onStaminaChange: (cur, max) => {
              setStamina(cur);
              setMaxStamina(max);
            },
            onPassengerServedCount: (count) => {},
            onDisputeUpdate: (dispute) => {
              setActiveDispute(dispute ? { ...dispute } : null);
            },
            onPlayerMove: (dist) => {
              if (runTutorial) {
                setTutorialStep((prev) => {
                  if (prev === TutorialStep.MOVE && dist >= 2.8) {
                    return TutorialStep.APPROACH_PASSENGER;
                  }
                  return prev;
                });
              }
            },
            onPassengerFollowed: () => {
              if (runTutorial) {
                setTutorialStep((prev) => {
                  if (prev === TutorialStep.CALL_PASSENGER) {
                    return TutorialStep.LEAD_TO_TAXI;
                  }
                  return prev;
                });
              }
            },
            onPassengerBoarded: () => {
              if (runTutorial) {
                setTutorialStep((prev) => {
                  if (prev === TutorialStep.BOARD_TAXI) {
                    return TutorialStep.SCORE_MONEY;
                  }
                  return prev;
                });
              }
            },
            onPlayerRunStart: () => {},
          },
          { isTutorial: runTutorial }
        );
      }
    }, 100);
  };

  const endMatch = (victoryParam?: boolean) => {
    if (engineRef.current) {
      const engine = engineRef.current;
      const isNewRecord = engine.matchKz > stats.bestScore;
      const isVictory =
        victoryParam !== undefined
          ? victoryParam
          : isTutorial
          ? engine.passengersServedCount >= 2 || engine.taxisLoadedCount >= 1
          : true;

      // Update Player Stats & Level Up Logic
      let newMoney = stats.money + engine.matchKz;
      let newXp = stats.xp + engine.matchXp;
      let newLevel = stats.level;
      let newTaxisLoaded = stats.taxisLoaded + engine.taxisLoadedCount;
      let newPassengers = stats.passengersServed + engine.passengersServedCount;

      // Level up checks
      let reqXp = getXpForNextLevel(newLevel);
      while (newXp >= reqXp) {
        newXp -= reqXp;
        newLevel++;
        reqXp = getXpForNextLevel(newLevel);
      }

      const updatedStats: PlayerStats = {
        ...stats,
        money: newMoney,
        xp: newXp,
        level: newLevel,
        bestScore: Math.max(stats.bestScore, engine.matchKz),
        taxisLoaded: newTaxisLoaded,
        passengersServed: newPassengers,
        maxCombo: Math.max(stats.maxCombo, engine.combo),
        tutorialCompleted: isTutorial && isVictory ? true : stats.tutorialCompleted,
      };

      savePlayerStats(updatedStats);
      setStats(updatedStats);

      storageManager.recordFinishedMatch(
        {
          id: `match_${Date.now()}`,
          timestamp: Date.now(),
          score: engine.matchKz,
          moneyEarned: engine.matchKz,
          taxisLoaded: engine.taxisLoadedCount,
          passengersServed: engine.passengersServedCount,
          zoneId: stats.selectedMapId || 'paragem_central',
          maxCombo: engine.combo,
        },
        updatedStats
      );

      const res: MatchResults = {
        taxisLoaded: engine.taxisLoadedCount,
        passengersServed: engine.passengersServedCount,
        maxCombo: engine.combo,
        earnedMoney: engine.matchKz,
        earnedXp: engine.matchXp,
        isNewRecord,
        duration: 180 - timerSeconds,
        isTutorial,
        isVictory,
      };

      setMatchResults(res);
      engine.destroy();
      engineRef.current = null;
    }

    soundManager.stopBackgroundRhythm();
    setScreen('RESULT');
  };

  const tutorialHighlight = isTutorial
    ? tutorialStep === TutorialStep.MOVE
      ? 'JOYSTICK'
      : tutorialStep === TutorialStep.CALL_PASSENGER
      ? 'CALL'
      : tutorialStep === TutorialStep.SCORE_MONEY
      ? 'MONEY'
      : tutorialStep === TutorialStep.RUN_STAMINA
      ? 'RUN'
      : tutorialStep === TutorialStep.OBJECTIVES
      ? 'OBJECTIVES'
      : tutorialStep === TutorialStep.TIMER
      ? 'TIMER'
      : null
    : null;

  return (
    <div className="relative w-full h-screen bg-[#f9f9ff] overflow-hidden select-none">
      {/* Main Menu Screen */}
      {screen === 'MENU' && (
        <MainMenu
          stats={stats}
          onStartGame={() => startMatch(false)}
          onStartTutorial={() => startMatch(true)}
          onOpenUpgrades={() => setActiveModal('UPGRADES')}
          onOpenCharacter={() => setActiveModal('CHARACTER')}
          onOpenMaps={() => setActiveModal('MAPS')}
          onOpenMissions={() => setActiveModal('MISSIONS')}
          onOpenSettings={() => setActiveModal('SETTINGS')}
          onOpenGuide={() => setActiveModal('GUIDE')}
        />
      )}

      {/* 3D Gameplay Screen */}
      {screen === 'GAME' && (
        <div className="relative w-full h-full">
          {/* 3D Canvas Container */}
          <div ref={canvasContainerRef} className="absolute inset-0 w-full h-full z-0" />

          {/* HUD Overlay */}
          <HUD
            money={matchKz}
            level={stats.level}
            timerSeconds={timerSeconds}
            combo={matchCombo}
            stamina={stamina}
            maxStamina={maxStamina}
            isRushHour={isRushHour}
            taxis={taxis}
            passengers={passengers}
            taxisLoadedCount={engineRef.current?.taxisLoadedCount || 0}
            activeDispute={activeDispute}
            floatingToasts={floatingToasts}
            onCallAction={() => engineRef.current?.triggerCallAction()}
            onInteractAction={() => engineRef.current?.triggerInteractAction()}
            onJoystickMove={(dir) =>
              engineRef.current?.updateInputs(dir, engineRef.current.isRunning)
            }
            onRunToggle={(running) => {
              if (engineRef.current) {
                engineRef.current.updateInputs(engineRef.current.inputDir, running);
              }
            }}
            onPause={() => setIsPaused(true)}
            onOpenObjectives={() => {
              setIsPaused(true);
              setActiveModal('MISSIONS');
            }}
            objectivesCount={DEFAULT_MISSIONS.filter((m) => !m.completed).length}
            tutorialHighlight={tutorialHighlight}
          />

          {/* Interactive Tutorial Overlay */}
          {isTutorial && (
            <TutorialOverlay
              engine={engineRef.current}
              currentStep={tutorialStep}
              passengersServed={engineRef.current?.passengersServedCount || 0}
              taxisLoaded={engineRef.current?.taxisLoadedCount || 0}
              money={matchKz}
              onStepChange={(nextStep) => setTutorialStep(nextStep)}
              onOpenObjectives={() => {
                setIsPaused(true);
                setActiveModal('MISSIONS');
              }}
              onCompleteTutorial={() => {
                endMatch(true);
              }}
            />
          )}

          {/* Pause Modal Overlay */}
          {isPaused && !activeModal && (
            <PauseModal
              onResume={() => setIsPaused(false)}
              onOpenObjectives={() => setActiveModal('MISSIONS')}
              onOpenSettings={() => setActiveModal('SETTINGS')}
              onQuitToMenu={() => {
                setIsPaused(false);
                if (engineRef.current) {
                  engineRef.current.destroy();
                  engineRef.current = null;
                }
                soundManager.stopBackgroundRhythm();
                setScreen('MENU');
              }}
            />
          )}
        </div>
      )}

      {/* Result Screen */}
      {screen === 'RESULT' && matchResults && (
        <ResultScreen
          results={matchResults}
          onPlayAgain={() => startMatch(isTutorial)}
          onContinue={() => setScreen('MENU')}
        />
      )}

      {/* Modals & Dialog Overlays */}
      {activeModal === 'MENTOR' && <MentorDialog onClose={() => setActiveModal(null)} />}

      {activeModal === 'UPGRADES' && (
        <UpgradesModal
          stats={stats}
          onUpdateStats={(newStats) => setStats(newStats)}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'CHARACTER' && (
        <CharacterModal
          stats={stats}
          onUpdateStats={(newStats) => setStats(newStats)}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'MAPS' && (
        <MapSelectModal
          stats={stats}
          onUpdateStats={(newStats) => setStats(newStats)}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'MISSIONS' && (
        <MissionsModal
          stats={stats}
          onUpdateStats={(newStats) => setStats(newStats)}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'SETTINGS' && (
        <SettingsModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'GUIDE' && (
        <HowToPlayGuide
          onClose={() => setActiveModal(null)}
          onStartGame={() => {
            setActiveModal(null);
            startMatch();
          }}
        />
      )}

      {/* PWA Offline / Update / Install Status Banner */}
      <PWAStatusBanner />
    </div>
  );
}
