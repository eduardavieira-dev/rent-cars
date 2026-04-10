'use client';

import { isAxiosError } from 'axios';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, Building2, Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { SyntheticEvent } from 'react';
import { useState } from 'react';
import { IMaskInput } from 'react-imask';
import { toast } from 'sonner';
import { z } from 'zod';

import { BrandLogo } from '@/components/brand-logo';
import api from '@/lib/axios';

const companySchema = z.object({
    name: z.string().min(1, 'Informe o nome do responsável.'),
    corporateName: z.string().min(1, 'Informe a razão social.'),
    email: z.string().email('Informe um e-mail válido.'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
    phone: z.string().refine((v) => v.replace(/\D/g, '').length >= 10, 'Informe um telefone válido.'),
    cnpj: z.string().refine((v) => v.replace(/\D/g, '').length === 14, 'Informe um CNPJ válido.'),
});

type CompanyFormErrors = Partial<Record<keyof z.infer<typeof companySchema>, string>>;

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
    cnpj: string;
    corporateName: string;
}

const INITIAL_FORM: FormState = {
    name: '',
    email: '',
    password: '',
    phone: '',
    cnpj: '',
    corporateName: '',
};

export default function CompanyRegistrationPage() {
    const router = useRouter();

    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [fieldErrors, setFieldErrors] = useState<CompanyFormErrors>({});
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

        const result = companySchema.safeParse(form);
        if (!result.success) {
            const errors: CompanyFormErrors = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as keyof CompanyFormErrors;
                if (!errors[field]) errors[field] = issue.message;
            }
            setFieldErrors(errors);
            return;
        }

        setFieldErrors({});
        setIsLoading(true);

        try {
            await api.post('/auth/register/company', {
                name: form.name,
                email: form.email,
                password: form.password,
                phone: form.phone,
                cnpj: form.cnpj,
                corporateName: form.corporateName,
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
                    toast.error(message ?? 'CNPJ ou e-mail já cadastrado. Verifique os dados.');
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
                        <Building2 size={22} className="text-primary-foreground" />
                    </div>
                    <h2 className="font-heading text-3xl font-bold text-foreground leading-snug mb-4">
                        Cadastre sua{' '}
                        <span className="text-gradient-gold">empresa locadora</span>
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                        Registre sua empresa e gerencie contratos, frotas e clientes em um único lugar.
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
                        <h1 className="font-heading text-2xl font-bold text-foreground mb-1">Cadastro de Empresa</h1>
                        <p className="text-sm text-muted-foreground">
                            Preencha os dados abaixo para cadastrar sua empresa locadora.
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
                                    onChange={(e) => handleTextChange('name', e.target.value)}
                                    placeholder="Maria da Silva"
                                    className={inputWithIcon}
                                />
                            </div>
                            {fieldErrors.name && (
                                <p className="mt-1 text-xs font-bold text-destructive">{fieldErrors.name}</p>
                            )}
                        </motion.div>

                        <motion.div variants={item}>
                            <label htmlFor="corporateName" className={labelBase}>
                                Razão social {requiredMark}
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                    <Briefcase size={15} />
                                </div>
                                <input
                                    id="corporateName"
                                    name="corporateName"
                                    type="text"
                                    required
                                    minLength={2}
                                    maxLength={200}
                                    value={form.corporateName}
                                    onChange={(e) => handleTextChange('corporateName', e.target.value)}
                                    placeholder="Locadora XYZ Ltda."
                                    className={inputWithIcon}
                                />
                            </div>
                            {fieldErrors.corporateName && (
                                <p className="mt-1 text-xs font-bold text-destructive">{fieldErrors.corporateName}</p>
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
                                        placeholder="empresa@email.com"
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

                            <div>
                                <label htmlFor="cnpj" className={labelBase}>
                                    CNPJ {requiredMark}
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                        <Building2 size={15} />
                                    </div>
                                    <IMaskInput
                                        id="cnpj"
                                        name="cnpj"
                                        mask="00.000.000/0000-00"
                                        type="text"
                                        required
                                        inputMode="numeric"
                                        value={form.cnpj}
                                        onAccept={(value: string) => handleTextChange('cnpj', value)}
                                        placeholder="00.000.000/0000-00"
                                        className={inputWithIcon}
                                    />
                                </div>
                                {fieldErrors.cnpj && (
                                    <p className="mt-1 text-xs font-bold text-destructive">{fieldErrors.cnpj}</p>
                                )}
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
