import { DataFrame } from "@grafana/data";
import { ErrorType, PlanError } from "../types/error-types";

export function extractPlanData(
  data: DataFrame[],
  fieldName: string,
): string | null {
  if (!data || data.length === 0) {
    return null;
  }

  const frame = data[0];

  if (!frame.fields || frame.fields.length === 0) {
    return null;
  }

  const planField = frame.fields.find((field) => field.name === fieldName);

  if (!planField) {
    const availableFields = frame.fields.map((f) => f.name).join(", ");

    throw new PlanError(
      ErrorType.FIELD_NOT_FOUND,
      `Field "${fieldName}" not found in data`,
      `Available fields: ${availableFields}`,
      `Update the "Plan Field Name" setting to one of: ${availableFields}`,
    );
  }

  const values = planField.values;

  if (!values || values.length === 0) {
    return null;
  }

  const rawValue = values[0];

  if (rawValue === null || rawValue === undefined) {
    return null;
  }

  if (typeof rawValue === "string") {
    return rawValue;
  }
  
  if (typeof rawValue === "object") {
    try {
      return JSON.stringify(rawValue);
    } catch (error) {
      throw new PlanError(
        ErrorType.INVALID_FORMAT,
        "Failed to convert field value to string",
        error instanceof Error ? error.message : String(error),
      );
    }
  }
  
  return String(rawValue);
}
