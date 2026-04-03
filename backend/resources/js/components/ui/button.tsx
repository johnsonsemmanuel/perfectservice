import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        const base = 'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none';
        const variants: Record<string, string> = {
            default:     'bg-red-600 text-white shadow-sm shadow-red-600/25 hover:bg-red-700 hover:-translate-y-px hover:shadow-md hover:shadow-red-600/20 active:translate-y-0 active:scale-[0.97] active:shadow-sm',
            destructive: 'bg-red-500 text-white hover:bg-red-600 hover:-translate-y-px active:scale-[0.97]',
            outline:     'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-px active:scale-[0.97] active:translate-y-0',
            secondary:   'bg-gray-100 text-gray-900 hover:bg-gray-200 hover:-translate-y-px active:scale-[0.97]',
            ghost:       'text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:scale-[0.97]',
            link:        'text-red-600 underline-offset-4 hover:underline',
        };
        const sizes: Record<string, string> = {
            default: 'h-10 px-5 py-2',
            sm:      'h-8 rounded-lg px-3 text-xs',
            lg:      'h-12 rounded-2xl px-8 text-base',
            icon:    'h-10 w-10 rounded-xl',
        };
        return (
            <Comp className={cn(base, variants[variant], sizes[size], className)} ref={ref} {...props} />
        );
    }
);
Button.displayName = 'Button';

export { Button };
