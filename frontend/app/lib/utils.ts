import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Idempotency keys for retried writes (messages, reports). */
export function newClientId(): string {
  return crypto.randomUUID();
}
