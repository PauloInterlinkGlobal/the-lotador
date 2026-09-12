/**
 * PWA & Native Capacitor Storage Multi-Tier System for LOTADOR
 * 
 * - Capacitor Preferences (@capacitor/preferences): Armazenamento nativo seguro (iOS/Android) imune a limpezas de cache do OS.
 * - IndexedDB: Armazenamento persistente primário para navegadores Web / PWA.
 * - localStorage: Armazenamento síncrono para inicialização instantânea do jogo.
 * - sessionStorage: Estado volátil da partida em curso.
 * - Cookies: Preferências leves de idioma/tema e carimbos de sessão.
 */

import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { PlayerStats, GameSettings } from '../types/game';
import { loadPlayerStats, savePlayerStats, DEFAULT_PLAYER_STATS, DEFAULT_SETTINGS } from '../utils/storage';

const DB_NAME = 'LOTADOR_OFFLINE_DB';
const DB_VERSION = 2;
const SAVE_KEY = 'LOTADOR_SAVE_V1';
const SETTINGS_KEY = 'LOTADOR_SETTINGS_V1';

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
// 1. HYBRID STORAGE ADAPTER (Capacitor Native vs Web IndexedDB)
// ============================================================
export class StorageAdapter {
  private static isNative = Capacitor.isNativePlatform();

  /**
   * Salva chave/valor de forma resiliente
   */
  static async setItem(key: string, value: string): Promise<void> {
    // Sempre mantém cópia no localStorage para boot síncrono rápido
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('[StorageAdapter] Falha ao escrever no localStorage:', e);
    }

    if (this.isNative) {
      try {
        await Preferences.set({ key, value });
        return;
      } catch (e) {
        console.warn('[StorageAdapter] Falha no Capacitor Preferences, usando fallback:', e);
      }
    }

    // Se for Web / PWA, sincroniza no IndexedDB
    try {
      await indexedDBService.setKeyValue(key, value);
    } catch (e) {
      console.warn('[StorageAdapter] Falha no IndexedDB setKeyValue:', e);
    }
  }

  /**
   * Lê chave/valor de forma resiliente
   */
  static async getItem(key: string): Promise<string | null> {
    if (this.isNative) {
      try {
        const res = await Preferences.get({ key });
        if (res && res.value !== null) {
          // Atualiza localStorage como cache quente
          try { localStorage.setItem(key, res.value); } catch {}
          return res.value;
        }
      } catch (e) {
        console.warn('[StorageAdapter] Falha ao ler do Capacitor Preferences:', e);
      }
    }

    // Tenta IndexedDB no ambiente Web
    try {
      const idbVal = await indexedDBService.getKeyValue(key);
      if (idbVal !== null) {
        try { localStorage.setItem(key, idbVal); } catch {}
        return idbVal;
      }
    } catch (e) {
      console.warn('[StorageAdapter] Falha ao ler do IndexedDB:', e);
    }

    // Fallback final no localStorage
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  /**
   * Remove chave em todas as camadas
   */
  static async removeItem(key: string): Promise<void> {
    try { localStorage.removeItem(key); } catch {}
    if (this.isNative) {
      try { await Preferences.remove({ key }); } catch {}
    }
    try { await indexedDBService.removeKeyValue(key); } catch {}
  }
}

