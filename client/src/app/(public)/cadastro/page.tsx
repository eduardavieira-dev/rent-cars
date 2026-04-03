'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Building2, Landmark, User, UserPlus } from 'lucide-react';
import Link from 'next/link';

import { BrandLogo } from '@/components/brand-logo';

const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
} as const;

const item = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
} as const;

const options = [
    {
        href: '/cadastro/cliente',
        icon: User,
        title: 'Cliente',
        description: 'Pessoa física que aluga veículos',
    },
    {
        href: '/cadastro/empresa',
        icon: Building2,
        title: 'Empresa',
        description: 'Empresa locadora de veículos',
    },
    {
        href: '/cadastro/banco',
        icon: Landmark,
        title: 'Banco',
        description: 'Instituição financeira',
    },
];

export default function CadastroPage() {
    return (
        <main className="min-h-screen flex bg-background">
            <motion.aside
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="hidden lg:flex lg:w-[38%] bg-secondary flex-col justify-between p-10 sticky top-0 h-screen overflow-hidden border-r border-border"
            >
                <div className="pointer-events-none absolute inset-0 bg-black/60" />
                {/* Blur orbs */}
                <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
                <div className="pointer-events-none absolute bottom-8 -right-16 w-72 h-72 rounded-full bg-amber-400/8 blur-3xl" />
                <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
                <div className="pointer-events-none absolute bottom-8 -right-16 w-64 h-64 rounded-full bg-amber-400/8 blur-3xl" />

                <BrandLogo size="md" className="relative z-10" />

                <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-gold shadow-gold flex items-center justify-center mb-6">
                        <UserPlus size={22} className="text-primary-foreground" />
                    </div>
                    <h2 className="font-heading text-3xl font-bold text-foreground leading-snug mb-4">
                        Escolha como{' '}
                        <span className="text-gradient-gold">deseja se cadastrar</span>
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                        Selecione o tipo de conta que melhor representa o seu perfil na plataforma.
                    </p>
                </div>

                <p className="relative z-10 text-xs text-muted-foreground">
                    © {new Date().getFullYear()} Rent Cars · PUC Minas
                </p>
            </motion.aside>

            <div className="w-full lg:w-[62%] flex items-center justify-center px-6 py-12">
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-md"
                >
                    <motion.div variants={item} className="flex lg:hidden items-center gap-2.5 mb-10">
                        <BrandLogo size="sm" />
                    </motion.div>

                    <motion.div variants={item} className="mb-8">
                        <h1 className="font-heading text-2xl font-bold text-foreground mb-1">Criar conta</h1>
                        <p className="text-sm text-muted-foreground">
                            Selecione o tipo de cadastro para continuar.
                        </p>
                    </motion.div>

                    <div className="space-y-3">
                        {options.map(({ href, icon: Icon, title, description }) => (
                            <motion.div key={href} variants={item}>
                                <Link
                                    href={href}
                                    className="flex items-center gap-4 w-full rounded-xl border border-border bg-secondary p-4 transition-all hover:border-primary hover:bg-secondary/80 group"
                                >
                                    <div className="w-11 h-11 rounded-xl bg-gradient-gold shadow-gold flex items-center justify-center shrink-0">
                                        <Icon size={20} className="text-primary-foreground" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-semibold text-foreground">{title}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                                    </div>
                                    <ArrowRight
                                        size={16}
                                        className="text-muted-foreground group-hover:text-primary transition-colors shrink-0"
                                    />
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    <motion.p variants={item} className="mt-8 text-center text-sm text-muted-foreground">
                        Já tem conta?{' '}
                        <Link href="/login" className="text-primary hover:opacity-80 font-medium transition-opacity">
                            Faça login
                        </Link>
                    </motion.p>
                </motion.div>
            </div>
        </main>
    );
}
