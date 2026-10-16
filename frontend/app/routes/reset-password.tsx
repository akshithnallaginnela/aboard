import { useState } from "react";
import { Form, Link, redirect, useNavigation, useSearchParams } from "react-router";

import type { Route } from "./+types/reset-password";
import { AuthPage, FormFailure, PasswordInput, useHideToken } from "~/components/auth";
import { Field, SubmitButton, guardSubmit } from "~/components/form";
import { buttonVariants } from "~/components/ui/button";
import { actionFailure, isApiError, validationFailure } from "~/lib/api";
import { privateMeta } from "~/lib/meta";
import { api } from "~/lib/runtime";

export const meta: Route.MetaFunction = () => [
  ...privateMeta("Choose a new password"),
  { name: "referrer", content: "no-referrer" },
];

const MIN_PASSWORD = 10;

export async function clientAction({ request }: Route.ClientActionArgs) {
  const form = await request.formData();
  const token = String(form.get("token") ?? "");
  const password = String(form.get("password") ?? "");
  const confirmPassword = String(form.get("confirmPassword") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (password.length < MIN_PASSWORD) {
    fieldErrors.password = password ? `Password must be at least ${MIN_PASSWORD} characters` : "Enter a new password";
  }
  if (!confirmPassword) fieldErrors.confirmPassword = "Enter your new password again";
  else if (confirmPassword !== password) fieldErrors.confirmPassword = "The passwords don't match";
  if (Object.keys(fieldErrors).length > 0) return { ...validationFailure(fieldErrors), linkInvalid: false };

  try {
    await api.resetPassword(token, password);
  } catch (error) {
    // A rejected token (not a rejected password) means the link can't be used again.
    const linkInvalid =
      isApiError(error) &&
      (error.kind === "not_found" ||
        error.kind === "conflict" ||
        (error.kind === "validation" && !error.fieldErrors.password));
    return { ...actionFailure(error), linkInvalid };
  }
  return redirect("/login?reason=reset");
}

function RequestNewLink() {
  return (
    <Link to="/forgot-password" className={buttonVariants()}>
      Request a new link
    </Link>
  );
}

export default function ResetPassword({ actionData }: Route.ComponentProps) {
  const [params] = useSearchParams();
  // Kept in state: the token is removed from the address bar right after the first render.
  const [token] = useState(() => params.get("token") ?? "");
  useHideToken();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle" && navigation.formMethod != null;
  const failure = actionData ?? null;

  if (!token) {
    return (
      <AuthPage title="Use the link in your email">
        <p>
          To choose a new password, open the most recent password reset email from ConnectAbroad and select its link.
          If the link has expired, ask for a new one.
        </p>
        <RequestNewLink />
      </AuthPage>
    );
  }

  if (failure?.linkInvalid) {
    return (
      <AuthPage title="This reset link has expired or was already used">
        <p>Reset links work once and expire soon. Ask for a new link, then use the newest email.</p>
        <RequestNewLink />
      </AuthPage>
    );
  }

  return (
    <AuthPage title="Choose a new password">
      {/* Explicit action without the token so a failed submit doesn't put it back in the address bar. */}
      <Form
        method="post"
        action="/reset-password"
        replace
        noValidate
        onSubmit={guardSubmit(busy)}
        className="flex flex-col gap-5"
      >
        <input type="hidden" name="token" value={token} />
        <FormFailure failure={failure} />
        <Field name="password" label="New password" hint="Use at least 10 characters." error={failure?.fieldErrors.password}>
          {(control) => <PasswordInput {...control} autoComplete="new-password" required />}
        </Field>
        <Field name="confirmPassword" label="Confirm new password" error={failure?.fieldErrors.confirmPassword}>
          {(control) => <PasswordInput {...control} autoComplete="new-password" required />}
        </Field>
        <SubmitButton busy={busy} busyLabel="Saving…">
          Save new password
        </SubmitButton>
      </Form>
    </AuthPage>
  );
}
