/**
 * Vue Mount Component
 *
 * React component that manages a Vue application lifecycle.
 * Mounts PEV2 visualization component and handles cleanup.
 */

import React, { useEffect, useRef } from "react";
import { App as VueApp, defineComponent, h } from "vue";
import { Plan as Pev2Plan } from "pev2";
import { mountVueApp, unmountVueApp } from "../services/vueBootstrap";
import { ExecutionPlan } from "../types/plan-types";
import { logDebug } from "../utils/logger";
import "bootstrap/dist/css/bootstrap.min.css";
import "pev2/dist/pev2.css";
import "../styles/pev2-overrides.css";

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
      // PEV2 Plan component is imported at the top as ES6 module
      // Create wrapper component to use PEV2 Plan
      const WrapperComponent = defineComponent({
        name: "PEV2Wrapper",
        components: {
          pev2: Pev2Plan,
        },
        setup() {
          // Convert plan to JSON string format that PEV2 expects
          const planSource = JSON.stringify(plan, null, 2);
          const planQuery = "";
          
          return () => h(Pev2Plan, {
            planSource: planSource,
            planQuery: planQuery,
          });
        },
      });

      // Mount Vue app with wrapper component
      vueAppRef.current = mountVueApp(
        containerRef.current,
        WrapperComponent,
        {},
      );

      // Apply font size styling
      if (containerRef.current && fontSize) {
        containerRef.current.style.fontSize = `${fontSize}px`;
      }

      // Apply dark mode styling
      if (containerRef.current && darkMode) {
        containerRef.current.classList.add("pev2-dark-mode");
      } else if (containerRef.current) {
        containerRef.current.classList.remove("pev2-dark-mode");
      }

      // Ensure PEV2 fills the container height
      if (containerRef.current) {
        const pev2Container = containerRef.current.querySelector('.d-flex') as HTMLElement;
        if (pev2Container) {
          pev2Container.style.height = '100%';
          pev2Container.style.minHeight = '100%';
        }
      }
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
        width: "100%",
        height: "100%",
        minHeight: height ? `${height}px` : "600px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    />
  );
};
