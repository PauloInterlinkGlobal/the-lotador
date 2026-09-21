/**
 * LOTADOR - Main Application Controller
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayerStats, MatchResults, Taxi, Passenger, PassengerDispute, GameSettings } from './types/game';
import { loadPlayerStats, savePlayerStats, getXpForNextLevel, DEFAULT_MISSIONS, recordLevelCompletion, loadSettings, saveSettings } from './utils/storage';
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
import { LevelSelectionScreen } from './components/LevelSelectionScreen';
import { LevelData, LevelObjective, SAMPLE_LEVELS_DATA, evaluateLevelResult } from './types/levelObjectives';
import { ALL_LEVELS_DATA } from './data/levelsData';
import { MissionsModal } from './components/MissionsModal';
import { SettingsModal } from './components/SettingsModal';
import { HowToPlayGuide } from './components/HowToPlayGuide';
import { PauseModal } from './components/PauseModal';
import { PWAStatusBanner } from './components/PWAStatusBanner';
import { TutorialOverlay, TutorialStep } from './components/TutorialOverlay';
import { useMobileLifecycle, tryLockLandscapeWeb } from './hooks/useMobileLifecycle';
import { DiagnosticOverlay } from './components/DiagnosticOverlay';
import { PerformanceOverlay } from './components/PerformanceOverlay';
import { LoadingScreen } from './components/LoadingScreen';
import { RotateDeviceOverlay } from './components/RotateDeviceOverlay';

type AppScreen = 'MENU' | 'GAME' | 'RESULT';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('MENU');
  const [stats, setStats] = useState<PlayerStats>(loadPlayerStats());
  const [gameSettings, setGameSettings] = useState<GameSettings>(() => loadSettings());

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

  // Performance & Condition Tracking Refs for Current Match
  const disputesWonRef = useRef(0);
  const obstacleCollisionsRef = useRef(0);

  // Active Level & In-Game Objectives
  const [activeLevel, setActiveLevel] = useState<LevelData>(
    () => ALL_LEVELS_DATA.find((l) => l.level_number === (stats.highestUnlockedLevel || 1)) || ALL_LEVELS_DATA[0]
  );
  const [matchObjectives, setMatchObjectives] = useState<LevelObjective[]>(
    () => (ALL_LEVELS_DATA.find((l) => l.level_number === (stats.highestUnlockedLevel || 1)) || ALL_LEVELS_DATA[0]).objectives
  );

  // Results State
  const [matchResults, setMatchResults] = useState<MatchResults | null>(null);

  // Asset Preloader State
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Modals
  const [activeModal, setActiveModal] = useState<
    'UPGRADES' | 'CHARACTER' | 'MAPS' | 'MISSIONS' | 'SETTINGS' | 'MENTOR' | 'GUIDE' | null
  >(null);
  const [isPaused, setIsPaused] = useState(false);

  // Mobile Lifecycle (Capacitor background/resume, orientation, Android Back button)
  const mobileEnv = useMobileLifecycle({
    onPauseGame: () => {
      if (screen === 'GAME') {
        setIsPaused(true);
      }
      soundManager.suspendAudio();
    },
    onResumeGame: () => {
      soundManager.resumeAudio();
    },
    onBackPressed: () => {
      // 1. If modal open, close modal
      if (activeModal !== null) {
        setActiveModal(null);
        return true;
      }
      // 2. If in game, pause or open pause modal
      if (screen === 'GAME') {
        if (!isPaused) {
          setIsPaused(true);
          return true;
        } else {
          setIsPaused(false);
          return true;
        }
      }
      // 3. If in result screen, return to menu
      if (screen === 'RESULT') {
        setScreen('MENU');
        return true;
      }
      return false; // let OS minimize app
    },
  });

  // Request persistent storage on mount (prevents browser data eviction) and hydrate from secure storage
  useEffect(() => {
    storageManager.requestPersistentStorage();
    storageManager.loadPlayerProgress().then((loadedStats) => {
      if (loadedStats && (loadedStats.money !== stats.money || loadedStats.level !== stats.level || loadedStats.bestScore !== stats.bestScore)) {
        setStats(loadedStats);
      }
    }).catch(() => {});
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

  // Sync Taxis and Passengers for HUD overlay with shallow equality guards
  useEffect(() => {
    let interval: any = null;
    if (screen === 'GAME') {
      interval = setInterval(() => {
        if (!engineRef.current) return;
        const currentTaxis = engineRef.current.taxis;
        const currentPassengers = engineRef.current.passengers;

        setTaxis((prev) => {
          if (prev.length !== currentTaxis.length) return [...currentTaxis];
          for (let i = 0; i < prev.length; i++) {
            if (
              prev[i].id !== currentTaxis[i].id ||
              prev[i].state !== currentTaxis[i].state ||
              prev[i].currentPassengers !== currentTaxis[i].currentPassengers
            ) {
              return [...currentTaxis];
            }
          }
          return prev;
        });

        setPassengers((prev) => {
          if (prev.length !== currentPassengers.length) return [...currentPassengers];
          for (let i = 0; i < prev.length; i++) {
            if (
              prev[i].id !== currentPassengers[i].id ||
              prev[i].state !== currentPassengers[i].state ||
              prev[i].followedBy !== currentPassengers[i].followedBy
            ) {
              return [...currentPassengers];
            }
          }
          return prev;
        });
      }, 350);
    }
    return () => clearInterval(interval);
  }, [screen]);

  const startMatch = async (forceTutorial = false) => {
    soundManager.playClick();
    tryLockLandscapeWeb();

    const runTutorial = forceTutorial || (!stats.tutorialCompleted && stats.level === 1);
    setIsTutorial(runTutorial);
    setTutorialStep(TutorialStep.INTRO);

    disputesWonRef.current = 0;
    obstacleCollisionsRef.current = 0;

    setMatchKz(0);
    setMatchXp(0);
    setMatchCombo(1);
    setTimerSeconds(activeLevel.time_limit_seconds || 180);
    setMatchObjectives(
      activeLevel.objectives.map((o) => ({
        ...o,
        current_value: 0,
        completed: false,
      }))
    );
    setIsRushHour(false);
    setActiveDispute(null);
    setFloatingToasts([]);
    setIsPaused(false);

    // Show loading overlay and preload 3D models & sprite atlases
    setIsLoadingMatch(true);
    setLoadingProgress(15);

    try {
      await GameEngine.preloadAllAssets((pct) => {
        setLoadingProgress(pct);
      });
    } catch (err) {
      console.warn('[startMatch] Preload completed with warning:', err);
    }

    setIsLoadingMatch(false);
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
              setMatchObjectives((prev) =>
                prev.map((obj) =>
                  obj.type === 'MONEY_EARNED'
                    ? {
                        ...obj,
                        current_value: kz,
                        completed: kz >= obj.target_value,
                      }
                    : obj
                )
              );
            },
            onTaxiLoaded: (taxi, reward, xp) => {
              // Check for rush hour condition
              if (engineRef.current && engineRef.current.taxisLoadedCount >= 5 && !engineRef.current.isRushHour) {
                engineRef.current.toggleRushHour(true);
              }
              setMatchObjectives((prev) =>
                prev.map((obj) =>
                  obj.type === 'FULL_CAPACITY_TRIPS'
                    ? {
                        ...obj,
                        current_value: obj.current_value + 1,
                        completed: obj.current_value + 1 >= obj.target_value,
                      }
                    : obj
                )
              );
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
              const roundedCur = Math.round(cur);
              const roundedMax = Math.round(max);
              setStamina((prev) => (prev === roundedCur ? prev : roundedCur));
              setMaxStamina((prev) => (prev === roundedMax ? prev : roundedMax));
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
              setMatchObjectives((prev) =>
                prev.map((obj) =>
                  obj.type === 'PASSENGERS_DELIVERED'
                    ? {
                        ...obj,
                        current_value: obj.current_value + 1,
                        completed: obj.current_value + 1 >= obj.target_value,
                      }
                    : obj
                )
              );
              if (runTutorial) {
                setTutorialStep((prev) => {
                  if (prev === TutorialStep.BOARD_TAXI) {
                    return TutorialStep.SCORE_MONEY;
                  }
                  return prev;
                });
              }
            },
            onDisputeWon: () => {
              disputesWonRef.current++;
              setMatchObjectives((prev) =>
                prev.map((obj) =>
                  obj.type === 'BEAT_RIVAL'
                    ? {
                        ...obj,
                        current_value: disputesWonRef.current,
                        completed: disputesWonRef.current >= obj.target_value,
                      }
                    : obj
                )
              );
            },
            onObstacleCollision: (type) => {
              obstacleCollisionsRef.current++;
              setMatchObjectives((prev) =>
                prev.map((obj) =>
                  obj.type === 'NO_COLLISIONS'
                    ? {
                        ...obj,
                        current_value: obstacleCollisionsRef.current,
                        completed: false,
                      }
                    : obj
                )
              );
            },
            onFullCapacityTrip: (taxi) => {
              setMatchObjectives((prev) =>
                prev.map((obj) =>
                  obj.type === 'FULL_CAPACITY_TRIPS'
                    ? {
                        ...obj,
                        current_value: obj.current_value + 1,
                        completed: obj.current_value + 1 >= obj.target_value,
                      }
                    : obj
                )
              );
            },
            onPlayerRunStart: () => {},
          },
          { isTutorial: runTutorial, levelConfig: activeLevel }
        );

        if (engineRef.current && gameSettings.graphicsQuality) {
          engineRef.current.setGraphicsQuality(gameSettings.graphicsQuality);
        }
      }
    }, 100);
  };

  const endMatch = (victoryParam?: boolean) => {
    if (engineRef.current) {
      const engine = engineRef.current;
      const duration = Math.max(1, (activeLevel.time_limit_seconds || 180) - timerSeconds);
      const isNewRecord = engine.matchKz > stats.bestScore;

      // Evaluate level completion and star requirements
      const evalResult = isTutorial
        ? {
            isVictory:
              victoryParam !== undefined
                ? victoryParam
                : engine.passengersServedCount >= 2 || engine.taxisLoadedCount >= 1,
            stars: 1,
            starsBreakdown: { star1: true, star2: false, star3: false },
            isParagemDominada: false,
            firstTimeClearBonus: 500,
            bonusKz: 0,
            bonusXp: 0,
            failReason: undefined,
          }
        : evaluateLevelResult(
            activeLevel,
            engine.matchKz,
            engine.passengersServedCount,
            engine.taxisLoadedCount,
            duration,
            disputesWonRef.current,
            obstacleCollisionsRef.current
          );

      const isVictory = evalResult.isVictory;
      const totalEarnedKz = engine.matchKz + (isVictory ? evalResult.bonusKz : 0);
      const totalEarnedXp = engine.matchXp + (isVictory ? evalResult.bonusXp : 0);

      // Record level completion in progression storage
      let updatedStats = { ...stats };
      if (isVictory && !isTutorial) {
        const recordResult = recordLevelCompletion(
          stats,
          activeLevel.level_number,
          evalResult.stars,
          engine.matchKz
        );
        updatedStats = recordResult.updatedStats;
      }

      // Update basic player wallet and XP
      let newMoney = updatedStats.money + totalEarnedKz;
      let newXp = updatedStats.xp + totalEarnedXp;
      let oldLevel = updatedStats.level;
      let newLevel = updatedStats.level;
      let newTaxisLoaded = updatedStats.taxisLoaded + engine.taxisLoadedCount;
      let newPassengers = updatedStats.passengersServed + engine.passengersServedCount;

      // Level up checks
      let reqXp = getXpForNextLevel(newLevel);
      while (newXp >= reqXp) {
        newXp -= reqXp;
        newLevel++;
        reqXp = getXpForNextLevel(newLevel);
      }

      updatedStats = {
        ...updatedStats,
        money: newMoney,
        xp: newXp,
        level: newLevel,
        bestScore: Math.max(updatedStats.bestScore, engine.matchKz),
        taxisLoaded: newTaxisLoaded,
        passengersServed: newPassengers,
        maxCombo: Math.max(updatedStats.maxCombo, engine.combo),
        tutorialCompleted: isTutorial && isVictory ? true : updatedStats.tutorialCompleted,
      };

      savePlayerStats(updatedStats);
      setStats(updatedStats);

      storageManager.recordFinishedMatch(
        {
          id: `match_${Date.now()}`,
          timestamp: Date.now(),
          score: engine.matchKz,
          moneyEarned: totalEarnedKz,
          taxisLoaded: engine.taxisLoadedCount,
          passengersServed: engine.passengersServedCount,
          zoneId: activeLevel.chapter_id || stats.selectedMapId || 'cazenga',
          maxCombo: engine.combo,
        },
        updatedStats
      );

      const res: MatchResults = {
        taxisLoaded: engine.taxisLoadedCount,
        passengersServed: engine.passengersServedCount,
        maxCombo: engine.combo,
        earnedMoney: totalEarnedKz,
        earnedXp: totalEarnedXp,
        isNewRecord,
        duration,
        isTutorial,
        isVictory,
        levelId: activeLevel.level_number,
        levelNumber: activeLevel.level_number,
        levelTitle: activeLevel.level_title,
        zoneName: activeLevel.chapter_name,
        starsEarned: evalResult.stars,
        starsBreakdown: evalResult.starsBreakdown,
        isParagemDominada: evalResult.isParagemDominada,
        firstTimeClearBonus: evalResult.firstTimeClearBonus,
        failReason: evalResult.failReason,
        oldLevel,
        newLevel,
        levelUp: newLevel > oldLevel,
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

  const handleCallAction = useCallback(() => {
    engineRef.current?.triggerCallAction();
  }, []);

  const handleInteractAction = useCallback(() => {
    engineRef.current?.triggerInteractAction();
  }, []);

  const handleJoystickMove = useCallback((dir: { x: number; z: number }) => {
    if (engineRef.current) {
      engineRef.current.updateInputs(dir, engineRef.current.isRunning);
    }
  }, []);

  const handleRunToggle = useCallback((running: boolean) => {
    if (engineRef.current) {
      engineRef.current.updateInputs(engineRef.current.inputDir, running);
    }
  }, []);

  const handlePause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleOpenObjectives = useCallback(() => {
    setIsPaused(true);
    setActiveModal('MISSIONS');
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#f9f9ff] overflow-hidden select-none">
      {/* Universal Landscape Lock Overlay for Mobile Browsers */}
      <RotateDeviceOverlay isTouch={mobileEnv.isTouch} />

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
            engine={engineRef.current}
            levelObjectives={matchObjectives}
            onCallAction={handleCallAction}
            onInteractAction={handleInteractAction}
            onJoystickMove={handleJoystickMove}
            onRunToggle={handleRunToggle}
            onPause={handlePause}
            onOpenObjectives={handleOpenObjectives}
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
          onNextLevel={() => {
            const nextLvl = ALL_LEVELS_DATA.find(
              (l) => l.level_number === (matchResults.levelNumber || 1) + 1
            );
            if (nextLvl) {
              setActiveLevel(nextLvl);
              startMatch(false);
            } else {
              setScreen('MENU');
            }
          }}
          onOpenLevelMap={() => {
            setScreen('MENU');
            setActiveModal('MAPS');
          }}
        />
      )}

      {/* Asset Preloader Screen */}
      {isLoadingMatch && <LoadingScreen progress={loadingProgress} />}

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
        <div className="absolute inset-0 z-50">
          <LevelSelectionScreen
            levels={ALL_LEVELS_DATA.map((lvl) => ({
              ...lvl,
              unlocked: (stats.highestUnlockedLevel || 1) >= lvl.level_number,
              stars_earned: stats.levelStars?.[lvl.level_number] || 0,
              high_score: stats.levelHighScores?.[lvl.level_number] || 0,
              paragem_dominada: (stats.levelStars?.[lvl.level_number] || 0) === 3,
            }))}
            onSelectAndPlayLevel={(lvl) => {
              setActiveLevel(lvl);
              setActiveModal(null);
              startMatch(false);
            }}
            onClose={() => setActiveModal(null)}
          />
        </div>
      )}

      {activeModal === 'MISSIONS' && (
        <MissionsModal
          stats={stats}
          onUpdateStats={(newStats) => setStats(newStats)}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'SETTINGS' && (
        <SettingsModal
          onClose={() => setActiveModal(null)}
          onSettingsChange={(newSettings) => {
            setGameSettings(newSettings);
            if (engineRef.current) {
              engineRef.current.setGraphicsQuality(newSettings.graphicsQuality);
            }
          }}
        />
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

      {/* Runtime Performance Diagnostics & Quality Selector */}
      {gameSettings.showFpsOverlay && (
        <PerformanceOverlay
          engine={engineRef.current}
          onQualityChange={(q) => {
            const updated = { ...gameSettings, graphicsQuality: q };
            setGameSettings(updated);
            saveSettings(updated);
          }}
        />
      )}

      {/* Dev-Only Storage & Network Telemetry Diagnostics */}
      <DiagnosticOverlay
        fps={engineRef.current?.getFps() || 60}
        entityCount={
          engineRef.current?.getEntitiesCount() || {
            passengers: passengers.length,
            taxis: taxis.length,
            particles: 0,
          }
        }
        graphicsQuality={engineRef.current?.graphicsQuality || (mobileEnv.isLowEnd ? 'LOW' : 'MEDIUM')}
        lastSavedTime={storageManager.getLastSavedTime()}
      />
    </div>
  );
}
