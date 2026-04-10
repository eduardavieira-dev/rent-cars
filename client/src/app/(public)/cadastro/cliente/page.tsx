'use client';

import axios, { isAxiosError } from 'axios';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Briefcase,
    Building,
    Building2,
    CreditCard,
    Eye,
    EyeOff,
    FileText,
    Home,
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
import { PasswordStrengthChecker } from '@/components/PasswordStrengthChecker';
import api from '@/lib/axios';

const passwordSchema = z
    .string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres.')
    .refine((v) => /[A-Za-z]/.test(v), 'A senha deve conter pelo menos uma letra.')
    .refine((v) => /\d/.test(v), 'A senha deve conter pelo menos um número.')
    .refine(
        (v) => /[^A-Za-z0-9À-ÿ]/.test(v),
        'A senha deve conter pelo menos um caractere especial.'
    );

const clientSchema = z
    .object({
        name: z
            .string()
            .min(3, 'O nome deve ter no mínimo 3 caracteres.')
            .refine(
                (v) => /^[A-Za-zÀ-ÿ\s]+$/.test(v),
                'O nome deve conter apenas letras e espaços.'
            ),
        email: z.string().email('Informe um e-mail válido.'),
        password: passwordSchema,
        confirmPassword: z.string().min(1, 'Confirme a senha.'),
        phone: z
            .string()
            .refine(
                (v) => v.replace(/\D/g, '').length === 11,
                'Informe um telefone com DDD e 9 dígitos.'
            ),
        cpf: z
            .string()
            .refine(
                (v) => v.replace(/\D/g, '').length === 11,
                'Informe um CPF válido (11 dígitos).'
            ),
        rg: z
            .string()
            .refine((v) => v.replace(/[.\-\s]/g, '').length >= 7, 'Informe o RG completo.'),
        profession: z.string().min(3, 'A profissão deve ter no mínimo 3 caracteres.'),
        cep: z.string().refine((v) => v.replace(/\D/g, '').length === 8, 'Informe um CEP válido.'),
        street: z.string().min(3, 'A rua deve ter no mínimo 3 caracteres.'),
        complement: z.string(),
        neighborhood: z.string().min(3, 'O bairro deve ter no mínimo 3 caracteres.'),
        city: z.string().min(3, 'A cidade deve ter no mínimo 3 caracteres.'),
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
    confirmPassword: string;
    phone: string;
    cpf: string;
    rg: string;
    profession: string;
    cep: string;
    street: string;
    complement: string;
    neighborhood: string;
    city: string;
}

const INITIAL_FORM: FormState = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    cpf: '',
    rg: '',
    profession: '',
    cep: '',
    street: '',
    complement: '',
    neighborhood: '',
    city: '',
};

interface ViaCepResponse {
    erro?: boolean;
    logradouro?: string;
    bairro?: string;
    localidade?: string;
}

