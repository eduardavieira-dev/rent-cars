'use client';

import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    Briefcase,
    Building,
    Building2,
    Car,
    ChevronDown,
    CreditCard,
    FileText,
    Hash,
    Lock,
    Mail,
    MapPin,
    Phone,
    User,
    UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';

import api from '@/lib/axios';
import type { LoginResponse } from '@/types/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ── Types ────────────────────────────────────────────────────
interface EmployerEntity {
    id: string;
    name: string;
    cnpj: string;
}

interface FormState {
    name: string;
    email: string;
    password: string;
    phone: string;
    cpf: string;
    rg: string;
    address: string;
    profession: string;
    employerEntityId: string;
    newEmployerName: string;
    newEmployerCnpj: string;
}

const INITIAL_FORM: FormState = {
    name: '',
    email: '',
    password: '',
    phone: '',
    cpf: '',
    rg: '',
    address: '',
    profession: '',
    employerEntityId: '',
    newEmployerName: '',
    newEmployerCnpj: '',
};

const EMPLOYER_OPTION_NONE = '';
const EMPLOYER_OPTION_OTHER = 'outra';

// ── Animation variants ───────────────────────────────────────
const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const item = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

// ── Shared class strings ─────────────────────────────────────
const inputBase =
    'w-full rounded-lg border border-border bg-input py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors';
const inputWithIcon = `${inputBase} pl-10 pr-3`;
const labelBase = 'block text-sm font-medium text-secondary-foreground mb-1.5';
const requiredMark = <span className="text-primary ml-0.5">*</span>;

