'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

export default function PrivateLayout({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = '';
            };
        }

        document.body.style.overflow = '';
    }, [isSidebarOpen]);

    if (isLoading || !isAuthenticated) return null;

    return (
        <div className="bg-background min-h-screen md:grid md:grid-cols-[18rem_1fr]">
            <AppSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {isSidebarOpen && (
                <button
                    type="button"
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 z-40 cursor-pointer bg-black/45 md:hidden"
                    aria-label="Fechar menu lateral"
                />
            )}

            <div className="min-w-0">
                <header className="border-border/70 bg-background/90 sticky top-0 z-30 flex items-center gap-2 border-b p-3 backdrop-blur md:hidden">
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-secondary-foreground hover:bg-secondary inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md transition-colors"
                        aria-label="Abrir menu"
                    >
                        <Menu size={20} />
                    </button>
                    <span className="text-sm font-medium">Menu</span>
                </header>

                <main className="p-4 md:p-8">{children}</main>
            </div>
        </div>
    );
}
