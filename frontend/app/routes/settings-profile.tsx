import { useRef, useState } from "react";
import type * as React from "react";
import { Form, Link, useNavigation, useRevalidator } from "react-router";

import type { Route } from "./+types/settings-profile";
import { ActionError, Notice, RouteErrorState } from "~/components/feedback";
import {
  Checkbox,
  ErrorSummary,
  Field,
  RadioGroup,
  Select,
  SubmitButton,
  TextArea,
  TextInput,
  fieldId,
  guardSubmit,
} from "~/components/form";
import { AppContainer, PageHeader } from "~/components/layout";
import { Avatar, RouteLine, TopicList } from "~/components/member";
import { SettingsNav } from "~/components/settings";
import { Button } from "~/components/ui/button";
import { type ActionFailure, actionFailure, validationFailure } from "~/lib/api";
import { COUNTRIES, JOURNEY_LABELS, TOPIC_LABELS } from "~/lib/format";
import { privateMeta } from "~/lib/meta";
import { api } from "~/lib/runtime";
import { withSession } from "~/lib/session";
import { HELP_TOPICS, type HelpTopic, type Journey, type OwnProfile } from "~/lib/types";

export const meta: Route.MetaFunction = () => privateMeta("Your profile");

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  return { profile: await withSession(request, () => api.getOwnProfile()) };
}

const LABELS: Record<string, string> = {
  displayName: "Display name",
  journey: "Where you are in your move",
  country: "Country",
  lookingFor: "What you're looking for",
  bio: "About you",
};

const text = (form: FormData, name: string) => String(form.get(name) ?? "").trim();
const asJourney = (value: string) => (Object.hasOwn(JOURNEY_LABELS, value) ? (value as Journey) : null);
const asTopics = (form: FormData) =>
  form.getAll("helpTopics").filter((topic): topic is HelpTopic => HELP_TOPICS.includes(topic as HelpTopic));

export async function clientAction({ request }: Route.ClientActionArgs) {
  const form = await request.formData();
  const journey = asJourney(text(form, "journey"));
  const update = {
    displayName: text(form, "displayName"),
    journey,
    country: text(form, "country"),
    city: text(form, "city"),
    hometown: text(form, "hometown"),
    college: text(form, "college"),
    community: text(form, "community"),
    languages: text(form, "languages")
      .split(",")
      .map((language) => language.trim())
      .filter(Boolean),
    helpTopics: asTopics(form),
    lookingFor: text(form, "lookingFor"),
    bio: text(form, "bio"),
  };
  const errors: Record<string, string> = {};
  if (!update.displayName) errors.displayName = "Enter the name other members will see.";
  if (!journey) errors.journey = "Choose where you are in your move.";
  if (!update.country) errors.country = "Choose a country.";
  if (update.lookingFor.length > 160) errors.lookingFor = "Use 160 characters or fewer.";
  if (update.bio.length > 500) errors.bio = "Use 500 characters or fewer.";
  if (Object.keys(errors).length > 0) return validationFailure(errors);
  try {
    await api.updateOwnProfile(update);
    return { ok: true as const };
  } catch (error) {
    return actionFailure(error);
  }
}

type Preview = Pick<OwnProfile, "displayName" | "journey" | "country" | "city" | "hometown" | "helpTopics" | "lookingFor">;

function readPreview(form: HTMLFormElement): Preview {
  const data = new FormData(form);
  return {
    displayName: text(data, "displayName"),
    journey: asJourney(text(data, "journey")),
    country: text(data, "country"),
    city: text(data, "city"),
    hometown: text(data, "hometown"),
    helpTopics: asTopics(data),
    lookingFor: text(data, "lookingFor"),
  };
}

const sectionClass = "flex flex-col gap-5 rounded-panel border border-divider bg-surface p-4 sm:p-6";