// ── Page ─────────────────────────────────────────────────────
export default function CadastroClientePage() {
    const router = useRouter();

    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [employerEntities, setEmployerEntities] = useState<EmployerEntity[]>([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Usa axios sem interceptors: o endpoint requer JWT e esta é uma página pública.
        // Se a requisição falhar (401 ou qualquer outro erro), o select ficará
        // apenas com a opção "Outra", sem redirecionar o usuário.
        axios
            .get<EmployerEntity[]>(`${BASE_URL}/employer-entities`)
            .then((res) => setEmployerEntities(res.data))
            .catch(() => {
                // Falha silenciosa — "Outra" sempre estará disponível
            });
    }, []);

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Passo 1: Cadastrar o cliente
            await api.post('/auth/register/client', {
                name: form.name,
                email: form.email,
                password: form.password,
                phone: form.phone,
                cpf: form.cpf,
                rg: form.rg || null,
                address: form.address || null,
                profession: form.profession || null,
            });

            // Passo 2: Se o usuário escolheu "Outra", criar a entidade empregadora.
            // Requer JWT — faz auto-login com as credenciais recém-cadastradas.
            if (form.employerEntityId === EMPLOYER_OPTION_OTHER) {
                try {
                    const { data: loginData } = await axios.post<LoginResponse>(`${BASE_URL}/login`, {
                        username: form.email,
                        password: form.password,
                    });
                    await axios.post(
                        `${BASE_URL}/employer-entities`,
                        { name: form.newEmployerName, cnpj: form.newEmployerCnpj },
                        {
                            headers: {
                                Authorization: `Bearer ${loginData.access_token}`,
                                'Content-Type': 'application/json',
                            },
                        },
                    );
                } catch {
                    // A entidade empregadora não foi criada, mas o cliente foi cadastrado.
                    // O usuário poderá criá-la após fazer login.
                }
            }

            router.push('/login');
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const status = err.response?.status;
                const message = (err.response?.data as { message?: string })?.message;

                if (status === 409) {
                    setError(message ?? 'E-mail ou CPF já cadastrado.');
                } else if (status === 400) {
                    setError(message ? `Dado inválido: ${message}` : 'Verifique os dados informados e tente novamente.');
                } else {
                    setError('Não foi possível completar o cadastro. Tente novamente.');
                }
            } else {
                setError('Não foi possível conectar ao servidor. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    }

    const isOtherEmployer = form.employerEntityId === EMPLOYER_OPTION_OTHER;

    return (
        <main className="min-h-screen flex bg-background">

            {/* ── Left branding panel (lg+) ──────────────────────── */}
            <motion.aside
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="hidden lg:flex lg:w-[38%] bg-secondary flex-col justify-between p-10 sticky top-0 h-screen relative overflow-hidden border-r border-border"
            >
                {/* Blur orbs */}
                <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
                <div className="pointer-events-none absolute bottom-8 -right-16 w-64 h-64 rounded-full bg-amber-400/8 blur-3xl" />

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
                    <div className="w-12 h-12 rounded-2xl bg-gradient-gold shadow-gold flex items-center justify-center mb-6">
                        <UserPlus size={22} className="text-primary-foreground" />
                    </div>
                    <h2 className="font-heading text-3xl font-bold text-foreground leading-snug mb-4">
                        Crie sua conta e{' '}
                        <span className="text-gradient-gold">comece agora</span>
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                        Cadastre-se como cliente e acesse todos os serviços da plataforma de locação de veículos.
                    </p>
                </div>

                {/* Footer */}
                <p className="relative z-10 text-xs text-muted-foreground">
                    © {new Date().getFullYear()} Rent Cars · PUC Minas
                </p>
            </motion.aside>

            {/* ── Right form panel (scrollable) ───────────────────── */}
            <div className="w-full lg:w-[62%] flex justify-center px-6 py-12">
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-lg"
                >
                    {/* Mobile-only logo */}
                    <motion.div variants={item} className="flex lg:hidden items-center gap-2.5 mb-10">
                        <div className="w-9 h-9 rounded-xl bg-gradient-gold shadow-gold flex items-center justify-center">
                            <Car size={17} className="text-primary-foreground" />
                        </div>
                        <span className="font-heading text-lg font-bold text-foreground">Rent Cars</span>
                    </motion.div>

                    {/* Heading */}
                    <motion.div variants={item} className="mb-8">
                        <h1 className="font-heading text-2xl font-bold text-foreground mb-1">Criar conta</h1>
                        <p className="text-sm text-muted-foreground">
                            Preencha os dados abaixo para se cadastrar como cliente.
                        </p>
                    </motion.div>

                    <form onSubmit={handleSubmit} noValidate className="space-y-4">

                        {/* Nome */}
                        <motion.div variants={item}>
                            <label htmlFor="name" className={labelBase}>
                                Nome completo {requiredMark}
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
                                    placeholder="Maria da Silva"
                                    className={inputWithIcon}
                                />
                            </div>
                        </motion.div>

                        {/* E-mail + Senha */}
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
                                        placeholder="seu@email.com"
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

                        {/* CPF + Telefone */}
                        <motion.div variants={item} className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="cpf" className={labelBase}>
                                    CPF {requiredMark}
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                        <CreditCard size={15} />
                                    </div>
                                    <input
                                        id="cpf"
                                        name="cpf"
                                        type="text"
                                        required
                                        value={form.cpf}
                                        onChange={handleChange}
                                        placeholder="000.000.000-00"
                                        className={inputWithIcon}
                                    />
                                </div>
                            </div>

                            <div>
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
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="(11) 99999-9999"
                                        className={inputWithIcon}
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* RG + Profissão */}
                        <motion.div variants={item} className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="rg" className={labelBase}>RG</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                        <FileText size={15} />
                                    </div>
                                    <input
                                        id="rg"
                                        name="rg"
                                        type="text"
                                        minLength={5}
                                        maxLength={20}
                                        value={form.rg}
                                        onChange={handleChange}
                                        placeholder="12.345.678-9"
                                        className={inputWithIcon}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="profession" className={labelBase}>Profissão</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                        <Briefcase size={15} />
                                    </div>
                                    <input
                                        id="profession"
                                        name="profession"
                                        type="text"
                                        maxLength={100}
                                        value={form.profession}
                                        onChange={handleChange}
                                        placeholder="Engenheira de Software"
                                        className={inputWithIcon}
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Endereço */}
                        <motion.div variants={item}>
                            <label htmlFor="address" className={labelBase}>Endereço</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                    <MapPin size={15} />
                                </div>
                                <input
                                    id="address"
                                    name="address"
                                    type="text"
                                    maxLength={200}
                                    autoComplete="street-address"
                                    value={form.address}
                                    onChange={handleChange}
                                    placeholder="Rua das Flores, 123 — Belo Horizonte, MG"
                                    className={inputWithIcon}
                                />
                            </div>
                        </motion.div>

                        {/* Empresa empregadora */}
                        <motion.div variants={item} className="pt-1 border-t border-border">
                            <label htmlFor="employerEntityId" className={`${labelBase} mt-3`}>
                                Empresa empregadora
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                    <Building2 size={15} />
                                </div>
                                <select
                                    id="employerEntityId"
                                    name="employerEntityId"
                                    value={form.employerEntityId}
                                    onChange={handleChange}
                                    className={`${inputBase} pl-10 pr-8 appearance-none`}
                                >
                                    <option value={EMPLOYER_OPTION_NONE}>Nenhuma / Não informar</option>
                                    {employerEntities.map((entity) => (
                                        <option key={entity.id} value={entity.id}>
                                            {entity.name}
                                        </option>
                                    ))}
                                    <option value={EMPLOYER_OPTION_OTHER}>Outra (cadastrar nova)</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                                    <ChevronDown size={14} />
                                </div>
                            </div>
                        </motion.div>

                        {/* Campos extras — nova empresa (animado) */}
                        <AnimatePresence>
                            {isOtherEmployer && (
                                <motion.div
                                    key="new-employer"
                                    initial={{ opacity: 0, height: 0, y: -8 }}
                                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: -8 }}
                                    transition={{ duration: 0.25, ease: 'easeOut' }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-4 bg-card rounded-xl p-4 border border-border">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                                            Nova empresa empregadora
                                        </p>

                                        <div>
                                            <label htmlFor="newEmployerName" className={labelBase}>
                                                Nome da empresa {requiredMark}
                                            </label>
                                            <div className="relative">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                                    <Building size={15} />
                                                </div>
                                                <input
                                                    id="newEmployerName"
                                                    name="newEmployerName"
                                                    type="text"
                                                    required={isOtherEmployer}
                                                    minLength={2}
                                                    maxLength={150}
                                                    value={form.newEmployerName}
                                                    onChange={handleChange}
                                                    placeholder="Empresa Ltda."
                                                    className={inputWithIcon}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="newEmployerCnpj" className={labelBase}>
                                                CNPJ {requiredMark}
                                            </label>
                                            <div className="relative">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                                    <Hash size={15} />
                                                </div>
                                                <input
                                                    id="newEmployerCnpj"
                                                    name="newEmployerCnpj"
                                                    type="text"
                                                    required={isOtherEmployer}
                                                    value={form.newEmployerCnpj}
                                                    onChange={handleChange}
                                                    placeholder="00.000.000/0001-00"
                                                    className={inputWithIcon}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

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
                                    'Cadastrando…'
                                ) : (
                                    <>
                                        Criar conta <ArrowRight size={15} />
                                    </>
                                )}
                            </button>
                        </motion.div>
                    </form>

                    {/* Link de login */}
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
