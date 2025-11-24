import React from "react";
import { Alert } from "@grafana/ui";
import { ErrorState, ERROR_SEVERITY } from "../types/error-types";

interface Props {
  error: ErrorState;
}

/**
 * Error Display component
 *
 * Displays error states using Grafana's Alert component.
 * Shows user-friendly messages with resolution hints.
 */
export const ErrorDisplay: React.FC<Props> = ({ error }) => {
  const severity = ERROR_SEVERITY[error.type];

  return (
    <div style={{ padding: "16px" }}>
      <Alert title={error.message} severity={severity}>
        <div>
          <p>{error.resolutionHint}</p>
          {error.details && (
            <details style={{ marginTop: "12px" }}>
              <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
                Technical Details
              </summary>
              <pre
                style={{
                  marginTop: "8px",
                  padding: "8px",
                  backgroundColor: "rgba(0, 0, 0, 0.05)",
                  borderRadius: "4px",
                  fontSize: "12px",
                  overflow: "auto",
                }}
              >
                {error.details}
              </pre>
            </details>
          )}
        </div>
      </Alert>
    </div>
  );
};
