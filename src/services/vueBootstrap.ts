/**
 * Vue Bootstrap Service
 *
 * Manages Vue 3 application lifecycle for PEV2 integration.
 * Provides functions to mount and unmount Vue apps in React components.
 */

import { createApp, App as VueApp } from "vue";
import { logDebug, logError } from "../utils/logger";

const CONTEXT = "VueBootstrap";

/**
 * Mount a Vue application to a DOM container
 *
 * @param container - HTML element to mount Vue app into
 * @param component - Vue component to render
 * @param props - Props to pass to the component
 * @returns Vue app instance
 */
export function mountVueApp(
  container: HTMLElement,
  component: any,
  props: Record<string, any>,
): VueApp {
  logDebug(CONTEXT, "Mounting Vue app", { props });

  try {
    const app = createApp(component, props);
    app.mount(container);

    logDebug(CONTEXT, "Vue app mounted successfully");
    return app;
  } catch (error) {
    logError(CONTEXT, "Failed to mount Vue app", error);
    throw error;
  }
}

/**
 * Unmount a Vue application
 *
 * @param app - Vue app instance to unmount
 */
export function unmountVueApp(app: VueApp | null): void {
  if (!app) {
    return;
  }

  try {
    app.unmount();
    logDebug(CONTEXT, "Vue app unmounted successfully");
  } catch (error) {
    logError(CONTEXT, "Error unmounting Vue app", error);
  }
}
