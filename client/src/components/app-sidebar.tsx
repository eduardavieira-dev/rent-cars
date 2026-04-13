'use client';

import { Banknote, Car, ClipboardList, FileText, LayoutGrid, LogOut, User, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { BrandLogo } from '@/components/brand-logo';
import { useAuth } from '@/hooks/useAuth';

interface MenuItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ size?: string | number; className?: string }>;
}

function isActivePath(pathname: string, href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
}

interface AppSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { hasRole, logout } = useAuth();

    const isClient = hasRole('CLIENT');
    const isBank = hasRole('BANK');
    const isCompany = hasRole('COMPANY');
    const isAgent = isBank || isCompany;

    const roleItems: MenuItem[] = [];

    if (isClient) {
        roleItems.push({ href: '/meus-pedidos', label: 'Meus pedidos', icon: ClipboardList });
        roleItems.push({ href: '/meus-contratos', label: 'Meus contratos', icon: FileText });
        roleItems.push({ href: '/meus-rendimentos', label: 'Meus rendimentos', icon: Banknote });
    }

    if (isClient || isAgent) {
        roleItems.push({ href: '/veiculos', label: 'Veículos', icon: Car });
    }

    if (isAgent) {
        roleItems.push({
            href: '/analisar-pedidos',
            label: 'Analisar pedidos',
            icon: ClipboardList,
        });
        roleItems.push({ href: '/contratos', label: 'Contratos', icon: FileText });
    }

    if (isBank) {
        roleItems.push({ href: '/contratos-credito', label: 'Contratos de crédito', icon: Banknote });
    }

    const menuItems: MenuItem[] = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
        ...roleItems,
        { href: '/perfil', label: 'Perfil', icon: User },
    ];

    function handleLogout() {
        logout();
        onClose();
        router.push('/login');
    }

    return (
        <aside
            className={`border-border/70 bg-card/95 md:bg-card/60 fixed inset-y-0 left-0 z-50 w-72 border-r transition-transform duration-300 md:static md:min-h-screen md:translate-x-0 ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            aria-hidden={!isOpen}
        >
            <div className="flex h-full flex-col gap-4 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <BrandLogo size="sm" className="gap-2" textClassName="text-base" />

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-secondary-foreground hover:bg-secondary inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md transition-colors md:hidden"
                        aria-label="Fechar menu"
                    >
                        <X size={18} />
                    </button>
                </div>

                <nav className="flex flex-1 flex-col gap-2">
                    {menuItems.map((item) => {
                        const active = isActivePath(pathname, item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                    active
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-secondary-foreground hover:bg-secondary hover:text-foreground'
                                }`}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="text-secondary-foreground hover:bg-destructive/15 hover:text-destructive mt-2 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                >
                    <LogOut size={18} />
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    );
}
