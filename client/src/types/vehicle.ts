export type VehicleStatus = 'AVAILABLE' | 'UNDER_REVIEW' | 'APPROVED' | 'UNAVAILABLE';

export interface Vehicle {
    id: string;
    registration: string;
    year: number;
    brand: string;
    model: string;
    plate: string;
    imageUrl: string;
    status: VehicleStatus;
    description?: string | null;
    dailyRate?: number | null;
}

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface RentalRequestResponse {
    id: string;
    vehicleId: string;
    vehiclePlate: string;
    vehicleModel: string;
    vehicleBrand: string;
    clientId: string;
    clientName: string;
    bankId: string;
    bankName: string;
    companyId: string;
    companyName: string;
    companyApproval: ApprovalStatus;
    bankApproval: ApprovalStatus;
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
