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
        <main className="bg-background flex min-h-screen">
            <motion.aside
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="bg-secondary border-border sticky top-0 hidden h-screen flex-col justify-between overflow-hidden border-r p-10 lg:flex lg:w-[38%]"
            >
                <div className="pointer-events-none absolute inset-0 bg-black/60" />
                {/* Blur orbs */}
                <div className="bg-primary/10 pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl" />
                <div className="pointer-events-none absolute -right-16 bottom-8 h-72 w-72 rounded-full bg-amber-400/8 blur-3xl" />
                <div className="bg-primary/10 pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl" />
                <div className="pointer-events-none absolute -right-16 bottom-8 h-64 w-64 rounded-full bg-amber-400/8 blur-3xl" />

                <BrandLogo size="md" className="relative z-10" />

                <div className="relative z-10">
                    <div className="bg-gradient-gold shadow-gold mb-6 flex h-12 w-12 items-center justify-center rounded-2xl">
                        <UserPlus size={22} className="text-primary-foreground" />
                    </div>
                    <h2 className="font-heading text-foreground mb-4 text-3xl leading-snug font-bold">
                        Escolha como <span className="text-gradient-gold">deseja se cadastrar</span>
                    </h2>
                    <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
                        Selecione o tipo de conta que melhor representa o seu perfil na plataforma.
                    </p>
                </div>

                <p className="text-muted-foreground relative z-10 text-xs">
                    © {new Date().getFullYear()} Rent Cars · PUC Minas
                </p>
            </motion.aside>

            <div className="flex w-full items-center justify-center px-6 py-12 lg:w-[62%]">
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-md"
                >
                    <motion.div
                        variants={item}
                        className="mb-10 flex items-center gap-2.5 lg:hidden"
                    >
                        <BrandLogo size="sm" />
                    </motion.div>

                    <motion.div variants={item} className="mb-8">
                        <h1 className="font-heading text-foreground mb-1 text-2xl font-bold">
                            Criar conta
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Selecione o tipo de cadastro para continuar.
                        </p>
                    </motion.div>

                    <div className="space-y-3">
                        {options.map(({ href, icon: Icon, title, description }) => (
                            <motion.div key={href} variants={item}>
                                <Link
                                    href={href}
                                    className="border-border bg-secondary hover:border-primary hover:bg-secondary/80 group flex w-full items-center gap-4 rounded-xl border p-4 transition-all"
                                >
                                    <div className="bg-gradient-gold shadow-gold flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                                        <Icon size={20} className="text-primary-foreground" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-foreground text-sm font-semibold">
                                            {title}
                                        </p>
                                        <p className="text-muted-foreground mt-0.5 text-xs">
                                            {description}
                                        </p>
                                    </div>
                                    <ArrowRight
                                        size={16}
                                        className="text-muted-foreground group-hover:text-primary shrink-0 transition-colors"
                                    />
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    <motion.p
                        variants={item}
                        className="text-muted-foreground mt-8 text-center text-sm"
                    >
                        Já tem conta?{' '}
                        <Link
                            href="/login"
                            className="text-primary font-medium transition-opacity hover:opacity-80"
                        >
                            Faça login
                        </Link>
                    </motion.p>
                </motion.div>
            </div>
        </main>
    );
}
