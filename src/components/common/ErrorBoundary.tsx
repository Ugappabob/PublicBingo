import React, { Component, ErrorInfo, ReactNode } from 'react';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { getPerformance, trace } from 'firebase/performance';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });

    // Log error to Firebase Analytics
    try {
      const analytics = getAnalytics();
      logEvent(analytics, 'error', {
        component: this.props.componentName,
        error_message: error.message,
        error_stack: error.stack
      });
    } catch (analyticsError) {
      console.error('Failed to log error to Analytics:', analyticsError);
    }

    // Create a performance trace for the error
    try {
      const performance = getPerformance();
      const errorTrace = trace(performance, `error_${this.props.componentName}`);
      errorTrace.putAttribute('error_message', error.message);
      errorTrace.putAttribute('error_component', this.props.componentName);
      errorTrace.stop();
    } catch (traceError) {
      console.error('Failed to create error trace:', traceError);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by ErrorBoundary:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>We're sorry, but there was an error in the {this.props.componentName} component.</p>
          {process.env.NODE_ENV === 'development' && (
            <details>
              <summary>Error Details</summary>
              <pre>{this.state.error?.toString()}</pre>
              <pre>{this.state.errorInfo?.componentStack}</pre>
            </details>
          )}
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 