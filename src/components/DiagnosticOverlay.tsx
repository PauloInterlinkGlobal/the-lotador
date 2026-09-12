/**
 * LOTADOR - Development Telemetry & Diagnostic Overlay
 * Strictly active in development mode (`import.meta.env.DEV`).
 * Real-time monitoring of:
 * - Render FPS
 * - Active Entities (Taxis, Passengers, NPCs, Particles)
 * - Heap Memory (when performance.memory is accessible)
 * - Network Status (Online / Offline)
 * - Graphic Quality level
 * - Storage Health (Persistent status, save confirmation, last save time)
 */

import React, { useState, useEffect } from 'react';
import { getStorageHealth } from '../services/storageService';
import { Activity, Cpu, Wifi, WifiOff, HardDrive, Layers, X } from 'lucide-react';

interface DiagnosticOverlayProps {
  fps?: number;
  entityCount?: {
    passengers: number;
    taxis: number;
    particles: number;
  };
  graphicsQuality?: string;
  lastSavedTime?: string;
}

export const DiagnosticOverlay: React.FC<DiagnosticOverlayProps> = ({
  fps = 60,
  entityCount = { passengers: 0, taxis: 0, particles: 0 },
  graphicsQuality = 'MEDIUM',
  lastSavedTime = 'N/A',
}) => {
  // Never render in production
  if (!import.meta.env.DEV) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [memoryMB, setMemoryMB] = useState<number | null>(null);
  const [storageInfo, setStorageInfo] = useState<{
    isNative: boolean;
    persisted: boolean;
    hasSave: boolean;
    hasBackup: boolean;
    quotaEstimateMB?: number;
  } | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(() => {
      // Memory API (Chromium / Android WebView)
      if ((performance as any).memory) {
        const mem = (performance as any).memory;
        setMemoryMB(Math.round(mem.usedJSHeapSize / (1024 * 1024)));
      }

      getStorageHealth().then(setStorageInfo).catch(() => {});
    }, 1500);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (!isOpen) {
    return (
      <button
        id="dev-diag-toggle-btn"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-2 left-2 z-[9999] bg-black/75 text-[#fe6b00] border border-[#fe6b00]/40 text-[10px] font-mono px-2 py-1 rounded backdrop-blur shadow hover:bg-black/90 flex items-center gap-1"
      >
        <Activity size={12} className="text-[#00e676]" />
        <span>DEV DIAG</span>
        <span className="text-white font-bold">{Math.round(fps)} FPS</span>
      </button>
    );
  }

  return (
    <div
      id="dev-diag-panel"
      className="fixed bottom-2 left-2 z-[9999] bg-[#0c1322]/95 border border-[#3b4758] text-white rounded-lg p-3 shadow-2xl backdrop-blur max-w-xs font-mono text-[11px] leading-tight space-y-2 pointer-events-auto"
    >
      <div className="flex items-center justify-between border-b border-[#253041] pb-1.5">
        <div className="flex items-center gap-1.5 font-bold text-[#fe6b00]">
          <Activity size={13} className="text-[#00e676]" />
          <span>LOTADOR DIAGNOSTICS</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white p-0.5"
          aria-label="Close Diagnostics"
        >
          <X size={13} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#162133] p-1.5 rounded">
          <div className="text-gray-400 flex items-center gap-1">
            <Activity size={11} /> FPS
          </div>
          <div
            className={`text-sm font-bold ${
              fps >= 50 ? 'text-[#00e676]' : fps >= 30 ? 'text-[#ffd700]' : 'text-[#ff5252]'
            }`}
          >
            {Math.round(fps)}
          </div>
        </div>

        <div className="bg-[#162133] p-1.5 rounded">
          <div className="text-gray-400 flex items-center gap-1">
            <Cpu size={11} /> JS Heap
          </div>
          <div className="text-sm font-bold text-white">
            {memoryMB !== null ? `${memoryMB} MB` : 'N/A'}
          </div>
        </div>

        <div className="bg-[#162133] p-1.5 rounded">
          <div className="text-gray-400 flex items-center gap-1">
            <Layers size={11} /> Entidades
          </div>
          <div className="text-[10px] text-gray-300">
            P:{entityCount.passengers} | T:{entityCount.taxis} | Part:{entityCount.particles}
          </div>
        </div>

        <div className="bg-[#162133] p-1.5 rounded">
          <div className="text-gray-400 flex items-center gap-1">
            {isOnline ? <Wifi size={11} className="text-[#00e676]" /> : <WifiOff size={11} className="text-[#ff5252]" />}
            Rede
          </div>
          <div className={`text-[10px] font-bold ${isOnline ? 'text-[#00e676]' : 'text-[#ff5252]'}`}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </div>
        </div>
      </div>

      <div className="border-t border-[#253041] pt-1.5 space-y-1 text-[10px]">
        <div className="flex justify-between">
          <span className="text-gray-400">Qualidade:</span>
          <span className="text-[#ffd700] font-bold">{graphicsQuality}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Armazenamento:</span>
          <span className="text-gray-200">
            {storageInfo?.isNative ? 'Capacitor Prefs' : 'IndexedDB + Local'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Persistência OS:</span>
          <span className={storageInfo?.persisted ? 'text-[#00e676]' : 'text-gray-400'}>
            {storageInfo?.persisted ? 'Garantida' : 'Padrão'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Backup Seguro:</span>
          <span className={storageInfo?.hasBackup ? 'text-[#00e676]' : 'text-gray-400'}>
            {storageInfo?.hasBackup ? 'Ativo' : 'Pendente'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Último Save:</span>
          <span className="text-gray-300">{lastSavedTime}</span>
        </div>
      </div>
    </div>
  );
};
