'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

export default function AgenteRoleLayout({ children }: { children: ReactNode }) {
    const { hasRole, isLoading } = useAuth();
    const router = useRouter();

    const isAgent = hasRole('BANK') || hasRole('COMPANY');

    useEffect(() => {
        if (!isLoading && !isAgent) {
            router.replace('/dashboard');
        }
    }, [isAgent, isLoading, router]);

    if (isLoading || !isAgent) return null;

    return <>{children}</>;
}
