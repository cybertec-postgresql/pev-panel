/**
 * Data Extractor Service
 *
 * Extracts PostgreSQL EXPLAIN plan data from Grafana DataFrame.
 * Handles different data source formats and field names.
 */

import { DataFrame } from "@grafana/data";
import { ErrorType, PlanError } from "../types/error-types";
import { logDebug, logWarn } from "../utils/logger";

const CONTEXT = "DataExtractor";

/**
 * Extract plan data from Grafana DataFrame
 *
 * @param data - Grafana data from query
 * @param fieldName - Name of field containing EXPLAIN output
 * @returns Plan data as string, or null if no data
 * @throws PlanError if field not found or data is invalid
 */
export function extractPlanData(
  data: DataFrame[],
  fieldName: string,
): string | null {
  logDebug(CONTEXT, "Extracting plan data", {
    fieldName,
    seriesCount: data.length,
  });

  // Check if data is empty
  if (!data || data.length === 0) {
    logDebug(CONTEXT, "No data series available");
    return null;
  }

  // Get first series (frame)
  const frame = data[0];

  if (!frame.fields || frame.fields.length === 0) {
    logDebug(CONTEXT, "No fields in data frame");
    return null;
  }

  // Find the field with the specified name
  const planField = frame.fields.find((field) => field.name === fieldName);

  if (!planField) {
    const availableFields = frame.fields.map((f) => f.name).join(", ");
    logWarn(CONTEXT, `Field "${fieldName}" not found`, { availableFields });

    throw new PlanError(
      ErrorType.FIELD_NOT_FOUND,
      `Field "${fieldName}" not found in data`,
      `Available fields: ${availableFields}`,
      `Update the "Plan Field Name" setting to one of: ${availableFields}`,
    );
  }

  // Get field values
  const values = planField.values;

  if (!values || values.length === 0) {
    logDebug(CONTEXT, "Field has no values");
    return null;
  }

  // Handle multiple rows - use first row and log warning
  if (values.length > 1) {
    logWarn(CONTEXT, `Multiple rows found (${values.length}), using first row`);
  }

  // Get first value
  const rawValue = values[0];

  if (rawValue === null || rawValue === undefined) {
    logDebug(CONTEXT, "Field value is null or undefined");
    return null;
  }

  // Convert value to string
  let planData: string;

  if (typeof rawValue === "string") {
    planData = rawValue;
  } else if (typeof rawValue === "object") {
    // If value is an object, stringify it
    try {
      planData = JSON.stringify(rawValue);
      logDebug(CONTEXT, "Converted object value to JSON string");
    } catch (error) {
      throw new PlanError(
        ErrorType.INVALID_FORMAT,
        "Failed to convert field value to string",
        error instanceof Error ? error.message : String(error),
      );
    }
  } else {
    // For other types (number, boolean), convert to string
    planData = String(rawValue);
  }

  logDebug(CONTEXT, "Successfully extracted plan data", {
    length: planData.length,
    preview: planData.substring(0, 100),
  });

  return planData;
}
