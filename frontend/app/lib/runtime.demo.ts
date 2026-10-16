import { createElement } from "react";
import { createDemoRuntime } from "./demo";
import { DemoControls } from "./demo/controls";
// Only the explicit demo build imports this module; production stays on runtime.http.
const runtime = createDemoRuntime();
export const isDemo = true;
export const api = runtime.api;
export const realtime = runtime.realtime;
export function DemoBar() {
    return createElement(DemoControls, { runtime });
}
