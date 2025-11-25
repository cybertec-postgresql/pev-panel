import { ExecutionPlan, isValidExecutionPlan } from "../types/plan-types";
import { ErrorType, PlanError } from "../types/error-types";

export function validatePlan(jsonString: string): ExecutionPlan {
  let parsedData: any;

  try {
    parsedData = JSON.parse(jsonString);
  } catch (error) {
    throw new PlanError(
      ErrorType.INVALID_FORMAT,
      "Invalid JSON format",
      error instanceof Error ? error.message : String(error),
      "Ensure your query returns valid JSON. Use EXPLAIN (FORMAT JSON) for guaranteed compatibility.",
    );
  }

  if (Array.isArray(parsedData)) {
    if (parsedData.length === 0) {
      throw new PlanError(
        ErrorType.INVALID_FORMAT,
        "Empty plan array",
        "Parsed JSON is an empty array",
      );
    }

    parsedData = parsedData[0];
  }

  if (!isValidExecutionPlan(parsedData)) {
    if (!parsedData || typeof parsedData !== "object") {
      throw new PlanError(
        ErrorType.INVALID_FORMAT,
        "Invalid plan structure: not an object",
        `Got type: ${typeof parsedData}`,
      );
    }

    if (!("Plan" in parsedData)) {
      throw new PlanError(
        ErrorType.INVALID_FORMAT,
        'Invalid plan structure: missing "Plan" field',
        `Available fields: ${Object.keys(parsedData).join(", ")}`,
        "Ensure your query uses EXPLAIN (FORMAT JSON) to generate valid plan structure.",
      );
    }

    throw new PlanError(
      ErrorType.INVALID_FORMAT,
      "Invalid plan structure",
      "Plan object does not match expected ExecutionPlan schema",
      "Verify the query returns PostgreSQL EXPLAIN output.",
    );
  }

  return parsedData;
}
