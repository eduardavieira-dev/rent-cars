import type { Vehicle, VehicleStatus } from '@/types/vehicle';

const API_BASE = '/api';

function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    const token = getAccessToken();
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        credentials: 'include',
    });

    if (!response.ok) {
        const errorBody = await response.text();
        const message =
            response.status === 403
                ? `❌ Acesso negado (403): Verifique se você está logado e tem permissão para acessar essa funcionalidade.`
                : `❌ Erro ${response.status}: ${errorBody || 'Erro desconhecido'}`;
        console.error(`[Vehicle API] Error on ${options.method || 'GET'} ${path}:`, message);
        throw new Error(message);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}

interface CarResponse {
    id: string;
    registrationCode: string;
    year: number;
    brand: string;
    model: string;
    plate: string;
    status: VehicleStatus;
    imageUrl?: string | null;
    companyId?: string;
    companyName?: string;
    description?: string | null;
    dailyRate?: number | null;
}

function mapCarToVehicle(car: CarResponse): Vehicle {
    return {
        id: car.id,
        registration: car.registrationCode,
        year: car.year,
        brand: car.brand,
        model: car.model,
        plate: car.plate,
        status: car.status,
        imageUrl: car.imageUrl ?? '/cars/car-1.png',
        description: car.description?.trim() || null,
        dailyRate: car.dailyRate ?? null,
    };
}

export async function fetchVehicles(): Promise<Vehicle[]> {
    const data = await request<CarResponse[]>('/vehicles');
    return data.map(mapCarToVehicle);
}

export async function fetchMyVehicles(): Promise<Vehicle[]> {
    const data = await request<CarResponse[]>('/vehicles/my-vehicles');
    return data.map(mapCarToVehicle);
}

export async function fetchVehicle(id: string): Promise<Vehicle> {
    const data = await request<CarResponse>(`/vehicles/${id}`);
    return mapCarToVehicle(data);
}

export async function createVehicle(payload: {
    registration: string;
    year: number;
    brand: string;
    model: string;
    plate: string;
    description: string;
    dailyRate: number;
}): Promise<Vehicle> {
    const data = await request<CarResponse>('/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            registrationCode: payload.registration,
            year: payload.year,
            brand: payload.brand,
            model: payload.model,
            plate: payload.plate,
            description: payload.description,
            dailyRate: payload.dailyRate,
        }),
    });

    return mapCarToVehicle(data);
}

export async function updateVehicleApi(payload: {
    id: string;
    registration: string;
    year: number;
    brand: string;
    model: string;
    plate: string;
    description: string;
    dailyRate: number;
}): Promise<Vehicle> {
    const data = await request<CarResponse>(`/vehicles/${payload.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            registrationCode: payload.registration,
            year: payload.year,
            brand: payload.brand,
            model: payload.model,
            plate: payload.plate,
            description: payload.description,
            dailyRate: payload.dailyRate,
        }),
    });

    return mapCarToVehicle(data);
}

export async function uploadVehicleImage(id: string, file: File): Promise<Vehicle> {
    const formData = new FormData();
    formData.append('image', file);

    const data = await request<CarResponse>(`/vehicles/${id}/image`, {
        method: 'PUT',
        body: formData,
    });

    return mapCarToVehicle(data);
}

export async function deleteVehicleApi(id: string): Promise<void> {
    await request<void>(`/vehicles/${id}`, { method: 'DELETE' });
}
