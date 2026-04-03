'use client';

import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
    const { logout } = useAuth();
    const router = useRouter();

    function handleLogout() {
        logout();
        router.push('/login');
    }

    return (
        <div>
            <h1>Painel</h1>
            <button onClick={handleLogout}>Sair</button>
        </div>
    );
}
