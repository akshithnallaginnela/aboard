import { Link, useFetcher, useLocation, type ShouldRevalidateFunctionArgs } from "react-router";

import type { Route } from "./+types/verify-email";
import { AuthPage, EmailField, FormFailure, submitEmail, textLink, useHideToken } from "~/components/auth";
import { Notice, RouteErrorState } from "~/components/feedback";
import { SubmitButton, guardSubmit } from "~/components/form";
import { PublicContainer } from "~/components/layout";
import { buttonVariants } from "~/components/ui/button";
import { isApiError } from "~/lib/api";
import { privateMeta } from "~/lib/meta";
import { api, isDemo } from "~/lib/runtime";

export const meta: Route.MetaFunction = () => [
  ...privateMeta("Confirm your email"),
  { name: "referrer", content: "no-referrer" },
];

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return { status: "check_inbox" as const };
  try {
    await api.verifyEmail(token);
    return { status: "verified" as const };
  } catch (error) {
    if (isApiError(error) && (error.kind === "validation" || error.kind === "not_found" || error.kind === "conflict")) {
      return { status: "invalid" as const };
    }
    throw error; // unavailable and other failures: ErrorBoundary with retry
  }
}

/** Tokens are single-use: never re-run verification just because the resend form was submitted. */
export function shouldRevalidate({ formMethod, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  return formMethod ? false : defaultShouldRevalidate;
}

export function clientAction({ request }: Route.ClientActionArgs) {
  return submitEmail(request, (email) => api.resendVerification(email));
}

function ResendForm({ email }: { email: string }) {
  const fetcher = useFetcher<typeof clientAction>();
  const busy = fetcher.state !== "idle";
  const result = fetcher.data;
  const failure = result && !result.ok ? result : null;
  return (
    <fetcher.Form
      method="post"
      action="/verify-email"
      noValidate
      onSubmit={guardSubmit(busy)}
      className="flex flex-col gap-5 border-t border-divider pt-5"
    >
      <h2 className="text-xl font-semibold">Send a new confirmation link</h2>
      {isDemo ? <Notice title="Demo: no email is sent." /> : null}
      {result?.ok ? (
        <Notice tone="success" role="status" title="If that address needs confirming, we've sent a new link." />
      ) : null}
      <FormFailure failure={failure} />
      <EmailField error={failure?.fieldErrors.email} defaultValue={email} />
      <SubmitButton variant="secondary" busy={busy} busyLabel="Sending…">
        Send a new link
      </SubmitButton>
    </fetcher.Form>
  );
}

export default function VerifyEmail({ loaderData }: Route.ComponentProps) {
  useHideToken();
  const location = useLocation();
  const email: string = typeof location.state?.email === "string" ? location.state.email : "";

  if (loaderData.status === "verified") {
    return (
      <AuthPage title="Your email is confirmed">
        <p>Log in to set up your profile.</p>
        <Link to="/login?reason=verified" className={buttonVariants()}>
          Log in
        </Link>
      </AuthPage>
    );
  }

  if (loaderData.status === "invalid") {
    return (
      <AuthPage title="This link has expired or was already used">
        <p>
          Confirmation links work once and expire after a while. If you've already confirmed your email,{" "}
          <Link to="/login" className={textLink}>
            log in
          </Link>
          . Otherwise, ask for a new link below.
        </p>
        <ResendForm email={email} />
      </AuthPage>
    );
  }

  return (
    <AuthPage title="Check your inbox">
      <div className="flex flex-col gap-3">
        {email ? (
          <p>
            Look for a message sent to <strong className="font-semibold">{email}</strong> and open the confirmation link
            in it, then log in.
          </p>
        ) : (
          <p>We email a confirmation link to the address used to create an account. Open it, then log in.</p>
        )}
        <p className="text-muted-ink">
          The link works once and expires after a while. If it hasn't arrived, check your spam folder or ask for a new
          one.
        </p>
      </div>
      <ResendForm email={email} />
      <p className="border-t border-divider pt-5">
        <Link to="/login" className={textLink}>
          Back to log in
        </Link>
      </p>
    </AuthPage>
  );
}

export function ErrorBoundary() {
  return (
    <PublicContainer>
      <RouteErrorState />
    </PublicContainer>
  );
}
