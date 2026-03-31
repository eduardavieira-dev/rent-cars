'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import type { AuthUser, UserRole } from '@/types/auth';

const TOKEN_KEY = 'access_token';

function decodeToken(token: string): AuthUser | null {
    try {
        const payload = JSON.parse(atob(token.split('.')[1])) as AuthUser;
        if (payload.exp * 1000 < Date.now()) return null;
        return payload;
    } catch {
        return null;
    }
}

function persistToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
}

function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}

interface AuthContextValue {
    token: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string) => void;
    logout: () => void;
    hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem(TOKEN_KEY);
        if (stored) {
            const decoded = decodeToken(stored);
            if (decoded) {
                setToken(stored);
                setUser(decoded);
            } else {
                clearToken();
            }
        }
        setIsLoading(false);
    }, []);

    const login = useCallback((newToken: string) => {
        const decoded = decodeToken(newToken);
        if (!decoded) throw new Error('Token inválido ou expirado.');
        persistToken(newToken);
        setToken(newToken);
        setUser(decoded);
    }, []);

    const logout = useCallback(() => {
        clearToken();
        setToken(null);
        setUser(null);
    }, []);

    const hasRole = useCallback((role: UserRole) => user?.roles?.includes(role) ?? false, [user]);

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                hasRole,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuthContext must be used within AuthProvider');
    return context;
}
