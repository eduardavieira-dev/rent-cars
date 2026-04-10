'use client';

import { isAxiosError } from 'axios';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Briefcase,
    CreditCard,
    Eye,
    EyeOff,
    FileText,
    Lock,
    Mail,
    MapPin,
    Phone,
    User,
    UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { SyntheticEvent } from 'react';
import { useState } from 'react';
import { IMaskInput } from 'react-imask';
import { toast } from 'sonner';
import { z } from 'zod';

import { BrandLogo } from '@/components/brand-logo';
import api from '@/lib/axios';

const clientSchema = z.object({
    name: z.string().min(1, 'Informe o nome completo.'),
    email: z.string().email('Informe um e-mail válido.'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
    phone: z.string().refine((v) => v.replace(/\D/g, '').length >= 10, 'Informe um telefone válido.'),
    cpf: z.string().refine((v) => v.replace(/\D/g, '').length === 11, 'Informe um CPF válido.'),
    rg: z.string().min(1, 'Informe o RG.'),
    address: z.string().optional(),
    profession: z.string().min(1, 'Informe a profissão.'),
});

type ClientFormErrors = Partial<Record<keyof z.infer<typeof clientSchema>, string>>;

const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
} as const;

const item = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
} as const;

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
    cpf: string;
    rg: string;
    address: string;
    profession: string;
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
};

