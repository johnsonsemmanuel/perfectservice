import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/toast';
import '../css/app.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 30_000,
        },
    },
});

createInertiaApp({
    title: (title) => `${title} — PerfectService`,
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.tsx', { eager: true });
        return pages[`./Pages/${name}.tsx`] as any;
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <QueryClientProvider client={queryClient}>
                <ToastProvider>
                    <App {...props} />
                </ToastProvider>
            </QueryClientProvider>
        );
    },
});
