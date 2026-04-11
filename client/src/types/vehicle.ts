export type VehicleStatus = 'AVAILABLE' | 'IN_REVIEW' | 'RENTED' | 'UNAVAILABLE';

export interface Vehicle {
    id: string;
    registration: string;
    year: number;
    brand: string;
    model: string;
    plate: string;
    category: string;
    pricePerDay: number;
    rating: number;
    imageUrl: string;
    status: VehicleStatus;
}

export type DecisionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type RentalRequestStatus = 'IN_REVIEW' | 'APPROVED' | 'REJECTED';

export interface RentalRequest {
    id: string;
    vehicleId: string;
    vehicleLabel: string;
    clientEmail: string;
    createdAt: string;
    status: RentalRequestStatus;
    bankDecision: DecisionStatus;
    companyDecision: DecisionStatus;
    monthlyPrice: number;
    durationMonths: number;
}

export interface Contract {
    id: string;
    vehicleId: string;
    vehicleLabel: string;
    clientEmail: string;
    startDate: string;
    endDate: string;
    monthlyPrice: number;
}