export default function ClientRegistrationPage() {
    const router = useRouter();

    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [fieldErrors, setFieldErrors] = useState<ClientFormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    function handleTextChange(name: keyof FormState, value: string) {
        setForm((prev) => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    }

    async function handleSubmit(e: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
        e.preventDefault();

        const result = clientSchema.safeParse(form);
        if (!result.success) {
            const errors: ClientFormErrors = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as keyof ClientFormErrors;
                if (!errors[field]) errors[field] = issue.message;
            }
            setFieldErrors(errors);
            return;
        }

        setFieldErrors({});
        setIsLoading(true);

        try {
            await api.post('/auth/register/client', {
                name: form.name,
                email: form.email,
                password: form.password,
                phone: form.phone,
                cpf: form.cpf,
                rg: form.rg,
                address: form.address || null,
                profession: form.profession,
            });

            router.push('/login');
        } catch (err) {
            if (isAxiosError(err)) {
                if (!err.response) {
                    toast.error('Não foi possível conectar ao servidor. Verifique se o backend está em execução.');
                    return;
                }

                const status = err.response.status;
                const message = (err.response.data as { message?: string })?.message;

                if (status === 409) {
                    toast.error(message ?? 'E-mail ou CPF já cadastrado. Verifique os dados.');
                } else if (status === 400) {
                    toast.error(message ? `Dado inválido: ${message}` : 'Verifique os dados informados e tente novamente.');
                } else {
                    toast.error(`Erro ${status} ao realizar o cadastro. Tente novamente.`);
                }
            } else {
                toast.error('Erro inesperado. Tente novamente.');
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
                className="hidden lg:flex lg:w-[38%] bg-secondary flex-col justify-between p-10 sticky top-0 h-screen overflow-hidden border-r border-border"
            >
                <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-black/65 via-black/45 to-black/25" />
                <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
                <div className="pointer-events-none absolute bottom-8 -right-16 w-64 h-64 rounded-full bg-amber-400/8 blur-3xl" />

                <BrandLogo size="md" className="relative z-10" />

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

                <p className="relative z-10 text-xs text-muted-foreground">
                    © {new Date().getFullYear()} Rent Cars · PUC Minas
                </p>
            </motion.aside>

            <div className="w-full lg:w-[62%] flex items-center justify-center px-6 py-12">
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-lg"
                >
                    <motion.div variants={item} className="flex lg:hidden items-center gap-2.5 mb-10">
                        <BrandLogo size="sm" />
                    </motion.div>

                    <motion.div variants={item} className="mb-8">
                        <h1 className="font-heading text-2xl font-bold text-foreground mb-1">Criar conta</h1>
                        <p className="text-sm text-muted-foreground">
                            Preencha os dados abaixo para se cadastrar como cliente.
                        </p>
                    </motion.div>

                    <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
                                    onChange={(e) => handleTextChange('name', e.target.value)}
                                    placeholder="Maria da Silva"
                                    className={inputWithIcon}
                                />
                            </div>
                            {fieldErrors.name && (
                                <p className="mt-1 text-xs font-bold text-destructive">{fieldErrors.name}</p>
                            )}
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
                                        onChange={(e) => handleTextChange('email', e.target.value)}
                                        placeholder="seu@email.com"
                                        className={inputWithIcon}
                                    />
                                </div>
                                {fieldErrors.email && (
                                    <p className="mt-1 text-xs font-bold text-destructive">{fieldErrors.email}</p>
                                )}
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
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        autoComplete="new-password"
                                        minLength={6}
                                        maxLength={100}
                                        value={form.password}
                                        onChange={(e) => handleTextChange('password', e.target.value)}
                                        placeholder="Mín. 6 caracteres"
                                        className={`${inputBase} pl-10 pr-10`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                                {fieldErrors.password && (
                                    <p className="mt-1 text-xs font-bold text-destructive">{fieldErrors.password}</p>
                                )}
                            </div>
                        </motion.div>

                        <motion.div variants={item} className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="cpf" className={labelBase}>
                                    CPF {requiredMark}
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                        <CreditCard size={15} />
                                    </div>
                                    <IMaskInput
                                        id="cpf"
                                        name="cpf"
                                        mask="000.000.000-00"
                                        type="text"
                                        required
                                        inputMode="numeric"
                                        value={form.cpf}
                                        onAccept={(value: string) => handleTextChange('cpf', value)}
                                        placeholder="000.000.000-00"
                                        className={inputWithIcon}
                                    />
                                </div>
                                {fieldErrors.cpf && (
                                    <p className="mt-1 text-xs font-bold text-destructive">{fieldErrors.cpf}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="phone" className={labelBase}>
                                    Telefone {requiredMark}
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                        <Phone size={15} />
                                    </div>
                                    <IMaskInput
                                        id="phone"
                                        name="phone"
                                        mask={[{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }]}
                                        type="tel"
                                        required
                                        autoComplete="tel"
                                        inputMode="numeric"
                                        value={form.phone}
                                        onAccept={(value: string) => handleTextChange('phone', value)}
                                        placeholder="(11) 99999-9999"
                                        className={inputWithIcon}
                                    />
                                </div>
                                {fieldErrors.phone && (
                                    <p className="mt-1 text-xs font-bold text-destructive">{fieldErrors.phone}</p>
                                )}
                            </div>
                        </motion.div>

                        <motion.div variants={item} className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="rg" className={labelBase}>RG {requiredMark}</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                        <FileText size={15} />
                                    </div>
                                    <IMaskInput
                                        id="rg"
                                        name="rg"
                                        mask={[
                                            { mask: '00.000.000-0' },
                                            { mask: 'aa-00.000.000', definitions: { a: /[A-Za-z]/ } },
                                        ]}
                                        prepare={(value: string) => value.toUpperCase()}
                                        type="text"
                                        required
                                        value={form.rg}
                                        onAccept={(value: string) => handleTextChange('rg', value)}
                                        placeholder="MG-12.345.678"
                                        className={inputWithIcon}
                                    />
                                </div>
                                {fieldErrors.rg && (
                                    <p className="mt-1 text-xs font-bold text-destructive">{fieldErrors.rg}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="profession" className={labelBase}>Profissão {requiredMark}</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                        <Briefcase size={15} />
                                    </div>
                                    <input
                                        id="profession"
                                        name="profession"
                                        type="text"
                                        required
                                        maxLength={100}
                                        value={form.profession}
                                        onChange={(e) => handleTextChange('profession', e.target.value)}
                                        placeholder="Engenheira de Software"
                                        className={inputWithIcon}
                                    />
                                </div>
                                {fieldErrors.profession && (
                                    <p className="mt-1 text-xs font-bold text-destructive">{fieldErrors.profession}</p>
                                )}
                            </div>
                        </motion.div>

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
                                    onChange={(e) => handleTextChange('address', e.target.value)}
                                    placeholder="Rua das Flores, 123 — Belo Horizonte, MG"
                                    className={inputWithIcon}
                                />
                            </div>
                        </motion.div>

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
