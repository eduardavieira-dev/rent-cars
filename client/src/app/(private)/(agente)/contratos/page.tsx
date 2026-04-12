'use client';

import { useEffect, useState } from 'react';

import { closeContract, getContracts } from '@/lib/vehicle-store';
import type { Contract } from '@/types/vehicle';

export default function ContractsPage() {
    const [contracts, setContracts] = useState<Contract[]>([]);

    useEffect(() => {
        setContracts(getContracts());
    }, []);

    function refresh(): void {
        setContracts(getContracts());
    }

    function handleClose(contractId: string): void {
        closeContract(contractId);
        refresh();
    }

    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Contratos</h1>
                <p className="text-muted-foreground">
                    Considere os contratos ativos e acompanhe vencimentos.
                </p>
            </div>

            <div className="grid gap-4">
                {contracts.map((contract) => (
                    <div
                        key={contract.id}
                        className="border-border bg-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4"
                    >
                        <div>
                            <p className="font-semibold">{contract.vehicleLabel}</p>
                            <p className="text-muted-foreground text-sm">
                                {contract.clientEmail} •{' '}
                                {contract.monthlyPrice
                                    ? `R$ ${contract.monthlyPrice}/mês`
                                    : 'Valor sob consulta'}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                Vigência: {new Date(contract.startDate).toLocaleDateString()} -{' '}
                                {new Date(contract.endDate).toLocaleDateString()}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleClose(contract.id)}
                            className="text-primary hover:bg-primary/10 cursor-pointer rounded-full px-3 py-2 text-xs font-semibold"
                        >
                            Finalizar contrato
                        </button>
                    </div>
                ))}
            </div>

            {contracts.length === 0 && (
                <div className="border-border/70 bg-secondary/40 rounded-2xl border p-6 text-center text-sm">
                    Nenhum contrato ativo no momento.
                </div>
            )}
        </section>
    );
}
