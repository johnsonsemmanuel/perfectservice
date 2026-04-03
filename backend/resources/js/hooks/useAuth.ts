import { usePage, router } from '@inertiajs/react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    role_display: string;
}

export interface PageProps {
    auth: {
        user: User | null;
    };
    flash: {
        success?: string;
        error?: string;
    };
    errors?: Record<string, string>;
}

export function useAuth() {
    const { auth } = usePage<PageProps>().props;

    const logout = useMutation({
        mutationFn: async () => {
            // Use Inertia form post for session-based logout
            return new Promise<void>((resolve) => {
                router.post('/web-logout', {}, {
                    onFinish: () => resolve(),
                });
            });
        },
    });

    return {
        user: auth.user,
        logout,
        isLoading: false,
    };
}
