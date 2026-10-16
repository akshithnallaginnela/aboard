import { Form, Link, redirect, useNavigation, useSearchParams } from "react-router";

import type { Route } from "./+types/login";
import {
  AuthPage,
  EmailField,
  FormFailure,
  PasswordInput,
  emailError,
  formText,
  textLink,
  useHydrated,
} from "~/components/auth";
import { Notice } from "~/components/feedback";
import { Field, SubmitButton, guardSubmit } from "~/components/form";
import { buttonVariants } from "~/components/ui/button";
import { actionFailure, isApiError, validationFailure } from "~/lib/api";
import { privateMeta } from "~/lib/meta";
import { api } from "~/lib/runtime";
import { safeNext, sessionStore, useSessionMember } from "~/lib/session";

export const meta: Route.MetaFunction = () => privateMeta("Log in");

const REASONS = {
  expired: { tone: "warning", text: "Your session ended. Log in again to continue." },
  signed_out: { tone: "info", text: "You've logged out." },
  reset: { tone: "success", text: "Your password was updated. Log in with your new password." },
  verified: { tone: "success", text: "Your email is confirmed. Log in to continue." },
} as const;

export async function clientAction({ request }: Route.ClientActionArgs) {
  const form = await request.formData();
  const email = formText(form, "email");
  const password = String(form.get("password") ?? "");
  const fieldErrors: Record<string, string> = {};
  const emailProblem = emailError(email);
  if (emailProblem) fieldErrors.email = emailProblem;
  if (!password) fieldErrors.password = "Enter your password";
  if (Object.keys(fieldErrors).length > 0) return { ...validationFailure(fieldErrors), code: null, email };

  try {
    const member = await api.login({ email, password });
    sessionStore.set(member);
    const next = new URL(request.url).searchParams.get("next");
    return redirect(member.onboardingComplete ? safeNext(next) : "/onboarding");
  } catch (error) {
    return { ...actionFailure(error), code: isApiError(error) ? error.code : null, email };
  }
}

export default function Login({ actionData }: Route.ComponentProps) {
  const [params] = useSearchParams();
  const hydrated = useHydrated();
  const member = useSessionMember();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle" && navigation.formMethod != null;
  const failure = actionData ?? null;
  const reasonKey = params.get("reason") ?? "";
  // Read after hydration only: the prerendered HTML was built without query parameters.
  const reason =
    hydrated && !failure && Object.hasOwn(REASONS, reasonKey) ? REASONS[reasonKey as keyof typeof REASONS] : null;

  return (
    <AuthPage title="Log in">
      {member ? (
        <Notice
          title={`You're already logged in as ${member.displayName}.`}
          action={
            <Link to="/people" className={buttonVariants({ size: "sm" })}>
              Open ConnectAbroad
            </Link>
          }
        />
      ) : null}
      {reason ? <Notice tone={reason.tone} role="status" title={reason.text} /> : null}

      <Form method="post" noValidate onSubmit={guardSubmit(busy)} className="flex flex-col gap-5">
        {failure?.code === "email_unverified" ? (
          <Notice tone="warning" role="alert" title="Confirm your email address first">
            Open the confirmation link we emailed you, then log in.{" "}
            <Link to="/verify-email" state={{ email: failure.email }} className={textLink}>
              Get a new confirmation link
            </Link>
          </Notice>
        ) : failure?.kind === "unauthorized" ? (
          <Notice tone="error" role="alert" title="Email or password is incorrect.">
            Check both and try again, or{" "}
            <Link to="/forgot-password" className={textLink}>
              reset your password
            </Link>
            .
          </Notice>
        ) : (
          <FormFailure failure={failure} />
        )}
        <EmailField error={failure?.fieldErrors.email} defaultValue={failure?.email} />
        <Field name="password" label="Password" error={failure?.fieldErrors.password}>
          {(control) => <PasswordInput {...control} autoComplete="current-password" required />}
        </Field>
        <SubmitButton busy={busy} busyLabel="Logging in…">
          Log in
        </SubmitButton>
      </Form>

      <div className="flex flex-col items-start gap-3 border-t border-divider pt-5">
        <Link to="/forgot-password" className={textLink}>
          Forgot your password?
        </Link>
        <p>
          New to ConnectAbroad?{" "}
          <Link to="/signup" className={textLink}>
            Create an account
          </Link>
        </p>
      </div>
    </AuthPage>
  );
}
