'use client';

import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { decideRequest, getRequests } from '@/lib/vehicle-store';
import type { RentalRequest } from '@/types/vehicle';

function requestStatusLabel(status: RentalRequest['status']): string {
    switch (status) {
        case 'IN_REVIEW':
            return 'Em analise';
        case 'APPROVED':
            return 'Aprovado';
        case 'REJECTED':
            return 'Recusado';
        default:
            return status;
    }
}

export default function ReviewOrdersPage() {
    const { hasRole } = useAuth();
    const isBank = hasRole('BANK');
    const isCompany = hasRole('COMPANY');
    const [requests, setRequests] = useState<RentalRequest[]>([]);

    useEffect(() => {
        setRequests(getRequests());
    }, []);

    function refresh(): void {
        setRequests(getRequests());
    }

    function handleDecision(requestId: string, decision: 'APPROVED' | 'REJECTED'): void {
        const actor = isCompany ? 'COMPANY' : 'BANK';
        decideRequest(requestId, actor, decision);
        refresh();
    }

    const pendingRequests = useMemo(
        () => requests.filter((request) => request.status === 'IN_REVIEW'),
        [requests]
    );

    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Analisar pedidos</h1>
                <p className="text-muted-foreground">
                    Avalie solicitacoes pendentes e decida pela aprovacao.
                </p>
            </div>

            <div className="grid gap-4">
                {pendingRequests.map((request) => (
                    <div
                        key={request.id}
                        className="border-border bg-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4"
                    >
                        <div>
                            <p className="font-semibold">{request.vehicleLabel}</p>
                            <p className="text-muted-foreground text-sm">
                                {request.clientEmail} • {request.durationMonths} meses
                            </p>
                            <p className="text-muted-foreground text-xs">
                                Banco: {request.bankDecision} • Empresa: {request.companyDecision}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs font-semibold">
                                {requestStatusLabel(request.status)}
                            </span>
                            <button
                                type="button"
                                onClick={() => handleDecision(request.id, 'APPROVED')}
                                className="bg-success/20 text-success hover:bg-success/30 cursor-pointer rounded-full px-3 py-1 text-xs font-semibold"
                            >
                                Aprovar
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDecision(request.id, 'REJECTED')}
                                className="bg-destructive/15 text-destructive hover:bg-destructive/25 cursor-pointer rounded-full px-3 py-1 text-xs font-semibold"
                            >
                                Recusar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {pendingRequests.length === 0 && (
                <div className="border-border/70 bg-secondary/40 rounded-2xl border p-6 text-center text-sm">
                    Nenhum pedido pendente no momento.
                </div>
            )}
        </section>
    );
}
