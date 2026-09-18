/**
 * O LOTADOR — HUD de Objetivos Durante o Jogo
 * Exibido no topo do ecrã de jogo sem tapar a ação central.
 * Suporta de 1 objetivo (fase tutorial) até 4 objetivos (fases avançadas).
 */

import React from 'react';
import { LevelObjective, getObjectiveVisuals } from '../types/levelObjectives';

interface InGameObjectivesHUDProps {
  objectives: LevelObjective[];
  onToggleObjective?: (index: number) => void;
  isInteractivePreview?: boolean;
}

export const InGameObjectivesHUD: React.FC<InGameObjectivesHUDProps> = ({
  objectives,
  onToggleObjective,
  isInteractivePreview = false,
}) => {
  if (!objectives || objectives.length === 0) return null;

  return (
    <div
      className="flex items-center justify-center gap-1.5 md:gap-2 px-1 py-0.5 max-w-full overflow-x-auto select-none pointer-events-auto"
      style={{
        // Safe spacing so it sits comfortably between top-left (energy) and top-right (money/timer)
        maxWidth: 'min(96vw, 680px)',
      }}
    >
      {objectives.slice(0, 4).map((obj, index) => {
        const visual = getObjectiveVisuals(obj.type);
        const percent = Math.min(100, Math.round((obj.current_value / Math.max(1, obj.target_value)) * 100));
        const isComplete = obj.completed || obj.current_value >= obj.target_value;

        // Custom short text based on objective type
        let valueText = `${obj.current_value}/${obj.target_value}`;
        if (obj.type === 'MONEY_EARNED') {
          valueText = `${obj.current_value}/${obj.target_value} Kz`;
        } else if (obj.type === 'NO_COLLISIONS') {
          valueText = isComplete ? '0 Batidas' : 'Penalizado';
        } else if (obj.type === 'BEAT_RIVAL') {
          valueText = isComplete ? 'Liderança!' : `${obj.current_value}/${obj.target_value} Rivais`;
        }

        return (
          <div
            key={`${obj.type}-${index}`}
            onClick={() => onToggleObjective && onToggleObjective(index)}
            title={`${obj.description} (${isInteractivePreview ? 'Clica para alternar estado' : ''})`}
            className={`group relative flex flex-col justify-between rounded-xl px-2 py-1 md:px-2.5 md:py-1.5 transition-all duration-300 border backdrop-blur-md shadow-md ${
              isInteractivePreview ? 'cursor-pointer hover:scale-[1.03]' : ''
            } ${
              // Responsive width adapting smoothly from 1 up to 4 objectives
              objectives.length === 1
                ? 'w-[clamp(180px,36vw,240px)]'
                : objectives.length === 2
                ? 'w-[clamp(130px,26vw,170px)]'
                : objectives.length === 3
                ? 'w-[clamp(110px,20vw,145px)]'
                : 'w-[clamp(95px,17vw,135px)]'
            } ${
              isComplete
                ? 'completed bg-[#0f2e1b]/90 border-[#2e7d32] text-white ring-1 ring-[#4caf50]/60'
                : 'bg-[#161c28]/85 border-white/15 text-slate-200 hover:border-white/30'
            }`}
          >
            {/* Header: Icon + Short Description */}
            <div className="flex items-center justify-between gap-1 w-full leading-none mb-1">
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-xs md:text-sm shrink-0 leading-none select-none">
                  {visual.emoji}
                </span>
                <span
                  className={`text-[9px] md:text-[10px] font-space font-bold truncate ${
                    isComplete ? 'text-[#a7f3d0] line-through decoration-[#4caf50]' : 'text-white'
                  }`}
                >
                  {obj.type === 'PASSENGERS_DELIVERED' && 'Passageiros'}
                  {obj.type === 'SPECIFIC_DESTINATION' && 'Destino'}
                  {obj.type === 'MONEY_EARNED' && 'Ganhos'}
                  {obj.type === 'FULL_CAPACITY_TRIPS' && 'Lotados'}
                  {obj.type === 'BEAT_RIVAL' && 'Rivais'}
                  {obj.type === 'NO_COLLISIONS' && 'Cuidado'}
                </span>
              </div>

              {/* Status Badge / Checkmark */}
              {isComplete ? (
                <span className="shrink-0 w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-[#2e7d32] border border-[#a7f3d0] text-white flex items-center justify-center text-[9px] font-black shadow-xs">
                  ✓
                </span>
              ) : (
                <span className="shrink-0 text-[8px] md:text-[9px] font-space font-bold tabular-nums text-slate-300">
                  {valueText}
                </span>
              )}
            </div>

            {/* Mini Progress Bar with Animation Slot */}
            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/10 relative">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isComplete
                    ? 'bg-gradient-to-r from-[#22c55e] to-[#4ade80]'
                    : percent > 65
                    ? 'bg-gradient-to-r from-[#fe6b00] to-[#ffd700]'
                    : 'bg-gradient-to-r from-[#00b4d8] to-[#0077b6]'
                }`}
                style={{ width: `${isComplete ? 100 : percent}%` }}
              />
            </div>

            {/* Sub-label for single/dual layout to give more context */}
            {objectives.length <= 2 && (
              <div className="mt-1 flex justify-between items-center text-[8px] font-work text-slate-300 truncate">
                <span className="truncate">{obj.description}</span>
                {isComplete && (
                  <span className="font-space font-black text-[#4caf50] uppercase ml-1">FEITO!</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
