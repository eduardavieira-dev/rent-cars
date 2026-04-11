import type { Contract, DecisionStatus, RentalRequest, Vehicle, VehicleStatus } from '@/types/vehicle';

const REQUESTS_KEY = 'rentcars.rentalRequests.v1';
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

function createId(prefix: string): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}


export function getRequests(): RentalRequest[] {
    return readStorage<RentalRequest[]>(REQUESTS_KEY, []);
}

export function saveRequests(requests: RentalRequest[]): void {
    writeStorage(REQUESTS_KEY, requests);
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

export function createRentalRequest(vehicle: Vehicle, clientEmail: string): RentalRequest | null {
    if (vehicle.status !== 'AVAILABLE') return null;
    const requests = getRequests();
    const exists = requests.some(
        (request) =>
            request.vehicleId === vehicle.id &&
            request.clientEmail === clientEmail &&
            request.status === 'IN_REVIEW'
    );
    if (exists) return null;

    const request: RentalRequest = {
        id: createId('req'),
        vehicleId: vehicle.id,
        vehicleLabel: `${vehicle.brand} ${vehicle.model}`,
        clientEmail,
        createdAt: new Date().toISOString(),
        status: 'IN_REVIEW',
        bankDecision: 'PENDING',
        companyDecision: 'PENDING',
        monthlyPrice: 0,
        durationMonths: 12,
    };

    saveRequests([request, ...requests]);
    return request;
}

function finalizeApproval(request: RentalRequest): RentalRequest {
    const updated: RentalRequest = { ...request, status: 'APPROVED' };
    const contracts = getContracts();
    const contract: Contract = {
        id: createId('ctr'),
        vehicleId: request.vehicleId,
        vehicleLabel: request.vehicleLabel,
        clientEmail: request.clientEmail,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        monthlyPrice: request.monthlyPrice,
    };
    saveContracts([contract, ...contracts]);
    return updated;
}

function rejectRequest(request: RentalRequest): RentalRequest {
    return {
        ...request,
        status: 'REJECTED',
        bankDecision: 'REJECTED',
        companyDecision: 'REJECTED',
    };
}

export function decideRequest(
    requestId: string,
    actor: 'BANK' | 'COMPANY',
    decision: Exclude<DecisionStatus, 'PENDING'>
): RentalRequest | null {
    const requests = getRequests();
    let updatedRequest: RentalRequest | null = null;

    const updated = requests.map((request) => {
        if (request.id !== requestId) return request;

        if (decision === 'REJECTED') {
            updatedRequest = rejectRequest(request);
            return updatedRequest;
        }

        const next: RentalRequest = {
            ...request,
            bankDecision: actor === 'BANK' ? 'APPROVED' : request.bankDecision,
            companyDecision: actor === 'COMPANY' ? 'APPROVED' : request.companyDecision,
        };

        if (next.bankDecision === 'APPROVED' && next.companyDecision === 'APPROVED') {
            updatedRequest = finalizeApproval(next);
            return updatedRequest;
        }

        updatedRequest = { ...next, status: 'IN_REVIEW' };
        return updatedRequest;
    });

    saveRequests(updated);
    return updatedRequest;
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
        case 'IN_REVIEW':
            return 'Em analise';
        case 'RENTED':
            return 'Alugado';
        default:
            return status;
    }
}
