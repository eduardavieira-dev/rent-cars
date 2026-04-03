'use client';

import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowRight, Building, Car, Hash, Landmark, Lock, Mail, Phone, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ChangeEvent, type FormEvent, useState } from 'react';

import api from '@/lib/axios';

function maskPhone(v: string): string {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length === 0) return '';
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function maskCnpj(v: string): string {
    const d = v.replace(/\D/g, '').slice(0, 14);
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
    if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
    if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

function maskCode(v: string): string {
    return v.replace(/\D/g, '').slice(0, 3);
}

function onlyDigits(value: string): string {
    return value.replace(/\D/g, '');
}

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function validateForm(form: FormState): string | null {
    if (!form.name.trim()) return 'Informe o nome do responsável.';
    if (!isValidEmail(form.email)) return 'Informe um e-mail válido.';
    if (form.password.length < 6) return 'A senha deve ter no mínimo 6 caracteres.';
    if (onlyDigits(form.phone).length < 10) return 'Informe um telefone válido.';
    if (onlyDigits(form.cnpj).length !== 14) return 'Informe um CNPJ válido.';
    if (onlyDigits(form.code).length !== 3) return 'Informe um código FEBRABAN válido.';

    return null;
}

const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const item = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

const inputBase =
    'w-full rounded-lg border border-border bg-input py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors';
const inputWithIcon = `${inputBase} pl-10 pr-3`;
const labelBase = 'block text-sm font-medium text-secondary-foreground mb-1.5';
const requiredMark = <span className="text-primary ml-0.5">*</span>;

interface FormState {
    name: string;
    email: string;
    password: string;
    phone: string;
    cnpj: string;
    code: string;
}

const INITIAL_FORM: FormState = {
    name: '',
    email: '',
    password: '',
    phone: '',
    cnpj: '',
    code: '',
};

export default function CadastroBancoPage() {
    const router = useRouter();

    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        let masked = value;
        if (name === 'phone') masked = maskPhone(value);
        else if (name === 'cnpj') masked = maskCnpj(value);
        else if (name === 'code') masked = maskCode(value);
        setForm((prev) => ({ ...prev, [name]: masked }));
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const validationError = validateForm(form);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            await api.post('/auth/register/bank', {
                name: form.name,
                email: form.email,
                password: form.password,
                phone: form.phone,
                cnpj: form.cnpj,
                code: form.code,
            });

            router.push('/login');
        } catch (err) {
            if (axios.isAxiosError(err)) {
                if (!err.response) {
                    setError('Não foi possível conectar ao servidor. Verifique se o backend está em execução.');
                    return;
                }

                const status = err.response.status;
                const message = (err.response.data as { message?: string })?.message;

                if (status === 409) {
                    setError(message ?? 'CNPJ ou e-mail já cadastrado. Verifique os dados.');
                } else if (status === 400) {
                    setError(message ? `Dado inválido: ${message}` : 'Verifique os dados informados e tente novamente.');
                } else {
                    setError(`Erro ${status} ao realizar o cadastro. Tente novamente.`);
                }
            } else {
                setError('Erro inesperado. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="min-h-screen flex bg-background">
            <motion.aside
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="hidden lg:flex lg:w-[38%] bg-secondary flex-col justify-between p-10 sticky top-0 h-screen relative overflow-hidden border-r border-border"
            >
                <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
                <div className="pointer-events-none absolute bottom-8 -right-16 w-64 h-64 rounded-full bg-amber-400/8 blur-3xl" />

                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-gold shadow-gold flex items-center justify-center shrink-0">
                        <Car size={20} className="text-primary-foreground" />
                    </div>
                    <span className="font-heading text-xl font-bold text-foreground tracking-tight">
                        Rent Cars
                    </span>
                </div>

                <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-gold shadow-gold flex items-center justify-center mb-6">
                        <Landmark size={22} className="text-primary-foreground" />
                    </div>
                    <h2 className="font-heading text-3xl font-bold text-foreground leading-snug mb-4">
                        Cadastre sua{' '}
                        <span className="text-gradient-gold">instituição financeira</span>
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                        Registre seu banco na plataforma e participe do financiamento de contratos de locação.
                    </p>
                </div>

                <p className="relative z-10 text-xs text-muted-foreground">
                    © {new Date().getFullYear()} Rent Cars · PUC Minas
                </p>
            </motion.aside>

            <div className="w-full lg:w-[62%] flex justify-center px-6 py-12">
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-lg"
                >
                    <motion.div variants={item} className="flex lg:hidden items-center gap-2.5 mb-10">
                        <div className="w-9 h-9 rounded-xl bg-gradient-gold shadow-gold flex items-center justify-center">
                            <Car size={17} className="text-primary-foreground" />
                        </div>
                        <span className="font-heading text-lg font-bold text-foreground">Rent Cars</span>
                    </motion.div>

                    <motion.div variants={item} className="mb-8">
                        <h1 className="font-heading text-2xl font-bold text-foreground mb-1">Cadastro de Banco</h1>
                        <p className="text-sm text-muted-foreground">
                            Preencha os dados abaixo para cadastrar sua instituição financeira.
                        </p>
                    </motion.div>

                    <form onSubmit={handleSubmit} noValidate className="space-y-4">
                        <motion.div variants={item}>
                            <label htmlFor="name" className={labelBase}>
                                Nome do responsável {requiredMark}
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                    <User size={15} />
                                </div>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    autoComplete="name"
                                    minLength={3}
                                    maxLength={100}
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="João da Silva"
                                    className={inputWithIcon}
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={item} className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="email" className={labelBase}>
                                    E-mail {requiredMark}
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                        <Mail size={15} />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="banco@email.com"
                                        className={inputWithIcon}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className={labelBase}>
                                    Senha {requiredMark}
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                        <Lock size={15} />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        autoComplete="new-password"
                                        minLength={6}
                                        maxLength={100}
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Mín. 6 caracteres"
                                        className={inputWithIcon}
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={item}>
                            <label htmlFor="phone" className={labelBase}>
                                Telefone {requiredMark}
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                    <Phone size={15} />
                                </div>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    required
                                    autoComplete="tel"
                                    inputMode="numeric"
                                    maxLength={15}
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="(11) 99999-9999"
                                    className={inputWithIcon}
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={item} className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="cnpj" className={labelBase}>
                                    CNPJ {requiredMark}
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                        <Building size={15} />
                                    </div>
                                    <input
                                        id="cnpj"
                                        name="cnpj"
                                        type="text"
                                        required
                                        inputMode="numeric"
                                        maxLength={18}
                                        value={form.cnpj}
                                        onChange={handleChange}
                                        placeholder="00.000.000/0000-00"
                                        className={inputWithIcon}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="code" className={labelBase}>
                                    Código FEBRABAN {requiredMark}
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                        <Hash size={15} />
                                    </div>
                                    <input
                                        id="code"
                                        name="code"
                                        type="text"
                                        required
                                        inputMode="numeric"
                                        maxLength={3}
                                        value={form.code}
                                        onChange={handleChange}
                                        placeholder="001"
                                        className={inputWithIcon}
                                    />
                                </div>
                            </div>
                        </motion.div>

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

                        <motion.div variants={item} className="pt-1">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-gold shadow-gold text-primary-foreground font-semibold py-2.5 px-4 rounded-lg text-sm transition-all hover:opacity-90 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    'Cadastrando…'
                                ) : (
                                    <>
                                        Criar conta <ArrowRight size={15} />
                                    </>
                                )}
                            </button>
                        </motion.div>
                    </form>

                    <motion.p variants={item} className="mt-6 text-center text-sm text-muted-foreground">
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
