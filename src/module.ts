import { PanelPlugin } from "@grafana/data";
import {
  PanelOptions,
  DEFAULT_PANEL_OPTIONS,
  PANEL_OPTIONS_CONSTRAINTS,
} from "./types/panel-options";
import { ExplainPanel } from "./components/ExplainPanel";

export const plugin = new PanelPlugin<PanelOptions>(
  ExplainPanel,
).setPanelOptions((builder) => {
  return builder
    .addTextInput({
      path: "planFieldName",
      name: "Plan Field Name",
      description: "Name of the DataFrame field containing EXPLAIN output",
      defaultValue: DEFAULT_PANEL_OPTIONS.planFieldName,
    })
    .addBooleanSwitch({
      path: "forceJsonMode",
      name: "Force JSON Mode",
      description: "Skip format auto-detection and assume JSON input",
      defaultValue: DEFAULT_PANEL_OPTIONS.forceJsonMode,
    })
    .addSliderInput({
      path: "fontSize",
      name: "Font Size",
      description: "Font size for visualization text (pixels)",
      defaultValue: PANEL_OPTIONS_CONSTRAINTS.DEFAULT_FONT_SIZE,
      settings: {
        min: PANEL_OPTIONS_CONSTRAINTS.MIN_FONT_SIZE,
        max: PANEL_OPTIONS_CONSTRAINTS.MAX_FONT_SIZE,
        step: PANEL_OPTIONS_CONSTRAINTS.FONT_SIZE_STEP,
      },
    })
    .addBooleanSwitch({
      path: "darkMode",
      name: "Dark Mode",
      description: "Force dark theme for visualization",
      defaultValue: DEFAULT_PANEL_OPTIONS.darkMode,
    });
});
