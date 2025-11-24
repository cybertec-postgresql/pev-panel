import React, { Component, ErrorInfo, ReactNode } from "react";
import { ErrorState, toErrorState } from "../types/error-types";
import { logError } from "../utils/logger";

interface Props {
  children: ReactNode;
  onError?: (error: ErrorState) => void;
}

interface State {
  hasError: boolean;
  error?: ErrorState;
}

/**
 * Error Boundary component
 *
 * Catches React errors and prevents the entire panel from crashing.
 * Displays error information and provides recovery options.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error: toErrorState(error),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logError("ErrorBoundary", "Caught error in component tree", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    const errorState = toErrorState(error);

    if (this.props.onError) {
      this.props.onError(errorState);
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div style={{ padding: "16px" }}>
          <div
            style={{
              border: "1px solid #f44336",
              borderRadius: "4px",
              padding: "12px",
              backgroundColor: "#ffebee",
              color: "#c62828",
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>Error</h3>
            <p style={{ margin: "0 0 8px 0", fontSize: "14px" }}>
              {this.state.error.message}
            </p>
            {this.state.error.details && (
              <pre
                style={{
                  margin: "8px 0",
                  padding: "8px",
                  backgroundColor: "#fff",
                  fontSize: "12px",
                  overflow: "auto",
                  maxHeight: "200px",
                }}
              >
                {this.state.error.details}
              </pre>
            )}
            <p
              style={{
                margin: "8px 0 0 0",
                fontSize: "13px",
                fontStyle: "italic",
              }}
            >
              {this.state.error.resolutionHint}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
