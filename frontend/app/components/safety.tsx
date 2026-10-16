// Report and block flows used from profiles, conversations and lists.
// Both dialogs call the API directly and only show outcomes the server confirmed.
import { useState } from "react";
import type * as React from "react";
import { useRevalidator } from "react-router";

import { ActionError, Notice } from "~/components/feedback";
import { Checkbox, ErrorSummary, Field, RadioGroup, SubmitButton, TextArea } from "~/components/form";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { type ActionFailure, actionFailure } from "~/lib/api";
import { REPORT_REASON_LABELS, formatDate, formatTime } from "~/lib/format";
import { api } from "~/lib/runtime";
import { REPORT_REASONS, type ReportReason } from "~/lib/types";
import { newClientId } from "~/lib/utils";

type Member = { id: string; displayName: string };
type ReportedMessage = { id: string; body: string; sentAt: string };
type DialogControl = { trigger?: React.ReactElement; open?: boolean; onOpenChange?: (open: boolean) => void };

/** Controlled when `open` is passed, otherwise opened by `trigger`. */
function useOpenState(open: boolean | undefined, onOpenChange?: (open: boolean) => void) {
  const [internal, setInternal] = useState(false);
  const setOpen = (next: boolean) => {
    setInternal(next);
    onOpenChange?.(next);
  };
  return [open ?? internal, setOpen] as const;
}

const REASON_OPTIONS = REPORT_REASONS.map((value) => ({ value, label: REPORT_REASON_LABELS[value] }));

export function ReportDialog({
  member,
  message,
  trigger,
  open,
  onOpenChange,
}: DialogControl & { member: Member; message?: ReportedMessage }) {
  const [isOpen, setOpen] = useOpenState(open, onOpenChange);
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent>
        {/* Mounted per opening: fresh fields and a new idempotency key each time. */}
        <ReportForm member={member} message={message} />
      </DialogContent>
    </Dialog>
  );
}

