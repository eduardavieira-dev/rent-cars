'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/useAuth';
import { statusLabel } from '@/lib/vehicle-store';
import { fetchVehicle } from '@/lib/vehicle-api';
import api from '@/lib/axios';
import type { Vehicle } from '@/types/vehicle';
import { RentalRequestModal } from './_components/RentalRequestModal';

interface UserRecord {
    id: string;
    email: string;
}

export default function VehicleDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user, hasRole } = useAuth();
    const vehicleId = Array.isArray(params.id) ? params.id[0] : params.id;
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);
    const [isCheckingIncome, setIsCheckingIncome] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isClient = hasRole('CLIENT');

    useEffect(() => {
        let isActive = true;
        const load = async () => {
            if (!vehicleId) return;
            try {
                const data = await fetchVehicle(vehicleId);
                if (isActive) setVehicle(data);
            } catch {
                if (isActive) setVehicle(null);
            } finally {
                if (isActive) setIsLoading(false);
            }
        };
        load();
        return () => {
            isActive = false;
        };
    }, [vehicleId]);

    if (isLoading) {
        return (
            <section className="space-y-4">
                <h1 className="text-2xl font-bold">Carregando veiculo...</h1>
            </section>
        );
    }

    if (!vehicle) {
        return (
            <section className="space-y-4">
                <h1 className="text-2xl font-bold">Veiculo nao encontrado</h1>
                <p className="text-muted-foreground">
                    Esse veiculo nao esta disponivel no momento.
                </p>
                <Link href="/veiculos" className="text-primary text-sm font-medium">
                    Voltar para veiculos
                </Link>
            </section>
        );
    }

    async function handleRequest(): Promise<void> {
        if (!vehicle) return;
        if (!user?.sub) {
            setMessage('Voce precisa estar logado para solicitar um veiculo.');
            return;
        }

        setIsCheckingIncome(true);
        setMessage(null);

        try {
            const usersRes = await api.get('/users');
            const users: UserRecord[] = Array.isArray(usersRes.data)
                ? usersRes.data
                : (usersRes.data?.items ?? usersRes.data?.content ?? []);

            const currentUser = users.find(
                (candidate) => candidate.email?.toLowerCase() === user.sub.toLowerCase()
            );

            if (!currentUser) {
                setMessage('Nao foi possivel identificar seu usuario.');
                return;
            }

            const incomesRes = await api.get(`/employments/client/${currentUser.id}`);
            const incomes = Array.isArray(incomesRes.data)
                ? incomesRes.data
                : (incomesRes.data?.items ?? incomesRes.data?.content ?? []);

            if (incomes.length === 0) {
                setMessage(
                    'Voce precisa cadastrar pelo menos um rendimento antes de solicitar um aluguel. Acesse "Meus rendimentos" no menu lateral.'
                );
                return;
            }

            setIsModalOpen(true);
        } catch {
            setMessage('Erro ao verificar rendimentos. Tente novamente.');
        } finally {
            setIsCheckingIncome(false);
        }
    }

    return (
        <section className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                    href="/veiculos"
                    className="text-primary inline-flex items-center gap-2 text-sm font-semibold"
                >
                    <ArrowLeft size={18} strokeWidth={2.5} />
                    Voltar para veiculos
                </Link>
                <span className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs font-semibold">
                    {statusLabel(vehicle.status)}
                </span>
            </div>

            <div className="bg-gradient-card border-border/70 grid gap-6 rounded-3xl border p-6 lg:grid-cols-[1.35fr_1fr]">
                <div className="space-y-5">
                    <div>
                        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                            {vehicle.brand} {vehicle.model}
                        </h1>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Carro premium para viagens, trabalho e experiencias especiais.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="bg-secondary/70 rounded-2xl p-4">
                            <p className="text-muted-foreground text-xs">Registro</p>
                            <p className="text-lg font-semibold">{vehicle.registration}</p>
                        </div>
                        <div className="bg-secondary/70 rounded-2xl p-4">
                            <p className="text-muted-foreground text-xs">Placa</p>
                            <p className="text-lg font-semibold">{vehicle.plate}</p>
                        </div>
                        <div className="bg-secondary/70 rounded-2xl p-4">
                            <p className="text-muted-foreground text-xs">Ano</p>
                            <p className="text-lg font-semibold">{vehicle.year}</p>
                        </div>
                        <div className="bg-secondary/70 rounded-2xl p-4">
                            <p className="text-muted-foreground text-xs">Status</p>
                            <p className="text-lg font-semibold">{statusLabel(vehicle.status)}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <span className="bg-secondary text-secondary-foreground rounded-full px-4 py-2 text-xs font-semibold">
                            Valor sob consulta
                        </span>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="border-border bg-card relative overflow-hidden rounded-2xl border">
                        <img
                            src={vehicle.imageUrl}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            className="h-full w-full object-cover"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent" />
                    </div>

                    <div className="bg-secondary/50 rounded-2xl p-5">
                        <p className="text-muted-foreground text-xs">Valor mensal estimado</p>
                        <p className="text-primary text-3xl font-bold">Sob consulta</p>
                        <p className="text-muted-foreground text-xs">Consulte a empresa</p>
                    </div>

                    {isClient && vehicle.status === 'AVAILABLE' && (
                        <button
                            type="button"
                            onClick={handleRequest}
                            disabled={isCheckingIncome}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold w-full cursor-pointer rounded-lg px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-60"
                        >
                            {isCheckingIncome ? 'Verificando...' : 'Solicitar aluguel'}
                        </button>
                    )}

                    {isClient && vehicle.status !== 'AVAILABLE' && (
                        <div className="border-border/70 bg-secondary/40 rounded-lg border px-4 py-3 text-sm">
                            Veiculo indisponivel no momento para novas solicitacoes.
                        </div>
                    )}

                    {message && (
                        <div className="border-border/70 bg-secondary/40 rounded-lg border px-4 py-3 text-sm">
                            {message}
                            {message.includes('rendimento') && (
                                <Link
                                    href="/meus-rendimentos"
                                    className="text-primary mt-2 block text-sm font-semibold"
                                >
                                    Ir para Meus rendimentos
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && vehicleId && (
                <RentalRequestModal
                    vehicleId={vehicleId}
                    vehicleLabel={`${vehicle.brand} ${vehicle.model}`}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        router.push('/meus-pedidos');
                    }}
                />
            )}
        </section>
    );
}
