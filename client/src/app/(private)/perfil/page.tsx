'use client';

import axios from 'axios';
import { Clock3, Save, ShieldCheck, UserCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    useEffect,
    useMemo,
    useState,
    type ChangeEvent,
    type FormEvent,
    type InputHTMLAttributes,
} from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import { ProfileDangerZone } from './ProfileDangerZone/page';

type RoleType = 'CLIENT' | 'BANK' | 'COMPANY';

interface ProfileFormState {
    name: string;
    email: string;
    phone: string;
    cpf: string;
    rg: string;
    address: string;
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
    address: '',
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

    return {
        id,
        roles,
        form: {
            name: toStringValue(payload.name),
            email: toStringValue(payload.email),
            phone: toStringValue(payload.phone),
            cpf: toStringValue(payload.cpf),
            rg: toStringValue(payload.rg),
            address: toStringValue(payload.address),
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

function onlyDigits(value: string): string {
    return value.replace(/\D/g, '');
}

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function maskCpf(v: string): string {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function maskPhone(v: string): string {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length === 0) return '';
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function maskRg(v: string): string {
    const d = v.replace(/\D/g, '').slice(0, 9);
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
    if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}-${d.slice(8)}`;
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

function extractApiMessage(data: unknown): string | null {
    if (typeof data === 'string') return data;
    if (!isRecord(data)) return null;

    const message = data.message;
    if (typeof message === 'string') return message;

    const error = data.error;
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

export default function PerfilPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [form, setForm] = useState<ProfileFormState>(EMPTY_FORM);
    const [isLoading, setIsLoading] = useState(true);
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
                if (axios.isAxiosError(requestError)) {
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
        let masked = value;

        if (name === 'cpf') masked = maskCpf(value);
        else if (name === 'phone') masked = maskPhone(value);
        else if (name === 'rg') masked = maskRg(value);
        else if (name === 'cnpj') masked = maskCnpj(value);
        else if (name === 'code') masked = maskCode(value);

        setForm((previous) => ({ ...previous, [name]: masked }));
    }

    async function handleSave(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!profile || !currentRole) {
            toast.error('Perfil não carregado.');
            return;
        }

        if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
            toast.error('Preencha nome, e-mail e telefone.');
            return;
        }

        if (!isValidEmail(form.email)) {
            toast.error('Informe um e-mail válido.');
            return;
        }

        if (onlyDigits(form.phone).length < 10) {
            toast.error('Informe um telefone válido.');
            return;
        }

        if (currentRole === 'CLIENT' && !form.cpf.trim()) {
            toast.error('CPF é obrigatório para cliente.');
            return;
        }

        if (currentRole === 'CLIENT' && onlyDigits(form.cpf).length !== 11) {
            toast.error('Informe um CPF válido.');
            return;
        }

        if (currentRole === 'BANK' && (!form.cnpj.trim() || !form.code.trim())) {
            toast.error('CNPJ e código são obrigatórios para banco.');
            return;
        }

        if (currentRole === 'BANK' && onlyDigits(form.cnpj).length !== 14) {
            toast.error('Informe um CNPJ válido.');
            return;
        }

        if (currentRole === 'BANK' && onlyDigits(form.code).length !== 3) {
            toast.error('Informe um código FEBRABAN válido.');
            return;
        }

        if (currentRole === 'COMPANY' && (!form.cnpj.trim() || !form.corporateName.trim())) {
            toast.error('CNPJ e razão social são obrigatórios para empresa.');
            return;
        }

        if (currentRole === 'COMPANY' && onlyDigits(form.cnpj).length !== 14) {
            toast.error('Informe um CNPJ válido.');
            return;
        }

        setIsSaving(true);

        const endpoint = `/users/${roleToPath(currentRole)}/${profile.id}`;
        const payloadByRole = {
            CLIENT: {
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                cpf: form.cpf.trim(),
                rg: form.rg.trim() || null,
                address: form.address.trim() || null,
                profession: form.profession.trim() || null,
            },
            BANK: {
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                cnpj: form.cnpj.trim(),
                code: form.code.trim(),
            },
            COMPANY: {
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                cnpj: form.cnpj.trim(),
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
            if (axios.isAxiosError(requestError)) {
                const message = extractApiMessage(requestError.response?.data);
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
            if (axios.isAxiosError(requestError)) {
                const status = requestError.response?.status;
                const message = (requestError.response?.data as { message?: string } | undefined)
                    ?.message;

                // Se receber 401 ou 500, faz logout automático
                // 401: sessão expirou/foi invalidada
                // 500: erro no servidor, mas tenta fazê logout de qualquer forma
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
                        label="Nome"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        required
                    />
                    <InputField
                        label="E-mail"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        required
                    />
                    <InputField
                        label="Telefone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        required
                    />

                    {currentRole === 'CLIENT' && (
                        <>
                            <InputField
                                label="CPF"
                                name="cpf"
                                value={form.cpf}
                                onChange={handleChange}
                                disabled={!isEditing}
                                required
                            />
                            <InputField
                                label="RG"
                                name="rg"
                                value={form.rg}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                            <InputField
                                label="Profissão"
                                name="profession"
                                value={form.profession}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                            <InputField
                                label="Endereço"
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                disabled={!isEditing}
                                wrapperClassName="md:col-span-2"
                            />
                        </>
                    )}

                    {currentRole === 'BANK' && (
                        <>
                            <InputField
                                label="CNPJ"
                                name="cnpj"
                                value={form.cnpj}
                                onChange={handleChange}
                                disabled={!isEditing}
                                required
                            />
                            <InputField
                                label="Código do banco"
                                name="code"
                                value={form.code}
                                onChange={handleChange}
                                disabled={!isEditing}
                                required
                            />
                        </>
                    )}

                    {currentRole === 'COMPANY' && (
                        <>
                            <InputField
                                label="CNPJ"
                                name="cnpj"
                                value={form.cnpj}
                                onChange={handleChange}
                                disabled={!isEditing}
                                required
                            />
                            <InputField
                                label="Razão social"
                                name="corporateName"
                                value={form.corporateName}
                                onChange={handleChange}
                                disabled={!isEditing}
                                required
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
}

function InputField({ label, wrapperClassName = '', className = '', ...props }: InputFieldProps) {
    return (
        <div className={`space-y-1.5 ${wrapperClassName}`}>
            <label className="text-foreground text-sm font-medium">{label}</label>
            <input
                className={`border-border bg-input text-foreground focus:border-primary disabled:bg-muted disabled:text-muted-foreground h-11 w-full rounded-md border px-3 text-sm transition-colors outline-none disabled:cursor-not-allowed ${className}`}
                {...props}
            />
        </div>
    );
}