export default function ClientRegistrationPage() {
    const router = useRouter();

    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [fieldErrors, setFieldErrors] = useState<ClientFormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showPasswordChecker, setShowPasswordChecker] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingCep, setIsLoadingCep] = useState(false);

    function handleTextChange(name: keyof FormState, value: string) {
        setForm((prev) => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    }

    async function handleCepBlur() {
        const digits = form.cep.replace(/\D/g, '');
        if (digits.length !== 8) return;

        setIsLoadingCep(true);
        try {
            const response = await axios.get<ViaCepResponse>(
                `https://viacep.com.br/ws/${digits}/json/`
            );
            const data = response.data;
            if (!data.erro) {
                setForm((prev) => ({
                    ...prev,
                    street: data.logradouro ?? prev.street,
                    neighborhood: data.bairro ?? prev.neighborhood,
                    city: data.localidade ?? prev.city,
                }));
                setFieldErrors((prev) => ({
                    ...prev,
                    street: undefined,
                    neighborhood: undefined,
                    city: undefined,
                }));
            }
        } catch {
            // ViaCEP indisponível — usuário preenche manualmente
        } finally {
            setIsLoadingCep(false);
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

        const composedAddress = `${form.street} - ${form.complement}. Bairro ${form.neighborhood} - ${form.city}`;

        try {
            await api.post('/auth/register/client', {
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
                phone: form.phone.replace(/\D/g, ''),
                cpf: form.cpf.replace(/\D/g, ''),
                rg: form.rg.replace(/[.\-\s]/g, ''),
                profession: form.profession.trim(),
                address: composedAddress,
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
                    toast.error(message ?? 'E-mail ou CPF já cadastrado. Verifique os dados.');
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
                        <UserPlus size={22} className="text-primary-foreground" />
                    </div>
                    <h2 className="font-heading text-foreground mb-4 text-3xl leading-snug font-bold">
                        Crie sua conta e <span className="text-gradient-gold">comece agora</span>
                    </h2>
                    <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
                        Cadastre-se como cliente e acesse todos os serviços da plataforma de locação
                        de veículos.
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
                            Criar conta
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Preencha os dados abaixo para se cadastrar como cliente.
                        </p>
                    </motion.div>

                    <form onSubmit={handleSubmit} noValidate className="space-y-4">
                        <motion.div
                            variants={item}
                            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                        >
                            <div>
                                <label htmlFor="name" className={labelBase}>
                                    Nome completo {requiredMark}
                                </label>
                                <div className="relative">
                                    <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
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
                                    <p className="text-destructive mt-1 text-xs font-bold">
                                        {fieldErrors.name}
                                    </p>
                                )}
                            </div>

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
                                        placeholder="seu@email.com"
                                        className={inputWithIcon}
                                    />
                                </div>
                                {fieldErrors.email && (
                                    <p className="text-destructive mt-1 text-xs font-bold">
                                        {fieldErrors.email}
                                    </p>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            variants={item}
                            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                        >
                            <div>
                                <label htmlFor="cpf" className={labelBase}>
                                    CPF {requiredMark}
                                </label>
                                <div className="relative">
                                    <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
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
                                    <p className="text-destructive mt-1 text-xs font-bold">
                                        {fieldErrors.cpf}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="rg" className={labelBase}>
                                    RG {requiredMark}
                                </label>
                                <div className="relative">
                                    <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <FileText size={15} />
                                    </div>
                                    <IMaskInput
                                        id="rg"
                                        name="rg"
                                        mask={[
                                            { mask: '00.000.000-0' },
                                            {
                                                mask: 'aa-00.000.000',
                                                definitions: { a: /[A-Za-z]/ },
                                            },
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
                                    <p className="text-destructive mt-1 text-xs font-bold">
                                        {fieldErrors.rg}
                                    </p>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            variants={item}
                            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                        >
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
                                        mask={[
                                            { mask: '(00) 0000-0000' },
                                            { mask: '(00) 00000-0000' },
                                        ]}
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

                            <div>
                                <label htmlFor="cep" className={labelBase}>
                                    CEP {requiredMark}
                                </label>
                                <div className="relative">
                                    <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <MapPin size={15} />
                                    </div>
                                    <IMaskInput
                                        id="cep"
                                        name="cep"
                                        mask="00000-000"
                                        type="text"
                                        required
                                        inputMode="numeric"
                                        value={form.cep}
                                        onAccept={(value: string) => handleTextChange('cep', value)}
                                        onBlur={handleCepBlur}
                                        placeholder="00000-000"
                                        className={`${inputWithIcon} ${isLoadingCep ? 'opacity-60' : ''}`}
                                    />
                                </div>
                                {fieldErrors.cep && (
                                    <p className="text-destructive mt-1 text-xs font-bold">
                                        {fieldErrors.cep}
                                    </p>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            variants={item}
                            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                        >
                            <div>
                                <label htmlFor="street" className={labelBase}>
                                    Rua {requiredMark}
                                </label>
                                <div className="relative">
                                    <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <MapPin size={15} />
                                    </div>
                                    <input
                                        id="street"
                                        name="street"
                                        type="text"
                                        required
                                        maxLength={200}
                                        value={form.street}
                                        onChange={(e) => handleTextChange('street', e.target.value)}
                                        placeholder="Rua das Flores"
                                        className={inputWithIcon}
                                    />
                                </div>
                                {fieldErrors.street && (
                                    <p className="text-destructive mt-1 text-xs font-bold">
                                        {fieldErrors.street}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="complement" className={labelBase}>
                                    Complemento/Número {requiredMark}
                                </label>
                                <div className="relative">
                                    <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Home size={15} />
                                    </div>
                                    <input
                                        id="complement"
                                        name="complement"
                                        type="text"
                                        required
                                        maxLength={100}
                                        value={form.complement}
                                        onChange={(e) =>
                                            handleTextChange('complement', e.target.value)
                                        }
                                        placeholder="Apto 201, Bloco B"
                                        className={inputWithIcon}
                                    />
                                </div>
                                {fieldErrors.complement && (
                                    <p className="text-destructive mt-1 text-xs font-bold">
                                        {fieldErrors.complement}
                                    </p>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            variants={item}
                            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                        >
                            <div>
                                <label htmlFor="neighborhood" className={labelBase}>
                                    Bairro {requiredMark}
                                </label>
                                <div className="relative">
                                    <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Building size={15} />
                                    </div>
                                    <input
                                        id="neighborhood"
                                        name="neighborhood"
                                        type="text"
                                        required
                                        maxLength={100}
                                        value={form.neighborhood}
                                        onChange={(e) =>
                                            handleTextChange('neighborhood', e.target.value)
                                        }
                                        placeholder="Centro"
                                        className={inputWithIcon}
                                    />
                                </div>
                                {fieldErrors.neighborhood && (
                                    <p className="text-destructive mt-1 text-xs font-bold">
                                        {fieldErrors.neighborhood}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="city" className={labelBase}>
                                    Cidade {requiredMark}
                                </label>
                                <div className="relative">
                                    <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Building2 size={15} />
                                    </div>
                                    <input
                                        id="city"
                                        name="city"
                                        type="text"
                                        required
                                        maxLength={100}
                                        value={form.city}
                                        onChange={(e) => handleTextChange('city', e.target.value)}
                                        placeholder="Belo Horizonte"
                                        className={inputWithIcon}
                                    />
                                </div>
                                {fieldErrors.city && (
                                    <p className="text-destructive mt-1 text-xs font-bold">
                                        {fieldErrors.city}
                                    </p>
                                )}
                            </div>
                        </motion.div>

                        <motion.div variants={item}>
                            <label htmlFor="profession" className={labelBase}>
                                Profissão {requiredMark}
                            </label>
                            <div className="relative">
                                <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
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
                                <p className="text-destructive mt-1 text-xs font-bold">
                                    {fieldErrors.profession}
                                </p>
                            )}
                        </motion.div>

                        <motion.div
                            variants={item}
                            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                        >
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
                                        onFocus={() => setShowPasswordChecker(true)}
                                        onBlur={() => setShowPasswordChecker(false)}
                                        placeholder="Mín. 8 caracteres, com letra, número e símbolo"
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

                        <motion.div variants={item}>
                            <PasswordStrengthChecker
                                password={form.password}
                                confirmPassword={form.confirmPassword}
                                visible={showPasswordChecker}
                            />
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
