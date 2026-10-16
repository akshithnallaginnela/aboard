// Adapted from shadcn/ui (MIT). Keyboard: arrows move, Enter/Space selects, Escape closes.
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "~/lib/utils";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export function DropdownMenuContent({
  className,
  sideOffset = 6,
  align = "end",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(
          "z-50 min-w-56 overflow-hidden rounded-panel border border-divider bg-surface p-1.5 text-ink shadow-dialog data-[state=open]:animate-fade-in",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  className,
  destructive = false,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & { destructive?: boolean }) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "relative flex min-h-11 cursor-pointer select-none items-center gap-2.5 rounded-button px-3 text-base outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-soft-context data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
        destructive && "text-danger data-[highlighted]:bg-danger-soft",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuLabel({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return <DropdownMenuPrimitive.Label className={cn("px-3 py-2 text-sm text-muted-ink", className)} {...props} />;
}

export function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return <DropdownMenuPrimitive.Separator className={cn("my-1.5 h-px bg-divider", className)} {...props} />;
}
