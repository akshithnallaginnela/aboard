// Adapted from shadcn/ui (MIT) and restyled with ConnectAbroad tokens.
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "~/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-button text-center font-semibold leading-tight no-underline transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-70 [&_svg]:size-[1.1em] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary hover:bg-primary-hover",
        secondary: "border border-control-border bg-surface text-ink hover:bg-canvas",
        quiet: "text-ink hover:bg-soft-context/60",
        danger: "bg-danger text-white hover:bg-danger-hover",
        "danger-outline": "border border-danger bg-surface text-danger hover:bg-danger-soft",
        link: "min-h-0 px-0 py-0 text-primary underline underline-offset-4 hover:text-primary-hover",
      },
      size: {
        md: "min-h-11 px-5 py-2 text-base",
        sm: "min-h-10 px-3.5 py-1.5 text-sm",
        icon: "size-11 p-0",
      },
    },
    compoundVariants: [{ variant: "link", className: "min-h-0 px-0 py-0" }],
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild = false, type, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      type={asChild ? undefined : (type ?? "button")}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
