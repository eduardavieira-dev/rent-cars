'use client';

import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import type { LoginResponse } from '@/types/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Usa axios diretamente (sem a instância api) para evitar que o interceptor
            // de 401 redirecione para /login quando as credenciais forem inválidas.
            const { data } = await axios.post<LoginResponse>(`${BASE_URL}/login`, {
                username: email,
                password,
            });

            login(data.access_token);
            router.push('/dashboard');
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                setError('E-mail ou senha inválidos.');
            } else {
                setError('Não foi possível conectar ao servidor. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Rent Cars</h1>
                    <p className="text-sm text-gray-500 mt-1">Bem-vindo de volta. Faça login para continuar.</p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            E-mail
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Senha
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        />
                    </div>

                    {error && (
                        <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors cursor-pointer"
                    >
                        {isLoading ? 'Entrando…' : 'Entrar'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Não tem conta?{' '}
                    <Link href="/cadastro" className="text-blue-600 hover:underline font-medium">
                        Cadastre-se
                    </Link>
                </p>
            </div>
        </main>
    );
}
