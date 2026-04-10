'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

export default function CompanyRoleLayout({ children }: { children: ReactNode }) {
    const { hasRole, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !hasRole('COMPANY')) {
            router.replace('/dashboard');
        }
    }, [hasRole, isLoading, router]);

    if (isLoading || !hasRole('COMPANY')) return null;

    return <>{children}</>;
}
