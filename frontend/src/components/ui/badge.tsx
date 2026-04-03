import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' }>(
    ({ className, variant = 'default', ...props }, ref) => {
        const variants = {
            default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm border-transparent",
            secondary: "bg-surface text-secondary-foreground hover:bg-gray-100 border-transparent",
            outline: "text-foreground border-border hover:bg-surface",
            success: "bg-success-50 text-success-700 border-success-200 hover:bg-success-100",
            warning: "bg-warning-50 text-warning-700 border-warning-200 hover:bg-warning-100",
            destructive: "bg-error-50 text-error-700 border-error-200 hover:bg-error-100",
        }

        return (
            <div
                ref={ref}
                className={cn(
                    "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border",
                    variants[variant],
                    className
                )}
                {...props}
            />
        )
    }
)
Badge.displayName = "Badge"

export { Badge }
