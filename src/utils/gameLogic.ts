import { Passenger, Taxi, RouteType } from '../types/game';

/**
 * Checks whether a passenger can follow the lotador based on destination compatibility
 * with taxis currently present at the paragem (stop).
 * 
 * Rules:
 * 1. A passenger only agrees to follow if there is at least one active taxi at the stop
 *    with a matching destination (taxi.route === passenger.destination).
 * 2. The taxi must be in an active waiting or loading state (WAITING | LOADING).
 * 3. The taxi must have vacancy (currentPassengers < capacity).
 */
export function canPassengerFollow(
  passenger: Passenger,
  availableTaxis: Taxi[]
): { canFollow: boolean; matchingTaxi: Taxi | null; reason?: string } {
  const matching = availableTaxis.find(
    (taxi) =>
      taxi.route === passenger.destination &&
      (taxi.state === 'WAITING' || taxi.state === 'LOADING') &&
      taxi.currentPassengers < taxi.capacity
  );

  if (!matching) {
    return {
      canFollow: false,
      matchingTaxi: null,
      reason: `Sem táxi disponível para ${passenger.destination}`,
    };
  }

  return {
    canFollow: true,
    matchingTaxi: matching,
  };
}

/**
 * Validates if the lotador can board a followed passenger into a specific taxi.
 */
export function canBoardPassenger(
  passenger: Passenger,
  taxi: Taxi,
  distance: number,
  maxDistance: number = 4.2
): boolean {
  if (passenger.destination !== taxi.route) return false;
  if (taxi.currentPassengers >= taxi.capacity) return false;
  if (taxi.state !== 'WAITING' && taxi.state !== 'LOADING') return false;
  return distance <= maxDistance;
}

/**
 * Helper to get user-friendly label and color token for any route.
 */
export function getRouteTheme(route: RouteType): {
  label: string;
  colorHex: string;
  borderColor: string;
  textColor: string;
} {
  switch (route) {
    case 'VIANA':
      return {
        label: 'VIANA',
        colorHex: '#f59e0b',
        borderColor: 'border-amber-400',
        textColor: 'text-amber-300',
      };
    case 'GOLFE 2':
      return {
        label: 'GOLFE 2',
        colorHex: '#a855f7',
        borderColor: 'border-purple-400',
        textColor: 'text-purple-300',
      };
    case 'TALATONA':
      return {
        label: 'TALATONA',
        colorHex: '#00d2ff',
        borderColor: 'border-cyan-400',
        textColor: 'text-cyan-300',
      };
    case 'CENTRO':
      return {
        label: 'CENTRO',
        colorHex: '#10b981',
        borderColor: 'border-emerald-400',
        textColor: 'text-emerald-300',
      };
    case 'CACUACO':
      return {
        label: 'CACUACO',
        colorHex: '#ff6b00',
        borderColor: 'border-orange-500',
        textColor: 'text-orange-300',
      };
    case 'CAMAMA':
      return {
        label: 'CAMAMA',
        colorHex: '#3b82f6',
        borderColor: 'border-blue-400',
        textColor: 'text-blue-300',
      };
    default:
      return {
        label: route,
        colorHex: '#ffd700',
        borderColor: 'border-yellow-400',
        textColor: 'text-yellow-300',
      };
  }
}