export default function SettingsProfileRoute({ loaderData, actionData }: Route.ComponentProps) {
  const { profile } = loaderData;
  const navigation = useNavigation();
  const busy = navigation.state !== "idle" && navigation.formMethod !== undefined;
  const [preview, setPreview] = useState<Preview>(profile);
  const failure = actionData && !actionData.ok ? actionData : null;
  const errors = failure?.fieldErrors ?? {};
  // Keep a saved country selectable even if it isn't in the current list.
  const countries = !profile.country || COUNTRIES.includes(profile.country) ? COUNTRIES : [profile.country, ...COUNTRIES];

  return (
    <AppContainer className="py-6 sm:py-8">
      <PageHeader title="Your profile" description="What you share here helps people with a similar move find you." />
      <SettingsNav />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="flex min-w-0 flex-col gap-8">
          <PhotoSection profile={profile} />
          <Form
            method="post"
            noValidate
            onSubmit={guardSubmit(busy)}
            onChange={(event) => setPreview(readPreview(event.currentTarget))}
            className="flex flex-col gap-6"
          >
            <ErrorSummary errors={errors} labels={LABELS} />
            <ActionError failure={failure} />

            <section aria-labelledby="basics-title" className={sectionClass}>
              <h2 id="basics-title" className="text-xl font-semibold">
                Your journey
              </h2>
              <Field
                name="displayName"
                label="Display name"
                hint="The name other members see. It doesn't need to be your full legal name."
                error={errors.displayName}
              >
                {(control) => <TextInput {...control} defaultValue={profile.displayName} autoComplete="nickname" />}
              </Field>
              <RadioGroup
                name="journey"
                legend="Where are you in your move?"
                options={[
                  { value: "preparing", label: JOURNEY_LABELS.preparing, hint: "You're planning or getting ready to move." },
                  { value: "living_abroad", label: JOURNEY_LABELS.living_abroad, hint: "You already live there." },
                ]}
                defaultValue={profile.journey ?? undefined}
                error={errors.journey}
              />
              <Field
                name="country"
                label="Country"
                hint="Where you're moving to, or where you live now."
                error={errors.country}
              >
                {(control) => (
                  <Select {...control} defaultValue={profile.country}>
                    <option value="">Choose a country</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field name="city" label="City" optional>
                {(control) => <TextInput {...control} defaultValue={profile.city} />}
              </Field>
            </section>

            <section aria-labelledby="background-title" className={sectionClass}>
              <div className="flex flex-col gap-1">
                <h2 id="background-title" className="text-xl font-semibold">
                  Shared background
                </h2>
                <p className="text-muted-ink">Leave anything blank if you'd prefer not to share it.</p>
              </div>
              <Field name="hometown" label="Hometown or region you're from" optional>
                {(control) => <TextInput {...control} defaultValue={profile.hometown} />}
              </Field>
              <Field name="college" label="College or university" optional>
                {(control) => <TextInput {...control} defaultValue={profile.college} />}
              </Field>
              <Field name="community" label="Community" optional hint="Any community you'd like to mention, in your own words.">
                {(control) => <TextInput {...control} defaultValue={profile.community} />}
              </Field>
              <Field name="languages" label="Languages" optional hint="Separate with commas, for example: Tamil, English">
                {(control) => <TextInput {...control} defaultValue={profile.languages.join(", ")} />}
              </Field>
            </section>

            <section aria-labelledby="connect-title" className={sectionClass}>
              <h2 id="connect-title" className="text-xl font-semibold">
                How you'd like to connect
              </h2>
              <fieldset className="flex flex-col gap-3">
                <legend className="mb-1 font-semibold">
                  I can share experience with <span className="font-normal text-muted-ink">(optional)</span>
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {HELP_TOPICS.map((topic, index) => (
                    <Checkbox
                      key={topic}
                      id={index === 0 ? fieldId("helpTopics") : `${fieldId("helpTopics")}-${topic}`}
                      name="helpTopics"
                      value={topic}
                      label={TOPIC_LABELS[topic]}
                      defaultChecked={profile.helpTopics.includes(topic)}
                    />
                  ))}
                </div>
              </fieldset>
              <Field
                name="lookingFor"
                label="What you're looking for"
                optional
                hint="Shown on your profile and in search. Up to 160 characters."
                error={errors.lookingFor}
              >
                {(control) => (
                  <TextArea {...control} className="min-h-20" maxLength={160} defaultValue={profile.lookingFor} />
                )}
              </Field>
              <Field name="bio" label="About you" optional hint="Up to 500 characters." error={errors.bio}>
                {(control) => <TextArea {...control} maxLength={500} defaultValue={profile.bio} />}
              </Field>
            </section>

            {actionData?.ok && navigation.state === "idle" ? (
              <Notice tone="success" role="status">
                Profile saved.
              </Notice>
            ) : null}
            <SubmitButton busy={busy} busyLabel="Saving…" className="self-start">
              Save profile
            </SubmitButton>
          </Form>
        </div>

        <aside className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
          <section aria-labelledby="preview-title" className="rounded-panel border border-divider bg-surface p-4">
            <h2 id="preview-title" className="text-lg font-semibold">
              Preview: what members see
            </h2>
            <div className="mt-3 flex gap-3 rounded-panel border border-divider p-3">
              <Avatar name={preview.displayName || profile.displayName} src={profile.avatarUrl} />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <p className="text-lg font-semibold leading-snug">{preview.displayName || "Your display name"}</p>
                {preview.journey ? (
                  <RouteLine
                    from={preview.hometown}
                    journey={preview.journey}
                    city={preview.city}
                    country={preview.country}
                  />
                ) : null}
                {preview.lookingFor ? <p>{preview.lookingFor}</p> : null}
                <TopicList topics={preview.helpTopics} limit={3} />
              </div>
            </div>
          </section>
          <section aria-labelledby="visibility-title" className="rounded-panel bg-soft-context p-4">
            <h2 id="visibility-title" className="font-semibold">
              Who can see your profile
            </h2>
            <p className="mt-1">
              Visible to signed-in members only. Never shown on your profile: your email, your messages, reports, or an
              exact address.
            </p>
            <Link
              to="/settings/privacy"
              className="mt-2 inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4"
            >
              Change search visibility
            </Link>
          </section>
        </aside>
      </div>
    </AppContainer>
  );
}

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

function PhotoSection({ profile }: { profile: OwnProfile }) {
  const revalidator = useRevalidator();
  const heading = useRef<HTMLHeadingElement>(null);
  const [busy, setBusy] = useState<"upload" | "remove" | null>(null);
  const [fileError, setFileError] = useState<string>();
  const [failure, setFailure] = useState<ActionFailure | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function run(kind: "upload" | "remove", call: () => Promise<unknown>, success: string) {
    setBusy(kind);
    setFailure(null);
    setDone(null);
    try {
      await call();
    } catch (error) {
      setFailure(actionFailure(error));
      return false;
    } finally {
      setBusy(null);
    }
    setDone(success);
    void revalidator.revalidate();
    return true;
  }

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const file = new FormData(form).get("avatar");
    if (!(file instanceof File) || file.size === 0) return setFileError("Choose a photo to upload.");
    if (!PHOTO_TYPES.includes(file.type)) return setFileError("Choose a JPEG, PNG or WebP image.");
    if (file.size > MAX_PHOTO_BYTES) return setFileError("Choose an image that is 2 MB or smaller.");
    setFileError(undefined);
    if (await run("upload", () => api.uploadAvatar(file), "Photo updated.")) form.reset();
  }

  async function remove() {
    if (busy) return;
    // The button disappears once the photo is gone; keep keyboard focus in this section.
    if (await run("remove", () => api.removeAvatar(), "Photo removed.")) heading.current?.focus();
  }

  return (
    <section aria-labelledby="photo-title" className={sectionClass}>
      <h2 id="photo-title" ref={heading} tabIndex={-1} className="text-xl font-semibold">
        Photo
      </h2>
      <div className="flex flex-wrap items-start gap-4">
        <Avatar name={profile.displayName} src={profile.avatarUrl} size="lg" />
        <form noValidate onSubmit={upload} className="flex min-w-0 flex-1 basis-60 flex-col gap-3">
          <Field
            name="avatar"
            label="Profile photo"
            optional
            hint="JPEG, PNG or WebP, up to 2 MB."
            error={fileError}
          >
            {(control) => (
              <input
                {...control}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="block w-full min-w-0 text-base file:mr-3 file:min-h-11 file:rounded-button file:border file:border-control-border file:bg-surface file:px-4 file:font-semibold file:text-ink"
              />
            )}
          </Field>
          <div className="flex flex-wrap gap-3">
            <SubmitButton variant="secondary" busy={busy === "upload"} busyLabel="Uploading…">
              Upload photo
            </SubmitButton>
            {profile.avatarUrl ? (
              <Button variant="quiet" aria-disabled={busy !== null || undefined} onClick={() => void remove()}>
                {busy === "remove" ? "Removing…" : "Remove photo"}
              </Button>
            ) : null}
          </div>
        </form>
      </div>
      <ActionError failure={failure} />
      {done ? (
        <Notice tone="success" role="status">
          {done}
        </Notice>
      ) : null}
    </section>
  );
}

export function ErrorBoundary() {
  return (
    <AppContainer>
      <RouteErrorState />
    </AppContainer>
  );
}
