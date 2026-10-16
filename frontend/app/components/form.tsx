// Shared form controls: visible labels, associated hints/errors, GOV.UK-style error summary.
// Field ids follow `field-${name}` so ErrorSummary links can focus the right control.
import { useEffect, useRef } from "react";
import type * as React from "react";

import { Button, type ButtonProps } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export const fieldId = (name: string) => `field-${name}`;

const controlClass =
  "block w-full min-h-11 rounded-input border border-control-border bg-surface px-3 py-2 text-base text-ink aria-[invalid=true]:border-danger aria-[invalid=true]:border-2 disabled:opacity-60";

interface FieldProps {
  name: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  optional?: boolean;
  className?: string;
  children: (control: {
    id: string;
    name: string;
    "aria-describedby"?: string;
    "aria-invalid"?: true;
  }) => React.ReactNode;
}

/** Label + optional hint + inline error, wired to one control via a render prop. */
export function Field({ name, label, hint, error, optional, className, children }: FieldProps) {
  const id = fieldId(name);
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="font-semibold">
        {label}
        {optional ? <span className="font-normal text-muted-ink"> (optional)</span> : null}
      </label>
      {hint ? (
        <p id={hintId} className="text-sm text-muted-ink">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="font-semibold text-danger">
          <span className="sr-only">Error: </span>
          {error}
        </p>
      ) : null}
      {children({ id, name, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
    </div>
  );
}

export function TextInput({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(controlClass, className)} {...props} />;
}

export function TextArea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(controlClass, "min-h-28 resize-y leading-normal", className)} {...props} />;
}

export function Select({ className, ...props }: React.ComponentProps<"select">) {
  return <select className={cn(controlClass, "pr-8", className)} {...props} />;
}

/** Native checkbox with a large hit area and its own label. */
export function Checkbox({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & { label: React.ReactNode; hint?: React.ReactNode; error?: string }) {
  const inputId = id ?? (props.name ? fieldId(props.name) : undefined);
  const hintId = hint && inputId ? `${inputId}-hint` : undefined;
  const errorId = error && inputId ? `${inputId}-error` : undefined;
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {error ? (
        <p id={errorId} className="font-semibold text-danger">
          <span className="sr-only">Error: </span>
          {error}
        </p>
      ) : null}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id={inputId}
          className="mt-0.5 size-6 shrink-0"
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
          aria-invalid={error ? true : undefined}
          {...props}
        />
        <label htmlFor={inputId} className="min-h-6 leading-snug">
          {label}
          {hint ? (
            <span id={hintId} className="mt-0.5 block text-sm text-muted-ink">
              {hint}
            </span>
          ) : null}
        </label>
      </div>
    </div>
  );
}

interface RadioOption {
  value: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
}

/** Native radio group in a fieldset with a visible legend. */
export function RadioGroup({
  name,
  legend,
  options,
  defaultValue,
  value,
  onChange,
  error,
  hint,
  className,
}: {
  name: string;
  legend: React.ReactNode;
  options: RadioOption[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  hint?: React.ReactNode;
  className?: string;
}) {
  const id = fieldId(name);
  const describedBy = [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <fieldset className={cn("flex flex-col gap-2", className)} aria-describedby={describedBy}>
      <legend className="mb-1 font-semibold">{legend}</legend>
      {hint ? (
        <p id={`${id}-hint`} className="-mt-1 text-sm text-muted-ink">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="font-semibold text-danger">
          <span className="sr-only">Error: </span>
          {error}
        </p>
      ) : null}
      {options.map((option, index) => {
        const optionId = index === 0 ? id : `${id}-${option.value}`;
        return (
          <div key={option.value} className="flex items-start gap-3">
            <input
              type="radio"
              id={optionId}
              name={name}
              value={option.value}
              className="mt-0.5 size-6 shrink-0"
              defaultChecked={defaultValue === undefined ? undefined : defaultValue === option.value}
              checked={value === undefined ? undefined : value === option.value}
              onChange={onChange ? () => onChange(option.value) : undefined}
              aria-invalid={error ? true : undefined}
            />
            <label htmlFor={optionId} className="leading-snug">
              {option.label}
              {option.hint ? <span className="mt-0.5 block text-sm text-muted-ink">{option.hint}</span> : null}
            </label>
          </div>
        );
      })}
    </fieldset>
  );
}

/**
 * Linked summary of field errors. Receives focus when it appears so keyboard and
 * screen-reader users land on it after a failed submit (GOV.UK error summary pattern).
 */
export function ErrorSummary({
  errors,
  labels = {},
  title = "There is a problem",
}: {
  errors: Record<string, string>;
  labels?: Record<string, string>;
  title?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const entries = Object.entries(errors);
  const signature = entries.map(([key, value]) => `${key}:${value}`).join("|");

  useEffect(() => {
    if (signature) ref.current?.focus();
  }, [signature]);

  if (entries.length === 0) return null;
  return (
    <div
      ref={ref}
      tabIndex={-1}
      data-focus-target
      role="alert"
      aria-labelledby="error-summary-title"
      className="rounded-panel border-2 border-danger bg-surface p-4"
    >
      <h2 id="error-summary-title" className="text-lg font-semibold">
        {title}
      </h2>
      <ul className="mt-2 flex list-disc flex-col gap-1 pl-5">
        {entries.map(([name, message]) => (
          <li key={name}>
            <a
              href={`#${fieldId(name)}`}
              className="font-semibold text-danger underline underline-offset-2"
              onClick={(event) => {
                const target = document.getElementById(fieldId(name));
                if (target) {
                  event.preventDefault();
                  target.focus();
                  target.scrollIntoView({ block: "center" });
                }
              }}
            >
              {labels[name] ? `${labels[name]}: ` : ""}
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Submit button that stays focusable while busy but ignores repeat activation,
 * so a double tap cannot send a second request.
 */
export function SubmitButton({
  busy,
  busyLabel,
  children,
  onClick,
  ...props
}: ButtonProps & { busy: boolean; busyLabel: string }) {
  return (
    <Button
      type="submit"
      aria-disabled={busy || undefined}
      onClick={(event) => {
        if (busy) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      {...props}
    >
      {busy ? busyLabel : children}
    </Button>
  );
}

/** Prevents a second submit while one is in flight (use as a <Form onSubmit>). */
export function guardSubmit(busy: boolean) {
  return (event: React.FormEvent) => {
    if (busy) event.preventDefault();
  };
}
