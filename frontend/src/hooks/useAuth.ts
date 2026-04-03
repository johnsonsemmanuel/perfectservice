import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    role_display: string;
    permissions: string[];
}

export function useAuth({ middleware, redirectIfAuthenticated }: { middleware?: 'auth' | 'guest', redirectIfAuthenticated?: string } = {}) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: user, error, isLoading } = useQuery<User>({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const res = await api.get('/me');
                return res.data;
            } catch (error: any) {
                if (error.response?.status !== 409) throw error;
                router.push('/verify-email');
                throw error;
            }
        },
        retry: false,
    });

    const csrf = () => api.get('/sanctum/csrf-cookie', { baseURL: process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8001' });

    const login = useMutation({
        mutationFn: async (credentials: any) => {
            await csrf();
            const res = await api.post('/login', credentials);
            return res.data;
        },
        onSuccess: (data) => {
            // Store token if returned (though Sanctum cookie is preferred for SPA, user endpoint returned token)
            // If strictly cookie-based, we don't need to store token. 
            // But the backend returned a token. I'll store it in localStorage for API calls 
            // IF the axios interceptor is set to use it.
            // However, axios config had `withCredentials: true` which implies cookies.
            // The backend return structure had `token`. 
            // I'll stick to Bearer token for now as it's explicit.
            if (data.token) {
                localStorage.setItem('token', data.token);
                // Update axios default header
                api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            }
            queryClient.invalidateQueries({ queryKey: ['user'] });
            router.push('/dashboard');
        },
    });

    const logout = useMutation({
        mutationFn: async () => {
            await api.post('/logout');
        },
        onSuccess: () => {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            queryClient.setQueryData(['user'], null);
            router.push('/login');
        },
    });

    // Handle redirects
    useEffect(() => {
        if (middleware === 'guest' && user && redirectIfAuthenticated) {
            router.push(redirectIfAuthenticated);
        }
        // Note: 'auth' middleware check is best done in a higher-level wrapper or layout, 
        // to avoid flash of content, but simple check here works for now.
        // If not user and not loading and error -> redirect to login
        if (middleware === 'auth' && !user && !isLoading && error) {
            router.push('/login');
        }
    }, [user, error, isLoading, middleware, redirectIfAuthenticated, router]);

    return {
        user,
        login,
        logout,
        isLoading,
    };
}
