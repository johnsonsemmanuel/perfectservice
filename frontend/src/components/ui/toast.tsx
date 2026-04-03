'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    type: ToastType;
    title: string;
    message?: string;
}

interface ToastContextType {
    toast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
}

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback((type: ToastType, title: string, message?: string) => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, type, title, message }]);
        setTimeout(() => removeToast(id), 4000);
    }, [removeToast]);

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />;
            case 'error': return <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />;
            case 'info': return <Info className="w-5 h-5 text-blue-500 shrink-0" />;
        }
    };

    const getBg = (type: ToastType) => {
        switch (type) {
            case 'success': return 'border-green-200 bg-green-50';
            case 'error': return 'border-red-200 bg-red-50';
            case 'info': return 'border-blue-200 bg-blue-50';
        }
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm min-w-[300px] max-w-[420px] animate-slide-in ${getBg(t.type)}`}
                    >
                        {getIcon(t.type)}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">{t.title}</p>
                            {t.message && <p className="text-xs text-gray-600 mt-0.5">{t.message}</p>}
                        </div>
                        <button
                            onClick={() => removeToast(t.id)}
                            className="p-0.5 rounded hover:bg-black/5 transition-colors shrink-0"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