// ============================================================
// 2. INDEXEDDB WRAPPER (Promises Nativas sem dependências externas)
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

        // Store genérico para pares chave/valor (persistência garantida)
        if (!db.objectStoreNames.contains('key_value_store')) {
          db.createObjectStore('key_value_store', { keyPath: 'key' });
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

  // Gravar par chave-valor no IndexedDB
  async setKeyValue(key: string, value: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('key_value_store', 'readwrite');
        const store = tx.objectStore('key_value_store');
        store.put({ key, value, updatedAt: Date.now() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('[IndexedDB] Erro ao gravar chave:', key, e);
    }
  }

  // Ler par chave-valor do IndexedDB
  async getKeyValue(key: string): Promise<string | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('key_value_store', 'readonly');
        const store = tx.objectStore('key_value_store');
        const req = store.get(key);
        req.onsuccess = () => {
          resolve(req.result ? req.result.value : null);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('[IndexedDB] Erro ao ler chave:', key, e);
      return null;
    }
  }

  // Remover par chave-valor do IndexedDB
  async removeKeyValue(key: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('key_value_store', 'readwrite');
        const store = tx.objectStore('key_value_store');
        store.delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('[IndexedDB] Erro ao remover chave:', key, e);
    }
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
// 3. SESSIONSTORAGE (Estado Volátil da Partida Atual)
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
// 4. COOKIES (Preferências de Idioma, Tema e Sessão)
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
// 5. STORAGE MANAGER UNIFICADO (Offline-First & Eviction-Proof)
// ============================================================
export const storageManager = {
  _lastSavedTime: 'Início da Sessão',

  getLastSavedTime(): string {
    return this._lastSavedTime;
  },

  // Gravação sincronizada e redundante (Capacitor Preferences + IndexedDB + localStorage)
  async saveAll(stats: PlayerStats, settings?: GameSettings): Promise<void> {
    this._lastSavedTime = new Date().toLocaleTimeString('pt-PT');
    const rawStats = JSON.stringify(stats);
    savePlayerStats(stats);
    await StorageAdapter.setItem(SAVE_KEY, rawStats);
    await indexedDBService.backupPlayerStats(stats);

    if (settings) {
      const rawSettings = JSON.stringify(settings);
      await StorageAdapter.setItem(SETTINGS_KEY, rawSettings);
      cookieStorage.set('lotador_lang', settings.language || 'PT');
      cookieStorage.set('lotador_quality', settings.graphicsQuality || 'MEDIUM');
    }
  },

  // Carregamento de progresso resiliente
  async loadPlayerProgress(): Promise<PlayerStats> {
    try {
      const stored = await StorageAdapter.getItem(SAVE_KEY);
      if (stored) {
        return { ...DEFAULT_PLAYER_STATS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('[StorageManager] Erro ao carregar progresso, usando fallback:', e);
    }
    return loadPlayerStats();
  },

  // Carregamento de configurações
  async loadSettings(): Promise<GameSettings> {
    try {
      const stored = await StorageAdapter.getItem(SETTINGS_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('[StorageManager] Erro ao carregar configurações:', e);
    }
    return DEFAULT_SETTINGS;
  },

  // Registro de partida completa
  async recordFinishedMatch(record: MatchRecord, currentStats: PlayerStats): Promise<void> {
    await indexedDBService.saveMatchRecord(record);
    await this.saveAll(currentStats);
    sessionGameStorage.clearCurrentMatch();
  },

  // Pedir armazenamento persistente ao navegador (evita evicção de dados pelo OS)
  async requestPersistentStorage(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      try {
        const isPersisted = await navigator.storage.persist();
        console.log(`[PWA Storage] Armazenamento persistente: ${isPersisted ? 'Ativo' : 'Padrão'}`);
        return isPersisted;
      } catch {
        return false;
      }
    }
    return false;
  },

  // Exportar backup em JSON para o jogador
  async exportBackup(): Promise<string> {
    const stats = await this.loadPlayerProgress();
    const settings = await this.loadSettings();
    const history = await indexedDBService.getMatchHistory(50);
    return JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      stats,
      settings,
      history,
    }, null, 2);
  },

  // Importar backup de arquivo JSON
  async importBackup(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      if (data && data.stats) {
        await this.saveAll(data.stats, data.settings);
        return true;
      }
    } catch (e) {
      console.error('[StorageManager] Falha ao importar backup:', e);
    }
    return false;
  }
};

// ============================================================
// 6. ETAPA 5 - API CENTRALIZADA E RESILIENTE DE PERSISTÊNCIA
// ============================================================
const BACKUP_SAVE_KEY = 'LOTADOR_SAVE_BACKUP_V1';

/**
 * Inicializa a camada de persistência, solicita persistência no SO e executa migrações
 */
export async function initializeStorage(): Promise<{ initialized: boolean; persisted: boolean }> {
  try {
    const persisted = await storageManager.requestPersistentStorage();
    await migrateStoredData();
    return { initialized: true, persisted };
  } catch (err) {
    console.warn('[Storage] Inicialização com avisos:', err);
    return { initialized: true, persisted: false };
  }
}

/**
 * Validação rigorosa dos dados antes de salvar ou ler para evitar corrupção
 */
export function verifyStoredData(stats: any): stats is PlayerStats {
  if (!stats || typeof stats !== 'object') return false;
  if (typeof stats.money !== 'number' || isNaN(stats.money) || stats.money < 0) return false;
  if (typeof stats.level !== 'number' || stats.level < 1) return false;
  if (typeof stats.reputation !== 'number') return false;
  return true;
}

/**
 * Salva o estado principal do jogador com cópia atômica de segurança
 */
