import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, FileText, AlertCircle, Circle } from 'lucide-react';

interface StatusBadgeProps {
    status: string;
    className?: string;
    type?: 'job' | 'invoice' | 'user';
}

export function StatusBadge({ status, className, type = 'job' }: StatusBadgeProps) {
    const formattedStatus = status.replace(/_/g, ' ').toLowerCase();

    // Status configuration mapping
    const getStatusConfig = (status: string) => {
        const normalized = status.toLowerCase();

        switch (normalized) {
            case 'active':
                return {
                    bg: 'bg-emerald-50',
                    text: 'text-emerald-700',
                    border: 'border-emerald-200',
                    icon: CheckCircle2,
                    label: 'Active'
                };
            case 'inactive':
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-500',
                    border: 'border-gray-200',
                    icon: Circle,
                    label: 'Inactive'
                };
            case 'completed':
            case 'paid':
                return {
                    bg: 'bg-success-50',
                    text: 'text-success-700',
                    border: 'border-success-200',
                    icon: CheckCircle2,
                    label: type === 'invoice' ? 'Paid' : 'Completed'
                };
            case 'in_progress':
            case 'partial':
                return {
                    bg: 'bg-blue-50',
                    text: 'text-blue-700',
                    border: 'border-blue-200',
                    icon: Clock,
                    label: type === 'invoice' ? 'Partial' : 'In Progress'
                };
            case 'open':
            case 'draft':
            case 'pending':
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-700',
                    border: 'border-gray-200',
                    icon: Circle,
                    label: normalized.charAt(0).toUpperCase() + normalized.slice(1)
                };
            case 'invoiced':
            case 'issued':
                return {
                    bg: 'bg-purple-50',
                    text: 'text-purple-700',
                    border: 'border-purple-200',
                    icon: FileText,
                    label: type === 'invoice' ? 'Issued' : 'Invoiced'
                };
            case 'void':
            case 'cancelled':
                return {
                    bg: 'bg-error-50',
                    text: 'text-error-700',
                    border: 'border-error-200',
                    icon: AlertCircle,
                    label: normalized.charAt(0).toUpperCase() + normalized.slice(1)
                };
            default:
                return {
                    bg: 'bg-gray-50',
                    text: 'text-gray-600',
                    border: 'border-gray-200',
                    icon: Circle,
                    label: status.replace(/_/g, ' ')
                };
        }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
                config.bg,
                config.text,
                config.border,
                className
            )}
        >
            <Icon className="w-3.5 h-3.5" />
            <span className="capitalize">{config.label}</span>
        </span>
    );
}
