import React from "react";
import { LoadingPlaceholder } from "@grafana/ui";

interface Props {
  message?: string;
}

/**
 * Loading Spinner component
 *
 * Displays a loading indicator using Grafana's LoadingPlaceholder.
 * Used while processing EXPLAIN data or rendering visualization.
 */
export const LoadingSpinner: React.FC<Props> = ({ message = "Loading..." }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
      }}
    >
      <LoadingPlaceholder text={message} />
    </div>
  );
};
