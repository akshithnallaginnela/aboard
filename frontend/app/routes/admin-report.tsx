import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router";

import type { Route } from "./+types/admin-report";
import { AccessDenied, ActionError, EmptyState, Notice, RouteErrorState } from "~/components/feedback";
import { ErrorSummary, Field, Select, SubmitButton, TextArea } from "~/components/form";
import { AppContainer, PageHeader } from "~/components/layout";
import { StatusLabel } from "~/components/member";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { type ActionFailure, actionFailure } from "~/lib/api";
import { REPORT_OUTCOME_LABELS, REPORT_REASON_LABELS, REPORT_STATUS_LABELS, formatDate, formatTime } from "~/lib/format";
import { privateMeta } from "~/lib/meta";
import { api, isDemo } from "~/lib/runtime";
import { requireMember, withSession } from "~/lib/session";
import type { ReportDetail, ReportOutcome } from "~/lib/types";
import { DemoModerationNotice, Severity } from "./admin-reports";

export const meta: Route.MetaFunction = () => privateMeta("Report details");

export async function clientLoader({ request, params }: Route.ClientLoaderArgs) {
  // The API must enforce this role independently of the frontend guard.
  const member = await requireMember(request);
  if (member.role !== "admin") return { denied: true as const };
  const report = await withSession(request, () => api.getReport(params.reportId));
  return { denied: false as const, report, memberId: member.id };
}

export default function AdminReportRoute({ loaderData }: Route.ComponentProps) {
  return (
    <AppContainer className="py-6 sm:py-8">
      {loaderData.denied ? (
        <AccessDenied />
      ) : (
        <ReportWorkspace key={loaderData.report.id} initialReport={loaderData.report} memberId={loaderData.memberId} />
      )}
    </AppContainer>
  );
}

const OUTCOMES = Object.keys(REPORT_OUTCOME_LABELS) as ReportOutcome[];
type Mutation = "assign" | "note" | "resolve";

