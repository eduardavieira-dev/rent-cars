export type OwnershipType = 'CLIENT' | 'COMPANY' | 'BANK';
export type ContractStatus = 'ACTIVE' | 'TERMINATED';
export type CreditContractStatus = 'PENDING' | 'APPROVED' | 'GRANTED';

export interface ContractResponse {
    id: string;
    rentalRequestId: string;
    vehicleId: string;
    vehiclePlate: string;
    vehicleModel: string;
    vehicleBrand: string;
    clientId: string;
    clientName: string;
    companyId: string;
    companyName: string;
    bankId: string;
    bankName: string;
    signatureDate: string;
    value: number;
    ownership: OwnershipType;
    status: ContractStatus;
    terminatedAt: string | null;
    creditRequested: boolean;
    creditContractId: string | null;
}

export interface CreditContractResponse {
    id: string;
    contractId: string;
    bankId: string;
    bankName: string;
    interestRate: number;
    termMonths: number;
    status: CreditContractStatus;
    approvedAt: string | null;
    grantedAt: string | null;
}
