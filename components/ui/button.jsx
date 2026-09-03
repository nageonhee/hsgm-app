import * as React from "react"
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-xl font-semibold whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20",
        outline:
          "border border-border bg-accent/50 hover:bg-accent text-foreground",
        secondary:
          "bg-accent text-foreground hover:bg-white/15",
        ghost:
          "hover:bg-accent text-foreground",
        destructive:
          "bg-red-500/10 text-red-400 hover:bg-red-500/20",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm gap-2",
        xs: "h-7 px-2.5 text-xs gap-1",
        sm: "h-8 px-3 text-xs gap-1.5",
        lg: "h-12 px-6 text-base gap-2.5",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  children,
  ...props
}) {
  const combinedClassName = cn(buttonVariants({ variant, size, className }));

  // asChild prop이 절대 DOM이나 자식으로 누출되지 않도록 안전하게 분리
  const safeProps = { ...props };
  delete safeProps.asChild;

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: cn(combinedClassName, children.props.className),
      ...safeProps,
    });
  }

  return (
    <button
      data-slot="button"
      className={combinedClassName}
      {...safeProps}
    >
      {children}
    </button>
  );
}

export { Button, buttonVariants }
