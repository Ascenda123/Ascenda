import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 max-w-full whitespace-normal text-center leading-snug",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_12px_30px_rgba(99,102,241,0.25)] border border-primary/25 hover:bg-primary/90 active:translate-y-[1px]",
        destructive:
          "bg-destructive text-destructive-foreground border border-destructive/25 shadow-[0_6px_20px_rgba(185,28,28,0.28)] hover:bg-destructive/90 active:translate-y-[1px]",
        outline:
          "border border-border bg-background text-foreground hover:bg-muted/80 hover:text-foreground active:translate-y-[1px]",
        secondary:
          "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 active:translate-y-[1px]",
        ghost: "text-foreground hover:bg-muted/80 active:translate-y-[1px]",
        link: "text-primary underline-offset-4 hover:underline",
        soft:
          "bg-accent/15 text-foreground border border-accent/30 hover:bg-accent/25 active:translate-y-[1px]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-full px-3",
        lg: "h-11 rounded-full px-8",
        icon: "h-10 w-10",
        xs: "h-7 rounded-full px-2 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
