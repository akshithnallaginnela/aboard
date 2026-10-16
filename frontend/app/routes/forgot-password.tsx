import { Form, Link, useNavigation } from "react-router";

import type { Route } from "./+types/forgot-password";
import { AuthPage, EmailField, FormFailure, submitEmail, textLink } from "~/components/auth";
import { Notice } from "~/components/feedback";
import { SubmitButton, guardSubmit } from "~/components/form";
import { privateMeta } from "~/lib/meta";
import { api, isDemo } from "~/lib/runtime";

export const meta: Route.MetaFunction = () => privateMeta("Reset your password");

// The answer is identical whether or not the address has an account.
export function clientAction({ request }: Route.ClientActionArgs) {
  return submitEmail(request, (email) => api.requestPasswordReset(email));
}

export default function ForgotPassword({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const busy = navigation.state !== "idle" && navigation.formMethod != null;
  const failure = actionData && !actionData.ok ? actionData : null;

  return (
    <AuthPage title="Reset your password">
      <p>
        Enter the email address you use for ConnectAbroad. If it belongs to an account, we'll send a link to choose a
        new password.
      </p>
      {isDemo ? <Notice title="Demo: no email is sent." /> : null}
      {actionData?.ok ? (
        <Notice tone="success" role="status" title="Check your email">
          If an account uses that address, we've sent a link to reset the password. The link expires soon and works
          once.
        </Notice>
      ) : null}

      <Form method="post" noValidate onSubmit={guardSubmit(busy)} className="flex flex-col gap-5">
        <FormFailure failure={failure} />
        <EmailField error={failure?.fieldErrors.email} defaultValue={actionData?.email} />
        <SubmitButton busy={busy} busyLabel="Sending link…">
          Send reset link
        </SubmitButton>
      </Form>

      <p className="border-t border-divider pt-5">
        <Link to="/login" className={textLink}>
          Back to log in
        </Link>
      </p>
    </AuthPage>
  );
}
