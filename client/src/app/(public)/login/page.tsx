'use client';

import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowRight, Car, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import type { LoginResponse } from '@/types/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ── Animation variants ───────────────────────────────────────
const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const item = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

// ── Page ─────────────────────────────────────────────────────
export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Usa axios diretamente (sem a instância api) para evitar que o interceptor
            // de 401 redirecione para /login quando as credenciais forem inválidas.
            const { data } = await axios.post<LoginResponse>(`${BASE_URL}/login`, {
                username: email,
                password,
            });

            login(data.access_token);
            router.push('/dashboard');
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                setError('E-mail ou senha inválidos.');
            } else {
                setError('Não foi possível conectar ao servidor. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="min-h-screen flex bg-background">

            {/* ── Left branding panel (md+) ──────────────────────── */}
            <motion.aside
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="hidden md:flex md:w-5/12 lg:w-[42%] bg-secondary flex-col justify-between p-10 relative overflow-hidden border-r border-border"
            >
                {/* Blur orbs */}
                <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
                <div className="pointer-events-none absolute bottom-8 -right-16 w-72 h-72 rounded-full bg-amber-400/8 blur-3xl" />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-gold shadow-gold flex items-center justify-center shrink-0">
                        <Car size={20} className="text-primary-foreground" />
                    </div>
                    <span className="font-heading text-xl font-bold text-foreground tracking-tight">
                        Rent Cars
                    </span>
                </div>

                {/* Headline */}
                <div className="relative z-10">
                    <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground leading-snug mb-4">
                        Gestão Inteligente de{' '}
                        <span className="text-gradient-gold">Locação de Veículos</span>
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                        Gerencie sua frota, contratos e clientes em um único lugar — com segurança e eficiência.
                    </p>
                </div>

                {/* Footer */}
                <p className="relative z-10 text-xs text-muted-foreground">
                    © {new Date().getFullYear()} Rent Cars · PUC Minas
                </p>
            </motion.aside>

            {/* ── Right form panel ────────────────────────────────── */}
            <div className="w-full md:w-7/12 lg:w-[58%] flex items-center justify-center px-6 py-12">
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-sm"
                >
                    {/* Mobile-only logo */}
                    <motion.div variants={item} className="flex md:hidden items-center justify-center gap-2.5 mb-10">
                        <div className="w-9 h-9 rounded-xl bg-gradient-gold shadow-gold flex items-center justify-center">
                            <Car size={17} className="text-primary-foreground" />
                        </div>
                        <span className="font-heading text-lg font-bold text-foreground">Rent Cars</span>
                    </motion.div>

                    {/* Heading */}
                    <motion.div variants={item} className="mb-8">
                        <h1 className="font-heading text-2xl font-bold text-foreground mb-1">
                            Bem-vindo de volta
                        </h1>
                        <p className="text-sm text-muted-foreground">Faça login para acessar o sistema.</p>
                    </motion.div>

                    <form onSubmit={handleSubmit} noValidate className="space-y-4">

                        {/* E-mail */}
                        <motion.div variants={item}>
                            <label htmlFor="email" className="block text-sm font-medium text-secondary-foreground mb-1.5">
                                E-mail
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                    <Mail size={15} />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="w-full rounded-lg border border-border bg-input pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </motion.div>

                        {/* Senha */}
                        <motion.div variants={item}>
                            <label htmlFor="password" className="block text-sm font-medium text-secondary-foreground mb-1.5">
                                Senha
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                    <Lock size={15} />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full rounded-lg border border-border bg-input pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </motion.div>

                        {/* Erro */}
                        {error && (
                            <motion.p
                                role="alert"
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
                            >
                                {error}
                            </motion.p>
                        )}

                        {/* Botão */}
                        <motion.div variants={item} className="pt-1">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-gold shadow-gold text-primary-foreground font-semibold py-2.5 px-4 rounded-lg text-sm transition-all hover:opacity-90 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    'Entrando…'
                                ) : (
                                    <>
                                        Entrar <ArrowRight size={15} />
                                    </>
                                )}
                            </button>
                        </motion.div>
                    </form>

                    {/* Link de cadastro */}
                    <motion.p variants={item} className="mt-6 text-center text-sm text-muted-foreground">
                        Não tem conta?{' '}
                        <Link
                            href="/cadastro/cliente"
                            className="text-primary hover:opacity-80 font-medium transition-opacity"
                        >
                            Cadastre-se
                        </Link>
                    </motion.p>
                </motion.div>
            </div>
        </main>
    );
}