export async function saveGameState(stats: PlayerStats): Promise<boolean> {
  try {
    if (!verifyStoredData(stats)) {
      console.error('[Storage] Tentativa de salvar dados inválidos:', stats);
      return false;
    }
    // Cria backup prévio do estado anterior antes de sobrescrever
    const previous = await StorageAdapter.getItem(SAVE_KEY);
    if (previous) {
      await StorageAdapter.setItem(BACKUP_SAVE_KEY, previous);
    }
    await storageManager.saveAll(stats);
    return true;
  } catch (err) {
    console.error('[Storage] Erro ao salvar estado:', err);
    return false;
  }
}

/**
 * Carrega o estado do jogador com recuperação automática em caso de corrupção
 */
export async function loadGameState(): Promise<PlayerStats> {
  try {
    const raw = await StorageAdapter.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (verifyStoredData(parsed)) {
        return { ...DEFAULT_PLAYER_STATS, ...parsed };
      }
    }
  } catch (err) {
    console.warn('[Storage] Save principal ilegível. Tentando recuperar backup de emergência...', err);
  }

  // Tentativa de recuperação via backup
  try {
    const backupRaw = await StorageAdapter.getItem(BACKUP_SAVE_KEY);
    if (backupRaw) {
      const parsedBackup = JSON.parse(backupRaw);
      if (verifyStoredData(parsedBackup)) {
        console.info('[Storage] Backup restaurado com sucesso!');
        await StorageAdapter.setItem(SAVE_KEY, backupRaw);
        return { ...DEFAULT_PLAYER_STATS, ...parsedBackup };
      }
    }
  } catch (err) {
    console.error('[Storage] Falha ao recuperar backup:', err);
  }

  return { ...DEFAULT_PLAYER_STATS };
}

/**
 * Exclui o progresso atual do jogador
 */
export async function deleteGameState(): Promise<void> {
  await StorageAdapter.removeItem(SAVE_KEY);
  await StorageAdapter.removeItem(BACKUP_SAVE_KEY);
  await indexedDBService.removeKeyValue(SAVE_KEY);
}

/**
 * Salva as configurações de jogo
 */
export async function saveSettings(settings: GameSettings): Promise<void> {
  try {
    const raw = JSON.stringify(settings);
    await StorageAdapter.setItem(SETTINGS_KEY, raw);
    cookieStorage.set('lotador_lang', settings.language || 'PT');
    cookieStorage.set('lotador_quality', settings.graphicsQuality || 'MEDIUM');
  } catch (e) {
    console.warn('[Storage] Erro ao salvar configurações:', e);
  }
}

/**
 * Carrega as configurações de jogo
 */
export async function loadSettings(): Promise<GameSettings> {
  return storageManager.loadSettings();
}

/**
 * Registra estatísticas
 */
export async function saveStatistics(stats: PlayerStats): Promise<void> {
  await saveGameState(stats);
}

/**
 * Limpa dados voláteis de sessão
 */
export function clearTemporaryData(): void {
  sessionGameStorage.clearCurrentMatch();
}

/**
 * Migra dados de versões antigas do jogo
 */
export async function migrateStoredData(): Promise<void> {
  try {
    // Migração de chaves legadas se existirem
    const legacySave = localStorage.getItem('LOTADOR_SAVE');
    if (legacySave && !localStorage.getItem(SAVE_KEY)) {
      localStorage.setItem(SAVE_KEY, legacySave);
      localStorage.removeItem('LOTADOR_SAVE');
    }
  } catch (e) {
    console.warn('[Storage] Migração concluída com avisos:', e);
  }
}

/**
 * Retorna a saúde e status do subsistema de armazenamento
 */
export async function getStorageHealth(): Promise<{
  isNative: boolean;
  persisted: boolean;
  hasSave: boolean;
  hasBackup: boolean;
  quotaEstimateMB?: number;
}> {
  const isNative = Capacitor.isNativePlatform();
  let persisted = false;
  let quotaEstimateMB: number | undefined;

  if (typeof navigator !== 'undefined' && navigator.storage) {
    if (navigator.storage.persisted) {
      persisted = await navigator.storage.persisted().catch(() => false);
    }
    if (navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate().catch(() => null);
      if (estimate && estimate.quota) {
        quotaEstimateMB = Math.round(estimate.quota / (1024 * 1024));
      }
    }
  }

  const hasSave = Boolean(await StorageAdapter.getItem(SAVE_KEY));
  const hasBackup = Boolean(await StorageAdapter.getItem(BACKUP_SAVE_KEY));

  return {
    isNative,
    persisted,
    hasSave,
    hasBackup,
    quotaEstimateMB,
  };
}