function ReportWorkspace({ initialReport, memberId }: { initialReport: ReportDetail; memberId: string }) {
  const [report, setReport] = useState(initialReport);
  const [busy, setBusy] = useState<Mutation | null>(null);
  const inFlight = useRef(false);
  const [failure, setFailure] = useState<ActionFailure | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [note, setNote] = useState("");
  const [noteErrors, setNoteErrors] = useState<Record<string, string>>({});
  const [outcome, setOutcome] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolutionErrors, setResolutionErrors] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);
  const reviewButton = useRef<HTMLButtonElement>(null);
  const resolved = report.status === "resolved";

  async function mutate(action: Mutation, save: () => Promise<ReportDetail>) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(action);
    setFailure(null);
    setAnnouncement("");
    try {
      const updated = await save();
      setReport(updated);
      if (action === "note") {
        setNote("");
        setNoteErrors({});
      }
      if (action === "resolve") {
        setResolutionNote("");
        setOutcome("");
        setResolutionErrors({});
        setConfirming(false);
      }
      const result = action === "assign" ? "Report assigned to you." : action === "note" ? "Moderator note added." : "Report resolved.";
      setAnnouncement(isDemo ? `Demo: ${result} Only sample data changed.` : result);
    } catch (error) {
      const result = actionFailure(error);
      setFailure(result);
      if (action === "note") {
        setNoteErrors(result.fieldErrors.body ? { moderatorNote: result.fieldErrors.body } : {});
      }
      if (action === "resolve") {
        setResolutionErrors({
          ...(result.fieldErrors.outcome ? { outcome: result.fieldErrors.outcome } : {}),
          ...(result.fieldErrors.note ? { resolutionNote: result.fieldErrors.note } : {}),
        });
        // Field corrections belong in the form, while other failures remain in the confirmation.
        if (result.kind === "validation") setConfirming(false);
      }
    } finally {
      inFlight.current = false;
      setBusy(null);
    }
  }

  function addNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    setFailure(null);
    setResolutionErrors({});
    const body = note.trim();
    if (!body || body.length > 1000) {
      setNoteErrors({ moderatorNote: "Enter a moderator note between 1 and 1000 characters." });
      return;
    }
    setNoteErrors({});
    void mutate("note", () => api.addReportNote(report.id, body));
  }

  function reviewResolution(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || resolved) return;
    setNoteErrors({});
    const errors: Record<string, string> = {};
    if (!OUTCOMES.includes(outcome as ReportOutcome)) errors.outcome = "Choose a resolution outcome.";
    if (!resolutionNote.trim() || resolutionNote.trim().length > 1000) {
      errors.resolutionNote = "Explain the resolution in 1 to 1000 characters.";
    }
    setResolutionErrors(errors);
    setFailure(null);
    if (Object.keys(errors).length === 0) setConfirming(true);
  }

  if (failure?.kind === "forbidden") return <AccessDenied />;

  return (
    <>
      <Link to="/admin/reports" className="mb-4 inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4">
        Back to reports
      </Link>
      <PageHeader title="Report details" description={`Case ${report.id}. Review only the evidence submitted for this report.`} />
      <DemoModerationNotice />
      {announcement ? <Notice tone="success" role="status" className="mb-6">{announcement}</Notice> : null}
      {!confirming ? <ActionError failure={failure} /> : null}

      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
        <div className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby="report-evidence-heading" className="rounded-panel border border-divider bg-surface p-5 sm:p-6">
            <h2 id="report-evidence-heading" className="text-xl font-semibold">Submitted evidence</h2>
            <dl className="mt-4 grid gap-x-4 gap-y-2 sm:grid-cols-[auto_minmax(0,1fr)]">
              <dt className="text-muted-ink">Reported member</dt><dd className="break-words font-semibold">{report.reportedMember.displayName}</dd>
              <dt className="text-muted-ink">Reported by</dt><dd className="break-words">{report.reporter.displayName}</dd>
              <dt className="text-muted-ink">Reason</dt><dd>{REPORT_REASON_LABELS[report.reason]}</dd>
              <dt className="text-muted-ink">Received</dt><dd><CaseTime value={report.createdAt} /></dd>
            </dl>
            <h3 className="mt-6 font-semibold">Reporter's explanation</h3>
            <p className="mt-2 whitespace-pre-wrap break-words text-muted-ink">{report.details || "No additional explanation was provided."}</p>
            {report.reportedMessage ? (
              <figure className="mt-6 rounded-panel bg-canvas p-4">
                <figcaption className="mb-2 font-semibold">Reported message · <CaseTime value={report.reportedMessage.sentAt} /></figcaption>
                <blockquote className="whitespace-pre-wrap break-words">{report.reportedMessage.body}</blockquote>
              </figure>
            ) : null}
            <p className="mt-4 text-sm text-muted-ink">This view contains the report and any selected message. Other conversations are not available here.</p>
          </section>

          <section aria-labelledby="moderator-notes-heading" className="rounded-panel border border-divider bg-surface p-5 sm:p-6">
            <h2 id="moderator-notes-heading" className="text-xl font-semibold">Moderator notes</h2>
            {report.notes.length === 0 ? <p className="mt-3 text-muted-ink">No moderator notes yet.</p> : (
              <ol className="mt-4 flex flex-col gap-4">
                {report.notes.map((entry) => (
                  <li key={entry.id} className="border-b border-divider pb-4 last:border-0">
                    <p className="text-sm text-muted-ink"><span className="font-semibold text-ink">{entry.author.displayName}</span> · <CaseTime value={entry.createdAt} /></p>
                    <p className="mt-2 whitespace-pre-wrap break-words">{entry.body}</p>
                  </li>
                ))}
              </ol>
            )}
            <form noValidate onSubmit={addNote} className="mt-5 flex flex-col items-start gap-4">
              <ErrorSummary errors={noteErrors} labels={{ moderatorNote: "Moderator note" }} />
              <Field name="moderatorNote" label="Add a moderator note" hint="Keep notes relevant to this case. Do not copy unrelated private conversations." error={noteErrors.moderatorNote} className="w-full">
                {(control) => <TextArea {...control} value={note} maxLength={1000} disabled={busy !== null} onChange={(event) => setNote(event.target.value)} />}
              </Field>
              <SubmitButton busy={busy === "note"} busyLabel="Saving note…" disabled={busy !== null && busy !== "note"}>Save note</SubmitButton>
            </form>
          </section>

          <section aria-labelledby="case-history-heading">
            <h2 id="case-history-heading" className="mb-4 text-xl font-semibold">Case history</h2>
            {report.history.length === 0 ? <EmptyState title="No case actions recorded yet." /> : (
              <ol className="flex flex-col gap-4 border-l border-divider pl-4">
                {report.history.map((entry) => (
                  <li key={entry.id}>
                    <p className="break-words font-semibold">{entry.action}</p>
                    <p className="text-sm text-muted-ink">{entry.actor.displayName} · <CaseTime value={entry.createdAt} /></p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby="case-status-heading" className="rounded-panel border border-divider bg-surface p-5 sm:p-6">
            <h2 id="case-status-heading" tabIndex={-1} className="text-xl font-semibold">Status and owner</h2>
            <div className="mt-4 flex flex-wrap items-center gap-3"><StatusLabel>{REPORT_STATUS_LABELS[report.status]}</StatusLabel><Severity value={report.severity} /></div>
            <p className="mt-4 break-words">Assigned to: <span className="font-semibold">{report.assignee?.displayName ?? "Unassigned"}</span></p>
            {!resolved && report.assignee?.id !== memberId ? (
              <Button className="mt-4" variant="secondary" disabled={busy !== null} onClick={() => void mutate("assign", () => api.assignReportToMe(report.id))}>
                {busy === "assign" ? "Assigning…" : "Assign to me"}
              </Button>
            ) : null}
            {report.outcome ? <p className="mt-4 font-semibold">Outcome: {REPORT_OUTCOME_LABELS[report.outcome]}</p> : null}
          </section>

          {!resolved ? (
            <section aria-labelledby="resolve-heading" className="rounded-panel border border-divider bg-surface p-5 sm:p-6">
              <h2 id="resolve-heading" className="text-xl font-semibold">Resolve report</h2>
              <p className="mt-2 text-sm text-muted-ink">Record a reasoned outcome. A restriction affects the reported member; review the evidence before confirming.</p>
              <form noValidate onSubmit={reviewResolution} className="mt-5 flex flex-col gap-4">
                <ErrorSummary errors={resolutionErrors} labels={{ outcome: "Outcome", resolutionNote: "Resolution explanation" }} />
                <Field name="outcome" label="Outcome" error={resolutionErrors.outcome}>
                  {(control) => <Select {...control} value={outcome} disabled={busy !== null} onChange={(event) => setOutcome(event.target.value)}>
                    <option value="">Choose an outcome</option>
                    {OUTCOMES.map((value) => <option key={value} value={value}>{REPORT_OUTCOME_LABELS[value]}</option>)}
                  </Select>}
                </Field>
                <Field name="resolutionNote" label="Resolution explanation" hint="Explain the evidence and decision for the case history. Maximum 1000 characters." error={resolutionErrors.resolutionNote}>
                  {(control) => <TextArea {...control} value={resolutionNote} maxLength={1000} disabled={busy !== null} onChange={(event) => setResolutionNote(event.target.value)} />}
                </Field>
                <Button ref={reviewButton} type="submit" disabled={busy !== null}>Review resolution</Button>
              </form>
            </section>
          ) : null}
        </div>
      </div>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (resolved) document.getElementById("case-status-heading")?.focus();
          else if (Object.keys(resolutionErrors).length) document.querySelector<HTMLElement>("[data-focus-target]")?.focus();
          else reviewButton.current?.focus();
        }}>
          <AlertDialogHeader>
            <AlertDialogTitle>Resolve this report?</AlertDialogTitle>
            <AlertDialogDescription>
              Record “{OUTCOMES.includes(outcome as ReportOutcome) ? REPORT_OUTCOME_LABELS[outcome as ReportOutcome] : ""}” for {report.reportedMember.displayName} and save the explanation in this case's history.
              {outcome === "member_restricted" ? " This restricts the member's account." : ""}
              {isDemo ? " This demonstration changes sample data only." : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <p className="max-h-40 overflow-y-auto whitespace-pre-wrap break-words rounded-panel bg-canvas p-3">{resolutionNote.trim()}</p>
          <ActionError failure={failure} />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy === "resolve"}>Keep reviewing</AlertDialogCancel>
            <Button variant={outcome === "member_restricted" ? "danger" : "primary"} disabled={busy !== null} onClick={() => {
              if (!OUTCOMES.includes(outcome as ReportOutcome) || !resolutionNote.trim() || resolved) return;
              void mutate("resolve", () => api.resolveReport(report.id, { outcome: outcome as ReportOutcome, note: resolutionNote.trim() }));
            }}>
              {busy === "resolve" ? "Resolving…" : "Confirm resolution"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function CaseTime({ value }: { value: string }) {
  return <time dateTime={value}>{formatDate(value)} at {formatTime(value)}</time>;
}

export function ErrorBoundary() {
  return <AppContainer><RouteErrorState /></AppContainer>;
}
