// Adapted from shadcn/ui (MIT): a side panel built on the Radix dialog primitive.
import { Dialog as SheetPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "~/lib/utils";

export const Sheet = SheetPrimitive.Root;
export const SheetTrigger = SheetPrimitive.Trigger;
export const SheetClose = SheetPrimitive.Close;

export function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: "right" | "left" }) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/45 data-[state=open]:animate-fade-in" />
      <SheetPrimitive.Content
        className={cn(
          "fixed inset-y-0 z-50 flex w-[min(22rem,88vw)] flex-col gap-4 overflow-y-auto border-divider bg-canvas p-5 text-ink shadow-dialog data-[state=open]:animate-fade-in",
          side === "right" ? "right-0 border-l" : "left-0 border-r",
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close
          className="absolute right-2 top-2 inline-flex size-11 items-center justify-center rounded-button text-muted-ink hover:bg-surface hover:text-ink"
          aria-label="Close menu"
        >
          <XIcon aria-hidden="true" className="size-5" />
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

export function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title className={cn("text-lg font-semibold", className)} {...props} />;
}

export function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return <SheetPrimitive.Description className={cn("text-sm text-muted-ink", className)} {...props} />;
}
