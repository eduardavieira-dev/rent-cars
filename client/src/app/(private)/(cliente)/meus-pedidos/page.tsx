'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { getRequests } from '@/lib/vehicle-store';
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

export default function MyOrdersPage() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<RentalRequest[]>([]);

    useEffect(() => {
        setRequests(getRequests());
    }, []);

    const myRequests = useMemo(() => {
        if (!user?.sub) return [];
        return requests.filter((request) => request.clientEmail === user.sub);
    }, [requests, user]);

    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Meus pedidos</h1>
                <p className="text-muted-foreground">
                    Acompanhe o andamento das suas solicitacoes de locacao.
                </p>
            </div>

            <div className="grid gap-4">
                {myRequests.map((request) => (
                    <div
                        key={request.id}
                        className="border-border bg-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4"
                    >
                        <div>
                            <p className="font-semibold">{request.vehicleLabel}</p>
                            <p className="text-muted-foreground text-sm">
                                {request.durationMonths} meses •{' '}
                                {request.monthlyPrice
                                    ? `R$ ${request.monthlyPrice}/mes`
                                    : 'Valor sob consulta'}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                Solicitado em {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs font-semibold">
                                {requestStatusLabel(request.status)}
                            </span>
                            <p className="text-muted-foreground mt-2 text-xs">
                                Banco: {request.bankDecision} • Empresa: {request.companyDecision}
                            </p>
                            <Link
                                href={`/veiculos/${request.vehicleId}`}
                                className="text-primary mt-3 inline-flex text-xs font-semibold"
                            >
                                Ver detalhes do veiculo
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {myRequests.length === 0 && (
                <div className="border-border/70 bg-secondary/40 rounded-2xl border p-6 text-center text-sm">
                    Nenhuma solicitacao criada ainda.
                </div>
            )}
        </section>
    );
}
