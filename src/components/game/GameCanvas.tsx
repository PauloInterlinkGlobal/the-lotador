/**
 * LOTADOR GameCanvas (game folder component and re-export)
 */

import React from 'react';
import { WorldSpaceCanvas } from '../WorldSpaceCanvas';
import { MatchResults } from '../../types/game';

interface GameCanvasProps {
  onMatchComplete?: (results: MatchResults) => void;
  [key: string]: any;
}

export const GameCanvas: React.FC<GameCanvasProps> = (props) => {
  return <WorldSpaceCanvas {...(props as any)} />;
};

export default GameCanvas;
export { WorldSpaceCanvas };
