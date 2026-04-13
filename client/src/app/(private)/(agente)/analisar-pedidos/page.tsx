'use client';

import { CheckCircle, FileText, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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

function approvalBadgeClass(status: ApprovalStatus): string {
    if (status === 'APPROVED') return 'bg-emerald-500/15 text-emerald-400';
    if (status === 'REJECTED') return 'bg-red-500/15 text-red-400';
    return 'bg-secondary text-secondary-foreground';
}

export default function ReviewOrdersPage() {
    const { user, hasRole } = useAuth();
    const isBank = hasRole('BANK');
    const isCompany = hasRole('COMPANY');
    const [requests, setRequests] = useState<RentalRequestResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [decidingId, setDecidingId] = useState<string | null>(null);

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

                let endpoint = '';
                if (isCompany) {
                    endpoint = `/rental-requests/company/${currentUser.id}`;
                } else if (isBank) {
                    endpoint = `/rental-requests/bank/${currentUser.id}`;
                }

                if (!endpoint) return;

                const requestsRes = await api.get(endpoint);
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
    }, [user, isBank, isCompany]);

    async function handleDecision(requestId: string, approved: boolean): Promise<void> {
        setDecidingId(requestId);

        const endpoint = isCompany
            ? '/rental-requests/company-approval'
            : '/rental-requests/bank-approval';

        try {
            const response = await api.put(endpoint, {
                rentalRequestId: requestId,
                approved,
            });

            setRequests((previous) =>
                previous.map((request) =>
                    request.id === requestId ? (response.data as RentalRequestResponse) : request
                )
            );

            toast.success(approved ? 'Pedido aprovado com sucesso.' : 'Pedido recusado.');
        } catch {
            toast.error('Erro ao processar decisão. Tente novamente.');
        } finally {
            setDecidingId(null);
        }
    }

    function myApprovalStatus(request: RentalRequestResponse): ApprovalStatus {
        return isCompany ? request.companyApproval : request.bankApproval;
    }

    function canDecide(request: RentalRequestResponse): boolean {
        return myApprovalStatus(request) === 'PENDING';
    }

    if (isLoading) {
        return (
            <section className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Analisar pedidos</h1>
                    <p className="text-muted-foreground">
                        Avalie solicitações e decida pela aprovação.
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
                <h1 className="text-2xl font-bold">Analisar pedidos</h1>
                <p className="text-muted-foreground">
                    Avalie solicitações e decida pela aprovação.
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
                                Placa: {request.vehiclePlate} • Cliente: {request.clientName}
                            </p>
                            {isCompany && (
                                <p className="text-muted-foreground text-xs">
                                    Banco: {request.bankName} •{' '}
                                    {approvalLabel(request.bankApproval)}
                                </p>
                            )}
                            {isBank && (
                                <p className="text-muted-foreground text-xs">
                                    Empresa: {request.companyName} •{' '}
                                    {approvalLabel(request.companyApproval)}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {canDecide(request) ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => handleDecision(request.id, true)}
                                        disabled={decidingId === request.id}
                                        className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/25 disabled:opacity-60"
                                    >
                                        <CheckCircle size={14} />
                                        Aprovar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDecision(request.id, false)}
                                        disabled={decidingId === request.id}
                                        className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/25 disabled:opacity-60"
                                    >
                                        <XCircle size={14} />
                                        Recusar
                                    </button>
                                </>
                            ) : (
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${approvalBadgeClass(myApprovalStatus(request))}`}
                                >
                                    {approvalLabel(myApprovalStatus(request))}
                                </span>
                            )}
                            {isCompany &&
                                request.companyApproval === 'APPROVED' &&
                                request.bankApproval === 'APPROVED' && (
                                    <Link
                                        href={`/contratos/novo?rentalRequestId=${request.id}`}
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
                                    >
                                        <FileText size={14} />
                                        Registrar contrato
                                    </Link>
                                )}
                        </div>
                    </div>
                ))}
            </div>

            {requests.length === 0 && (
                <div className="border-border/70 bg-secondary/40 rounded-2xl border p-6 text-center text-sm">
                    Nenhum pedido encontrado.
                </div>
            )}
        </section>
    );
}
