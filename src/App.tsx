/**
 * LOTADOR - Main Application Controller
 */

import React, { useState, useEffect, useRef } from 'react';
import { PlayerStats, MatchResults, Taxi, Passenger } from './types/game';
import { loadPlayerStats, savePlayerStats, getXpForNextLevel } from './utils/storage';
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

type AppScreen = 'MENU' | 'GAME' | 'RESULT';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('MENU');
  const [stats, setStats] = useState<PlayerStats>(loadPlayerStats());

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

  // Results State
  const [matchResults, setMatchResults] = useState<MatchResults | null>(null);

  // Modals
  const [activeModal, setActiveModal] = useState<
    'UPGRADES' | 'CHARACTER' | 'MAPS' | 'MISSIONS' | 'SETTINGS' | 'MENTOR' | null
  >(null);

  // Match Timer Interval
  useEffect(() => {
    let timer: any = null;
    if (screen === 'GAME' && timerSeconds > 0) {
      timer = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            endMatch();
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
  }, [screen, timerSeconds]);

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

  const startMatch = () => {
    soundManager.playClick();
    setMatchKz(0);
    setMatchXp(0);
    setMatchCombo(1);
    setTimerSeconds(180);
    setIsRushHour(false);
    setScreen('GAME');

    soundManager.startBackgroundRhythm(false);

    // Initialize 3D Game Engine after canvas mount
    setTimeout(() => {
      if (canvasContainerRef.current) {
        engineRef.current = new GameEngine(canvasContainerRef.current, stats, {
          onScoreUpdate: (kz, xp, combo) => {
            setMatchKz(kz);
            setMatchXp(xp);
            setMatchCombo(combo);
          },
          onTaxiLoaded: (taxi, reward, xp) => {
            // Check for rush hour condition
            if (engineRef.current && engineRef.current.taxisLoadedCount >= 5 && !isRushHour) {
              engineRef.current.toggleRushHour(true);
            }
          },
          onFloatingText: (text, color, pos) => {},
          onRushHourState: (isRush) => setIsRushHour(isRush),
          onStaminaChange: (cur, max) => {
            setStamina(cur);
            setMaxStamina(max);
          },
          onPassengerServedCount: (count) => {},
        });
      }
    }, 100);
  };

  const endMatch = () => {
    if (engineRef.current) {
      const engine = engineRef.current;
      const isNewRecord = engine.matchKz > stats.bestScore;

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
      };

      savePlayerStats(updatedStats);
      setStats(updatedStats);

      const res: MatchResults = {
        taxisLoaded: engine.taxisLoadedCount,
        passengersServed: engine.passengersServedCount,
        maxCombo: engine.combo,
        earnedMoney: engine.matchKz,
        earnedXp: engine.matchXp,
        isNewRecord,
        duration: 180 - timerSeconds,
      };

      setMatchResults(res);
      engine.destroy();
      engineRef.current = null;
    }

    soundManager.stopBackgroundRhythm();
    setScreen('RESULT');
  };

  return (
    <div className="relative w-full h-screen bg-[#f9f9ff] overflow-hidden select-none">
      {/* Main Menu Screen */}
      {screen === 'MENU' && (
        <MainMenu
          stats={stats}
          onStartGame={startMatch}
          onOpenUpgrades={() => setActiveModal('UPGRADES')}
          onOpenCharacter={() => setActiveModal('CHARACTER')}
          onOpenMaps={() => setActiveModal('MAPS')}
          onOpenMissions={() => setActiveModal('MISSIONS')}
          onOpenSettings={() => setActiveModal('SETTINGS')}
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
          />
        </div>
      )}

      {/* Result Screen */}
      {screen === 'RESULT' && matchResults && (
        <ResultScreen
          results={matchResults}
          onPlayAgain={startMatch}
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
    </div>
  );
}
