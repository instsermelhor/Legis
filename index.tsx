import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// FIX: Correct import path for App component.
import App from './App';
import { AppProvider } from './context/AppContext';
import { AppDataProvider } from './context/AppDataContext';
import { ToastProvider } from './components/common/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { initMonitoring } from './lib/monitoring';

// Inicializa Sentry + Web Vitals + error listeners em produção
initMonitoring();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary fallbackTitle="Falha de Inicialização na Plataforma Legis Connect">
      <ToastProvider>
        <AppProvider>
          <AppDataProvider>
            <App />
          </AppDataProvider>
        </AppProvider>
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
);