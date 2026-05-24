"use client";

import React, { ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="glass rounded-lg p-6 text-center">
            <p className="text-red-200 mb-2">Something went wrong</p>
            <p className="text-xs text-zinc-400">
              {this.state.error?.message || "Unknown error"}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 px-3 py-1 text-xs bg-cyan-500/20 text-cyan-100 rounded hover:bg-cyan-500/30 transition-colors"
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
