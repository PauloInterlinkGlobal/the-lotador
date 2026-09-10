import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [hasUpdate, setHasUpdate] = useState<boolean>(false);

  useEffect(() => {
    // 1. Detectar se o app já está a correr como PWA Standalone instalado
    const checkInstalled = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone);
    };

    checkInstalled();

    // 2. Capturar evento de instalação nativo
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log('[PWA] Aplicação instalada com sucesso no dispositivo!');
    };

    // 3. Monitorizar conectividade online / offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 4. Registo do Service Worker com escuta de updates (apenas em produção)
    if ('serviceWorker' in navigator) {
      const isDev = (import.meta as any).env?.DEV ?? process.env.NODE_ENV !== 'production';
      if (isDev) {
        // No ambiente de desenvolvimento, desregistrar workers e limpar caches antigos para não interferir no Vite
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister();
            console.log('[PWA Dev] Service Worker desregistrado em modo de desenvolvimento.');
          }
        });
        if ('caches' in window) {
          caches.keys().then((keys) => {
            for (const key of keys) {
              caches.delete(key);
            }
          });
        }
      } else {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[PWA] Service Worker registrado com sucesso:', reg.scope);

            // Verificar se há uma nova versão à espera de ativação
            reg.addEventListener('updatefound', () => {
              const newWorker = reg.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    setHasUpdate(true);
                  }
                });
              }
            });
          })
          .catch((err) => {
            console.warn('[PWA] Falha ao registrar Service Worker:', err);
          });
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Ação de disparar o prompt de instalação
  const installApp = useCallback(async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } catch (err) {
      console.error('[PWA] Erro durante a instalação:', err);
    }
  }, [deferredPrompt]);

  // Ação de recarregar quando há nova versão disponível
  const updateApp = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg && reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  }, []);

  return {
    isInstallable: !isInstalled && deferredPrompt !== null,
    isInstalled,
    isOnline,
    hasUpdate,
    installApp,
    updateApp,
  };
}