function ReportForm({ member, message }: { member: Member; message?: ReportedMessage }) {
  const name = member.displayName;
  const revalidator = useRevalidator();
  // Reused on retries so a resubmitted report creates one case.
  const [clientRequestId] = useState(newClientId);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [alsoBlock, setAlsoBlock] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<ActionFailure | null>(null);
  const [received, setReceived] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [blockFailure, setBlockFailure] = useState<ActionFailure | null>(null);

  async function blockMember() {
    if (blocking) return;
    setBlocking(true);
    try {
      await api.blockMember(member.id);
      setBlocked(true);
      setBlockFailure(null);
      void revalidator.revalidate();
    } catch (error) {
      setBlockFailure(actionFailure(error));
    } finally {
      setBlocking(false);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!REPORT_REASONS.includes(reason as ReportReason)) {
      setErrors({ reason: "Choose what happened." });
      return;
    }
    setErrors({});
    setFailure(null);
    setBusy(true);
    try {
      await api.createReport({
        clientRequestId,
        memberId: member.id,
        messageId: message?.id,
        reason: reason as ReportReason,
        details: details.trim(),
      });
    } catch (error) {
      const result = actionFailure(error);
      setFailure(result);
      setErrors(result.fieldErrors);
      return;
    } finally {
      setBusy(false);
    }
    setReceived(true);
    // Blocking is a separate operation with its own outcome.
    if (alsoBlock) await blockMember();
  }

  const header = (
    <DialogHeader>
      <DialogTitle>Tell us what happened.</DialogTitle>
      <DialogDescription>
        {message ? `You're reporting a message from ${name}.` : `You're reporting ${name}.`}
      </DialogDescription>
    </DialogHeader>
  );

  if (received) {
    return (
      <>
        {header}
        <Notice tone="success" role="status">
          Your report was received. The moderation team will review it.
        </Notice>
        {blocking && !blockFailure ? (
          <p role="status" className="text-muted-ink">
            Blocking {name}…
          </p>
        ) : null}
        {blocked ? (
          <Notice tone="success" role="status">
            You also blocked {name}.
          </Notice>
        ) : null}
        {blockFailure && !blocked ? (
          <Notice
            tone="error"
            role="alert"
            title="Your report was received, but blocking didn't work."
            action={
              <Button variant="secondary" size="sm" aria-disabled={blocking || undefined} onClick={() => void blockMember()}>
                {blocking ? "Blocking…" : "Try blocking again"}
              </Button>
            }
          >
            {blockFailure.message}
          </Notice>
        ) : null}
        {blocking ? null : (
          <DialogFooter>
            <DialogClose asChild>
              <Button>Done</Button>
            </DialogClose>
          </DialogFooter>
        )}
      </>
    );
  }

  return (
    <>
      {header}
      {message ? (
        <figure className="rounded-panel bg-canvas p-3">
          <blockquote className="whitespace-pre-wrap">{message.body}</blockquote>
          <figcaption className="mt-1 text-sm text-muted-ink">
            Sent{" "}
            <time dateTime={message.sentAt}>
              {formatDate(message.sentAt)} at {formatTime(message.sentAt)}
            </time>
          </figcaption>
        </figure>
      ) : null}
      <form noValidate onSubmit={submit} className="flex flex-col gap-5">
        <ErrorSummary errors={errors} labels={{ reason: "What happened", details: "Details" }} />
        <ActionError failure={failure} />
        <RadioGroup
          name="reason"
          legend="What happened?"
          options={REASON_OPTIONS}
          value={reason}
          onChange={setReason}
          error={errors.reason}
        />
        {reason === "safety_concern" ? (
          <Notice tone="warning" role="alert">
            If someone is in immediate danger, contact local emergency services now. ConnectAbroad can't send help.
          </Notice>
        ) : null}
        <Field
          name="details"
          label="Details"
          optional
          hint={`Anything that helps a moderator understand. ${details.length} of 1000 characters used.`}
          error={errors.details}
        >
          {(control) => (
            <TextArea {...control} value={details} maxLength={1000} onChange={(event) => setDetails(event.target.value)} />
          )}
        </Field>
        <p className="text-sm text-muted-ink">
          {name} won't be told who reported them.{" "}
          {message
            ? `Moderators see your report, ${name}'s profile and the message you selected — not your other conversations.`
            : `Moderators see your report and ${name}'s profile — not your conversations.`}
        </p>
        <Checkbox
          name="alsoBlock"
          label={`Also block ${name}`}
          hint="A separate step: they won't be able to send you requests or messages."
          checked={alsoBlock}
          onChange={(event) => setAlsoBlock(event.target.checked)}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <SubmitButton busy={busy} busyLabel="Sending report…">
            Submit report
          </SubmitButton>
        </DialogFooter>
      </form>
    </>
  );
}

export function BlockDialog({
  member,
  trigger,
  open,
  onOpenChange,
  onBlocked,
}: DialogControl & { member: Member; onBlocked?: () => void }) {
  const name = member.displayName;
  const [isOpen, setOpen] = useOpenState(open, onOpenChange);
  const revalidator = useRevalidator();
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<ActionFailure | null>(null);
  const [announcement, setAnnouncement] = useState("");

  async function block() {
    if (busy) return;
    setBusy(true);
    setFailure(null);
    setAnnouncement("");
    try {
      await api.blockMember(member.id);
    } catch (error) {
      // Keep the dialog open so the person can retry or cancel.
      setFailure(actionFailure(error));
      return;
    } finally {
      setBusy(false);
    }
    setAnnouncement(`You blocked ${name}.`);
    setOpen(false);
    onBlocked?.();
    void revalidator.revalidate();
  }

  return (
    <>
      <AlertDialog
        open={isOpen}
        onOpenChange={(next) => {
          if (!next) setFailure(null);
          setOpen(next);
        }}
      >
        {trigger ? <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger> : null}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block {name}?</AlertDialogTitle>
            <AlertDialogDescription>
              They won't be able to send you requests or messages, and you won't appear in each other's search. Earlier
              messages stay in your conversation history. They aren't told that you blocked them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ActionError failure={failure} />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {/* A plain button: AlertDialogAction would close before the server answers. */}
            <Button variant="danger" aria-disabled={busy || undefined} onClick={() => void block()}>
              {busy ? "Blocking…" : "Block member"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </>
  );
}
