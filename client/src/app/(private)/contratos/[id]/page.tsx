'use client';

import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import {
    contractStatusBadgeClass,
    contractStatusLabel,
    creditStatusBadgeClass,
    creditStatusLabel,
    formatCurrency,
    formatDate,
    ownershipLabel,
} from '@/lib/contract-labels';
import type {
    ContractResponse,
    CreditContractResponse,
    OwnershipType,
} from '@/types/contract';

const OWNERSHIP_OPTIONS: { value: OwnershipType; label: string }[] = [
    { value: 'CLIENT', label: 'Cliente' },
    { value: 'COMPANY', label: 'Empresa' },
    { value: 'BANK', label: 'Banco' },
];

export default function ContractDetailPage() {
    const params = useParams();
    const router = useRouter();
    const contractId = Array.isArray(params.id) ? params.id[0] : params.id;
    const { hasRole } = useAuth();

    const isCompany = hasRole('COMPANY');
    const isClient = hasRole('CLIENT');
    const isBank = hasRole('BANK');

    const [contract, setContract] = useState<ContractResponse | null>(null);
    const [credit, setCredit] = useState<CreditContractResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [signatureDate, setSignatureDate] = useState('');
    const [value, setValue] = useState('');
    const [ownership, setOwnership] = useState<OwnershipType>('CLIENT');

    const [interestRate, setInterestRate] = useState('');
    const [termMonths, setTermMonths] = useState('');
    const [isSavingCredit, setIsSavingCredit] = useState(false);

    useEffect(() => {
        async function load(): Promise<void> {
            if (!contractId) return;
            try {
                const contractRes = await api.get(`/contracts/${contractId}`);
                const contractData = contractRes.data as ContractResponse;
                setContract(contractData);
                setSignatureDate(contractData.signatureDate);
                setValue(String(contractData.value));
                setOwnership(contractData.ownership);

                if (contractData.creditContractId) {
                    try {
                        const creditRes = await api.get(
                            `/credit-contracts/contract/${contractData.id}`
                        );
                        const creditData = creditRes.data as CreditContractResponse;
                        setCredit(creditData);
                        setInterestRate(String(creditData.interestRate));
                        setTermMonths(String(creditData.termMonths));
                    } catch {
                        setCredit(null);
                    }
                }
            } catch {
                setContract(null);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [contractId]);

    async function handleUpdate(event: React.FormEvent): Promise<void> {
        event.preventDefault();
        if (!contract) return;
        setIsSaving(true);
        try {
            const response = await api.put(`/contracts/${contract.id}`, {
                signatureDate,
                value: Number(value),
                ownership,
            });
            setContract(response.data as ContractResponse);
            setIsEditing(false);
            toast.success('Contrato atualizado.');
        } catch {
            toast.error('Erro ao atualizar contrato.');
        } finally {
            setIsSaving(false);
        }
    }

    async function handleRescind(): Promise<void> {
        if (!contract) return;
        if (!window.confirm('Confirma a rescisão deste contrato?')) return;
        try {
            const response = await api.post(`/contracts/${contract.id}/rescind`);
            setContract(response.data as ContractResponse);
            toast.success('Contrato rescindido.');
        } catch (error: unknown) {
            const status =
                error instanceof Object && 'response' in error
                    ? (error as { response?: { status?: number } }).response?.status
                    : undefined;
            if (status === 409) {
                toast.error('Contrato não pode ser rescindido no estado atual.');
            } else {
                toast.error('Erro ao rescindir contrato.');
            }
        }
    }

    async function handleCreateCredit(event: React.FormEvent): Promise<void> {
        event.preventDefault();
        if (!contract) return;
        setIsSavingCredit(true);
        try {
            const response = await api.post('/credit-contracts', {
                contractId: contract.id,
                interestRate: Number(interestRate),
                termMonths: Number(termMonths),
            });
            setCredit(response.data as CreditContractResponse);
            toast.success('Contrato de crédito criado.');
        } catch {
            toast.error('Erro ao criar contrato de crédito.');
        } finally {
            setIsSavingCredit(false);
        }
    }

    async function handleUpdateCredit(event: React.FormEvent): Promise<void> {
        event.preventDefault();
        if (!credit) return;
        setIsSavingCredit(true);
        try {
            const response = await api.put(`/credit-contracts/${credit.id}`, {
                interestRate: Number(interestRate),
                termMonths: Number(termMonths),
            });
            setCredit(response.data as CreditContractResponse);
            toast.success('Contrato de crédito atualizado.');
        } catch {
            toast.error('Erro ao atualizar contrato de crédito.');
        } finally {
            setIsSavingCredit(false);
        }
    }

    async function handleApproveCredit(): Promise<void> {
        if (!credit) return;
        try {
            const response = await api.post(`/credit-contracts/${credit.id}/approve`);
            setCredit(response.data as CreditContractResponse);
            toast.success('Crédito aprovado.');
        } catch {
            toast.error('Erro ao aprovar crédito.');
        }
    }

    async function handleGrantCredit(): Promise<void> {
        if (!credit) return;
        try {
            const response = await api.post(`/credit-contracts/${credit.id}/grant`);
            setCredit(response.data as CreditContractResponse);
            toast.success('Crédito concedido.');
        } catch {
            toast.error('Erro ao conceder crédito.');
        }
    }

    if (isLoading) {
        return (
            <section className="text-muted-foreground flex items-center gap-2 py-10 text-sm">
                <Loader2 size={16} className="animate-spin" />
                Carregando contrato...
            </section>
        );
    }

    if (!contract) {
        return (
            <section className="space-y-4">
                <h1 className="text-2xl font-bold">Contrato não encontrado</h1>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="text-primary text-sm font-semibold"
                >
                    Voltar
                </button>
            </section>
        );
    }

    const canRescind =
        contract.status === 'ACTIVE' &&
        (isCompany || isClient) &&
        (credit?.status !== 'GRANTED');
    const canEdit = isCompany && contract.status === 'ACTIVE';
    const canManageCredit =
        isBank && contract.status === 'ACTIVE' && contract.creditRequested;

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <Link
                    href={isClient ? '/meus-contratos' : '/contratos'}
                    className="text-primary inline-flex items-center gap-2 text-sm font-semibold"
                >
                    <ArrowLeft size={18} strokeWidth={2.5} />
                    Voltar
                </Link>
                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${contractStatusBadgeClass(contract.status)}`}
                >
                    {contractStatusLabel(contract.status)}
                </span>
            </div>

            <div className="bg-gradient-card border-border/70 grid gap-6 rounded-3xl border p-6 lg:grid-cols-2">
                <div className="space-y-3">
                    <div>
                        <p className="text-muted-foreground text-xs">Veículo</p>
                        <p className="text-lg font-semibold">
                            {contract.vehicleBrand} {contract.vehicleModel}
                        </p>
                        <p className="text-muted-foreground text-xs">Placa: {contract.vehiclePlate}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-xs">Cliente</p>
                        <p className="font-medium">{contract.clientName}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-xs">Empresa</p>
                        <p className="font-medium">{contract.companyName}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-xs">Banco</p>
                        <p className="font-medium">{contract.bankName}</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div>
                        <p className="text-muted-foreground text-xs">Data de assinatura</p>
                        <p className="font-medium">{formatDate(contract.signatureDate)}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-xs">Valor</p>
                        <p className="text-primary text-2xl font-bold">
                            {formatCurrency(contract.value)}
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-xs">Propriedade do automóvel</p>
                        <p className="font-medium">{ownershipLabel(contract.ownership)}</p>
                    </div>
                    {contract.terminatedAt && (
                        <div>
                            <p className="text-muted-foreground text-xs">Rescindido em</p>
                            <p className="font-medium">
                                {new Date(contract.terminatedAt).toLocaleString('pt-BR')}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {(canEdit || canRescind) && (
                <div className="flex flex-wrap items-center gap-3">
                    {canEdit && !isEditing && (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="bg-secondary hover:bg-secondary/80 cursor-pointer rounded-full px-4 py-2 text-sm font-semibold"
                        >
                            Editar contrato
                        </button>
                    )}
                    {canRescind && (
                        <button
                            type="button"
                            onClick={handleRescind}
                            className="cursor-pointer rounded-full bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/25"
                        >
                            Rescindir contrato
                        </button>
                    )}
                </div>
            )}

            {canEdit && isEditing && (
                <form
                    onSubmit={handleUpdate}
                    className="border-border bg-card space-y-4 rounded-2xl border p-5"
                >
                    <h2 className="text-lg font-semibold">Editar contrato</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-1 text-sm">
                            <span className="text-muted-foreground">Data de assinatura</span>
                            <input
                                type="date"
                                required
                                value={signatureDate}
                                onChange={(event) => setSignatureDate(event.target.value)}
                                className="bg-secondary border-border w-full rounded-lg border px-3 py-2 text-sm outline-none"
                            />
                        </label>
                        <label className="space-y-1 text-sm">
                            <span className="text-muted-foreground">Valor (R$)</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                value={value}
                                onChange={(event) => setValue(event.target.value)}
                                className="bg-secondary border-border w-full rounded-lg border px-3 py-2 text-sm outline-none"
                            />
                        </label>
                        <label className="space-y-1 text-sm sm:col-span-2">
                            <span className="text-muted-foreground">Propriedade</span>
                            <select
                                value={ownership}
                                onChange={(event) => setOwnership(event.target.value as OwnershipType)}
                                className="bg-secondary border-border w-full rounded-lg border px-3 py-2 text-sm outline-none"
                            >
                                {OWNERSHIP_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="text-secondary-foreground hover:bg-secondary cursor-pointer rounded-full px-4 py-2 text-sm"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold inline-flex cursor-pointer items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold disabled:opacity-60"
                        >
                            {isSaving && <Loader2 size={16} className="animate-spin" />}
                            Salvar
                        </button>
                    </div>
                </form>
            )}

            <section className="border-border bg-card space-y-4 rounded-2xl border p-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Contrato de crédito</h2>
                    {credit && (
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${creditStatusBadgeClass(credit.status)}`}
                        >
                            {creditStatusLabel(credit.status)}
                        </span>
                    )}
                </div>

                {!contract.creditRequested && (
                    <p className="text-muted-foreground text-sm">
                        O cliente não solicitou crédito para este contrato.
                    </p>
                )}

                {contract.creditRequested && !credit && !canManageCredit && (
                    <p className="text-muted-foreground text-sm">
                        Aguardando o banco {contract.bankName} registrar o contrato de crédito.
                    </p>
                )}

                {credit && (
                    <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                            <p className="text-muted-foreground text-xs">Taxa de juros</p>
                            <p className="font-semibold">{credit.interestRate}% a.m.</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">Prazo</p>
                            <p className="font-semibold">{credit.termMonths} meses</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">Banco</p>
                            <p className="font-semibold">{credit.bankName}</p>
                        </div>
                        {credit.approvedAt && (
                            <div>
                                <p className="text-muted-foreground text-xs">Aprovado em</p>
                                <p className="text-sm">
                                    {new Date(credit.approvedAt).toLocaleString('pt-BR')}
                                </p>
                            </div>
                        )}
                        {credit.grantedAt && (
                            <div>
                                <p className="text-muted-foreground text-xs">Concedido em</p>
                                <p className="text-sm">
                                    {new Date(credit.grantedAt).toLocaleString('pt-BR')}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {canManageCredit && !credit && (
                    <form onSubmit={handleCreateCredit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="space-y-1 text-sm">
                                <span className="text-muted-foreground">Taxa de juros (% a.m.)</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    value={interestRate}
                                    onChange={(event) => setInterestRate(event.target.value)}
                                    className="bg-secondary border-border w-full rounded-lg border px-3 py-2 text-sm outline-none"
                                />
                            </label>
                            <label className="space-y-1 text-sm">
                                <span className="text-muted-foreground">Prazo (meses)</span>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={termMonths}
                                    onChange={(event) => setTermMonths(event.target.value)}
                                    className="bg-secondary border-border w-full rounded-lg border px-3 py-2 text-sm outline-none"
                                />
                            </label>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSavingCredit}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold inline-flex cursor-pointer items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold disabled:opacity-60"
                            >
                                {isSavingCredit && <Loader2 size={16} className="animate-spin" />}
                                Registrar crédito
                            </button>
                        </div>
                    </form>
                )}

                {canManageCredit && credit && credit.status === 'PENDING' && (
                    <form onSubmit={handleUpdateCredit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="space-y-1 text-sm">
                                <span className="text-muted-foreground">Taxa de juros (% a.m.)</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    value={interestRate}
                                    onChange={(event) => setInterestRate(event.target.value)}
                                    className="bg-secondary border-border w-full rounded-lg border px-3 py-2 text-sm outline-none"
                                />
                            </label>
                            <label className="space-y-1 text-sm">
                                <span className="text-muted-foreground">Prazo (meses)</span>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={termMonths}
                                    onChange={(event) => setTermMonths(event.target.value)}
                                    className="bg-secondary border-border w-full rounded-lg border px-3 py-2 text-sm outline-none"
                                />
                            </label>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="submit"
                                disabled={isSavingCredit}
                                className="bg-secondary hover:bg-secondary/80 cursor-pointer rounded-full px-4 py-2 text-sm font-semibold"
                            >
                                Salvar
                            </button>
                            <button
                                type="button"
                                onClick={handleApproveCredit}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer rounded-full px-5 py-2 text-sm font-semibold"
                            >
                                Aprovar
                            </button>
                        </div>
                    </form>
                )}

                {canManageCredit && credit && credit.status === 'APPROVED' && (
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleGrantCredit}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer rounded-full px-5 py-2 text-sm font-semibold"
                        >
                            Conceder crédito
                        </button>
                    </div>
                )}
            </section>
        </section>
    );
}
