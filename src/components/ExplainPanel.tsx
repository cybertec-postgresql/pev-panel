/**
 * Explain Panel Component
 *
 * Main panel component for PostgreSQL EXPLAIN visualization.
 * Orchestrates data extraction, validation, and rendering.
 */

import React, { useMemo } from "react";
import { PanelProps } from "@grafana/data";
import { PanelOptions } from "../types/panel-options";
import {
  ErrorState,
  ErrorType,
  toErrorState,
  PlanError,
} from "../types/error-types";
import { extractPlanData } from "../services/dataExtractor";
import { validatePlan } from "../services/planValidator";
import { VueMount } from "./VueMount";
import { ErrorBoundary } from "./ErrorBoundary";
import { ErrorDisplay } from "./ErrorDisplay";
import { LoadingSpinner } from "./LoadingSpinner";
import { logDebug, logError } from "../utils/logger";

const CONTEXT = "ExplainPanel";

interface Props extends PanelProps<PanelOptions> {}

/**
 * ExplainPanel
 *
 * Main panel component that:
 * 1. Extracts EXPLAIN data from DataFrame
 * 2. Validates JSON structure
 * 3. Renders visualization using Vue/PEV2
 * 4. Handles errors gracefully
 */
export const ExplainPanel: React.FC<Props> = ({
  options,
  data,
  width,
  height,
}) => {
  logDebug(CONTEXT, "Rendering ExplainPanel", {
    options,
    seriesCount: data.series.length,
    width,
    height,
  });

  // Process data and handle errors
  const result = useMemo(() => {
    try {
      // Extract plan data from DataFrame
      const planData = extractPlanData(data.series, options.planFieldName);

      // Handle no data case
      if (!planData) {
        const errorState: ErrorState = {
          type: ErrorType.NO_DATA,
          message: "No data available",
          resolutionHint:
            "Configure a query to return EXPLAIN output. Use EXPLAIN (FORMAT JSON) SELECT ... or EXPLAIN SELECT ...",
        };
        return { type: "error" as const, error: errorState };
      }

      // Validate and parse plan
      const plan = validatePlan(planData);

      logDebug(CONTEXT, "Plan extracted and validated successfully");

      return { type: "success" as const, plan };
    } catch (error) {
      logError(CONTEXT, "Error processing plan data", error);

      // Convert error to ErrorState
      const errorState =
        error instanceof PlanError ? error.toErrorState() : toErrorState(error);

      return { type: "error" as const, error: errorState };
    }
  }, [data.series, options.planFieldName]);

  // Render error state
  if (result.type === "error") {
    // For NO_DATA, show info message instead of error
    if (result.error.type === ErrorType.NO_DATA) {
      return <ErrorDisplay error={result.error} />;
    }

    return <ErrorDisplay error={result.error} />;
  }

  // Render visualization
  return (
    <ErrorBoundary>
      <VueMount
        plan={result.plan}
        fontSize={options.fontSize}
        width={width}
        height={height}
      />
    </ErrorBoundary>
  );
};
