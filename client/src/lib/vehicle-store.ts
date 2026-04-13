import type { VehicleStatus } from '@/types/vehicle';

export function statusLabel(status: VehicleStatus): string {
    switch (status) {
        case 'AVAILABLE':
            return 'Disponível';
        case 'UNDER_REVIEW':
            return 'Em análise';
        case 'APPROVED':
            return 'Aprovado';
        case 'UNAVAILABLE':
            return 'Indisponível';
        default:
            return status;
    }
}
