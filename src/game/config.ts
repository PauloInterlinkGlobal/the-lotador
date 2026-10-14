/**
 * LOTADOR - Configurações Gerais do Jogo e Recompensas de Nível
 */

export const LEVEL_UP_REWARD = {
  BASE_KZ_PER_LEVEL: 250, // 250 Kz * novo nível
  BASE_XP_PER_LEVEL: 150, // 150 XP * novo nível
  SKILL_POINTS_PER_LEVEL: 1, // +1 ponto de habilidade
};

export interface LevelUpRewardCalculation {
  bonusKz: number;
  bonusXp: number;
  skillPoints: number;
}

/**
 * Calcula os bónus de subida de nível proporcionais ao novo nível alcançado
 */
export function calculateLevelUpRewards(newLevel: number): LevelUpRewardCalculation {
  const safeLevel = Math.max(1, newLevel);
  return {
    bonusKz: LEVEL_UP_REWARD.BASE_KZ_PER_LEVEL * safeLevel,
    bonusXp: LEVEL_UP_REWARD.BASE_XP_PER_LEVEL * safeLevel,
    skillPoints: LEVEL_UP_REWARD.SKILL_POINTS_PER_LEVEL,
  };
}
