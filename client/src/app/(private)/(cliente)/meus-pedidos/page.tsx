'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import type { ApprovalStatus, RentalRequestResponse } from '@/types/vehicle';

interface UserRecord {
    id: string;
    email: string;
}

function approvalLabel(status: ApprovalStatus): string {
    switch (status) {
        case 'APPROVED':
            return 'Aprovado';
        case 'REJECTED':
            return 'Recusado';
        case 'PENDING':
        default:
            return 'Pendente';
    }
}

function overallLabel(request: RentalRequestResponse): string {
    if (request.companyApproval === 'REJECTED' || request.bankApproval === 'REJECTED') {
        return 'Recusado';
    }
    if (request.companyApproval === 'APPROVED' && request.bankApproval === 'APPROVED') {
        return 'Aprovado';
    }
    return 'Em análise';
}

function overallBadgeClass(request: RentalRequestResponse): string {
    const label = overallLabel(request);
    if (label === 'Aprovado') return 'bg-emerald-500/15 text-emerald-400';
    if (label === 'Recusado') return 'bg-red-500/15 text-red-400';
    return 'bg-secondary text-secondary-foreground';
}

export default function MyOrdersPage() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<RentalRequestResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadRequests(): Promise<void> {
            if (!user?.sub) return;

            try {
                const usersRes = await api.get('/users');
                const users: UserRecord[] = Array.isArray(usersRes.data)
                    ? usersRes.data
                    : (usersRes.data?.items ?? usersRes.data?.content ?? []);

                const currentUser = users.find(
                    (candidate) => candidate.email?.toLowerCase() === user.sub.toLowerCase()
                );

                if (!currentUser) return;

                const requestsRes = await api.get(`/rental-requests/client/${currentUser.id}`);
                const data: RentalRequestResponse[] = Array.isArray(requestsRes.data)
                    ? requestsRes.data
                    : (requestsRes.data?.items ?? requestsRes.data?.content ?? []);

                setRequests(data);
            } catch {
                setRequests([]);
            } finally {
                setIsLoading(false);
            }
        }

        loadRequests();
    }, [user]);

    if (isLoading) {
        return (
            <section className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Meus pedidos</h1>
                    <p className="text-muted-foreground">
                        Acompanhe o andamento das suas solicitações de locação.
                    </p>
                </div>
                <div className="text-muted-foreground flex items-center gap-2 py-8 text-sm">
                    <Loader2 size={16} className="animate-spin" />
                    Carregando pedidos...
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Meus pedidos</h1>
                <p className="text-muted-foreground">
                    Acompanhe o andamento das suas solicitações de locação.
                </p>
            </div>

            <div className="grid gap-4">
                {requests.map((request) => (
                    <div
                        key={request.id}
                        className="border-border bg-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4"
                    >
                        <div className="space-y-1">
                            <p className="font-semibold">
                                {request.vehicleBrand} {request.vehicleModel}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                Placa: {request.vehiclePlate}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                Empresa: {request.companyName}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                Banco: {request.bankName}
                            </p>
                        </div>
                        <div className="text-right">
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${overallBadgeClass(request)}`}
                            >
                                {overallLabel(request)}
                            </span>
                            <p className="text-muted-foreground mt-2 text-xs">
                                Empresa: {approvalLabel(request.companyApproval)} • Banco:{' '}
                                {approvalLabel(request.bankApproval)}
                            </p>
                            <Link
                                href={`/veiculos/${request.vehicleId}`}
                                className="text-primary mt-3 inline-flex text-xs font-semibold"
                            >
                                Ver detalhes do veículo
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {requests.length === 0 && (
                <div className="border-border/70 bg-secondary/40 rounded-2xl border p-6 text-center text-sm">
                    Nenhuma solicitação criada ainda.
                </div>
            )}
        </section>
    );
}
