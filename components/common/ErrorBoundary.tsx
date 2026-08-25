/**
 * components/common/ErrorBoundary.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * ErrorBoundary React robusto para captura de exceções em tempo de renderização.
 * Integrado com ErrorReportingService, sanitização LGPD e ErrorBoundaryFallback.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { type ErrorInfo, type ReactNode } from 'react';
import { captureError } from '../../lib/monitoring';
import { ErrorReportingService } from '../../services/errorReportingService';
import { ErrorBoundaryFallback } from '../error/ErrorBoundaryFallback';
import { SystemRole } from '../../security/rbac';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  moduleName?: string;
  onReport?: () => void;
  tenantId?: string;
  userId?: string;
  userRole?: SystemRole;
}

interface State {
  hasError: boolean;
  error: Error | null;
  reportId?: string;
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

    captureError(error, {
      component: this.props.moduleName || 'ErrorBoundary',
      action: 'react_render_exception',
      extra: { componentStack: errorInfo.componentStack },
    });

    // Registra via ErrorReportingService de forma assíncrona e segura
    ErrorReportingService.captureFromBoundary(
      error,
      errorInfo.componentStack || undefined,
      this.props.moduleName,
      {
        tenantId: this.props.tenantId,
        userId: this.props.userId,
        userRole: this.props.userRole,
      }
    ).then((reportId) => {
      this.setState({ reportId });
    }).catch(() => {});
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorBoundaryFallback
          moduleName={this.props.moduleName}
          onRetry={this.handleRetry}
          onReportError={this.props.onReport}
        />
      );
    }

    return this.props.children;
  }
}
