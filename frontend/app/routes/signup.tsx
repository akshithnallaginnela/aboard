import { useEffect } from "react";
import { Form, Link, useNavigate, useNavigation } from "react-router";

import type { Route } from "./+types/signup";
import {
  AuthPage,
  EmailField,
  FormFailure,
  PasswordInput,
  displayNameError,
  emailError,
  formText,
  textLink,
} from "~/components/auth";
import { Checkbox, Field, SubmitButton, TextInput, guardSubmit } from "~/components/form";
import { actionFailure, validationFailure } from "~/lib/api";
import { privateMeta } from "~/lib/meta";
import { api } from "~/lib/runtime";

export const meta: Route.MetaFunction = () => privateMeta("Create your account");

const MIN_PASSWORD = 10;

export async function clientAction({ request }: Route.ClientActionArgs) {
  const form = await request.formData();
  // Everything except the password is returned on failure so the form can be refilled.
  const values = {
    displayName: formText(form, "displayName"),
    email: formText(form, "email"),
    confirmAdult: form.has("confirmAdult"),
    acceptTerms: form.has("acceptTerms"),
  };
  const password = String(form.get("password") ?? "");

  const fieldErrors: Record<string, string> = {};
  const nameProblem = displayNameError(values.displayName);
  if (nameProblem) fieldErrors.displayName = nameProblem;
  const emailProblem = emailError(values.email);
  if (emailProblem) fieldErrors.email = emailProblem;
  if (password.length < MIN_PASSWORD) {
    fieldErrors.password = password ? `Password must be at least ${MIN_PASSWORD} characters` : "Enter a password";
  }
  if (!values.confirmAdult) fieldErrors.confirmAdult = "Confirm that you're 18 or older. The beta is for adults only";
  if (!values.acceptTerms) {
    fieldErrors.acceptTerms = "Agree to the terms of use and privacy policy to create an account";
  }
  if (Object.keys(fieldErrors).length > 0) return { ...validationFailure(fieldErrors), values };

  try {
    await api.register({ ...values, password });
    return { ok: true as const, email: values.email };
  } catch (error) {
    return { ...actionFailure(error), values };
  }
}

export default function Signup({ actionData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const failure = actionData && !actionData.ok ? actionData : null;
  const errors = failure?.fieldErrors ?? {};
  const values = failure?.values;
  const busy = (navigation.state !== "idle" && navigation.formMethod != null) || actionData?.ok === true;

  // The email travels in navigation state, never in the URL.
  useEffect(() => {
    if (actionData?.ok) navigate("/verify-email", { state: { email: actionData.email }, replace: true });
  }, [actionData, navigate]);

  return (
    <AuthPage title="Create your account">
      <div className="flex flex-col gap-3">
        <p>
          ConnectAbroad is in early access. We're starting with a small founding community, so you may find only a
          few members at first, and features may change.
        </p>
        <p className="text-muted-ink">
          After you sign up, we'll email you a link to confirm your address before you can log in.
        </p>
      </div>

      <Form method="post" noValidate onSubmit={guardSubmit(busy)} className="flex flex-col gap-5">
        <FormFailure failure={failure} />
        <Field
          name="displayName"
          label="Display name"
          hint="The name other members see. A first name or nickname is fine."
          error={errors.displayName}
        >
          {(control) => <TextInput {...control} autoComplete="name" required defaultValue={values?.displayName} />}
        </Field>
        <EmailField
          hint="We'll send a confirmation link here. Other members never see your email."
          error={errors.email}
          defaultValue={values?.email}
        />
        <Field name="password" label="Create a password" hint="Use at least 10 characters." error={errors.password}>
          {(control) => <PasswordInput {...control} autoComplete="new-password" required />}
        </Field>
        <Checkbox
          name="confirmAdult"
          label="I'm 18 or older"
          hint="The beta is open to adults only."
          error={errors.confirmAdult}
          defaultChecked={values?.confirmAdult}
          required
        />
        <Checkbox
          name="acceptTerms"
          label={
            <>
              I agree to the{" "}
              <a href="/terms" target="_blank" rel="noreferrer" className={textLink}>
                terms of use
              </a>{" "}
              and{" "}
              <a href="/privacy" target="_blank" rel="noreferrer" className={textLink}>
                privacy policy
              </a>
            </>
          }
          hint="Both are drafts and may change. The links open in a new tab, so you won't lose what you've entered."
          error={errors.acceptTerms}
          defaultChecked={values?.acceptTerms}
          required
        />
        <SubmitButton busy={busy} busyLabel="Creating account…">
          Create account
        </SubmitButton>
      </Form>

      <p className="border-t border-divider pt-5">
        Already have an account?{" "}
        <Link to="/login" className={textLink}>
          Log in
        </Link>
      </p>
    </AuthPage>
  );
}
