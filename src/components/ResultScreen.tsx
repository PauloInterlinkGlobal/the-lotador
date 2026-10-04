/**
 * LOTADOR Match Result Screen
 * Roteador modular que delega a renderização para VictoryScreen ou GameOverScreen
 */

import React from 'react';
import { MatchResults } from '../types/game';
import { VictoryScreen } from './VictoryScreen';
import { GameOverScreen } from './GameOverScreen';

export { VictoryScreen } from './VictoryScreen';
export { GameOverScreen } from './GameOverScreen';

interface ResultScreenProps {
  results: MatchResults;
  onPlayAgain: () => void;
  onContinue: () => void;
  onNextLevel?: () => void;
  onOpenLevelMap?: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  results,
  onPlayAgain,
  onContinue,
  onNextLevel,
  onOpenLevelMap,
}) => {
  const isVictory = results.isVictory !== false;

  if (isVictory) {
    return (
      <VictoryScreen
        results={results}
        onNextLevel={onNextLevel}
        onPlayAgain={onPlayAgain}
        onContinue={onContinue}
        onOpenLevelMap={onOpenLevelMap}
      />
    );
  }

  return (
    <GameOverScreen
      results={results}
      onRetry={onPlayAgain}
      onContinue={onContinue}
      onOpenLevelMap={onOpenLevelMap}
    />
  );
};
