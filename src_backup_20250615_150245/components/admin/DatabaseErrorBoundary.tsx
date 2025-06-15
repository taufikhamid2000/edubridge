import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class DatabaseErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('DatabaseErrorBoundary caught an error:', error, errorInfo);
  }

  private isTableNotExistError(error: Error | null): boolean {
    if (!error) return false;
    return (
      error.message.includes('relation') &&
      error.message.includes('does not exist')
    );
  }

  private getErrorMessage(): string {
    if (!this.state.error) return 'Unknown error occurred';

    if (this.isTableNotExistError(this.state.error)) {
      return 'The database schema needs to be updated. Please run the migration script.';
    }

    return this.state.error.message;
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
            Database Error
          </h3>
          <p className="text-red-700 dark:text-red-300 mb-4">
            {this.getErrorMessage()}
          </p>
          <button
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DatabaseErrorBoundary;
