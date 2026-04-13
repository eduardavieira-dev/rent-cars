'use client';

import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import api from '@/lib/axios';
import { fetchVehicle } from '@/lib/vehicle-api';
import type { OwnershipType } from '@/types/contract';
import type { RentalRequestResponse, Vehicle } from '@/types/vehicle';

const OWNERSHIP_OPTIONS: { value: OwnershipType; label: string }[] = [
    { value: 'CLIENT', label: 'Cliente' },
    { value: 'COMPANY', label: 'Empresa' },
    { value: 'BANK', label: 'Banco' },
];

export default function NewContractPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const rentalRequestId = searchParams.get('rentalRequestId');

    const [rental, setRental] = useState<RentalRequestResponse | null>(null);
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [signatureDate, setSignatureDate] = useState(
        () => new Date().toISOString().slice(0, 10)
    );
    const [value, setValue] = useState('');
    const [ownership, setOwnership] = useState<OwnershipType>('CLIENT');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function load(): Promise<void> {
            if (!rentalRequestId) {
                setIsLoading(false);
                return;
            }
            try {
                const res = await api.get(`/rental-requests/${rentalRequestId}`);
                const rentalData = res.data as RentalRequestResponse;
                setRental(rentalData);
                const vehicleData = await fetchVehicle(rentalData.vehicleId);
                setVehicle(vehicleData);
                if (vehicleData.dailyRate != null) {
                    setValue(String(vehicleData.dailyRate));
                }
            } catch {
                setRental(null);
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [rentalRequestId]);

    async function handleSubmit(event: React.FormEvent): Promise<void> {
        event.preventDefault();
        if (!rental) return;
        setIsSubmitting(true);
        try {
            const response = await api.post('/contracts', {
                rentalRequestId: rental.id,
                signatureDate,
                value: Number(value),
                ownership,
            });
            const contract = response.data as { id: string };
            toast.success('Contrato registrado.');
            router.push(`/contratos/${contract.id}`);
        } catch (error: unknown) {
            const status =
                error instanceof Object && 'response' in error
                    ? (error as { response?: { status?: number } }).response?.status
                    : undefined;
            if (status === 409) {
                toast.error('Pedido inelegível ou contrato já existente.');
            } else if (status === 403) {
                toast.error('Você não é a empresa responsável por este pedido.');
            } else {
                toast.error('Erro ao registrar contrato.');
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <section className="text-muted-foreground flex items-center gap-2 py-10 text-sm">
                <Loader2 size={16} className="animate-spin" />
                Carregando pedido...
            </section>
        );
    }

    if (!rentalRequestId || !rental) {
        return (
            <section className="space-y-4">
                <h1 className="text-2xl font-bold">Pedido de aluguel não encontrado</h1>
                <p className="text-muted-foreground text-sm">
                    Abra a página "Analisar pedidos" e use a ação "Registrar contrato" em um pedido aprovado.
                </p>
            </section>
        );
    }

    const fullyApproved =
        rental.companyApproval === 'APPROVED' && rental.bankApproval === 'APPROVED';

    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Registrar contrato</h1>
                <p className="text-muted-foreground">
                    Formalize o aluguel aprovado com a assinatura do contrato.
                </p>
            </div>

            <div className="border-border bg-card rounded-2xl border p-5">
                <p className="font-semibold">
                    {rental.vehicleBrand} {rental.vehicleModel}
                </p>
                <p className="text-muted-foreground text-sm">
                    Placa: {rental.vehiclePlate} • Cliente: {rental.clientName} • Banco: {rental.bankName}
                </p>
                {rental.creditRequested && (
                    <p className="text-muted-foreground mt-1 text-xs">
                        Cliente solicitou contrato de crédito para este aluguel.
                    </p>
                )}
                {vehicle?.dailyRate != null && (
                    <p className="text-muted-foreground mt-2 text-xs">
                        Valor diário do veículo: R${' '}
                        {vehicle.dailyRate.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </p>
                )}
            </div>

            {!fullyApproved && (
                <div className="border-border/70 bg-red-500/10 text-red-400 rounded-2xl border p-4 text-sm">
                    Este pedido ainda não foi aprovado pela empresa e pelo banco.
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="border-border bg-card space-y-4 rounded-2xl border p-5"
            >
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
                        <span className="text-muted-foreground">Propriedade do automóvel</span>
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

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={!fullyApproved || isSubmitting}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold inline-flex cursor-pointer items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold disabled:opacity-60"
                    >
                        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                        Registrar contrato
                    </button>
                </div>
            </form>
        </section>
    );
}
