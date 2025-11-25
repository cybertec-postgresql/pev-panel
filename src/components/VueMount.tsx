import React, { useEffect, useRef } from "react";
import { App as VueApp, createApp, defineComponent, h } from "vue";
import { Plan as Pev2Plan } from "pev2";
import { ExecutionPlan } from "../types/plan-types";
import "../styles/bootstrap-scoped.css";
import "pev2/dist/pev2.css";
import "../styles/pev2-overrides.css";

interface Props {
  plan: ExecutionPlan;
  fontSize?: number;
  width?: number;
  height?: number;
}

export const VueMount: React.FC<Props> = ({
  plan,
  fontSize = 14,
  width,
  height,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const vueAppRef = useRef<VueApp | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const WrapperComponent = defineComponent({
      name: "PEV2Wrapper",
      components: {
        pev2: Pev2Plan,
      },
      setup() {
        const planSource = JSON.stringify(plan);
        const planQuery = "";

        return () =>
          h(Pev2Plan, {
            planSource: planSource,
            planQuery: planQuery,
          });
      },
    });

    const app = createApp(WrapperComponent, {});
    app.mount(containerRef.current);
    vueAppRef.current = app;

    if (containerRef.current && fontSize) {
      containerRef.current.style.fontSize = `${fontSize}px`;
    }

    const pev2Container = containerRef.current.querySelector(
      ".d-flex",
    ) as HTMLElement;
    if (pev2Container) {
      pev2Container.style.height = "100%";
      pev2Container.style.minHeight = "100%";
    }

    return () => {
      if (vueAppRef.current) {
        vueAppRef.current.unmount();
        vueAppRef.current = null;
      }
    };
  }, [plan, fontSize, width, height]);

  return (
    <div
      ref={containerRef}
      className="pev2-panel-container"
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
