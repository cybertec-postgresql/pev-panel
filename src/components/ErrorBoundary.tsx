import React, { Component, ErrorInfo, ReactNode } from "react";
import { css } from "@emotion/css";
import { ErrorState, toErrorState } from "../types/error-types";

interface Props {
  children: ReactNode;
  onError?: (error: ErrorState) => void;
}

interface State {
  hasError: boolean;
  error?: ErrorState;
}

const errorContainerStyle = css`
  padding: 16px;
`;

const errorBoxStyle = css`
  border: 1px solid #f44336;
  border-radius: 4px;
  padding: 12px;
  background-color: #ffebee;
  color: #c62828;
`;

const errorTitleStyle = css`
  margin: 0 0 8px 0;
  font-size: 16px;
`;

const errorMessageStyle = css`
  margin: 0 0 8px 0;
  font-size: 14px;
`;

const errorDetailsStyle = css`
  margin: 8px 0;
  padding: 8px;
  background-color: #fff;
  font-size: 12px;
  overflow: auto;
  max-height: 200px;
`;

const errorHintStyle = css`
  margin: 8px 0 0 0;
  font-size: 13px;
  font-style: italic;
`;

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
    console.error("ErrorBoundary caught error:", error.message, {
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    if (this.props.onError && this.state.error) {
      this.props.onError(this.state.error);
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className={errorContainerStyle}>
          <div className={errorBoxStyle}>
            <h3 className={errorTitleStyle}>Error</h3>
            <p className={errorMessageStyle}>
              {this.state.error.message}
            </p>
            {this.state.error.details && (
              <pre className={errorDetailsStyle}>
                {this.state.error.details}
              </pre>
            )}
            <p className={errorHintStyle}>
              {this.state.error.resolutionHint}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
