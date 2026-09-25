import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for offline café espresso dialing & timing
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('[BaristaOS Service Worker] New update available, refreshing precache...');
    updateSW(true);
  },
  onOfflineReady() {
    console.log('[BaristaOS Service Worker] Barista OS is ready to work offline on the espresso bar.');
  },
  onRegisterError(error) {
    console.warn('[BaristaOS Service Worker] Registration error:', error);
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
