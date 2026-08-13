/**
 * components/common/ErrorBoundary.tsx
 * Componente ErrorBoundary React para capturar exceções não tratadas (ISS-033)
 */

import React, { type ErrorInfo, type ReactNode } from 'react';
import { captureError } from '../../lib/monitoring';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  declare props: Props;
  declare state: State;
  declare setState: React.Component<Props, State>['setState'];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Capturado erro não tratado:', error, errorInfo);
    captureError({
      message: error.message,
      stack: error.stack,
      severity: 'high',
      context: { componentStack: errorInfo.componentStack },
    });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center bg-gray-950 text-white rounded-2xl border border-red-500/20 my-8 mx-auto max-w-2xl shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-3xl mb-4 text-red-400">
            ⚠️
          </div>
          <h2 className="text-xl font-bold font-montserrat mb-2">
            {this.props.fallbackTitle || 'Ocorreu um erro inesperado nesta seção'}
          </h2>
          <p className="text-sm text-gray-400 max-w-md mb-6 leading-relaxed">
            Nossa equipe de monitoramento foi notificada. Você pode tentar recarregar a página para restaurar o estado normal.
          </p>
          {this.state.error && (
            <div className="w-full text-left bg-black/40 border border-white/10 p-4 rounded-xl mb-6 overflow-x-auto text-xs font-mono text-red-300 max-h-40">
              {this.state.error.toString()}
            </div>
          )}
          <button
            onClick={this.handleReset}
            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-primary/25"
          >
            🔄 Recarregar Aplicação
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
