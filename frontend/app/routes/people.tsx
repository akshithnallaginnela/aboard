import { useState } from "react";
import { Form, Link, useNavigation } from "react-router";

import type { Route } from "./+types/people";
import { EmptyState, LoadingRows, RouteErrorState } from "~/components/feedback";
import { Checkbox, Field, Select, SubmitButton, TextInput } from "~/components/form";
import { AppContainer, PageHeader } from "~/components/layout";
import { PersonRow, activeFilterCount, parseMemberSearch, searchHref } from "~/components/people";
import { Button, buttonVariants } from "~/components/ui/button";
import { JOURNEY_LABELS, TOPIC_LABELS, plural } from "~/lib/format";
import { privateMeta } from "~/lib/meta";
import { api } from "~/lib/runtime";
import { requireMember, withSession } from "~/lib/session";
import { cn } from "~/lib/utils";

export const meta: Route.MetaFunction = () => privateMeta("Find people");

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  await requireMember(request);
  const query = parseMemberSearch(new URL(request.url).searchParams);
  const [filters, people] = await withSession(request, () =>
    Promise.all([api.getDiscoveryFilters(), api.searchMembers(query)]),
  );
  return { query, filters, people };
}

export default function PeopleRoute({ loaderData }: Route.ComponentProps) {
  const { query, filters, people } = loaderData;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  const count = activeFilterCount(query);
  const missingCountry = query.country && !filters.countries.some((country) => country.value === query.country);

  return (
    <AppContainer className="py-6 sm:py-8">
      <PageHeader
        title="Find people with a shared starting point."
        description="Look for shared roots, a similar journey, or experience with a question on your mind."
      />
      <div className="grid items-start gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8">
        <aside aria-label="Search and filters" className="rounded-panel border border-divider bg-surface p-4 sm:p-5">
          <Button
            variant="secondary"
            aria-expanded={filtersOpen}
            aria-controls="people-filters"
            className="w-full lg:hidden"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            Search and filters{count > 0 ? ` (${count} active)` : ""}
          </Button>
          <div id="people-filters" className={cn("pt-4 lg:block lg:pt-0", !filtersOpen && "hidden")}>
            <Form key={searchHref(query)} method="get" action="/people" role="search" className="flex flex-col gap-5">
              <Field name="q" label="Search people" hint="A name, college, hometown or community.">
                {(control) => <TextInput {...control} defaultValue={query.q ?? ""} maxLength={120} type="search" />}
              </Field>
              <Field name="journey" label="Their journey">
                {(control) => (
                  <Select {...control} defaultValue={query.journey ?? ""}>
                    <option value="">Any journey</option>
                    {Object.entries(JOURNEY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field name="country" label="Current or destination country">
                {(control) => (
                  <Select {...control} defaultValue={query.country ?? ""}>
                    <option value="">Any country</option>
                    {missingCountry ? <option value={query.country}>{query.country} (no current matches)</option> : null}
                    {filters.countries.map((country) => (
                      <option key={country.value} value={country.value}>{country.label} ({country.count})</option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field name="topic" label="Experience with">
                {(control) => (
                  <Select {...control} defaultValue={query.topic ?? ""}>
                    <option value="">Any topic</option>
                    {filters.topics.map((topic) => (
                      <option key={topic.value} value={topic.value}>{TOPIC_LABELS[topic.value]} ({topic.count})</option>
                    ))}
                  </Select>
                )}
              </Field>
              <Checkbox name="shared" value="1" label="Shared background only" defaultChecked={Boolean(query.shared)} />
              <div className="flex flex-wrap items-center gap-3">
                <SubmitButton busy={busy} busyLabel="Finding people…">Find people</SubmitButton>
                <Link to="/people" className={buttonVariants({ variant: "quiet", size: "sm" })}>Clear filters</Link>
              </div>
            </Form>
          </div>
        </aside>

        <section aria-label="People results" aria-busy={busy} className="min-w-0">
          <p role="status" className="mb-4 text-muted-ink">
            {busy ? "Finding people…" : `${plural(people.totalItems, "matching member")}${count ? ` · ${plural(count, "active filter")}` : ""}`}
          </p>
          {people.items.length === 0 ? (
            <EmptyState
              title={people.totalItems > 0 ? "No members on this page." : "No matching members yet."}
              action={
                <Link
                  to={people.totalItems > 0 ? searchHref(query) : "/people"}
                  className={buttonVariants({ variant: "secondary" })}
                >
                  {people.totalItems > 0 ? "View the first page" : "Clear filters"}
                </Link>
              }
            >
              Try fewer filters, or return as the founding community grows. You can explore without inviting anyone.
            </EmptyState>
          ) : (
            <ul className="flex flex-col gap-4">
              {people.items.map((member) => <li key={member.id}><PersonRow member={member} /></li>)}
            </ul>
          )}
          {people.totalPages > 1 ? (
            <nav aria-label="People pagination" className="mt-6 flex flex-wrap items-center gap-3">
              {people.page > 1 ? (
                <Link to={searchHref(query, people.page - 1)} className={buttonVariants({ variant: "secondary" })}>Previous page</Link>
              ) : null}
              <p className="text-sm text-muted-ink">Page {people.page} of {people.totalPages}</p>
              {people.page < people.totalPages ? (
                <Link to={searchHref(query, people.page + 1)} className={buttonVariants({ variant: "secondary" })}>Next page</Link>
              ) : null}
            </nav>
          ) : null}
        </section>
      </div>
    </AppContainer>
  );
}

export function HydrateFallback() {
  return <AppContainer className="py-6"><LoadingRows label="Finding people" /></AppContainer>;
}

export function ErrorBoundary() {
  return <AppContainer><RouteErrorState /></AppContainer>;
}
