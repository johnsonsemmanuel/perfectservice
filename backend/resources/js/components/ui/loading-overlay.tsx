

import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
    isLoading: boolean;
    message?: string;
}

export function LoadingOverlay({ isLoading, message = 'Loading...' }: LoadingOverlayProps) {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl shadow-xl">
                <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
                <p className="text-sm font-medium text-gray-900">{message}</p>
            </div>
        </div>
    );
}
