import type { Contract, VehicleStatus } from '@/types/vehicle';

const CONTRACTS_KEY = 'rentcars.contracts.v1';

function readStorage<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

function writeStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
}

export function getContracts(): Contract[] {
    const contracts = readStorage<Contract[]>(CONTRACTS_KEY, []);
    const now = Date.now();
    const active = contracts.filter((contract) => {
        const expired = new Date(contract.endDate).getTime() < now;
        return !expired;
    });
    if (active.length !== contracts.length) {
        saveContracts(active);
    }
    return active;
}

export function saveContracts(contracts: Contract[]): void {
    writeStorage(CONTRACTS_KEY, contracts);
}

export function closeContract(contractId: string): void {
    const contracts = getContracts();
    const contract = contracts.find((item) => item.id === contractId);
    if (!contract) return;
    saveContracts(contracts.filter((item) => item.id !== contractId));
}

export function statusLabel(status: VehicleStatus): string {
    switch (status) {
        case 'AVAILABLE':
            return 'Disponivel';
        case 'UNDER_REVIEW':
            return 'Em analise';
        case 'APPROVED':
            return 'Aprovado';
        case 'UNAVAILABLE':
            return 'Indisponivel';
        default:
            return status;
    }
}
