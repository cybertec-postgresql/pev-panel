/**
 * Vue Mount Component
 *
 * React component that manages a Vue application lifecycle.
 * Mounts PEV2 visualization component and handles cleanup.
 */

import React, { useEffect, useRef } from "react";
import { App as VueApp } from "vue";
import { mountVueApp, unmountVueApp } from "../services/vueBootstrap";
import { ExecutionPlan } from "../types/plan-types";
import { logDebug } from "../utils/logger";
import "pev2/dist/pev2.css";

const CONTEXT = "VueMount";

interface Props {
  plan: ExecutionPlan;
  fontSize?: number;
  darkMode?: boolean;
  width?: number;
  height?: number;
}

/**
 * VueMount component
 *
 * Manages Vue app lifecycle and renders PEV2 Plan component.
 * Handles mounting, updating, and unmounting of Vue app.
 */
export const VueMount: React.FC<Props> = ({
  plan,
  fontSize = 14,
  darkMode = false,
  width,
  height,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const vueAppRef = useRef<VueApp | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    logDebug(CONTEXT, "Mounting PEV2 visualization", {
      fontSize,
      darkMode,
      width,
      height,
    });

    try {
      // Dynamically import PEV2 Plan component
      // Note: This requires PEV2 to be installed and built
      // For now, we'll create a placeholder until PEV2 is properly integrated
      const PlaceholderComponent = {
        props: ["plan", "fontSize", "darkMode"],
        template: `
          <div style="padding: 20px; font-family: monospace;">
            <h3>PostgreSQL EXPLAIN Visualization</h3>
            <div style="margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 4px;">
              <strong>Node Type:</strong> {{ plan.Plan['Node Type'] }}<br>
              <strong>Total Cost:</strong> {{ plan.Plan['Total Cost'] }}<br>
              <strong>Plan Rows:</strong> {{ plan.Plan['Plan Rows'] }}<br>
              <div v-if="plan['Planning Time']" style="margin-top: 8px;">
                <strong>Planning Time:</strong> {{ plan['Planning Time'] }}ms
              </div>
              <div v-if="plan['Execution Time']" style="margin-top: 4px;">
                <strong>Execution Time:</strong> {{ plan['Execution Time'] }}ms
              </div>
              <div style="margin-top: 12px; font-size: 12px; color: #666;">
                Font Size: {{ fontSize }}px | Dark Mode: {{ darkMode ? 'Yes' : 'No' }}
              </div>
              <div style="margin-top: 12px; padding: 10px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px;">
                <strong>Note:</strong> Full PEV2 visualization will be integrated in the next iteration.
                This placeholder confirms Vue integration is working correctly.
              </div>
            </div>
          </div>
        `,
      };

      vueAppRef.current = mountVueApp(
        containerRef.current,
        PlaceholderComponent,
        {
          plan,
          fontSize,
          darkMode,
        },
      );
    } catch (error) {
      logDebug(CONTEXT, "Error mounting Vue app", error);
      throw error;
    }

    // Cleanup function
    return () => {
      if (vueAppRef.current) {
        unmountVueApp(vueAppRef.current);
        vueAppRef.current = null;
      }
    };
  }, [plan, fontSize, darkMode, width, height]);

  return (
    <div
      ref={containerRef}
      style={{
        width: width ? `${width}px` : "100%",
        height: height ? `${height}px` : "100%",
        overflow: "auto",
      }}
    />
  );
};
