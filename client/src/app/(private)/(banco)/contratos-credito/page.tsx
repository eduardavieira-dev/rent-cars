'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import api from '@/lib/axios';
import {
    creditStatusBadgeClass,
    creditStatusLabel,
    formatCurrency,
} from '@/lib/contract-labels';
import type { ContractResponse, CreditContractResponse } from '@/types/contract';

export default function CreditContractsPage() {
    const [contracts, setContracts] = useState<ContractResponse[]>([]);
    const [credits, setCredits] = useState<Record<string, CreditContractResponse>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load(): Promise<void> {
            try {
                const [contractsRes, creditsRes] = await Promise.all([
                    api.get('/contracts'),
                    api.get('/credit-contracts'),
                ]);
                const contractsData: ContractResponse[] = Array.isArray(contractsRes.data)
                    ? contractsRes.data
                    : (contractsRes.data?.items ?? contractsRes.data?.content ?? []);
                const creditsData: CreditContractResponse[] = Array.isArray(creditsRes.data)
                    ? creditsRes.data
                    : (creditsRes.data?.items ?? creditsRes.data?.content ?? []);
                setContracts(contractsData);
                setCredits(
                    Object.fromEntries(creditsData.map((credit) => [credit.contractId, credit]))
                );
            } catch {
                setContracts([]);
                setCredits({});
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, []);

    if (isLoading) {
        return (
            <section className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Contratos de crédito</h1>
                    <p className="text-muted-foreground">
                        Avalie, aprove e conceda crédito para contratos vinculados ao banco.
                    </p>
                </div>
                <div className="text-muted-foreground flex items-center gap-2 py-8 text-sm">
                    <Loader2 size={16} className="animate-spin" />
                    Carregando contratos...
                </div>
            </section>
        );
    }

    const creditRequested = contracts.filter((contract) => contract.creditRequested);

    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Contratos de crédito</h1>
                <p className="text-muted-foreground">
                    Avalie, aprove e conceda crédito para contratos vinculados ao banco.
                </p>
            </div>

            <div className="grid gap-4">
                {creditRequested.map((contract) => {
                    const credit = credits[contract.id];
                    return (
                        <Link
                            key={contract.id}
                            href={`/contratos/${contract.id}`}
                            className="border-border bg-card hover:border-primary/60 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 transition-colors"
                        >
                            <div className="space-y-1">
                                <p className="font-semibold">
                                    {contract.vehicleBrand} {contract.vehicleModel}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    Cliente: {contract.clientName} • Placa: {contract.vehiclePlate}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    Valor do contrato: {formatCurrency(contract.value)}
                                </p>
                            </div>
                            <div className="text-right">
                                {credit ? (
                                    <>
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${creditStatusBadgeClass(credit.status)}`}
                                        >
                                            {creditStatusLabel(credit.status)}
                                        </span>
                                        <p className="text-muted-foreground mt-2 text-xs">
                                            {credit.interestRate}% a.m. • {credit.termMonths} meses
                                        </p>
                                    </>
                                ) : (
                                    <span className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs font-semibold">
                                        Aguardando registro
                                    </span>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>

            {creditRequested.length === 0 && (
                <div className="border-border/70 bg-secondary/40 rounded-2xl border p-6 text-center text-sm">
                    Nenhum contrato com solicitação de crédito no momento.
                </div>
            )}
        </section>
    );
}
