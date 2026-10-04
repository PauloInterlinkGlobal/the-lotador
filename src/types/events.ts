/**
 * LOTADOR — Tipos e Definições de Eventos Aleatórios da Paragem
 * Simulação de eventos culturais e dinâmicos de Luanda
 */

export type ParagemEventType =
  | 'BLITZ_FISCAL'       // Fiscalização na rotunda / apito do fiscal
  | 'TROCO_COMPLICADO'   // Passageiro paga com nota de 5.000 Kz e pede troco rápido
  | 'ENGARRAFAMENTO'     // Trânsito pesado / aumento temporário de tarifas (+50% Kz)
  | 'CHUVA_TROPICAL';    // Chuva repentina em Luanda / passageiros aceleram para embarcar

export interface ParagemEvent {
  id: string;
  type: ParagemEventType;
  title: string;
  description: string;
  icon: string;
  durationSeconds: number;
  remainingSeconds: number;
  bonusMultiplier?: number;
  resolved?: boolean;
  extraData?: {
    billAmount?: number;
    changeRequired?: number;
    penaltyKz?: number;
    reputationBonusXp?: number;
  };
}
