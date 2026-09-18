/**
 * O LOTADOR — Ecrã de Seleção de Fases (Level Selection Screen)
 * Agrupado por 6 Capítulos/Bairros de Luanda.
 * Estética retro pixel art, paleta terrosa (areia, asfalto, terracota)
 * com painéis de UI translúcidos azul-marinho/escuro.
 */

import React, { useState } from 'react';
import {
  LevelData,
  SAMPLE_LEVELS_DATA,
  CHAPTERS_LIST,
  getObjectiveVisuals,
} from '../types/levelObjectives';
import { InGameObjectivesHUD } from './InGameObjectivesHUD';
import { soundManager } from '../utils/audio';

interface LevelSelectionScreenProps {
  levels?: LevelData[];
  onSelectAndPlayLevel?: (level: LevelData) => void;
  onClose?: () => void;
}

export const LevelSelectionScreen: React.FC<LevelSelectionScreenProps> = ({
  levels = SAMPLE_LEVELS_DATA,
  onSelectAndPlayLevel,
  onClose,
}) => {
  // Current active chapter filter
  const [selectedChapterId, setSelectedChapterId] = useState<string>('cazenga');

  // Selected level for inspection / playing
  const [selectedLevelNumber, setSelectedLevelNumber] = useState<number>(1);

  // HUD Testing Sandbox mode toggle (allows user to test the in-game HUD with 1, 2, 3, 4 objectives)
  const [showHudSandbox, setShowHudSandbox] = useState<boolean>(false);
  const [sandboxObjectivesCount, setSandboxObjectivesCount] = useState<1 | 2 | 3 | 4>(2);
  const [editableLevels, setEditableLevels] = useState<LevelData[]>(levels);

  const selectedLevel =
    editableLevels.find((l) => l.level_number === selectedLevelNumber) ||
    editableLevels[0];

  const currentChapter =
    CHAPTERS_LIST.find((c) => c.id === selectedChapterId) || CHAPTERS_LIST[0];

  const filteredLevels = editableLevels.filter(
    (l) => l.chapter_id === selectedChapterId
  );

  const handleLevelClick = (level: LevelData) => {
    if (!level.unlocked) {
      soundManager.playHorn();
      return;
    }
    soundManager.playClick();
    setSelectedLevelNumber(level.level_number);
  };

  const handlePlay = () => {
    soundManager.playCoin();
    if (onSelectAndPlayLevel) {
      onSelectAndPlayLevel(selectedLevel);
    }
  };

  // Toggle objective completed status in sandbox mode
  const handleToggleSandboxObjective = (index: number) => {
    soundManager.playCoin();
    setEditableLevels((prev) =>
      prev.map((lvl) => {
        if (lvl.level_number === selectedLevel.level_number) {
          const updatedObjs = [...lvl.objectives];
          if (updatedObjs[index]) {
            const current = updatedObjs[index];
            const willComplete = !current.completed;
            updatedObjs[index] = {
              ...current,
              completed: willComplete,
              current_value: willComplete ? current.target_value : Math.floor(current.target_value * 0.5),
            };
          }
          return { ...lvl, objectives: updatedObjs };
        }
        return lvl;
      })
    );
  };

  return (
    <div className="relative w-full h-screen bg-[#241a15] text-slate-100 flex flex-col justify-between select-none overflow-hidden font-work">
      {/* ─────────────────────────────────────────────────────────────
          EARTHY PIXEL ART / RETRO STREET SCENERY BACKGROUND
          Luanda dusty street aesthetic, terra-cotta, pavement & retro grid
          ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {/* Subtle retro road lines & sand texture */}
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(212, 163, 115, 0.15) 0%, transparent 80%),
              linear-gradient(to right, rgba(0,0,0,0.4) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.4) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 24px 24px, 24px 24px',
          }}
        />
      </div>

      {/* Decorative Candongueiro Silhouette / City Skyline */}
      <div className="absolute bottom-0 inset-x-0 h-28 opacity-10 pointer-events-none flex justify-between items-end px-12">
        <span className="material-symbols-outlined text-[140px] text-[#ffd700]">
          location_city
        </span>
        <span className="material-symbols-outlined text-[120px] text-[#00b4d8]">
          airport_shuttle
        </span>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TOP BAR: HEADER & VIEW SWITCHER
          ───────────────────────────────────────────────────────────── */}
      <header className="relative z-20 flex justify-between items-center px-4 py-2 bg-[#161c28]/95 border-b-2 border-[#161c28] shadow-lg backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#ffd700] border-2 border-[#161c28] flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-[#161c28] text-xl font-black">
              map
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-anybody font-black text-base md:text-xl text-white tracking-wide uppercase">
                O LOTADOR • MAPA DE FASES
              </h1>
              <span className="bg-[#fe6b00] text-white text-[9px] font-space font-black px-2 py-0.5 rounded-full border border-black/30 uppercase tracking-widest hidden sm:inline">
                LUANDA 6 BAIRROS
              </span>
            </div>
            <p className="text-[10px] md:text-xs text-slate-400 font-work">
              Seleciona o teu bairro e conquista a liderança das paragens!
            </p>
          </div>
        </div>

        {/* View Switcher / HUD Sandbox Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              setShowHudSandbox(!showHudSandbox);
            }}
            className={`px-3 py-1.5 rounded-xl border-2 border-[#161c28] font-space font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
              showHudSandbox
                ? 'bg-[#2e7d32] text-white ring-2 ring-[#4caf50]'
                : 'bg-[#ffd700] hover:bg-[#ffe16d] text-[#161c28]'
            }`}
            title="Alternar entre Seleção de Fases e Teste do HUD"
          >
            <span className="material-symbols-outlined text-sm">
              {showHudSandbox ? 'dashboard' : 'speed'}
            </span>
            <span className="uppercase text-[11px] font-black">
              {showHudSandbox ? 'Voltar ao Mapa' : 'Testar HUD Objetivos'}
            </span>
          </button>

          {onClose && (
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center font-bold text-sm cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          HUD TEST SANDBOX MODAL / VIEW (When user wants to test HUD behavior)
          Demonstrates 1 objective (tutorial) up to 4 objectives (advanced)
          ───────────────────────────────────────────────────────────── */}
      {showHudSandbox ? (
        <main className="relative z-10 flex-1 flex flex-col items-center justify-between p-4 overflow-y-auto">
          {/* Top Simulated Game Screen Context */}
          <div className="w-full max-w-4xl bg-[#0f141f] rounded-2xl border-2 border-[#161c28] shadow-2xl p-4 flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-2 left-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-space font-black text-slate-400 uppercase tracking-wider">
                SIMULAÇÃO DE ECRÃ DE JOGO EM DIRETO
              </span>
            </div>

            {/* In-Game HUD Mounted in its real in-game position (Top Center) */}
            <div className="w-full mt-6 mb-6 flex flex-col items-center">
              <div className="text-center mb-1.5">
                <span className="text-[10px] font-space text-amber-300 font-bold bg-[#161c28]/90 px-2 py-0.5 rounded-full border border-amber-400/30">
                  HUD DE OBJETIVOS (Topo do ecrã • Clica num card para alternar "Concluído")
                </span>
              </div>

              {/* LIVE HUD COMPONENT */}
              <div className="w-full flex justify-center py-1">
                <InGameObjectivesHUD
                  objectives={selectedLevel.objectives.slice(0, sandboxObjectivesCount)}
                  onToggleObjective={handleToggleSandboxObjective}
                  isInteractivePreview={true}
                />
              </div>
            </div>

            {/* Mock Street Action Background */}
            <div className="w-full h-36 bg-gradient-to-b from-[#3a281e] to-[#241a15] rounded-xl border border-white/10 flex items-center justify-around px-6 text-slate-400 relative overflow-hidden">
              <div className="absolute bottom-2 inset-x-0 h-4 bg-[#1f1612] border-t-2 border-dashed border-white/20" />
              <div className="flex flex-col items-center z-10">
                <span className="material-symbols-outlined text-4xl text-[#00b4d8] animate-bounce">
                  airport_shuttle
                </span>
                <span className="text-[9px] font-space text-slate-300 font-bold">
                  Paragem Central
                </span>
              </div>
              <div className="flex flex-col items-center z-10">
                <span className="material-symbols-outlined text-4xl text-[#ffd700]">
                  directions_walk
                </span>
                <span className="text-[9px] font-space text-slate-300 font-bold">
                  Nelo (Lotador)
                </span>
              </div>
              <div className="flex flex-col items-center z-10">
                <span className="material-symbols-outlined text-4xl text-[#ff5252]">
                  record_voice_over
                </span>
                <span className="text-[9px] font-space text-slate-300 font-bold">
                  Kito (Rival)
                </span>
              </div>
            </div>
          </div>

          {/* Sandbox Controls Bar */}
          <div className="w-full max-w-4xl bg-[#161c28]/95 rounded-2xl border-2 border-[#ffd700]/50 p-3 mt-3 shadow-lg flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-space font-black text-xs text-white uppercase">
                Quantidade de Objetivos Ativos:
              </span>
              <div className="flex items-center gap-1.5">
                {([1, 2, 3, 4] as const).map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      soundManager.playClick();
                      setSandboxObjectivesCount(num);
                    }}
                    className={`w-8 h-8 rounded-xl font-space font-black text-xs border-2 transition-all cursor-pointer ${
                      sandboxObjectivesCount === num
                        ? 'bg-[#fe6b00] text-white border-white scale-110 shadow-md'
                        : 'bg-white/10 text-slate-300 border-transparent hover:bg-white/20'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-right">
              <p className="text-[11px] text-slate-300 font-work">
                {sandboxObjectivesCount === 1 && '🟢 Caso Tutorial: 1 objetivo amplo e centrado.'}
                {sandboxObjectivesCount === 2 && '🟡 Caso Inicial: 2 objetivos equilibrados.'}
                {sandboxObjectivesCount === 3 && '🟠 Caso Intermédio: 3 objetivos com rival ativo.'}
                {sandboxObjectivesCount === 4 && '🔴 Caso Extremo: 4 objetivos compactos sem sobreposição.'}
              </p>
            </div>
          </div>
        </main>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            MAIN LEVEL SELECTION SCREEN (2-COLUMN LANDSCAPE LAYOUT)
            [Left: Chapters & Levels Grid] | [Right: Selected Level Details Card]
            ───────────────────────────────────────────────────────────── */
        <main className="relative z-10 flex-1 flex flex-col md:flex-row gap-3 p-3 md:p-4 overflow-hidden">
          {/* LEFT COLUMN: CHAPTERS TABS + LEVELS CARDS */}
          <div className="flex-1 flex flex-col bg-[#161c28]/90 rounded-2xl border-2 border-[#161c28] shadow-xl p-3 md:p-4 overflow-hidden backdrop-blur-md">
            {/* Chapters Horizontal Scroll Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none shrink-0 mb-3">
              {CHAPTERS_LIST.map((chap, idx) => {
                const isActive = chap.id === selectedChapterId;
                return (
                  <button
                    key={chap.id}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedChapterId(chap.id);
                      // Select first level of that chapter if available
                      const firstInChap = editableLevels.find(
                        (l) => l.chapter_id === chap.id
                      );
                      if (firstInChap && firstInChap.unlocked) {
                        setSelectedLevelNumber(firstInChap.level_number);
                      }
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-[#fe6b00] border-white text-white shadow-lg scale-105'
                        : 'bg-white/10 hover:bg-white/20 border-white/15 text-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {chap.icon}
                    </span>
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] font-space uppercase tracking-wider text-amber-200">
                        Cap. {idx + 1}
                      </span>
                      <span className="text-xs font-anybody font-black uppercase whitespace-nowrap">
                        {chap.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Chapter Header Banner */}
            <div
              className="p-2.5 rounded-xl mb-3 flex items-center justify-between border border-white/15"
              style={{
                backgroundColor: `${currentChapter.color}40`,
                borderColor: currentChapter.accentColor,
              }}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-2xl text-[#ffd700]">
                  {currentChapter.icon}
                </span>
                <div>
                  <h3 className="font-anybody font-black text-sm text-white uppercase">
                    {currentChapter.name}
                  </h3>
                  <p className="text-[10px] text-slate-300 font-work">
                    {currentChapter.subtitle}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-space font-bold bg-black/40 px-2.5 py-1 rounded-full text-slate-200">
                {filteredLevels.filter((l) => l.stars > 0).length}/{filteredLevels.length} Fases Concluídas
              </span>
            </div>

            {/* Levels Grid (Responsive for Mobile Landscape) */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {filteredLevels.map((lvl) => {
                const isSelected = lvl.level_number === selectedLevel.level_number;
                const isCompleted = lvl.stars > 0;
                const isLocked = !lvl.unlocked;

                return (
                  <div
                    key={lvl.level_number}
                    onClick={() => handleLevelClick(lvl)}
                    className={`relative p-2.5 rounded-xl border-2 flex flex-col justify-between transition-all duration-200 cursor-pointer select-none ${
                      isSelected
                        ? 'bg-[#233045] border-[#ffd700] ring-2 ring-[#ffd700]/70 scale-[1.02] shadow-xl'
                        : isLocked
                        ? 'bg-[#10141d]/70 border-white/10 opacity-50 grayscale'
                        : isCompleted
                        ? 'bg-[#161c28] hover:bg-[#1f2838] border-[#2e7d32]/80 shadow-md'
                        : 'bg-[#161c28] hover:bg-[#1f2838] border-white/20 shadow-sm'
                    }`}
                  >
                    {/* Top Row: Level Number + Difficulty Badge */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-6 h-6 rounded-lg font-space font-black text-xs flex items-center justify-center border ${
                            isSelected
                              ? 'bg-[#ffd700] text-[#161c28] border-black'
                              : isCompleted
                              ? 'bg-[#2e7d32] text-white border-white/20'
                              : 'bg-white/10 text-white border-white/20'
                          }`}
                        >
                          {lvl.level_number}
                        </span>
                        <span className="text-[11px] font-anybody font-bold text-white truncate max-w-[90px]">
                          {lvl.level_title}
                        </span>
                      </div>

                      {/* Locked Padlock or Status Icon */}
                      {isLocked ? (
                        <span className="material-symbols-outlined text-base text-slate-400">
                          lock
                        </span>
                      ) : (
                        <span
                          className={`text-[8px] font-space font-black px-1.5 py-0.5 rounded-sm uppercase ${
                            lvl.difficulty === 'FÁCIL'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : lvl.difficulty === 'MÉDIO'
                              ? 'bg-sky-950 text-sky-300 border border-sky-500/40'
                              : lvl.difficulty === 'DIFÍCIL'
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                              : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {lvl.difficulty}
                        </span>
                      )}
                    </div>

                    {/* Middle: PROGRESSIVE OBJECTIVES ICONS (Dense icon row that expands with chapter progress) */}
                    <div className="my-1.5 py-1 px-1.5 bg-black/40 rounded-lg border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {lvl.objectives.map((obj, i) => {
                          const vis = getObjectiveVisuals(obj.type);
                          return (
                            <span
                              key={i}
                              title={obj.description}
                              className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px] shadow-xs"
                            >
                              {vis.emoji}
                            </span>
                          );
                        })}
                        {lvl.rival_count > 0 && (
                          <span
                            title={`${lvl.rival_count} rival(is) em jogo`}
                            className="text-[9px] font-space font-black bg-red-900/60 text-red-300 px-1 rounded border border-red-500/40"
                          >
                            ⚔️{lvl.rival_count}
                          </span>
                        )}
                      </div>

                      <span className="text-[9px] font-mono text-slate-300 font-bold">
                        ⏱️{lvl.time_limit_seconds}s
                      </span>
                    </div>

                    {/* Bottom Row: 3 Stars Rating & Reward Kz */}
                    <div className="flex items-center justify-between pt-1 border-t border-white/10">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((starIdx) => (
                          <span
                            key={starIdx}
                            className={`text-xs ${
                              starIdx <= lvl.stars
                                ? 'text-[#ffd700]'
                                : 'text-slate-600'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>

                      <span className="text-[10px] font-space font-extrabold text-[#ffd700]">
                        +{lvl.reward_kz}{' '}
                        <span className="text-[8px] text-slate-400">Kz</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: SELECTED LEVEL DETAILS CARD & PLAY BUTTON */}
          <div className="w-full md:w-[320px] lg:w-[360px] flex flex-col justify-between bg-[#161c28]/95 rounded-2xl border-2 border-[#161c28] shadow-2xl p-4 backdrop-blur-md shrink-0">
            <div>
              {/* Level Title & Badges */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[10px] font-space font-black text-amber-400 uppercase tracking-wider">
                    {selectedLevel.chapter_name} • NÍVEL {selectedLevel.level_number}
                  </span>
                  <h2 className="font-anybody font-black text-lg text-white uppercase leading-tight">
                    {selectedLevel.level_title}
                  </h2>
                </div>

                <div className="flex items-center gap-0.5 bg-black/40 px-2 py-1 rounded-lg border border-white/10">
                  {[1, 2, 3].map((s) => (
                    <span
                      key={s}
                      className={`text-sm ${
                        s <= selectedLevel.stars ? 'text-[#ffd700]' : 'text-slate-600'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 font-work leading-relaxed mb-3 bg-white/5 p-2 rounded-xl border border-white/10">
                "{selectedLevel.description}"
              </p>

              {/* Objectives List Box */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-space font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-[#00b4d8]">
                      checklist
                    </span>
                    Objetivos da Fase ({selectedLevel.objectives.length})
                  </span>
                  <span className="text-[9px] font-space text-slate-400">
                    Meta para 3 Estrelas
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {selectedLevel.objectives.map((obj, i) => {
                    const vis = getObjectiveVisuals(obj.type);
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/10 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm shrink-0">{vis.emoji}</span>
                          <span className="font-work text-slate-200 text-[11px] truncate">
                            {obj.description}
                          </span>
                        </div>
                        <span className="font-space font-bold text-[10px] text-amber-300 shrink-0 ml-2">
                          {obj.current_value}/{obj.target_value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Match Details Specs: Time Limit, Rivals, Reward */}
              <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                <div className="bg-black/30 p-2 rounded-xl border border-white/10">
                  <span className="text-[9px] font-space text-slate-400 uppercase block">
                    Tempo
                  </span>
                  <span className="font-mono font-black text-xs text-white">
                    ⏱️ {selectedLevel.time_limit_seconds}s
                  </span>
                </div>

                <div className="bg-black/30 p-2 rounded-xl border border-white/10">
                  <span className="text-[9px] font-space text-slate-400 uppercase block">
                    Rivais IA
                  </span>
                  <span className="font-space font-black text-xs text-rose-400">
                    {selectedLevel.rival_count === 0 ? 'Nenhum' : `⚔️ ${selectedLevel.rival_count}`}
                  </span>
                </div>

                <div className="bg-black/30 p-2 rounded-xl border border-white/10">
                  <span className="text-[9px] font-space text-slate-400 uppercase block">
                    Recompensa
                  </span>
                  <span className="font-space font-black text-xs text-[#ffd700]">
                    +{selectedLevel.reward_kz} Kz
                  </span>
                </div>
              </div>
            </div>

            {/* Big Action Button "JOGAR" */}
            <button
              onClick={handlePlay}
              disabled={!selectedLevel.unlocked}
              className={`w-full py-3 rounded-2xl border-2 border-[#161c28] font-anybody font-black text-lg uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
                selectedLevel.unlocked
                  ? 'bg-[#ffd700] hover:bg-[#ffe16d] text-[#161c28] active:scale-95 ring-2 ring-[#ffd700]/50'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              {selectedLevel.unlocked ? (
                <>
                  <span className="material-symbols-outlined text-2xl font-black">
                    play_arrow
                  </span>
                  <span>JOGAR NÍVEL {selectedLevel.level_number}</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xl">lock</span>
                  <span>NÍVEL BLOQUEADO</span>
                </>
              )}
            </button>
          </div>
        </main>
      )}
    </div>
  );
};
