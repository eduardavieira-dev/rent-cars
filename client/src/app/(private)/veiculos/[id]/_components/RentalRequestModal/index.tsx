'use client';

import { Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import api from '@/lib/axios';

interface BankOption {
    id: string;
    name: string;
}

interface UserRecord {
    id: string;
    name: string;
    type: string;
}

interface RentalRequestModalProps {
    vehicleId: string;
    vehicleLabel: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function RentalRequestModal({
    vehicleId,
    vehicleLabel,
    onClose,
    onSuccess,
}: RentalRequestModalProps) {
    const [banks, setBanks] = useState<BankOption[]>([]);
    const [selectedBankId, setSelectedBankId] = useState('');
    const [isLoadingBanks, setIsLoadingBanks] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function loadBanks(): Promise<void> {
            try {
                const response = await api.get('/users');
                const users: UserRecord[] = Array.isArray(response.data)
                    ? response.data
                    : (response.data?.items ?? response.data?.content ?? []);

                const bankList = users
                    .filter((user) => user.type === 'Bank')
                    .map((user) => ({ id: user.id, name: user.name }));

                setBanks(bankList);
            } catch {
                toast.error('Erro ao carregar bancos disponíveis.');
            } finally {
                setIsLoadingBanks(false);
            }
        }

        loadBanks();
    }, []);

    async function handleSubmit(event: React.FormEvent): Promise<void> {
        event.preventDefault();

        if (!selectedBankId) {
            toast.error('Selecione um banco para prosseguir.');
            return;
        }

        setIsSubmitting(true);

        try {
            await api.post('/rental-requests', {
                vehicleId,
                bankId: selectedBankId,
            });

            toast.success('Solicitação de aluguel enviada com sucesso!');
            onSuccess();
        } catch (error: unknown) {
            const status =
                error instanceof Object && 'response' in error
                    ? (error as { response?: { status?: number } }).response?.status
                    : undefined;

            if (status === 409) {
                toast.error('Já existe uma solicitação pendente para este veículo.');
            } else if (status === 400) {
                toast.error('Veículo indisponível para locação.');
            } else {
                toast.error('Erro ao enviar solicitação. Tente novamente.');
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-background border-border w-full max-w-lg rounded-2xl border p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Solicitar aluguel</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-muted-foreground hover:bg-secondary inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors"
                        aria-label="Fechar"
                    >
                        <X size={18} />
                    </button>
                </div>

                <p className="text-muted-foreground mt-2 text-sm">
                    Você está solicitando o aluguel do veículo{' '}
                    <span className="text-foreground font-medium">{vehicleLabel}</span>.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    <div className="space-y-2">
                        <label htmlFor="bank-select" className="text-sm font-medium">
                            Selecione o banco
                        </label>

                        {isLoadingBanks ? (
                            <div className="text-muted-foreground flex items-center gap-2 py-3 text-sm">
                                <Loader2 size={16} className="animate-spin" />
                                Carregando bancos...
                            </div>
                        ) : banks.length === 0 ? (
                            <div className="border-border/70 bg-secondary/40 rounded-lg border px-4 py-3 text-sm">
                                Nenhum banco disponível no momento.
                            </div>
                        ) : (
                            <select
                                id="bank-select"
                                value={selectedBankId}
                                onChange={(event) => setSelectedBankId(event.target.value)}
                                className="bg-secondary border-border w-full rounded-lg border px-3 py-2 text-sm outline-none"
                            >
                                <option value="">Selecione um banco</option>
                                {banks.map((bank) => (
                                    <option key={bank.id} value={bank.id}>
                                        {bank.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="border-border/70 bg-secondary/40 space-y-1 rounded-lg border px-4 py-3">
                        <p className="text-xs font-medium">Como funciona?</p>
                        <p className="text-muted-foreground text-xs">
                            Sua solicitação será enviada para a empresa proprietária do veículo e
                            para o banco selecionado. Ambos precisam aprovar para que o aluguel seja
                            efetivado.
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-secondary-foreground hover:bg-secondary cursor-pointer rounded-full px-4 py-2 text-sm"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || isLoadingBanks || banks.length === 0}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold inline-flex cursor-pointer items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                            {isSubmitting ? 'Enviando...' : 'Confirmar solicitação'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
