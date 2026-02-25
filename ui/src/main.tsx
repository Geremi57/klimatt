import { registerSW } from 'virtual:pwa-register';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);

registerSW({
  onNeedRefresh() {
    console.log('New content available');
  },
  onOfflineReady() {
    console.log('App ready for offline use');
  },
});
