'use client';

import { isAxiosError } from 'axios';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Building,
    Eye,
    EyeOff,
    Hash,
    Landmark,
    Lock,
    Mail,
    Phone,
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

const bankSchema = z
    .object({
        name: z.string().min(1, 'Informe o nome do banco.'),
        email: z.string().email('Informe um e-mail válido.'),
        password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
        confirmPassword: z.string().min(1, 'Confirme a senha.'),
        phone: z
            .string()
            .refine((v) => v.replace(/\D/g, '').length >= 10, 'Informe um telefone válido.'),
        cnpj: z
            .string()
            .refine((v) => v.replace(/\D/g, '').length === 14, 'Informe um CNPJ válido.'),
        code: z
            .string()
            .refine((v) => v.replace(/\D/g, '').length === 3, 'Informe um código COMPE válido.'),
    })
    .superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'As senhas não coincidem.',
                path: ['confirmPassword'],
            });
        }
    });

type BankFormErrors = Partial<Record<keyof z.infer<typeof bankSchema>, string>>;

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
    confirmPassword: string;
    phone: string;
    cnpj: string;
    code: string;
}

const INITIAL_FORM: FormState = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    cnpj: '',
    code: '',
};

export default function BankRegistrationPage() {
    const router = useRouter();

    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [fieldErrors, setFieldErrors] = useState<BankFormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    function handleTextChange(name: keyof FormState, value: string) {
        setForm((prev) => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    }

    async function handleSubmit(e: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
        e.preventDefault();

        const result = bankSchema.safeParse(form);
        if (!result.success) {
            const errors: BankFormErrors = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as keyof BankFormErrors;
                if (!errors[field]) errors[field] = issue.message;
            }
            setFieldErrors(errors);
            return;
        }

        setFieldErrors({});
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
            if (isAxiosError(err)) {
                if (!err.response) {
                    toast.error(
                        'Não foi possível conectar ao servidor. Verifique se o backend está em execução.'
                    );
                    return;
                }

                const status = err.response.status;
                const message = (err.response.data as { message?: string })?.message;

                if (status === 409) {
                    toast.error(message ?? 'CNPJ ou e-mail já cadastrado. Verifique os dados.');
                } else if (status === 400) {
                    toast.error(
                        message
                            ? `Dado inválido: ${message}`
                            : 'Verifique os dados informados e tente novamente.'
                    );
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
        <main className="bg-background flex min-h-screen">
            <motion.aside
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="bg-secondary border-border sticky top-0 hidden h-screen flex-col justify-between overflow-hidden border-r p-10 lg:flex lg:w-[38%]"
            >
                <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-black/65 via-black/45 to-black/25" />
                <div className="bg-primary/10 pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl" />
                <div className="pointer-events-none absolute -right-16 bottom-8 h-64 w-64 rounded-full bg-amber-400/8 blur-3xl" />

                <BrandLogo size="md" className="relative z-10" />

                <div className="relative z-10">
                    <div className="bg-gradient-gold shadow-gold mb-6 flex h-12 w-12 items-center justify-center rounded-2xl">
                        <Landmark size={22} className="text-primary-foreground" />
                    </div>
                    <h2 className="font-heading text-foreground mb-4 text-3xl leading-snug font-bold">
                        Cadastre sua{' '}
                        <span className="text-gradient-gold">instituição financeira</span>
                    </h2>
                    <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
                        Registre seu banco na plataforma e participe do financiamento de contratos
                        de locação.
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
                    className="w-full max-w-lg"
                >
                    <motion.div
                        variants={item}
                        className="mb-10 flex items-center gap-2.5 lg:hidden"
                    >
                        <BrandLogo size="sm" />
                    </motion.div>

                    <motion.div variants={item} className="mb-8">
                        <h1 className="font-heading text-foreground mb-1 text-2xl font-bold">
                            Cadastro de Banco
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Preencha os dados abaixo para cadastrar sua instituição financeira.
                        </p>
                    </motion.div>

                    <form onSubmit={handleSubmit} noValidate className="space-y-4">
                        <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="name" className={labelBase}>
                                    Nome do banco {requiredMark}
                                </label>
                                <div className="relative">
                                    <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Landmark size={15} />
                                    </div>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        autoComplete="organization"
                                        minLength={3}
                                        maxLength={100}
                                        value={form.name}
                                        onChange={(e) => handleTextChange('name', e.target.value)}
                                        placeholder="Banco do Brasil"
                                        className={inputWithIcon}
                                    />
                                </div>
                                {fieldErrors.name && (
                                    <p className="text-destructive mt-1 text-xs font-bold">
                                        {fieldErrors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="code" className={labelBase}>
                                    Código COMPE {requiredMark}
                                </label>
                                <div className="relative">
                                    <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Hash size={15} />
                                    </div>
                                    <IMaskInput
                                        id="code"
                                        name="code"
                                        mask="000"
                                        type="text"
                                        required
                                        inputMode="numeric"
                                        value={form.code}
                                        onAccept={(value: string) =>
                                            handleTextChange('code', value)
                                        }
                                        placeholder="001"
                                        className={inputWithIcon}
                                    />
                                </div>
                                {fieldErrors.code && (
                                    <p className="text-destructive mt-1 text-xs font-bold">
                                        {fieldErrors.code}
                                    </p>
                                )}
                            </div>
                        </motion.div>

                        <motion.div variants={item}>
                            <label htmlFor="cnpj" className={labelBase}>
                                CNPJ {requiredMark}
                            </label>
                            <div className="relative">
                                <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Building size={15} />
                                </div>
                                <IMaskInput
                                    id="cnpj"
                                    name="cnpj"
                                    mask="00.000.000/0000-00"
                                    type="text"
                                    required
                                    inputMode="numeric"
                                    value={form.cnpj}
                                    onAccept={(value: string) =>
                                        handleTextChange('cnpj', value)
                                    }
                                    placeholder="00.000.000/0000-00"
                                    className={inputWithIcon}
                                />
                            </div>
                            {fieldErrors.cnpj && (
                                <p className="text-destructive mt-1 text-xs font-bold">
                                    {fieldErrors.cnpj}
                                </p>
                            )}
                        </motion.div>

                        <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="email" className={labelBase}>
                                    E-mail {requiredMark}
                                </label>
                                <div className="relative">
                                    <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
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
                                        placeholder="banco@email.com"
                                        className={inputWithIcon}
                                    />
                                </div>
                                {fieldErrors.email && (
                                    <p className="text-destructive mt-1 text-xs font-bold">
                                        {fieldErrors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="phone" className={labelBase}>
                                    Telefone {requiredMark}
                                </label>
                                <div className="relative">
                                    <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
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
                                        onAccept={(value: string) =>
                                            handleTextChange('phone', value)
                                        }
                                        placeholder="(11) 99999-9999"
                                        className={inputWithIcon}
                                    />
                                </div>
                                {fieldErrors.phone && (
                                    <p className="text-destructive mt-1 text-xs font-bold">
                                        {fieldErrors.phone}
                                    </p>
                                )}
                            </div>
                        </motion.div>

                        <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="password" className={labelBase}>
                                    Senha {requiredMark}
                                </label>
                                <div className="relative">
                                    <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
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
                                        onChange={(e) =>
                                            handleTextChange('password', e.target.value)
                                        }
                                        placeholder="Mín. 6 caracteres"
                                        className={`${inputBase} pr-10 pl-10`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        aria-label={
                                            showPassword ? 'Ocultar senha' : 'Mostrar senha'
                                        }
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
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className={labelBase}>
                                    Confirmar senha {requiredMark}
                                </label>
                                <div className="relative">
                                    <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Lock size={15} />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        autoComplete="new-password"
                                        minLength={6}
                                        maxLength={100}
                                        value={form.confirmPassword}
                                        onChange={(e) =>
                                            handleTextChange('confirmPassword', e.target.value)
                                        }
                                        placeholder="Repita a senha"
                                        className={`${inputBase} pr-10 pl-10`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        aria-label={
                                            showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'
                                        }
                                        className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={15} />
                                        ) : (
                                            <Eye size={15} />
                                        )}
                                    </button>
                                </div>
                                {fieldErrors.confirmPassword && (
                                    <p className="text-destructive mt-1 text-xs font-bold">
                                        {fieldErrors.confirmPassword}
                                    </p>
                                )}
                            </div>
                        </motion.div>

                        <motion.div variants={item} className="pt-1">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-gradient-gold shadow-gold text-primary-foreground flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
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

                    <motion.p
                        variants={item}
                        className="text-muted-foreground mt-6 text-center text-sm"
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
