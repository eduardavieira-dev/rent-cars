'use client';

import axios, { isAxiosError } from 'axios';
import { Clock3, Save, ShieldCheck, UserCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { SyntheticEvent } from 'react';
import { useEffect, useMemo, useState, type ChangeEvent, type InputHTMLAttributes } from 'react';
import { IMaskInput } from 'react-imask';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import { z } from 'zod';
import { ProfileDangerZone } from './ProfileDangerZone/index';

type RoleType = 'CLIENT' | 'BANK' | 'COMPANY';

interface ViaCepResponse {
    erro?: boolean;
    logradouro?: string;
    bairro?: string;
    localidade?: string;
}

interface ProfileFormState {
    name: string;
    email: string;
    phone: string;
    cpf: string;
    rg: string;
    cep: string;
    street: string;
    complement: string;
    neighborhood: string;
    city: string;
    profession: string;
    cnpj: string;
    code: string;
    corporateName: string;
}

interface UserProfile {
    id: string;
    roles: RoleType[];
    form: ProfileFormState;
}

const EMPTY_FORM: ProfileFormState = {
    name: '',
    email: '',
    phone: '',
    cpf: '',
    rg: '',
    cep: '',
    street: '',
    complement: '',
    neighborhood: '',
    city: '',
    profession: '',
    cnpj: '',
    code: '',
    corporateName: '',
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function toStringValue(value: unknown): string {
    return typeof value === 'string' ? value : '';
}

function normalizeRole(value: unknown): RoleType | null {
    if (typeof value !== 'string') return null;
    const normalized = value.toUpperCase();
    if (normalized === 'CLIENT' || normalized === 'BANK' || normalized === 'COMPANY')
        return normalized;
    return null;
}

function parseAddressString(address: string): { cep: string; street: string; complement: string; neighborhood: string; city: string } {
    const match = /^(.*?) - (.*?)\. Bairro (.*?) - (.*)$/.exec(address);
    if (match) return { cep: '', street: match[1], complement: match[2], neighborhood: match[3], city: match[4] };
    return { cep: '', street: address, complement: '', neighborhood: '', city: '' };
}

function parseUserProfile(payload: unknown): UserProfile | null {
    if (!isRecord(payload)) return null;

    const rolesRaw = payload.roles;
    const rolesFromArray = Array.isArray(rolesRaw)
        ? rolesRaw.map(normalizeRole).filter((role): role is RoleType => role !== null)
        : [];
    const roleFromType = normalizeRole(payload.type);
    const roles = rolesFromArray.length > 0 ? rolesFromArray : roleFromType ? [roleFromType] : [];

    const id = String(payload.id ?? '');
    if (!id) return null;

    const addressParsed = parseAddressString(toStringValue(payload.address));

    return {
        id,
        roles,
        form: {
            name: toStringValue(payload.name),
            email: toStringValue(payload.email),
            phone: toStringValue(payload.phone),
            cpf: toStringValue(payload.cpf),
            rg: toStringValue(payload.rg),
            cep: addressParsed.cep,
            street: addressParsed.street,
            complement: addressParsed.complement,
            neighborhood: addressParsed.neighborhood,
            city: addressParsed.city,
            profession: toStringValue(payload.profession),
            cnpj: toStringValue(payload.cnpj),
            code: toStringValue(payload.code),
            corporateName: toStringValue(payload.corporateName),
        },
    };
}

function getListFromResponse(payload: unknown): unknown[] {
    if (Array.isArray(payload)) return payload;
    if (!isRecord(payload)) return [];
    if (Array.isArray(payload.items)) return payload.items;
    if (Array.isArray(payload.content)) return payload.content;
    if (Array.isArray(payload.data)) return payload.data;
    return [];
}

function roleToPath(role: RoleType): 'client' | 'bank' | 'company' {
    if (role === 'CLIENT') return 'client';
    if (role === 'BANK') return 'bank';
    return 'company';
}

function roleToLabel(role: RoleType): string {
    if (role === 'CLIENT') return 'Cliente';
    if (role === 'BANK') return 'Banco';
    return 'Empresa';
}

const baseProfileSchema = z.object({
    name: z
        .string()
        .min(3, 'O nome deve ter no mínimo 3 caracteres.')
        .refine(
            (v) => /^[A-Za-zÀ-ÿ\s]+$/.test(v),
            'O nome deve conter apenas letras e espaços.'
        ),
    email: z.string().email('Informe um e-mail válido.'),
    phone: z
        .string()
        .refine(
            (v) => v.replace(/\D/g, '').length === 11,
            'Informe um telefone com DDD e 9 dígitos.'
        ),
});

const clientProfileSchema = baseProfileSchema.extend({
    cpf: z
        .string()
        .refine(
            (v) => v.replace(/\D/g, '').length === 11,
            'Informe um CPF válido (11 dígitos).'
        ),
    rg: z
        .string()
        .refine(
            (v) => v.replace(/[.\-\s]/g, '').length >= 7,
            'Informe o RG completo.'
        ),
    profession: z.string().min(3, 'A profissão deve ter no mínimo 3 caracteres.'),
    cep: z
        .string()
        .refine((v) => v.replace(/\D/g, '').length === 8, 'Informe um CEP válido.'),
    street: z.string().min(3, 'A rua deve ter no mínimo 3 caracteres.'),
    complement: z.string(),
    neighborhood: z.string().min(3, 'O bairro deve ter no mínimo 3 caracteres.'),
    city: z.string().min(3, 'A cidade deve ter no mínimo 3 caracteres.'),
});

const bankProfileSchema = baseProfileSchema.extend({
    cnpj: z
        .string()
        .refine(
            (v) => v.replace(/\D/g, '').length === 14,
            'Informe um CNPJ válido (14 dígitos).'
        ),
    code: z
        .string()
        .refine(
            (v) => v.replace(/\D/g, '').length === 3,
            'Informe um código COMPE válido (3 dígitos).'
        ),
});

const companyProfileSchema = baseProfileSchema.extend({
    cnpj: z
        .string()
        .refine(
            (v) => v.replace(/\D/g, '').length === 14,
            'Informe um CNPJ válido (14 dígitos).'
        ),
    corporateName: z.string().min(3, 'A razão social deve ter no mínimo 3 caracteres.'),
});

type ProfileFormErrors = Partial<Record<keyof ProfileFormState, string>>;

const profileSchemaByRole = {
    CLIENT: clientProfileSchema,
    BANK: bankProfileSchema,
    COMPANY: companyProfileSchema,
};

function extractApiErrorMessage(responseData: unknown): string | null {
    if (typeof responseData === 'string') return responseData;
    if (!isRecord(responseData)) return null;

    const message = responseData.message;
    if (typeof message === 'string') return message;

    const error = responseData.error;
    if (typeof error === 'string') return error;

    return null;
}

function translateApiErrorMessage(message: string): string {
    const normalized = message.toLowerCase();

    if (normalized.includes('must be a valid cpf')) return 'Informe um CPF válido.';
    if (normalized.includes('must be a valid cnpj')) return 'Informe um CNPJ válido.';
    if (normalized.includes('must be a valid brazilian phone number')) {
        return 'Informe um telefone válido.';
    }

    return message;
}

function formatTimeLeft(remainingSeconds: number): string {
    if (remainingSeconds <= 0) return 'Sessão expirada';
    if (remainingSeconds < 60) return `Expira em ${remainingSeconds}s`;
    const minutes = Math.floor(remainingSeconds / 60);
    if (minutes < 60) return `Expira em ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const restMinutes = minutes % 60;
    return restMinutes === 0 ? `Expira em ${hours}h` : `Expira em ${hours}h ${restMinutes}min`;
}

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [form, setForm] = useState<ProfileFormState>(EMPTY_FORM);
    const [fieldErrors, setFieldErrors] = useState<ProfileFormErrors>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingCep, setIsLoadingCep] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [nowMs, setNowMs] = useState(Date.now());

    const currentRole = useMemo<RoleType | null>(() => {
        if (profile?.roles?.length) return profile.roles[0];
        if (!user?.roles?.length) return null;
        const firstRole = user.roles[0];
        if (firstRole === 'CLIENT' || firstRole === 'BANK' || firstRole === 'COMPANY')
            return firstRole;
        return null;
    }, [profile?.roles, user?.roles]);

    const sessionRemainingSeconds = useMemo(() => {
        if (!user?.exp) return 0;
        return Math.max(0, user.exp - Math.floor(nowMs / 1000));
    }, [user?.exp, nowMs]);

    const sessionExpiresAtLabel = useMemo(() => {
        if (!user?.exp) return '-';
        return new Date(user.exp * 1000).toLocaleString('pt-BR');
    }, [user?.exp]);

    useEffect(() => {
        const intervalId = window.setInterval(() => setNowMs(Date.now()), 1000);
        return () => window.clearInterval(intervalId);
    }, []);

    useEffect(() => {
        async function loadProfile() {
            if (!user?.sub) {
                toast.error('Usuário não autenticado.');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);

            try {
                const usersResponse = await api.get('/users');
                const users = getListFromResponse(usersResponse.data);
                const emailFromToken = user.sub.toLowerCase();
                const userProfile =
                    users
                        .map(parseUserProfile)
                        .find(
                            (candidate) =>
                                candidate && candidate.form.email.toLowerCase() === emailFromToken
                        ) ?? null;

                if (!userProfile) {
                    toast.error('Não foi possível localizar os dados do seu perfil.');
                    setProfile(null);
                    return;
                }

                setProfile(userProfile);
                setForm(userProfile.form);
                setIsEditing(false);
            } catch (requestError) {
                if (isAxiosError(requestError)) {
                    const status = requestError.response?.status;
                    toast.error(
                        status
                            ? `Não foi possível carregar seu perfil (erro ${status}).`
                            : 'Não foi possível carregar seu perfil.'
                    );
                } else {
                    toast.error('Erro inesperado ao carregar perfil.');
                }
            } finally {
                setIsLoading(false);
            }
        }

        loadProfile();
    }, [user?.sub]);

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
        if (fieldErrors[name as keyof ProfileFormErrors]) {
            setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    }

    function handleMaskedChange(name: keyof ProfileFormState, value: string) {
        setForm((previous) => ({ ...previous, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    }

    async function handleCepBlur() {
        const digits = form.cep.replace(/\D/g, '');
        if (digits.length !== 8) return;
        setIsLoadingCep(true);
        try {
            const response = await axios.get<ViaCepResponse>(`https://viacep.com.br/ws/${digits}/json/`);
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
            // keep existing values on fetch error
        } finally {
            setIsLoadingCep(false);
        }
    }

    async function handleSave(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
        event.preventDefault();

        if (!profile || !currentRole) {
            toast.error('Perfil não carregado.');
            return;
        }

        const validationResult = profileSchemaByRole[currentRole].safeParse(form);
        if (!validationResult.success) {
            const errors: ProfileFormErrors = {};
            for (const issue of validationResult.error.issues) {
                const field = issue.path[0] as keyof ProfileFormErrors;
                if (!errors[field]) errors[field] = issue.message;
            }
            setFieldErrors(errors);
            return;
        }

        setFieldErrors({});
        setIsSaving(true);

        const endpoint = `/users/${roleToPath(currentRole)}/${profile.id}`;
        const payloadByRole = {
            CLIENT: {
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.replace(/\D/g, ''),
                cpf: form.cpf.replace(/\D/g, ''),
                rg: form.rg.replace(/[.\-\s]/g, ''),
                address: `${form.street.trim()} - ${form.complement.trim()}. Bairro ${form.neighborhood.trim()} - ${form.city.trim()}`,
                profession: form.profession.trim(),
            },
            BANK: {
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.replace(/\D/g, ''),
                cnpj: form.cnpj.replace(/\D/g, ''),
                code: form.code.trim(),
            },
            COMPANY: {
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.replace(/\D/g, ''),
                cnpj: form.cnpj.replace(/\D/g, ''),
                corporateName: form.corporateName.trim(),
            },
        };

        try {
            const response = await api.put(endpoint, payloadByRole[currentRole]);
            const updatedProfile = parseUserProfile(response.data);
            if (updatedProfile) {
                setProfile(updatedProfile);
                setForm(updatedProfile.form);
            }
            setIsEditing(false);
            toast.success('Perfil atualizado com sucesso.');
        } catch (requestError) {
            if (isAxiosError(requestError)) {
                const message = extractApiErrorMessage(requestError.response?.data);
                const status = requestError.response?.status;
                toast.error(
                    (message ? translateApiErrorMessage(message) : null) ??
                        (status
                            ? `Não foi possível salvar (erro ${status}).`
                            : 'Não foi possível salvar as alterações.')
                );
            } else {
                toast.error('Erro inesperado ao salvar alterações.');
            }
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDeleteAccount() {
        if (!profile) {
            toast.error('Perfil não carregado.');
            return;
        }

        setIsDeleting(true);

        try {
            await api.delete(`/users/${profile.id}`);
            toast.success('Conta excluída com sucesso.');
            logout();
            router.replace('/login');
        } catch (requestError) {
            if (isAxiosError(requestError)) {
                const status = requestError.response?.status;
                const message = (requestError.response?.data as { message?: string } | undefined)
                    ?.message;

                if (status === 401 || status === 500) {
                    toast.success('Conta excluída com sucesso.');
                    logout();
                    router.replace('/login');
                    return;
                }

                toast.error(
                    message ??
                        (status
                            ? `Não foi possível excluir a conta (erro ${status}).`
                            : 'Não foi possível excluir a conta.')
                );
            } else {
                toast.error('Erro inesperado ao excluir a conta.');
            }
        } finally {
            setIsDeleting(false);
        }
    }

    if (isLoading) {
        return (
            <section className="mx-auto w-full max-w-4xl space-y-3">
                <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
                <p className="text-muted-foreground text-sm">
                    Carregando informações da sua conta...
                </p>
            </section>
        );
    }

    if (!profile) {
        return (
            <section className="mx-auto w-full max-w-4xl space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
                <p className="text-muted-foreground text-sm">
                    Não foi possível carregar seus dados agora.
                </p>
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="border-border text-foreground hover:bg-secondary rounded-md border px-4 py-2 text-sm font-medium"
                >
                    Tentar novamente
                </button>
            </section>
        );
    }

    return (
        <section className="mx-auto w-full max-w-5xl space-y-6">
            <header className="space-y-2">
                <p className="text-primary text-xs font-medium tracking-[0.24em] uppercase">
                    Minha conta
                </p>
                <h1 className="text-3xl font-bold tracking-tight">
                    Olá, {form.name || 'Usuário'}!
                </h1>
                <p className="text-muted-foreground text-sm">
                    Atualize suas informações e acompanhe o status da sua sessão.
                </p>
            </header>

            <div className="grid gap-4 md:grid-cols-3">
                <InfoCard
                    icon={<UserCircle2 size={16} />}
                    label="Usuário"
                    value={user?.sub ?? form.email}
                />
                <InfoCard
                    icon={<ShieldCheck size={16} />}
                    label="Perfil"
                    value={currentRole ? roleToLabel(currentRole) : 'Não identificado'}
                />
                <InfoCard
                    icon={<Clock3 size={16} />}
                    label="Sessão"
                    value={formatTimeLeft(sessionRemainingSeconds)}
                    extra={`Válida até ${sessionExpiresAtLabel}`}
                />
            </div>

            <form
                onSubmit={handleSave}
                noValidate
                className="border-border bg-card space-y-5 rounded-2xl border p-6 shadow-sm"
            >
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold">Dados da conta</h2>
                    <span className="border-border text-muted-foreground rounded-full border px-3 py-1 text-xs">
                        {currentRole ? roleToLabel(currentRole) : 'Conta'}
                    </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <InputField
                        label={currentRole === 'BANK' ? 'Nome do banco' : 'Nome'}
                        name="name"
                        placeholder="Maria da Silva"
                        value={form.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        required
                        error={fieldErrors.name}
                    />
                    <InputField
                        label="E-mail"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={form.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        required
                        error={fieldErrors.email}
                    />
                    <MaskedInputField
                        label="Telefone"
                        mask={[{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }]}
                        type="tel"
                        inputMode="numeric"
                        placeholder="(11) 99999-9999"
                        value={form.phone}
                        onAccept={(value) => handleMaskedChange('phone', value)}
                        disabled={!isEditing}
                        required
                        error={fieldErrors.phone}
                    />

                    {currentRole === 'CLIENT' && (
                        <>
                            <MaskedInputField
                                label="CPF"
                                mask="000.000.000-00"
                                inputMode="numeric"
                                placeholder="000.000.000-00"
                                value={form.cpf}
                                onAccept={(value) => handleMaskedChange('cpf', value)}
                                disabled={!isEditing}
                                required
                                error={fieldErrors.cpf}
                            />
                            <MaskedInputField
                                label="RG"
                                mask={[
                                    { mask: '00.000.000-0' },
                                    { mask: 'aa-00.000.000', definitions: { a: /[A-Za-z]/ } },
                                ]}
                                prepare={(value: string) => value.toUpperCase()}
                                placeholder="MG-12.345.678"
                                value={form.rg}
                                onAccept={(value) => handleMaskedChange('rg', value)}
                                disabled={!isEditing}
                                required
                                error={fieldErrors.rg}
                            />
                            <InputField
                                label="Profissão"
                                name="profession"
                                placeholder="Engenheira de Software"
                                value={form.profession}
                                onChange={handleChange}
                                disabled={!isEditing}
                                required
                                error={fieldErrors.profession}
                            />
                            <MaskedInputField
                                label="CEP"
                                mask="00000-000"
                                inputMode="numeric"
                                placeholder="00000-000"
                                value={form.cep}
                                onAccept={(value) => handleMaskedChange('cep', value)}
                                onBlur={handleCepBlur}
                                disabled={!isEditing}
                                required
                                error={fieldErrors.cep}
                                wrapperClassName={isLoadingCep ? 'opacity-60' : ''}
                            />
                            <InputField
                                label="Rua"
                                name="street"
                                placeholder="Rua das Flores"
                                value={form.street}
                                onChange={handleChange}
                                disabled={!isEditing || isLoadingCep}
                                required
                                error={fieldErrors.street}
                            />
                            <InputField
                                label="Complemento/Número"
                                name="complement"
                                placeholder="Apt 101"
                                value={form.complement}
                                onChange={handleChange}
                                disabled={!isEditing}
                                required
                                error={fieldErrors.complement}
                            />
                            <InputField
                                label="Bairro"
                                name="neighborhood"
                                placeholder="Centro"
                                value={form.neighborhood}
                                onChange={handleChange}
                                disabled={!isEditing || isLoadingCep}
                                required
                                error={fieldErrors.neighborhood}
                            />
                            <InputField
                                label="Cidade"
                                name="city"
                                placeholder="Belo Horizonte"
                                value={form.city}
                                onChange={handleChange}
                                disabled={!isEditing || isLoadingCep}
                                required
                                error={fieldErrors.city}
                            />
                        </>
                    )}

                    {currentRole === 'BANK' && (
                        <>
                            <MaskedInputField
                                label="CNPJ"
                                mask="00.000.000/0000-00"
                                inputMode="numeric"
                                placeholder="00.000.000/0000-00"
                                value={form.cnpj}
                                onAccept={(value) => handleMaskedChange('cnpj', value)}
                                disabled={!isEditing}
                                required
                                error={fieldErrors.cnpj}
                            />
                            <MaskedInputField
                                label="Código COMPE"
                                mask="000"
                                inputMode="numeric"
                                placeholder="001"
                                value={form.code}
                                onAccept={(value) => handleMaskedChange('code', value)}
                                disabled={!isEditing}
                                required
                                error={fieldErrors.code}
                            />
                        </>
                    )}

                    {currentRole === 'COMPANY' && (
                        <>
                            <MaskedInputField
                                label="CNPJ"
                                mask="00.000.000/0000-00"
                                inputMode="numeric"
                                placeholder="00.000.000/0000-00"
                                value={form.cnpj}
                                onAccept={(value) => handleMaskedChange('cnpj', value)}
                                disabled={!isEditing}
                                required
                                error={fieldErrors.cnpj}
                            />
                            <InputField
                                label="Razão social"
                                name="corporateName"
                                placeholder="Locadora XYZ Ltda."
                                value={form.corporateName}
                                onChange={handleChange}
                                disabled={!isEditing}
                                required
                                error={fieldErrors.corporateName}
                            />
                        </>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                    {!isEditing ? (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 cursor-pointer rounded-md px-4 text-sm font-medium hover:transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Editar perfil
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => {
                                    setForm(profile.form);
                                    setFieldErrors({});
                                    setIsEditing(false);
                                }}
                                disabled={isSaving || isDeleting}
                                className="border-border text-foreground h-10 rounded-md border px-4 text-sm font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving || isDeleting}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 cursor-pointer items-center gap-2 rounded-md px-4 text-sm font-medium hover:transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Save size={14} />
                                {isSaving ? 'Salvando...' : 'Salvar alterações'}
                            </button>
                        </>
                    )}
                </div>
            </form>

            <ProfileDangerZone
                isEditing={isEditing}
                isSaving={isSaving}
                isDeleting={isDeleting}
                onDeleteAccount={handleDeleteAccount}
            />
        </section>
    );
}

function InfoCard({
    icon,
    label,
    value,
    extra,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    extra?: string;
}) {
    return (
        <article className="border-border bg-card rounded-xl border p-4">
            <p className="text-muted-foreground flex items-center gap-2 text-xs tracking-[0.16em] uppercase">
                {icon}
                {label}
            </p>
            <p className="mt-2 text-sm font-semibold break-all">{value || '-'}</p>
            {extra ? <p className="text-muted-foreground mt-1 text-xs">{extra}</p> : null}
        </article>
    );
}

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    wrapperClassName?: string;
    error?: string;
}

function InputField({
    label,
    wrapperClassName = '',
    className = '',
    error,
    required,
    ...props
}: InputFieldProps) {
    return (
        <div className={`space-y-1.5 ${wrapperClassName}`}>
            <label className="text-foreground text-sm font-medium">
                {label}
                {required && <span className="text-primary ml-0.5">*</span>}
            </label>
            <input
                required={required}
                className={`border-border bg-input text-foreground focus:border-primary disabled:bg-muted disabled:text-muted-foreground h-11 w-full rounded-md border px-3 text-sm transition-colors outline-none disabled:cursor-not-allowed ${className}`}
                {...props}
            />
            {error && <p className="text-destructive mt-1 text-xs font-bold">{error}</p>}
        </div>
    );
}

interface MaskedInputFieldProps {
    label: string;
    mask: string | { mask: string; definitions?: Record<string, RegExp> }[];
    prepare?: (value: string) => string;
    value: string;
    onAccept: (value: string) => void;
    onBlur?: () => void;
    disabled?: boolean;
    required?: boolean;
    placeholder?: string;
    inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
    type?: string;
    wrapperClassName?: string;
    error?: string;
}

function MaskedInputField({
    label,
    mask,
    prepare,
    value,
    onAccept,
    onBlur,
    disabled,
    required,
    placeholder,
    inputMode,
    type,
    wrapperClassName = '',
    error,
}: MaskedInputFieldProps) {
    return (
        <div className={`space-y-1.5 ${wrapperClassName}`}>
            <label className="text-foreground text-sm font-medium">
                {label}
                {required && <span className="text-primary ml-0.5">*</span>}
            </label>
            <IMaskInput
                {...({
                    mask,
                    prepare,
                    value,
                    onAccept,
                    onBlur,
                    disabled,
                    required,
                    placeholder,
                    inputMode,
                    type,
                } as object)}
                className="border-border bg-input text-foreground focus:border-primary disabled:bg-muted disabled:text-muted-foreground h-11 w-full rounded-md border px-3 text-sm transition-colors outline-none disabled:cursor-not-allowed"
            />
            {error && <p className="text-destructive mt-1 text-xs font-bold">{error}</p>}
        </div>
    );
}
