'use client';

import { AlertTriangle, Banknote, Briefcase, Building2, Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import { formatCnpj } from '@/lib/utils';
import { AddIncomeModal } from './_components/AddIncomeModal';

interface EmployerEntity {
    id: string;
    name: string;
    cnpj: string;
}

interface Employment {
    id: string;
    earnedIncome: number;
    jobTitle: string;
    clientId: string;
    clientName: string;
    employerEntityId: string;
    employerEntityName: string;
}

interface UserRecord {
    id: string;
    email: string;
}

const MAX_INCOMES = 3;

function formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function MyIncomesPage() {
    const { user } = useAuth();

    const [clientId, setClientId] = useState<string | null>(null);
    const [incomes, setIncomes] = useState<Employment[]>([]);
    const [employers, setEmployers] = useState<EmployerEntity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const canAddMore = incomes.length < MAX_INCOMES;

    useEffect(() => {
        async function loadData(): Promise<void> {
            if (!user?.sub) return;

            setIsLoading(true);
            try {
                const usersRes = await api.get('/users');

                const users: UserRecord[] = Array.isArray(usersRes.data)
                    ? usersRes.data
                    : (usersRes.data?.items ?? usersRes.data?.content ?? []);

                const currentUser = users.find(
                    (candidate) => candidate.email?.toLowerCase() === user.sub.toLowerCase()
                );

                if (!currentUser) {
                    toast.error('Não foi possível localizar o seu perfil.');
                    setIsLoading(false);
                    return;
                }

                setClientId(currentUser.id);

                const [employersRes, incomesRes] = await Promise.allSettled([
                    api.get('/employer-entities'),
                    api.get(`/employments/client/${currentUser.id}`),
                ]);

                if (employersRes.status === 'fulfilled') {
                    setEmployers(
                        Array.isArray(employersRes.value.data) ? employersRes.value.data : []
                    );
                }
                if (incomesRes.status === 'fulfilled') {
                    setIncomes(Array.isArray(incomesRes.value.data) ? incomesRes.value.data : []);
                }
            } catch {
                toast.error('Erro ao carregar dados. Tente novamente.');
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, [user?.sub]);

    async function handleDelete(incomeId: string): Promise<void> {
        setDeletingId(incomeId);
        try {
            await api.delete(`/employments/${incomeId}`);
            setIncomes((prev) => prev.filter((income) => income.id !== incomeId));
            toast.success('Rendimento removido com sucesso.');
        } catch {
            toast.error('Erro ao remover rendimento.');
        } finally {
            setDeletingId(null);
        }
    }

    if (isLoading) {
        return (
            <section className="mx-auto w-full max-w-5xl space-y-6">
                <header className="space-y-2">
                    <p className="text-primary text-xs font-medium tracking-[0.24em] uppercase">
                        Financeiro
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight">Meus Rendimentos</h1>
                    <p className="text-muted-foreground text-sm">Carregando informações…</p>
                </header>
                <div className="flex items-center justify-center py-12">
                    <Loader2 size={24} className="text-primary animate-spin" />
                </div>
            </section>
        );
    }

    return (
        <section className="mx-auto w-full max-w-5xl space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <header className="space-y-2">
                    <p className="text-primary text-xs font-medium tracking-[0.24em] uppercase">
                        Financeiro
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight">Meus Rendimentos</h1>
                    <p className="text-muted-foreground text-sm">
                        Gerencie seus vínculos de renda para solicitar aluguéis de veículos.
                    </p>
                </header>
                {canAddMore && (
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold inline-flex cursor-pointer items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold"
                    >
                        <Plus size={16} />
                        Adicionar rendimento
                    </button>
                )}
            </div>

            {incomes.length === 0 && (
                <div className="border-primary/30 bg-primary/5 flex items-start gap-3 rounded-2xl border p-5">
                    <AlertTriangle size={20} className="text-primary mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold">Nenhum rendimento cadastrado</p>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Você precisa cadastrar ao menos um rendimento antes de solicitar o
                            aluguel de um veículo.
                        </p>
                    </div>
                </div>
            )}

            {incomes.length > 0 && (
                <div className="space-y-3">
                    {incomes.map((income) => (
                        <div
                            key={income.id}
                            className="border-border/70 bg-gradient-card flex items-center justify-between gap-4 rounded-2xl border p-5"
                        >
                            <div className="min-w-0 space-y-1">
                                <div className="flex items-center gap-2">
                                    <Banknote size={16} className="text-primary shrink-0" />
                                    <span className="text-lg font-bold">
                                        {formatCurrency(income.earnedIncome)}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
                                        <Building2 size={13} />
                                        {income.employerEntityName}
                                    </span>
                                    {(() => {
                                        const cnpj = employers.find(
                                            (e) => e.id === income.employerEntityId
                                        )?.cnpj;
                                        return cnpj ? (
                                            <span className="text-muted-foreground text-xs">
                                                {formatCnpj(cnpj)}
                                            </span>
                                        ) : null;
                                    })()}
                                    {income.jobTitle && income.jobTitle !== 'Não informado' && (
                                        <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
                                            <Briefcase size={13} />
                                            {income.jobTitle}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleDelete(income.id)}
                                disabled={deletingId === income.id}
                                className="text-destructive hover:bg-destructive/10 inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Remover rendimento"
                            >
                                {deletingId === income.id ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <Trash2 size={14} />
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="text-muted-foreground text-xs">
                {incomes.length} de {MAX_INCOMES} rendimentos cadastrados
            </div>

            {!canAddMore && (
                <div className="border-border/50 bg-secondary/30 rounded-2xl border p-5 text-center">
                    <p className="text-muted-foreground text-sm">
                        Você atingiu o limite máximo de {MAX_INCOMES} rendimentos.
                    </p>
                </div>
            )}

            {isModalOpen && clientId && (
                <AddIncomeModal
                    clientId={clientId}
                    employers={employers}
                    onClose={() => setIsModalOpen(false)}
                    onEmployerCreated={(employer) => setEmployers((prev) => [...prev, employer])}
                    onIncomeAdded={(income) => setIncomes((prev) => [...prev, income])}
                />
            )}
        </section>
    );
}
