import type { Contract, DecisionStatus, RentalRequest, Vehicle, VehicleStatus } from '@/types/vehicle';

const VEHICLES_KEY = 'rentcars.vehicles.v1';
const REQUESTS_KEY = 'rentcars.rentalRequests.v1';
const CONTRACTS_KEY = 'rentcars.contracts.v1';

const seedVehicles: Vehicle[] = [
    {
        id: 'veh-1',
        registration: 'ABC123',
        year: 2024,
        brand: 'BMW',
        model: '320i',
        plate: 'ABC1D23',
        category: 'Sedan',
        pricePerDay: 350,
        rating: 4.8,
        imageUrl: '/cars/car-1.png',
        status: 'AVAILABLE',
    },
    {
        id: 'veh-2',
        registration: 'DEF567',
        year: 2023,
        brand: 'Mercedes',
        model: 'C200',
        plate: 'DEF5G67',
        category: 'Sedan',
        pricePerDay: 420,
        rating: 4.7,
        imageUrl: '/cars/car-2.png',
        status: 'AVAILABLE',
    },
    {
        id: 'veh-3',
        registration: 'GHI901',
        year: 2024,
        brand: 'Audi',
        model: 'A4',
        plate: 'GHI9J01',
        category: 'Sedan',
        pricePerDay: 380,
        rating: 4.6,
        imageUrl: '/cars/car-3.png',
        status: 'IN_REVIEW',
    },
    {
        id: 'veh-4',
        registration: 'JKL234',
        year: 2022,
        brand: 'Volvo',
        model: 'XC60',
        plate: 'JKL2M34',
        category: 'SUV',
        pricePerDay: 480,
        rating: 4.9,
        imageUrl: '/cars/car-4.png',
        status: 'RENTED',
    },
];

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

export function getVehicles(): Vehicle[] {
    const vehicles = readStorage<Vehicle[]>(VEHICLES_KEY, []);
    if (vehicles.length === 0) {
        writeStorage(VEHICLES_KEY, seedVehicles);
        return seedVehicles;
    }
    return vehicles;
}

export function saveVehicles(vehicles: Vehicle[]): void {
    writeStorage(VEHICLES_KEY, vehicles);
}

export function getVehicleById(id: string): Vehicle | undefined {
    return getVehicles().find((vehicle) => vehicle.id === id);
}

export function addVehicle(payload: Omit<Vehicle, 'id'>): Vehicle {
    const vehicles = getVehicles();
    const vehicle: Vehicle = { ...payload, id: createId('veh') };
    const updated = [vehicle, ...vehicles];
    saveVehicles(updated);
    return vehicle;
}

export function updateVehicle(id: string, changes: Partial<Vehicle>): Vehicle | null {
    const vehicles = getVehicles();
    let updatedVehicle: Vehicle | null = null;
    const updated = vehicles.map((vehicle) => {
        if (vehicle.id !== id) return vehicle;
        updatedVehicle = { ...vehicle, ...changes };
        return updatedVehicle;
    });
    saveVehicles(updated);
    return updatedVehicle;
}

export function deleteVehicle(id: string): void {
    updateVehicle(id, { status: 'UNAVAILABLE' });
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
        if (expired) {
            updateVehicle(contract.vehicleId, { status: 'AVAILABLE' });
        }
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
        monthlyPrice: Math.round(vehicle.pricePerDay * 30),
        durationMonths: 12,
    };

    saveRequests([request, ...requests]);
    updateVehicle(vehicle.id, { status: 'IN_REVIEW' });
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
    updateVehicle(request.vehicleId, { status: 'RENTED' });
    return updated;
}

function rejectRequest(request: RentalRequest): RentalRequest {
    updateVehicle(request.vehicleId, { status: 'AVAILABLE' });
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
    updateVehicle(contract.vehicleId, { status: 'AVAILABLE' });
}

export function statusLabel(status: VehicleStatus): string {
    switch (status) {
        case 'AVAILABLE':
            return 'Disponivel';
        case 'IN_REVIEW':
            return 'Em analise';
        case 'RENTED':
            return 'Alugado';
        case 'UNAVAILABLE':
            return 'Indisponivel';
        default:
            return status;
    }
}
