import { Link } from "react-router";

import type { Route } from "./+types/admin-reports";
import { AccessDenied, EmptyState, Notice, RouteErrorState } from "~/components/feedback";
import { AppContainer, PageHeader } from "~/components/layout";
import { StatusLabel } from "~/components/member";
import { buttonVariants } from "~/components/ui/button";
import { REPORT_REASON_LABELS, REPORT_STATUS_LABELS, formatRelative, plural } from "~/lib/format";
import { privateMeta } from "~/lib/meta";
import { api, isDemo } from "~/lib/runtime";
import { requireMember, withSession } from "~/lib/session";
import type { ReportStatus, ReportSummary } from "~/lib/types";

export const meta: Route.MetaFunction = () => privateMeta("Reports");

const STATUSES = Object.keys(REPORT_STATUS_LABELS) as ReportStatus[];

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  // UX guard only; the server enforces the admin role (a 403 renders AccessDenied too).
  const member = await requireMember(request);
  if (member.role !== "admin") return { denied: true as const };
  const params = new URL(request.url).searchParams;
  const requested = params.get("status") as ReportStatus;
  const status = STATUSES.includes(requested) ? requested : "open";
  const page = Math.max(1, Math.floor(Number(params.get("page"))) || 1);
  const reports = await withSession(request, () => api.listReports({ status, page }));
  return { denied: false as const, status, reports };
}

export function DemoModerationNotice() {
  if (!isDemo) return null;
  return (
    <Notice tone="warning" className="mb-6">
      Demo moderation: actions here only change this browser tab's sample data. Switching to the moderator persona is not
      real authorization.
    </Notice>
  );
}

export function Severity({ value }: { value: ReportSummary["severity"] }) {
  return value === "urgent" ? <StatusLabel tone="danger">Urgent</StatusLabel> : <span>Standard</span>;
}

const owner = (report: ReportSummary) => report.assignee?.displayName ?? "Unassigned";
const reportLink = "font-semibold text-primary underline underline-offset-4 hover:text-primary-hover";

export default function AdminReportsRoute({ loaderData }: Route.ComponentProps) {
  if (loaderData.denied) {
    return (
      <AppContainer className="py-6 sm:py-8">
        <AccessDenied />
      </AppContainer>
    );
  }
  const { status, reports } = loaderData;
  const pageLink = (page: number) => `?status=${status}&page=${page}`;

  return (
    <AppContainer className="py-6 sm:py-8">
      <PageHeader
        title="Reports"
        description="Moderation queue. Use the least information needed to resolve each report."
      />
      <DemoModerationNotice />
      <nav aria-label="Report status" className="mb-6">
        <ul className="flex flex-wrap gap-2">
          {STATUSES.map((value) => (
            <li key={value}>
              <Link
                to={`?status=${value}`}
                aria-current={value === status ? "page" : undefined}
                className={buttonVariants({ variant: value === status ? "primary" : "secondary", size: "sm" })}
              >
                {REPORT_STATUS_LABELS[value]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {reports.items.length === 0 ? (
        <EmptyState title="No reports in this view." />
      ) : (
        <>
          <div
            role="region"
            aria-label="Reports table"
            tabIndex={0}
            className="hidden overflow-x-auto rounded-panel border border-divider bg-surface md:block"
          >
            <table className="w-full text-left">
              <caption className="px-4 py-3 text-left text-sm text-muted-ink">
                {REPORT_STATUS_LABELS[status]} reports, page {reports.page} of {reports.totalPages}
              </caption>
              <thead>
                <tr className="border-y border-divider text-sm">
                  {["Reported member", "Reason", "Severity", "Received", "Status", "Owner"].map((heading) => (
                    <th key={heading} scope="col" className="px-4 py-3 font-semibold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.items.map((report) => (
                  <tr key={report.id} className="border-b border-divider align-top last:border-0">
                    <td className="px-4 py-3">
                      <Link to={`/admin/reports/${report.id}`} className={reportLink}>
                        {report.reportedMember.displayName}
                      </Link>
                      {report.subjectType === "message" ? (
                        <span className="block text-sm text-muted-ink">About a message</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{REPORT_REASON_LABELS[report.reason]}</td>
                    <td className="px-4 py-3">
                      <Severity value={report.severity} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <time dateTime={report.createdAt}>{formatRelative(report.createdAt)}</time>
                    </td>
                    <td className="px-4 py-3">{REPORT_STATUS_LABELS[report.status]}</td>
                    <td className="px-4 py-3">{owner(report)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="flex flex-col gap-3 md:hidden">
            {reports.items.map((report) => (
              <li key={report.id} className="rounded-panel border border-divider bg-surface p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Link to={`/admin/reports/${report.id}`} className={reportLink}>
                    {report.reportedMember.displayName}
                  </Link>
                  {report.severity === "urgent" ? <Severity value={report.severity} /> : null}
                </div>
                <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-sm">
                  <dt className="text-muted-ink">Reason</dt>
                  <dd>
                    {REPORT_REASON_LABELS[report.reason]}
                    {report.subjectType === "message" ? " (about a message)" : ""}
                  </dd>
                  <dt className="text-muted-ink">Received</dt>
                  <dd>
                    <time dateTime={report.createdAt}>{formatRelative(report.createdAt)}</time>
                  </dd>
                  <dt className="text-muted-ink">Status</dt>
                  <dd>{REPORT_STATUS_LABELS[report.status]}</dd>
                  <dt className="text-muted-ink">Owner</dt>
                  <dd>{owner(report)}</dd>
                </dl>
              </li>
            ))}
          </ul>

          <nav aria-label="Pagination" className="mt-6 flex flex-wrap items-center gap-3">
            {reports.page > 1 ? (
              <Link to={pageLink(reports.page - 1)} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                Previous page
              </Link>
            ) : null}
            <p className="text-sm text-muted-ink">
              Page {reports.page} of {reports.totalPages} · {plural(reports.totalItems, "report")}
            </p>
            {reports.page < reports.totalPages ? (
              <Link to={pageLink(reports.page + 1)} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                Next page
              </Link>
            ) : null}
          </nav>
        </>
      )}
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
