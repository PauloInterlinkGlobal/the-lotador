/**
 * PWA Storage Multi-Tier System for LOTADOR
 * 
 * - IndexedDB: Partidas salvas, histórico detalhado, saves grandes e fila offline.
 * - localStorage: Recorde, moedas, melhor pontuação e configurações.
 * - sessionStorage: Estado volátil da partida em curso.
 * - Cookies: Preferências leves de idioma/tema e carimbos de sessão.
 */

import { PlayerStats, GameSettings } from '../types/game';
import { loadPlayerStats, savePlayerStats } from '../utils/storage';

const DB_NAME = 'LOTADOR_OFFLINE_DB';
const DB_VERSION = 1;

export interface MatchRecord {
  id: string;
  timestamp: number;
  score: number;
  moneyEarned: number;
  taxisLoaded: number;
  passengersServed: number;
  zoneId: string;
  maxCombo: number;
}

export interface OfflineAction {
  id?: number;
  type: string;
  data: any;
  timestamp: number;
}

// ============================================================
// 1. INDEXEDDB WRAPPER (Promises Nativas sem dependências externas)
// ============================================================
class IndexedDBService {
  private db: IDBDatabase | null = null;
  private openingPromise: Promise<IDBDatabase> | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.openingPromise) return this.openingPromise;

    this.openingPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB não suportado neste ambiente.'));
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Store para histórico de partidas
        if (!db.objectStoreNames.contains('match_history')) {
          const store = db.createObjectStore('match_history', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store para backups de save completos
        if (!db.objectStoreNames.contains('player_saves')) {
          db.createObjectStore('player_saves', { keyPath: 'id' });
        }

        // Store para fila de sincronização offline
        if (!db.objectStoreNames.contains('offline_queue')) {
          db.createObjectStore('offline_queue', { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.openingPromise;
  }

  // Salvar uma partida no histórico IndexedDB
  async saveMatchRecord(record: MatchRecord): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('match_history', 'readwrite');
        const store = tx.objectStore('match_history');
        store.put(record);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('[IndexedDB] Erro ao salvar histórico:', e);
    }
  }

  // Obter histórico de partidas
  async getMatchHistory(limit = 20): Promise<MatchRecord[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('match_history', 'readonly');
        const store = tx.objectStore('match_history');
        const index = store.index('timestamp');
        const req = index.openCursor(null, 'prev');
        const records: MatchRecord[] = [];

        req.onsuccess = (e) => {
          const cursor = (e.target as IDBRequest).result;
          if (cursor && records.length < limit) {
            records.push(cursor.value);
            cursor.continue();
          } else {
            resolve(records);
          }
        };
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('[IndexedDB] Erro ao carregar histórico:', e);
      return [];
    }
  }

  // Backup seguro do save completo
  async backupPlayerStats(stats: PlayerStats): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('player_saves', 'readwrite');
        const store = tx.objectStore('player_saves');
        store.put({ id: 'current_backup', stats, updatedAt: Date.now() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('[IndexedDB] Erro no backup:', e);
    }
  }

  // Enfileirar ação executada offline
  async queueOfflineAction(action: { type: string; data: any }): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('offline_queue', 'readwrite');
        const store = tx.objectStore('offline_queue');
        store.add({ ...action, timestamp: Date.now() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('[IndexedDB] Erro ao enfileirar ação offline:', e);
    }
  }
}

export const indexedDBService = new IndexedDBService();

// ============================================================
// 2. SESSIONSTORAGE (Estado Volátil da Partida Atual)
// ============================================================
export interface CurrentMatchSession {
  activeZoneId: string;
  currentCombo: number;
  currentScore: number;
  timeRemaining: number;
  startTime: number;
}

export const sessionGameStorage = {
  saveCurrentMatch(data: CurrentMatchSession): void {
    try {
      sessionStorage.setItem('LOTADOR_ACTIVE_MATCH', JSON.stringify(data));
    } catch (e) {
      console.warn('[SessionStorage] Erro ao salvar partida ativa:', e);
    }
  },

  getCurrentMatch(): CurrentMatchSession | null {
    try {
      const raw = sessionStorage.getItem('LOTADOR_ACTIVE_MATCH');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  clearCurrentMatch(): void {
    try {
      sessionStorage.removeItem('LOTADOR_ACTIVE_MATCH');
    } catch (e) {
      console.warn('[SessionStorage] Erro ao limpar:', e);
    }
  }
};

// ============================================================
// 3. COOKIES (Preferências de Idioma, Tema e Sessão)
// ============================================================
export const cookieStorage = {
  set(name: string, value: string, days = 365): void {
    try {
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    } catch (e) {
      console.warn('[Cookies] Erro ao definir cookie:', e);
    }
  },

  get(name: string): string | null {
    try {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    } catch {
      return null;
    }
  }
};

// ============================================================
// 4. STORAGE MANAGER UNIFICADO
// ============================================================
export const storageManager = {
  // Gravação sincronizada (localStorage para acesso rápido + IndexedDB para redundância)
  async saveAll(stats: PlayerStats, settings?: GameSettings): Promise<void> {
    // 1. Salva no localStorage síncrono
    savePlayerStats(stats);

    // 2. Salva no IndexedDB de forma resiliente
    await indexedDBService.backupPlayerStats(stats);

    // 3. Persistência de preferências em cookies se aplicável
    if (settings) {
      cookieStorage.set('lotador_lang', settings.language || 'PT');
      cookieStorage.set('lotador_quality', settings.graphicsQuality || 'MEDIUM');
    }
  },

  // Registro de partida completa
  async recordFinishedMatch(record: MatchRecord, currentStats: PlayerStats): Promise<void> {
    // Gravar no histórico IndexedDB
    await indexedDBService.saveMatchRecord(record);

    // Atualizar stats gerais
    await this.saveAll(currentStats);

    // Limpar sessão temporária
    sessionGameStorage.clearCurrentMatch();
  },

  // Pedir armazenamento persistente ao navegador (evita evicção de dados pelo OS)
  async requestPersistentStorage(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persist();
      console.log(`[PWA Storage] Armazenamento persistente: ${isPersisted ? 'Ativo' : 'Padrão'}`);
      return isPersisted;
    }
    return false;
  }
};
