import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

const Select = ({ value, onValueChange, children }: any) => {
    return (
        <div className="relative">
            {React.Children.map(children, (child) => {
                if (child.type === SelectTrigger) {
                    return React.cloneElement(child, { value, onValueChange, children: child.props.children });
                }
                if (child.type === SelectContent) {
                    return React.cloneElement(child, { value, onValueChange });
                }
                return child;
            })}
        </div>
    );
};

const SelectTrigger = React.forwardRef<HTMLDivElement, any>(
    ({ className, children, value, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "flex h-11 w-full items-center justify-between rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-gray-200 shadow-sm transition-all",
                className
            )}
            {...props}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </div>
    )
);
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder, value }: any) => (
    <span className="truncate">{value || placeholder}</span>
);

// We'll use a simple absolute div for content to avoid complex portal logic for now
const SelectContent = ({ children, value, onValueChange, className }: any) => {
    return (
        <div className={cn("absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-md animate-in fade-in zoom-in-95 bg-white border-gray-100", className)}>
            <div className="p-1">
                {React.Children.map(children, (child) => {
                    return React.cloneElement(child, {
                        isSelected: child.props.value === value,
                        onClick: () => onValueChange(child.props.value)
                    });
                })}
            </div>
        </div>
    );
};

const SelectItem = ({ value, children, isSelected, onClick, className }: any) => (
    <div
        className={cn(
            "relative flex w-full cursor-default select-none items-center rounded-lg py-1.5 px-3 text-sm outline-none transition-colors hover:bg-gray-50 focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            isSelected && "bg-gray-100 font-semibold",
            className
        )}
        onClick={onClick}
    >
        {children}
    </div>
);

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
