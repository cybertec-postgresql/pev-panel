import React from "react";
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

interface Props extends PanelProps<PanelOptions> {}

export const ExplainPanel: React.FC<Props> = ({
  options,
  data,
  width,
  height,
}) => {
  let result: { type: "success"; plan: any } | { type: "error"; error: ErrorState };

  try {
    const planData = extractPlanData(data.series, options.planFieldName);

    if (!planData) {
      const errorState: ErrorState = {
        type: ErrorType.NO_DATA,
        message: "No data available",
        resolutionHint:
          "Configure a query to return EXPLAIN output. Use EXPLAIN (FORMAT JSON) SELECT ... or EXPLAIN SELECT ...",
      };
      result = { type: "error" as const, error: errorState };
    } else {
      const plan = validatePlan(planData);
      result = { type: "success" as const, plan };
    }
  } catch (error) {
    const errorState =
      error instanceof PlanError ? error.toErrorState() : toErrorState(error);
    result = { type: "error" as const, error: errorState };
  }

  if (result.type === "error") {
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
