/**
 * Plan Validator Service
 *
 * Validates PostgreSQL EXPLAIN JSON structure before rendering.
 * Ensures data matches the expected ExecutionPlan interface.
 */

import { ExecutionPlan, isValidExecutionPlan } from "../types/plan-types";
import { ErrorType, PlanError } from "../types/error-types";
import { logDebug, logWarn } from "../utils/logger";

const CONTEXT = "PlanValidator";

/**
 * Validate and parse EXPLAIN JSON string
 *
 * @param jsonString - JSON string to validate
 * @returns Parsed ExecutionPlan object
 * @throws PlanError if JSON is invalid or doesn't match schema
 */
export function validatePlan(jsonString: string): ExecutionPlan {
  logDebug(CONTEXT, "Validating plan JSON", { length: jsonString.length });

  // Parse JSON
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

  // Handle array wrapper (some data sources wrap result in array)
  if (Array.isArray(parsedData)) {
    if (parsedData.length === 0) {
      throw new PlanError(
        ErrorType.INVALID_FORMAT,
        "Empty plan array",
        "Parsed JSON is an empty array",
      );
    }

    if (parsedData.length > 1) {
      logWarn(
        CONTEXT,
        `Multiple plans in array (${parsedData.length}), using first`,
      );
    }

    parsedData = parsedData[0];
  }

  // Validate plan structure
  if (!isValidExecutionPlan(parsedData)) {
    // Try to provide helpful error message
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
      "Verify the query returns PostgreSQL EXPLAIN output. The Plan node must have Node Type, costs, and row estimates.",
    );
  }

  logDebug(CONTEXT, "Plan validation successful", {
    nodeType: parsedData.Plan["Node Type"],
    planningTime: parsedData["Planning Time"],
    executionTime: parsedData["Execution Time"],
  });

  return parsedData;
}

/**
 * Check if string looks like JSON (quick pre-check)
 *
 * @param str - String to check
 * @returns True if string likely contains JSON
 */
export function looksLikeJson(str: string): boolean {
  const trimmed = str.trim();
  return (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  );
}
