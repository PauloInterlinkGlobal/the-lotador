import React from 'react';
import { Download, WifiOff, RefreshCw } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export const PWAStatusBanner: React.FC = () => {
  const { isInstallable, isOnline, hasUpdate, installApp, updateApp } = usePWA();

  return (
    <>
      {/* 1. Indicador de Modo Offline */}
      {!isOnline && (
        <div
          id="pwa-offline-badge"
          className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/90 text-amber-950 text-xs font-bold shadow-lg backdrop-blur-md border border-amber-300/40 pointer-events-none transition-all duration-300"
        >
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          <span>MODO OFFLINE ATIVO • DADOS SEGUROS NO APARELHO</span>
        </div>
      )}

      {/* 2. Banner de Atualização do Service Worker */}
      {hasUpdate && (
        <div
          id="pwa-update-banner"
          className="fixed top-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2 rounded-xl bg-blue-600/95 text-white text-xs font-bold shadow-2xl backdrop-blur-md border border-blue-300/30"
        >
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Nova versão disponível!</span>
          <button
            onClick={updateApp}
            className="px-2.5 py-1 rounded bg-white text-blue-700 font-bold hover:bg-blue-50 transition cursor-pointer"
          >
            Atualizar
          </button>
        </div>
      )}

      {/* 3. Botão Flutuante de Instalação (se elegível e ainda não instalado) */}
      {isInstallable && (
        <button
          id="pwa-install-button"
          onClick={installApp}
          className="fixed bottom-4 right-4 z-40 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all border border-yellow-200/50 cursor-pointer"
          title="Instalar LOTADOR no seu dispositivo para jogar a qualquer hora sem internet"
        >
          <Download className="w-4 h-4 text-slate-950" />
          <span>Instalar App</span>
        </button>
      )}
    </>
  );
};
