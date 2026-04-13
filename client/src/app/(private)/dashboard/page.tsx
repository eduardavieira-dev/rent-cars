'use client';

import { Car, CheckCircle2, Clock, FileText, Loader2, TrendingUp, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import type { ContractResponse } from '@/types/contract';
import type { RentalRequestResponse, Vehicle } from '@/types/vehicle';

interface KpiCard {
    label: string;
    value: number;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
}

function buildChartData(contracts: ContractResponse[]): { date: string; contratos: number }[] {
    const countByDate = new Map<string, number>();
    
    for (const contract of contracts) {
        if (!contract.signatureDate) {
            continue;
        }

        const date = contract.signatureDate;
        countByDate.set(date, (countByDate.get(date) ?? 0) + 1);
    }
    return Array.from(countByDate.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, contratos]) => {
            const [year, month, day] = date.split('-');
            return { date: `${day}/${month}/${year}`, contratos };
        });
}

export default function DashboardPage() {
    const { hasRole } = useAuth();
    const isCompany = hasRole('COMPANY');
    const isClient = hasRole('CLIENT');
    const isBank = hasRole('BANK');

    const [contracts, setContracts] = useState<ContractResponse[]>([]);
    const [requests, setRequests] = useState<RentalRequestResponse[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load(): Promise<void> {
            try {
                const promises: Promise<void>[] = [];

                promises.push(
                    api.get('/contracts').then((res) => {
                        const data = Array.isArray(res.data) ? res.data : (res.data?.items ?? []);
                        setContracts(data);
                    })
                );

                promises.push(
                    api.get('/rental-requests').then((res) => {
                        const data = Array.isArray(res.data) ? res.data : (res.data?.items ?? []);
                        setRequests(data);
                    })
                );

                if (isCompany) {
                    promises.push(
                        api.get('/vehicles/my-vehicles').then((res) => {
                            const data = Array.isArray(res.data)
                                ? res.data
                                : (res.data?.items ?? []);
                            setVehicles(data);
                        })
                    );
                }

                await Promise.allSettled(promises);
            } finally {
                setIsLoading(false);
            }
        }

        load();
    }, [isCompany]);

    const kpis: KpiCard[] = useMemo(() => {
        const cards: KpiCard[] = [];

        const activeContracts = contracts.filter((c) => c.status === 'ACTIVE').length;
        const terminatedContracts = contracts.filter((c) => c.status === 'TERMINATED').length;

        cards.push({
            label: 'Contratos ativos',
            value: activeContracts,
            icon: FileText,
            color: 'text-success',
        });

        cards.push({
            label: 'Contratos rescindidos',
            value: terminatedContracts,
            icon: XCircle,
            color: 'text-destructive',
        });

        if (isCompany) {
            const pendingRequests = requests.filter((r) => r.companyApproval === 'PENDING').length;
            const approvedRequests = requests.filter(
                (r) => r.companyApproval === 'APPROVED' && r.bankApproval === 'APPROVED'
            ).length;
            const availableVehicles = vehicles.filter((v) => v.status === 'AVAILABLE').length;
            const unavailableVehicles = vehicles.filter((v) => v.status === 'UNAVAILABLE').length;

            cards.push({
                label: 'Pedidos pendentes',
                value: pendingRequests,
                icon: Clock,
                color: 'text-primary',
            });
            cards.push({
                label: 'Pedidos aprovados',
                value: approvedRequests,
                icon: CheckCircle2,
                color: 'text-success',
            });
            cards.push({
                label: 'Veículos disponíveis',
                value: availableVehicles,
                icon: Car,
                color: 'text-primary',
            });
            cards.push({
                label: 'Veículos indisponíveis',
                value: unavailableVehicles,
                icon: XCircle,
                color: 'text-destructive',
            });
        }

        if (isClient) {
            const myPending = requests.filter(
                (r) => r.companyApproval === 'PENDING' || r.bankApproval === 'PENDING'
            ).length;
            const myApproved = requests.filter(
                (r) => r.companyApproval === 'APPROVED' && r.bankApproval === 'APPROVED'
            ).length;
            const myRejected = requests.filter(
                (r) => r.companyApproval === 'REJECTED' || r.bankApproval === 'REJECTED'
            ).length;

            cards.push({
                label: 'Pedidos pendentes',
                value: myPending,
                icon: Clock,
                color: 'text-primary',
            });
            cards.push({
                label: 'Pedidos aprovados',
                value: myApproved,
                icon: CheckCircle2,
                color: 'text-success',
            });
            cards.push({
                label: 'Pedidos recusados',
                value: myRejected,
                icon: XCircle,
                color: 'text-destructive',
            });
        }

        if (isBank) {
            const bankPending = requests.filter((r) => r.bankApproval === 'PENDING').length;
            const bankApproved = requests.filter((r) => r.bankApproval === 'APPROVED').length;
            const bankRejected = requests.filter((r) => r.bankApproval === 'REJECTED').length;
            const creditContracts = contracts.filter((c) => c.creditRequested).length;

            cards.push({
                label: 'Pedidos pendentes',
                value: bankPending,
                icon: Clock,
                color: 'text-primary',
            });
            cards.push({
                label: 'Pedidos aprovados',
                value: bankApproved,
                icon: CheckCircle2,
                color: 'text-success',
            });
            cards.push({
                label: 'Pedidos recusados',
                value: bankRejected,
                icon: XCircle,
                color: 'text-destructive',
            });
            cards.push({
                label: 'Com crédito solicitado',
                value: creditContracts,
                icon: TrendingUp,
                color: 'text-primary',
            });
        }

        return cards;
    }, [contracts, requests, vehicles, isCompany, isClient, isBank]);

    const chartData = useMemo(() => buildChartData(contracts), [contracts]);

    const totalContractValue = useMemo(
        () => contracts.reduce((sum, c) => sum + (c.value ?? 0), 0),
        [contracts]
    );

    if (isLoading) {
        return (
            <section className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Acompanhe aqui os principais dados do sistema.
                    </p>
                </div>
                <div className="text-muted-foreground flex items-center gap-2 py-8 text-sm">
                    <Loader2 size={16} className="animate-spin" />
                    Carregando dados...
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                    Acompanhe aqui os principais dados do sistema.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {kpis.map((kpi) => (
                    <div
                        key={kpi.label}
                        className="border-border bg-gradient-card flex items-center gap-4 rounded-2xl border p-5"
                    >
                        <div
                            className={`bg-secondary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${kpi.color}`}
                        >
                            <kpi.icon size={20} />
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs font-medium">{kpi.label}</p>
                            <p className="text-2xl font-bold">{kpi.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <div className="border-border bg-gradient-card rounded-2xl border p-5">
                    <div className="mb-1 flex items-center gap-2">
                        <TrendingUp size={16} className="text-primary" />
                        <h2 className="text-sm font-semibold">Valor total em contratos</h2>
                    </div>
                    <p className="text-3xl font-bold">
                        {totalContractValue.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                        })}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                        Soma de todos os contratos ({contracts.length})
                    </p>
                </div>

                <div className="border-border bg-gradient-card rounded-2xl border p-5">
                    <div className="mb-1 flex items-center gap-2">
                        <FileText size={16} className="text-primary" />
                        <h2 className="text-sm font-semibold">Resumo de pedidos</h2>
                    </div>
                    <p className="text-3xl font-bold">{requests.length}</p>
                    <p className="text-muted-foreground mt-1 text-xs">
                        Total de pedidos de aluguel registrados
                    </p>
                </div>
            </div>

            <div className="border-border bg-gradient-card rounded-2xl border p-5">
                <div className="mb-6 flex items-center gap-2">
                    <TrendingUp size={16} className="text-primary" />
                    <h2 className="text-sm font-semibold">Contratos por data de assinatura</h2>
                </div>

                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                        <AreaChart
                            data={chartData}
                            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                        >
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#d97706" stopOpacity={0.4} />
                                    <stop offset="100%" stopColor="#d97706" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2c2624" />
                            <XAxis
                                dataKey="date"
                                stroke="#a8a29e"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#a8a29e"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#141210',
                                    border: '1px solid #2c2624',
                                    borderRadius: '12px',
                                    color: '#fafaf9',
                                    fontSize: '13px',
                                }}
                                labelStyle={{ color: '#a8a29e' }}
                                itemStyle={{ color: '#d97706' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="contratos"
                                name="Contratos"
                                stroke="#d97706"
                                strokeWidth={2}
                                fill="url(#chartGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-muted-foreground flex h-80 items-center justify-center text-sm">
                        Nenhum contrato encontrado para gerar o gráfico.
                    </div>
                )}
            </div>
        </section>
    );
}
