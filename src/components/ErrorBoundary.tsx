import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[kred ErrorBoundary Caught]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.hash = '#/';
    window.location.reload();
  };

  private handleCopy = () => {
    const errorDetails = `Error: ${this.state.error?.message || 'Unknown error'}\nComponent Stack: ${
      this.state.errorInfo?.componentStack || 'N/A'
    }`;
    navigator.clipboard?.writeText(errorDetails);
    alert('Diagnostics copied to clipboard');
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#000000] text-[#F4F2EC] flex items-center justify-center p-6">
          <div className="card max-w-[500px] w-full bg-[#0E0E0E] border border-[#222222] rounded-[24px] p-8 text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-[#FF8A80]/15 text-[#FF8A80] inline-flex items-center justify-center text-[28px]">
              <i className="ti ti-alert-triangle" aria-hidden="true"></i>
            </div>

            <div className="space-y-2">
              <h1 className="text-[22px] font-medium tracking-tight text-[#F4F2EC]">
                Something interrupted this view
              </h1>
              <p className="text-[13px] text-[#9A9892] leading-relaxed">
                The attribution client encountered an unexpected state. Your account balance and campaign tracking links remain secure.
              </p>
            </div>

            {this.state.error && (
              <div className="code text-left text-[11px] text-[#FF8A80] max-h-[100px] overflow-y-auto p-3 font-mono">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="pill on min-h-[44px] px-6 cursor-pointer font-medium"
              >
                Reload Marketplace
              </button>
              <button
                type="button"
                onClick={this.handleCopy}
                className="pill out min-h-[44px] px-4 cursor-pointer"
              >
                Copy diagnostics
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
