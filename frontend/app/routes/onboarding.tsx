import { ChevronLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Form, Link, redirect, useNavigation } from "react-router";

import type { Route } from "./+types/onboarding";
import { FormFailure, displayNameError, formText, textLink } from "~/components/auth";
import { RouteErrorState } from "~/components/feedback";
import { Checkbox, Field, RadioGroup, Select, SubmitButton, TextArea, TextInput, fieldId, guardSubmit } from "~/components/form";
import { AppContainer, PageHeader } from "~/components/layout";
import { buttonVariants } from "~/components/ui/button";
import { actionFailure, validationFailure } from "~/lib/api";
import { COUNTRIES, TOPIC_LABELS, plural } from "~/lib/format";
import { privateMeta } from "~/lib/meta";
import { api } from "~/lib/runtime";
import { withSession } from "~/lib/session";
import { HELP_TOPICS, type HelpTopic, type Journey, type OwnProfile, type ProfileUpdate } from "~/lib/types";
import { cn } from "~/lib/utils";

export const meta: Route.MetaFunction = () => privateMeta("Set up your profile");

const STEPS = ["Your journey", "Shared background", "How you'd like to connect"] as const;
const LOOKING_FOR_MAX = 160;
const VISIBILITY = "Visible to signed-in members. Your email is never shown.";

type Errors = Record<string, string>;

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const profile = await withSession(request, () => api.getOwnProfile());
  const requested = Number(new URL(request.url).searchParams.get("step"));
  const step = requested === 2 || requested === 3 ? requested : 1;
  // Later steps build on the journey: start at step 1 until it has been saved.
  if (step > 1 && (!profile.journey || !profile.country)) throw redirect("/onboarding");
  return { profile, step };
}

const isTopic = (value: unknown): value is HelpTopic =>
  typeof value === "string" && (HELP_TOPICS as readonly string[]).includes(value);

export async function clientAction({ request }: Route.ClientActionArgs) {
  const form = await request.formData();
  const step = Number(form.get("step"));
  const fieldErrors: Errors = {};
  let update: ProfileUpdate;

  if (step === 1) {
    const displayName = formText(form, "displayName");
    const journey = formText(form, "journey");
    const country = formText(form, "country");
    const nameProblem = displayNameError(displayName);
    if (nameProblem) fieldErrors.displayName = nameProblem;
    if (journey !== "preparing" && journey !== "living_abroad") {
      fieldErrors.journey = "Choose whether you're preparing to move or already living abroad";
    }
    if (!COUNTRIES.includes(country)) {
      fieldErrors.country =
        journey === "living_abroad" ? "Choose the country where you live now" : "Choose the country you're moving to";
    }
    update = { displayName, journey: journey as Journey, country, city: formText(form, "city") };
  } else if (step === 2) {
    update = {
      hometown: formText(form, "hometown"),
      college: formText(form, "college"),
      community: formText(form, "community"),
      languages: formText(form, "languages")
        .split(",")
        .map((language) => language.trim())
        .filter(Boolean),
    };
  } else {
    const lookingFor = formText(form, "lookingFor");
    if (lookingFor.length > LOOKING_FOR_MAX) {
      fieldErrors.lookingFor = `Keep this to ${LOOKING_FOR_MAX} characters or fewer`;
    }
    update = { helpTopics: form.getAll("helpTopics").filter(isTopic), lookingFor, completeOnboarding: true };
  }

  if (Object.keys(fieldErrors).length > 0) return validationFailure(fieldErrors);
  try {
    await api.updateOwnProfile(update);
  } catch (error) {
    return actionFailure(error);
  }
  if (step === 1 || step === 2) return redirect(`/onboarding?step=${step + 1}`);
  return { ok: true as const };
}

