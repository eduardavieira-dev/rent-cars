import type { ContractStatus, CreditContractStatus, OwnershipType } from '@/types/contract';

export function contractStatusLabel(status: ContractStatus): string {
    switch (status) {
        case 'ACTIVE':
            return 'Ativo';
        case 'TERMINATED':
            return 'Rescindido';
        default:
            return status;
    }
}

export function contractStatusBadgeClass(status: ContractStatus): string {
    if (status === 'ACTIVE') return 'bg-emerald-500/15 text-emerald-400';
    if (status === 'TERMINATED') return 'bg-red-500/15 text-red-400';
    return 'bg-secondary text-secondary-foreground';
}

export function ownershipLabel(ownership: OwnershipType): string {
    switch (ownership) {
        case 'CLIENT':
            return 'Cliente';
        case 'COMPANY':
            return 'Empresa';
        case 'BANK':
            return 'Banco';
        default:
            return ownership;
    }
}

export function creditStatusLabel(status: CreditContractStatus): string {
    switch (status) {
        case 'PENDING':
            return 'Pendente';
        case 'APPROVED':
            return 'Aprovado';
        case 'GRANTED':
            return 'Concedido';
        default:
            return status;
    }
}

export function creditStatusBadgeClass(status: CreditContractStatus): string {
    if (status === 'GRANTED') return 'bg-emerald-500/15 text-emerald-400';
    if (status === 'APPROVED') return 'bg-blue-500/15 text-blue-400';
    return 'bg-secondary text-secondary-foreground';
}

export function formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

export function formatDate(date: string | null): string {
    if (!date) return '—';
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
}
