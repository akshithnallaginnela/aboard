// Account access building blocks: centered panel, password field with show/hide, shared form helpers.
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type * as React from "react";

import { ActionError } from "~/components/feedback";
import { ErrorSummary, Field, TextInput } from "~/components/form";
import { Button } from "~/components/ui/button";
import { actionFailure, validationFailure, type ActionFailure } from "~/lib/api";
import { cn } from "~/lib/utils";

export const textLink = "font-semibold text-primary underline underline-offset-4 hover:text-primary-hover";

/** Centered single-column panel on the canvas. Renders the page's only h1. */
export function AuthPage({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md px-5 py-8 sm:py-16">
      <div className="flex flex-col gap-6 rounded-panel border border-divider bg-surface p-6">
        <h1 tabIndex={-1} className="text-[1.75rem] font-semibold leading-tight sm:text-[2.25rem]">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}

/**
 * Password field with a visible show/hide toggle. Paste and password-manager autofill keep working;
 * the field reverts to type=password on submit so browsers never store it as plain text.
 */
export function PasswordInput({ className, ...props }: Omit<React.ComponentProps<"input">, "type">) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = ref.current;
    const form = input?.form;
    if (!input || !form) return;
    const hide = () => {
      input.type = "password";
      setVisible(false);
    };
    form.addEventListener("submit", hide);
    return () => form.removeEventListener("submit", hide);
  }, []);

  return (
    <div className="flex flex-wrap gap-2">
      <TextInput
        ref={ref}
        {...props}
        type={visible ? "text" : "password"}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className={cn("min-w-0 flex-[1_1_12rem]", className)}
      />
      <Button
        variant="secondary"
        aria-controls={props.id}
        aria-pressed={visible}
        onClick={() => setVisible((shown) => !shown)}
      >
        {visible ? "Hide password" : "Show password"}
      </Button>
    </div>
  );
}

export function EmailField({ error, hint, defaultValue }: { error?: string; hint?: string; defaultValue?: string }) {
  return (
    <Field name="email" label="Email address" hint={hint} error={error}>
      {(control) => (
        <TextInput
          {...control}
          type="email"
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          defaultValue={defaultValue}
        />
      )}
    </Field>
  );
}

/** Field errors go to the linked summary (plus inline errors); everything else to ActionError. */
export function FormFailure({ failure }: { failure: ActionFailure | null | undefined }) {
  if (!failure) return null;
  if (Object.keys(failure.fieldErrors).length > 0) return <ErrorSummary errors={failure.fieldErrors} />;
  return <ActionError failure={failure} />;
}

const subscribeNever = () => () => {};

/** False while hydrating prerendered HTML, true afterwards. Gate URL-dependent UI on it to avoid mismatches. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}

/** Drops a one-time ?token= from the address bar without a router navigation, so loaders don't re-run. */
export function useHideToken() {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("token")) return;
    url.searchParams.delete("token");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }, []);
}

export const formText = (form: FormData, name: string) => String(form.get(name) ?? "").trim();

export function emailError(email: string): string | undefined {
  if (!email) return "Enter your email address";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Enter an email address in the correct format, like name@example.com";
  }
  return undefined;
}

export function displayNameError(name: string): string | undefined {
  if (!name) return "Enter a display name";
  if (name.length < 2 || name.length > 60) return "Display name must be between 2 and 60 characters";
  return undefined;
}

/** clientAction body for single-email forms (password reset, resend verification). Keeps the email on failure. */
export async function submitEmail(request: Request, send: (email: string) => Promise<void>) {
  const email = formText(await request.formData(), "email");
  const problem = emailError(email);
  if (problem) return { ...validationFailure({ email: problem }), email };
  try {
    await send(email);
    return { ok: true as const, email };
  } catch (error) {
    return { ...actionFailure(error), email };
  }
}