function JourneyFields({ profile, errors }: { profile: OwnProfile; errors: Errors }) {
  const [journey, setJourney] = useState<string>(profile.journey ?? "");
  const countryLabel =
    journey === "living_abroad"
      ? "Where do you live now?"
      : journey === "preparing"
        ? "Where are you moving?"
        : "Which country are you moving to or living in?";
  return (
    <>
      <Field
        name="displayName"
        label="Display name"
        hint="The name other members see. A first name or nickname is fine."
        error={errors.displayName}
      >
        {(control) => <TextInput {...control} autoComplete="name" required defaultValue={profile.displayName} />}
      </Field>
      <RadioGroup
        name="journey"
        legend="Where are you in your journey?"
        options={[
          { value: "preparing", label: "Preparing to move" },
          { value: "living_abroad", label: "Already living abroad" },
        ]}
        defaultValue={profile.journey ?? undefined}
        onChange={setJourney}
        error={errors.journey}
      />
      <Field name="country" label={countryLabel} error={errors.country}>
        {(control) => (
          <Select {...control} required defaultValue={profile.country}>
            <option value="">Choose a country</option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field name="city" label="City" optional error={errors.city}>
        {(control) => <TextInput {...control} defaultValue={profile.city} />}
      </Field>
    </>
  );
}

function BackgroundFields({ profile, errors }: { profile: OwnProfile; errors: Errors }) {
  return (
    <>
      <p className="text-muted-ink">
        Leave blank if you'd prefer not to share. These are self-described and never used to guess nationality,
        religion or immigration status.
      </p>
      <Field name="hometown" label="Hometown" optional error={errors.hometown}>
        {(control) => <TextInput {...control} defaultValue={profile.hometown} />}
      </Field>
      <Field name="college" label="College or university" optional error={errors.college}>
        {(control) => <TextInput {...control} defaultValue={profile.college} />}
      </Field>
      <Field
        name="community"
        label="Community"
        optional
        hint="For example, an alumni network or a regional association."
        error={errors.community}
      >
        {(control) => <TextInput {...control} defaultValue={profile.community} />}
      </Field>
      <Field
        name="languages"
        label="Languages you speak"
        optional
        hint="Separate languages with commas, for example: Tamil, English"
        error={errors.languages}
      >
        {(control) => <TextInput {...control} defaultValue={profile.languages.join(", ")} />}
      </Field>
    </>
  );
}

function ConnectFields({ profile, errors }: { profile: OwnProfile; errors: Errors }) {
  const [length, setLength] = useState(profile.lookingFor.length);
  const remaining = LOOKING_FOR_MAX - length;
  const topicsId = fieldId("helpTopics");
  const countId = `${fieldId("lookingFor")}-count`;
  return (
    <>
      <fieldset className="flex flex-col gap-3" aria-describedby={errors.helpTopics ? `${topicsId}-error` : undefined}>
        <legend className="mb-1 font-semibold">
          {profile.journey === "living_abroad" ? "I can share experience with…" : "I'd like to learn about…"}
          <span className="font-normal text-muted-ink"> (optional)</span>
        </legend>
        {errors.helpTopics ? (
          <p id={`${topicsId}-error`} className="font-semibold text-danger">
            <span className="sr-only">Error: </span>
            {errors.helpTopics}
          </p>
        ) : null}
        {HELP_TOPICS.map((topic, index) => (
          <Checkbox
            key={topic}
            id={index === 0 ? topicsId : `${topicsId}-${topic}`}
            name="helpTopics"
            value={topic}
            label={TOPIC_LABELS[topic]}
            defaultChecked={profile.helpTopics.includes(topic)}
          />
        ))}
      </fieldset>
      <Field
        name="lookingFor"
        label="What would you like from a connection?"
        optional
        hint="A sentence other members will see, like “Hoping to hear how others found housing near campus.”"
        error={errors.lookingFor}
      >
        {(control) => (
          <>
            <TextArea
              {...control}
              aria-describedby={[control["aria-describedby"], countId].filter(Boolean).join(" ")}
              rows={3}
              defaultValue={profile.lookingFor}
              onChange={(event) => setLength(event.target.value.length)}
            />
            <p id={countId} className={cn("text-sm", remaining < 0 ? "font-semibold text-danger" : "text-muted-ink")}>
              {remaining >= 0
                ? `You have ${plural(remaining, "character")} remaining`
                : `You have ${plural(-remaining, "character")} too many`}
            </p>
          </>
        )}
      </Field>
    </>
  );
}

export default function Onboarding({ loaderData, actionData }: Route.ComponentProps) {
  const { profile, step } = loaderData;
  const navigation = useNavigation();
  const busy = navigation.state !== "idle" && navigation.formMethod != null;
  const failure = actionData && !actionData.ok ? actionData : null;
  const errors = failure?.fieldErrors ?? {};
  const done = actionData?.ok === true;

  // Steps share one path, so the root's route focus doesn't fire: move focus to the new heading here.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    document.querySelector<HTMLElement>("main h1")?.focus();
  }, [step, done]);

  if (done) {
    return (
      <AppContainer className="py-6 sm:py-8">
        <PageHeader title="Your profile is ready" description={VISIBILITY} />
        <div className="flex max-w-xl flex-col items-start gap-5">
          <p>
            You can change these details any time in{" "}
            <Link to="/settings/profile" className={textLink}>
              your profile settings
            </Link>
            .
          </p>
          <Link to="/people" className={buttonVariants()}>
            Find people
          </Link>
        </div>
      </AppContainer>
    );
  }

  return (
    <AppContainer className="py-6 sm:py-8">
      {step > 1 ? (
        <Link
          to={`/onboarding?step=${step - 1}`}
          className="-ml-1 mb-2 inline-flex min-h-11 items-center gap-1 rounded-button px-1 font-semibold text-primary underline underline-offset-4"
        >
          <ChevronLeft aria-hidden="true" className="size-5" />
          Back
        </Link>
      ) : null}
      <PageHeader
        title={
          <>
            <span className="mb-1 block text-base font-semibold text-muted-ink">
              Step {step} of 3<span className="sr-only">:</span>
            </span>{" "}
            {STEPS[step - 1]}
          </>
        }
        description={VISIBILITY}
      />
      <Form
        key={step}
        method="post"
        noValidate
        onSubmit={guardSubmit(busy)}
        className="flex max-w-xl flex-col gap-6"
      >
        <input type="hidden" name="step" value={step} />
        <FormFailure failure={failure} />
        {step === 1 ? (
          <JourneyFields profile={profile} errors={errors} />
        ) : step === 2 ? (
          <BackgroundFields profile={profile} errors={errors} />
        ) : (
          <ConnectFields profile={profile} errors={errors} />
        )}
        <div>
          <SubmitButton busy={busy} busyLabel="Saving…">
            Save and continue
          </SubmitButton>
        </div>
      </Form>
    </AppContainer>
  );
}

export function ErrorBoundary() {
  return (
    <AppContainer>
      <RouteErrorState />
    </AppContainer>
  );
}
