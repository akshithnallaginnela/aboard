// Production runtime: real HTTP API and WebSocket. No demo code is reachable from here.
import type { ComponentType } from "react";
import { createHttpApi } from "./api";
import { createWebSocketRealtime } from "./realtime";

export const isDemo = false;
export const api = createHttpApi();
export const realtime = createWebSocketRealtime();
export const DemoBar: ComponentType | null = null;
