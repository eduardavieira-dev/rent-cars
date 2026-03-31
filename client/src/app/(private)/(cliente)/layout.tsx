'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

export default function ClienteRoleLayout({ children }: { children: ReactNode }) {
    const { hasRole, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !hasRole('CLIENT')) {
            router.replace('/dashboard');
        }
    }, [hasRole, isLoading, router]);

    if (isLoading || !hasRole('CLIENT')) return null;

    return <>{children}</>;
}
