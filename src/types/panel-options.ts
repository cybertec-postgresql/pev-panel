export interface PanelOptions {
  planFieldName: string;
  forceJsonMode: boolean;
  fontSize: number;
}

export const DEFAULT_PANEL_OPTIONS: PanelOptions = {
  planFieldName: "plan",
  forceJsonMode: false,
  fontSize: 14,
};

export const PANEL_OPTIONS_CONSTRAINTS = {
  MIN_FONT_SIZE: 10,
  MAX_FONT_SIZE: 24,
  DEFAULT_FONT_SIZE: 14,
  FONT_SIZE_STEP: 1,
} as const;

export function validatePanelOptions(
  options: Partial<PanelOptions>,
): PanelOptions {
  const validated: PanelOptions = {
    ...DEFAULT_PANEL_OPTIONS,
    ...options,
  };

  if (
    typeof validated.planFieldName !== "string" ||
    validated.planFieldName.trim() === ""
  ) {
    throw new Error("planFieldName must be a non-empty string");
  }

  if (typeof validated.forceJsonMode !== "boolean") {
    validated.forceJsonMode = DEFAULT_PANEL_OPTIONS.forceJsonMode;
  }

  if (typeof validated.fontSize !== "number" || isNaN(validated.fontSize)) {
    validated.fontSize = PANEL_OPTIONS_CONSTRAINTS.DEFAULT_FONT_SIZE;
  } else {
    validated.fontSize = Math.max(
      PANEL_OPTIONS_CONSTRAINTS.MIN_FONT_SIZE,
      Math.min(
        PANEL_OPTIONS_CONSTRAINTS.MAX_FONT_SIZE,
        Math.round(validated.fontSize),
      ),
    );
  }

  return validated;
}
