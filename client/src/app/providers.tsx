'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            {children}
            <Toaster theme="dark" richColors position="top-center" closeButton />
        </AuthProvider>
    );
}
