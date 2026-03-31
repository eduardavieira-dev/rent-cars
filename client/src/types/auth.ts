export type UserRole = 'CLIENT' | 'BANK' | 'COMPANY';

export interface AuthUser {
    sub: string;
    roles: UserRole[];
    exp: number;
    iat: number;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    username: string;
    roles: UserRole[];
}
