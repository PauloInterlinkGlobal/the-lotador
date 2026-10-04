/**
 * LOTADOR — Gestor de Eventos Aleatórios da Paragem (ParagemEventManager)
 * 
 * Gere o ciclo de vida dos imprevistos e oportunidades urbanas de Luanda:
 * - Blitz do Fiscal
 * - Disputa de Troco Rápido
 * - Engarrafamento e subida de tarifas
 * - Chuva Tropical
 */

import { ParagemEvent, ParagemEventType } from '../types/events';

export class ParagemEventManager {
  private activeEvent: ParagemEvent | null = null;
  private cooldownTimer: number = 20; // 20s de carência inicial
  private onEventTriggered?: (evt: ParagemEvent) => void;
  private onEventResolved?: (evt: ParagemEvent, message: string) => void;

  constructor(
    onEventTriggered?: (evt: ParagemEvent) => void,
    onEventResolved?: (evt: ParagemEvent, message: string) => void
  ) {
    this.onEventTriggered = onEventTriggered;
    this.onEventResolved = onEventResolved;
  }

  public getActiveEvent(): ParagemEvent | null {
    return this.activeEvent;
  }

  public update(delta: number, isTutorial: boolean, levelNumber: number) {
    // Nunca gera eventos durante o tutorial nem no nível 1 para não sobrecarregar
    if (isTutorial || levelNumber <= 2) {
      return;
    }

    if (this.activeEvent) {
      this.activeEvent.remainingSeconds -= delta;
      if (this.activeEvent.remainingSeconds <= 0) {
        this.expireActiveEvent();
      }
      return;
    }

    this.cooldownTimer -= delta;
    if (this.cooldownTimer <= 0) {
      this.triggerRandomEvent(levelNumber);
      // Próximo evento entre 30 a 50 segundos
      this.cooldownTimer = 30 + Math.random() * 20;
    }
  }

  private triggerRandomEvent(levelNumber: number) {
    const candidates: ParagemEventType[] = ['ENGARRAFAMENTO', 'TROCO_COMPLICADO'];
    if (levelNumber >= 4) {
      candidates.push('CHUVA_TROPICAL');
    }
    if (levelNumber >= 6) {
      candidates.push('BLITZ_FISCAL');
    }

    const type = candidates[Math.floor(Math.random() * candidates.length)];
    let event: ParagemEvent;

    switch (type) {
      case 'ENGARRAFAMENTO':
        event = {
          id: `evt_${Date.now()}`,
          type: 'ENGARRAFAMENTO',
          title: '🚐 ENGARRAFAMENTO NA VIA!',
          description: 'Filas de trânsito na estrada! A procura subiu: ganho de +50% Kz por cada passageiro!',
          icon: 'traffic',
          durationSeconds: 18,
          remainingSeconds: 18,
          bonusMultiplier: 1.5,
        };
        break;

      case 'TROCO_COMPLICADO':
        event = {
          id: `evt_${Date.now()}`,
          type: 'TROCO_COMPLICADO',
          title: '💵 NOTA DE 5.000 KZ!',
          description: 'Passageiro entregou nota grande! Toca no botão DAR TROCO rápido para receber 200 Kz de gorjeta!',
          icon: 'payments',
          durationSeconds: 12,
          remainingSeconds: 12,
          extraData: {
            billAmount: 5000,
            changeRequired: 4700,
            reputationBonusXp: 40,
          },
        };
        break;

      case 'CHUVA_TROPICAL':
        event = {
          id: `evt_${Date.now()}`,
          type: 'CHUVA_TROPICAL',
          title: '🌧️ CHUVA EM LUANDA!',
          description: 'Caiu uma chuvada! Passageiros correm desesperados para as carrinhas!',
          icon: 'rainy',
          durationSeconds: 16,
          remainingSeconds: 16,
          bonusMultiplier: 1.25,
        };
        break;

      case 'BLITZ_FISCAL':
      default:
        event = {
          id: `evt_${Date.now()}`,
          type: 'BLITZ_FISCAL',
          title: '🚨 FISCALIZAÇÃO ATIVA!',
          description: 'O Fiscal está na paragem! Não corras nem cometas infrações para evitar multas de 100 Kz!',
          icon: 'local_police',
          durationSeconds: 15,
          remainingSeconds: 15,
          extraData: {
            penaltyKz: 100,
            reputationBonusXp: 60,
          },
        };
        break;
    }

    this.activeEvent = event;
    this.onEventTriggered?.(event);
  }

  public resolveChangeMinigame(): { rewardKz: number; rewardXp: number; message: string } | null {
    if (this.activeEvent?.type !== 'TROCO_COMPLICADO') return null;

    const rewardKz = 200;
    const rewardXp = this.activeEvent.extraData?.reputationBonusXp || 35;
    const msg = `Troco entregue com rapidez! +${rewardKz} Kz de gorjeta e +${rewardXp} XP!`;

    this.activeEvent.resolved = true;
    this.onEventResolved?.(this.activeEvent, msg);
    this.activeEvent = null;

    return { rewardKz, rewardXp, message: msg };
  }

  private expireActiveEvent() {
    if (!this.activeEvent) return;
    const current = this.activeEvent;
    this.activeEvent = null;

    if (current.type === 'BLITZ_FISCAL') {
      this.onEventResolved?.(current, 'Operação terminada sem infrações! +50 XP de reputação!');
    } else if (current.type === 'ENGARRAFAMENTO') {
      this.onEventResolved?.(current, 'O trânsito aliviou: tarifas voltaram ao normal.');
    } else if (current.type === 'CHUVA_TROPICAL') {
      this.onEventResolved?.(current, 'A chuva parou: ritmo da paragem normalizado.');
    } else {
      this.onEventResolved?.(current, 'O passageiro guardou o troco.');
    }
  }

  public clear() {
    this.activeEvent = null;
    this.cooldownTimer = 20;
  }
}
