'use client';

import { isAxiosError } from 'axios';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { type FormEvent, Suspense, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import { BrandLogo } from '@/components/brand-logo';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import type { LoginResponse } from '@/types/auth';

const loginSchema = z.object({
    email: z.string().email('Informe um e-mail válido.'),
    password: z.string().min(1, 'Informe sua senha.'),
});

type LoginFormErrors = Partial<Record<'email' | 'password', string>>;

const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
} as const;

const item = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
} as const;

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<LoginFormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const result = loginSchema.safeParse({ email, password });
        if (!result.success) {
            const errors: LoginFormErrors = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as keyof LoginFormErrors;
                if (!errors[field]) errors[field] = issue.message;
            }
            setFieldErrors(errors);
            return;
        }

        setFieldErrors({});
        setIsLoading(true);

        try {
            const params = new URLSearchParams();
            params.append('username', email);
            params.append('password', password);

            const { data: loginResponse } = await api.post<LoginResponse>('/login', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            login(loginResponse.access_token);
            router.push(searchParams.get('redirect') ?? '/dashboard');
        } catch (err: unknown) {
            if (isAxiosError(err) && err.response?.status === 401) {
                toast.error('E-mail ou senha inválidos.');
            } else {
                toast.error('Não foi possível conectar ao servidor. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="bg-background flex min-h-screen">
            <motion.aside
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="bg-secondary border-border relative hidden flex-col justify-between overflow-hidden border-r bg-[url('/background.png')] bg-cover bg-center bg-no-repeat p-10 md:flex md:w-5/12 lg:w-[42%]"
            >
                <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-black/75 via-black/45 to-black/35" />
                <div className="bg-primary/10 pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl" />
                <div className="pointer-events-none absolute -right-16 bottom-8 h-72 w-72 rounded-full bg-amber-400/8 blur-3xl" />

                <BrandLogo size="md" className="relative z-10" />

                <div className="relative z-10">
                    <h2 className="font-heading text-foreground mb-4 text-3xl leading-snug font-bold lg:text-4xl">
                        Gestão Inteligente de{' '}
                        <span className="text-orange-400">Locação de Veículos</span>
                    </h2>
                    <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
                        Gerencie sua frota, contratos e clientes em um único lugar com segurança e
                        eficiência.
                    </p>
                </div>

                <p className="text-muted-foreground relative z-10 text-xs">
                    © {new Date().getFullYear()} Rent Cars · PUC Minas
                </p>
            </motion.aside>

            <div className="flex w-full items-center justify-center px-6 py-12 md:w-7/12 lg:w-[58%]">
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-sm"
                >
                    <motion.div
                        variants={item}
                        className="mb-10 flex items-center gap-2.5 md:hidden"
                    >
                        <BrandLogo size="sm" />
                    </motion.div>

                    <motion.div variants={item} className="mb-8">
                        <h1 className="font-heading text-foreground mb-1 text-2xl font-bold">
                            Bem-vindo de volta
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Faça login para acessar o sistema.
                        </p>
                    </motion.div>

                    <form onSubmit={handleSubmit} noValidate className="space-y-4">
                        <motion.div variants={item}>
                            <label
                                htmlFor="email"
                                className="text-secondary-foreground mb-1.5 block text-sm font-medium"
                            >
                                E-mail
                            </label>
                            <div className="relative">
                                <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Mail size={15} />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (fieldErrors.email)
                                            setFieldErrors((prev) => ({
                                                ...prev,
                                                email: undefined,
                                            }));
                                    }}
                                    placeholder="seu@email.com"
                                    className="border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary w-full rounded-lg border py-2.5 pr-3 pl-10 text-sm transition-colors outline-none"
                                />
                            </div>
                            {fieldErrors.email && (
                                <p className="text-destructive mt-1 text-xs font-bold">
                                    {fieldErrors.email}
                                </p>
                            )}
                        </motion.div>

                        <motion.div variants={item}>
                            <label
                                htmlFor="password"
                                className="text-secondary-foreground mb-1.5 block text-sm font-medium"
                            >
                                Senha
                            </label>
                            <div className="relative">
                                <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Lock size={15} />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (fieldErrors.password)
                                            setFieldErrors((prev) => ({
                                                ...prev,
                                                password: undefined,
                                            }));
                                    }}
                                    placeholder="••••••••"
                                    className="border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary w-full rounded-lg border py-2.5 pr-10 pl-10 text-sm transition-colors outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                    className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                            {fieldErrors.password && (
                                <p className="text-destructive mt-1 text-xs font-bold">
                                    {fieldErrors.password}
                                </p>
                            )}
                        </motion.div>

                        <motion.div variants={item} className="pt-1">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-gradient-gold shadow-gold text-primary-foreground flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
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

                    <motion.p
                        variants={item}
                        className="text-muted-foreground mt-6 text-center text-sm"
                    >
                        Não tem conta?{' '}
                        <Link
                            href="/cadastro"
                            className="text-primary font-medium transition-opacity hover:opacity-80"
                        >
                            Cadastre-se
                        </Link>
                    </motion.p>
                </motion.div>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
