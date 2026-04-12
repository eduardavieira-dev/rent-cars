'use client';

import { isAxiosError } from 'axios';
import { Banknote, Briefcase, Building2, Loader2, Plus, Search } from 'lucide-react';
import { useMemo, useState, type RefObject } from 'react';
import { IMaskInput, useIMask } from 'react-imask';
import { toast } from 'sonner';

import api from '@/lib/axios';
import { formatCnpj } from '@/lib/utils';

interface EmployerEntity {
    id: string;
    name: string;
    cnpj: string;
}

interface Employment {
    id: string;
    earnedIncome: number;
    jobTitle: string;
    clientId: string;
    clientName: string;
    employerEntityId: string;
    employerEntityName: string;
}

interface AddIncomeModalProps {
    clientId: string;
    employers: EmployerEntity[];
    onClose: () => void;
    onEmployerCreated: (employer: EmployerEntity) => void;
    onIncomeAdded: (income: Employment) => void;
}

function parseBRLCurrency(masked: string): number {
    return parseFloat(masked.replace(/\./g, '').replace(',', '.')) || 0;
}

export function AddIncomeModal({
    clientId,
    employers,
    onClose,
    onEmployerCreated,
    onIncomeAdded,
}: AddIncomeModalProps) {
    const { ref: salaryIMaskRef, value: salaryDisplay } = useIMask({
        mask: Number,
        scale: 2,
        signed: false,
        thousandsSeparator: '.',
        padFractionalZeros: true,
        normalizeZeros: true,
        radix: ',',
        mapToRadix: ['.'],
    });
    const salaryRef = salaryIMaskRef as unknown as RefObject<HTMLInputElement>;
    const [jobTitle, setJobTitle] = useState('');
    const [selectedEmployerId, setSelectedEmployerId] = useState('');
    const [employerSearch, setEmployerSearch] = useState('');
    const [showEmployerDropdown, setShowEmployerDropdown] = useState(false);
    const [showNewEmployerForm, setShowNewEmployerForm] = useState(false);
    const [newEmployerName, setNewEmployerName] = useState('');
    const [newEmployerCnpj, setNewEmployerCnpj] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCreatingEmployer, setIsCreatingEmployer] = useState(false);

    const allEmployers = useMemo(() => employers, [employers]);

    const filteredEmployers = useMemo(() => {
        if (!employerSearch.trim()) return allEmployers;
        const term = employerSearch.toLowerCase();
        return allEmployers.filter((employer) => employer.name.toLowerCase().includes(term));
    }, [allEmployers, employerSearch]);

    function handleSelectEmployer(employer: EmployerEntity): void {
        setSelectedEmployerId(employer.id);
        setEmployerSearch(employer.name);
        setShowNewEmployerForm(false);
        setShowEmployerDropdown(false);
    }

    function handleSelectNewEmployerOption(): void {
        setShowNewEmployerForm(true);
        setSelectedEmployerId('');
        setEmployerSearch('');
        setShowEmployerDropdown(false);
    }

    async function handleCreateEmployer(): Promise<void> {
        if (!newEmployerName.trim()) {
            toast.error('Informe o nome da empresa.');
            return;
        }

        const cnpjDigits = newEmployerCnpj.replace(/\D/g, '');
        if (cnpjDigits.length !== 14) {
            toast.error('CNPJ inválido ou incompleto. Preencha todos os 14 dígitos.');
            return;
        }

        setIsCreatingEmployer(true);
        try {
            const response = await api.post('/employer-entities', {
                name: newEmployerName.trim(),
                cnpj: cnpjDigits,
            });
            const created: EmployerEntity = response.data;
            onEmployerCreated(created);
            setSelectedEmployerId(created.id);
            setEmployerSearch(created.name);
            setShowNewEmployerForm(false);
            setNewEmployerName('');
            setNewEmployerCnpj('');
            toast.success(
                `Empresa "${created.name}" cadastrada. Agora clique em Cadastrar rendimento.`
            );
        } catch (error) {
            if (isAxiosError(error)) {
                const status = error.response?.status;
                const message = error.response?.data?.message;
                if (status === 409) {
                    toast.error('CNPJ já cadastrado. Selecione a empresa na lista.');
                } else if (
                    status === 400 &&
                    typeof message === 'string' &&
                    message.toLowerCase().includes('cnpj')
                ) {
                    toast.error('CNPJ inválido ou incompleto.');
                } else {
                    toast.error(message ?? 'Erro ao cadastrar empresa.');
                }
            } else {
                toast.error('Erro inesperado ao cadastrar empresa.');
            }
        } finally {
            setIsCreatingEmployer(false);
        }
    }

    async function handleSubmit(event: React.FormEvent): Promise<void> {
        event.preventDefault();

        const parsedSalary = parseBRLCurrency(salaryDisplay);
        if (!salaryDisplay || parsedSalary <= 0) {
            toast.error('Informe um salário válido maior que zero.');
            return;
        }

        if (!selectedEmployerId) {
            toast.error('Selecione uma empresa empregadora.');
            return;
        }

        setIsSubmitting(true);
        try {
            const createEmploymentRes = await api.post('/employments', {
                earnedIncome: parsedSalary,
                jobTitle: jobTitle.trim() || 'Não informado',
                clientId,
                employerEntityId: selectedEmployerId,
            });

            onIncomeAdded(createEmploymentRes.data);
            toast.success('Rendimento cadastrado com sucesso!');
            onClose();
        } catch (error) {
            if (isAxiosError(error)) {
                const status = error.response?.status;
                const message = error.response?.data?.message;
                if (status === 422) {
                    toast.error('Você já atingiu o limite de 3 rendimentos.');
                } else {
                    toast.error(message ?? 'Erro ao cadastrar rendimento.');
                }
            } else {
                toast.error('Erro inesperado ao cadastrar rendimento.');
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    const selectedEmployerName = allEmployers.find((e) => e.id === selectedEmployerId)?.name;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="border-border bg-background max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Novo rendimento</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-muted-foreground cursor-pointer text-sm"
                    >
                        Fechar
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-4">
                    <label className="grid gap-2 text-sm">
                        <span>
                            Salário mensal <span className="text-destructive">*</span>
                        </span>
                        <div className="relative">
                            <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Banknote size={15} />
                            </div>
                            <input
                                ref={salaryRef}
                                placeholder="0,00"
                                inputMode="decimal"
                                className="bg-secondary border-border w-full rounded-lg border py-2 pr-4 pl-10 text-sm outline-none"
                            />
                        </div>
                    </label>

                    <label className="grid gap-2 text-sm">
                        Cargo / Função
                        <div className="relative">
                            <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Briefcase size={15} />
                            </div>
                            <input
                                type="text"
                                maxLength={100}
                                value={jobTitle}
                                onChange={(event) => setJobTitle(event.target.value)}
                                placeholder="Ex: Analista de sistemas"
                                className="bg-secondary border-border w-full rounded-lg border py-2 pr-4 pl-10 text-sm outline-none"
                            />
                        </div>
                    </label>

                    <div className="grid gap-2 text-sm">
                        <span>
                            Empresa empregadora <span className="text-destructive">*</span>
                        </span>
                        <div className="relative">
                            <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search size={15} />
                            </div>
                            <input
                                type="text"
                                value={employerSearch}
                                onChange={(event) => {
                                    setEmployerSearch(event.target.value);
                                    setShowEmployerDropdown(true);
                                    if (selectedEmployerId) {
                                        setSelectedEmployerId('');
                                    }
                                }}
                                onFocus={() => setShowEmployerDropdown(true)}
                                placeholder="Buscar empresa..."
                                autoComplete="off"
                                className="bg-secondary border-border w-full rounded-lg border py-2 pr-4 pl-10 text-sm outline-none"
                            />
                            {showEmployerDropdown && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowEmployerDropdown(false)}
                                    />
                                    <div className="border-border bg-card absolute top-full right-0 left-0 z-20 mt-1 max-h-52 overflow-y-auto rounded-lg border shadow-lg">
                                        {filteredEmployers.map((employer) => (
                                            <button
                                                key={employer.id}
                                                type="button"
                                                onClick={() => handleSelectEmployer(employer)}
                                                className="text-foreground hover:bg-secondary flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors"
                                            >
                                                <Building2
                                                    size={14}
                                                    className="text-muted-foreground shrink-0"
                                                />
                                                <span className="truncate">{employer.name}</span>
                                                {employer.cnpj && (
                                                    <span className="text-muted-foreground ml-auto shrink-0 text-xs">
                                                        {formatCnpj(employer.cnpj)}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={handleSelectNewEmployerOption}
                                            className="text-primary hover:bg-primary/10 flex w-full cursor-pointer items-center gap-2 border-t border-dashed px-3 py-2.5 text-left text-sm font-medium transition-colors"
                                        >
                                            <Plus size={14} />
                                            Outra (cadastrar nova empresa)
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                        {selectedEmployerName && (
                            <p className="text-muted-foreground text-xs">
                                Selecionado: {selectedEmployerName}
                            </p>
                        )}
                    </div>

                    {showNewEmployerForm && (
                        <div className="border-border/50 bg-secondary/30 grid gap-3 rounded-xl border p-4">
                            <p className="text-base font-semibold">Nova empresa</p>
                            <label className="grid gap-2 text-sm">
                                <span>
                                    Nome da empresa <span className="text-destructive">*</span>
                                </span>
                                <input
                                    type="text"
                                    maxLength={150}
                                    value={newEmployerName}
                                    onChange={(event) => setNewEmployerName(event.target.value)}
                                    placeholder="Ex: Empresa XYZ Ltda"
                                    className="bg-secondary border-border rounded-lg border px-3 py-2 text-sm outline-none"
                                />
                            </label>
                            <label className="grid gap-2 text-sm">
                                <span>
                                    CNPJ <span className="text-destructive">*</span>
                                </span>
                                <IMaskInput
                                    mask="00.000.000/0000-00"
                                    value={newEmployerCnpj}
                                    onAccept={(value: string) => setNewEmployerCnpj(value)}
                                    placeholder="00.000.000/0000-00"
                                    inputMode="numeric"
                                    className="bg-secondary border-border rounded-lg border px-3 py-2 text-sm outline-none"
                                />
                            </label>
                            <button
                                type="button"
                                onClick={handleCreateEmployer}
                                disabled={isCreatingEmployer}
                                className="bg-secondary border-border text-foreground hover:bg-secondary/70 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isCreatingEmployer ? (
                                    <>
                                        <Loader2 size={13} className="animate-spin" />
                                        Cadastrando…
                                    </>
                                ) : (
                                    <>
                                        <Plus size={13} />
                                        Cadastrar empresa
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="text-secondary-foreground hover:bg-secondary cursor-pointer rounded-full px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || isCreatingEmployer}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex cursor-pointer items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Salvando…
                                </>
                            ) : (
                                'Cadastrar rendimento'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
