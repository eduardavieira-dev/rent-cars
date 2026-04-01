'use client';

import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';

import api from '@/lib/axios';
import type { LoginResponse } from '@/types/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface EmployerEntity {
    id: string;
    name: string;
    cnpj: string;
}

interface FormState {
    name: string;
    email: string;
    password: string;
    phone: string;
    cpf: string;
    rg: string;
    address: string;
    profession: string;
    employerEntityId: string;
    newEmployerName: string;
    newEmployerCnpj: string;
}

const INITIAL_FORM: FormState = {
    name: '',
    email: '',
    password: '',
    phone: '',
    cpf: '',
    rg: '',
    address: '',
    profession: '',
    employerEntityId: '',
    newEmployerName: '',
    newEmployerCnpj: '',
};

const EMPLOYER_OPTION_NONE = '';
const EMPLOYER_OPTION_OTHER = 'outra';

export default function CadastroClientePage() {
    const router = useRouter();

    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [employerEntities, setEmployerEntities] = useState<EmployerEntity[]>([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Usa axios sem interceptors: o endpoint requer JWT e esta é uma página pública.
        // Se a requisição falhar (401 ou qualquer outro erro), o select ficará
        // apenas com a opção "Outra", sem redirecionar o usuário.
        axios
            .get<EmployerEntity[]>(`${BASE_URL}/employer-entities`)
            .then((res) => setEmployerEntities(res.data))
            .catch(() => {
                // Falha silenciosa — "Outra" sempre estará disponível
            });
    }, []);

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Passo 1: Cadastrar o cliente
            await api.post('/auth/register/client', {
                name: form.name,
                email: form.email,
                password: form.password,
                phone: form.phone,
                cpf: form.cpf,
                rg: form.rg || null,
                address: form.address || null,
                profession: form.profession || null,
            });

            // Passo 2: Se o usuário escolheu "Outra", criar a entidade empregadora.
            // Requer JWT — faz auto-login com as credenciais recém-cadastradas.
            if (form.employerEntityId === EMPLOYER_OPTION_OTHER) {
                try {
                    const { data: loginData } = await axios.post<LoginResponse>(`${BASE_URL}/login`, {
                        username: form.email,
                        password: form.password,
                    });
                    await axios.post(
                        `${BASE_URL}/employer-entities`,
                        { name: form.newEmployerName, cnpj: form.newEmployerCnpj },
                        {
                            headers: {
                                Authorization: `Bearer ${loginData.access_token}`,
                                'Content-Type': 'application/json',
                            },
                        },
                    );
                } catch {
                    // A entidade empregadora não foi criada, mas o cliente foi cadastrado.
                    // O usuário poderá criá-la após fazer login.
                }
            }

            router.push('/login');
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const status = err.response?.status;
                const message = (err.response?.data as { message?: string })?.message;

                if (status === 409) {
                    setError(message ?? 'E-mail ou CPF já cadastrado.');
                } else if (status === 400) {
                    setError(message ? `Dado inválido: ${message}` : 'Verifique os dados informados e tente novamente.');
                } else {
                    setError('Não foi possível completar o cadastro. Tente novamente.');
                }
            } else {
                setError('Não foi possível conectar ao servidor. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    }

    const isOtherEmployer = form.employerEntityId === EMPLOYER_OPTION_OTHER;

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Criar conta</h1>
                    <p className="text-sm text-gray-500 mt-1">Preencha os dados abaixo para se cadastrar como cliente.</p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    {/* Dados pessoais */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Nome completo <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            autoComplete="name"
                            minLength={3}
                            maxLength={100}
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Maria da Silva"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                E-mail <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="seu@email.com"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Senha <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                autoComplete="new-password"
                                minLength={6}
                                maxLength={100}
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Mínimo 6 caracteres"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                                CPF <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="cpf"
                                name="cpf"
                                type="text"
                                required
                                value={form.cpf}
                                onChange={handleChange}
                                placeholder="000.000.000-00"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                Telefone <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                required
                                autoComplete="tel"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="(11) 99999-9999"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                            />
                        </div>
                    </div>

                    {/* Dados opcionais */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="rg" className="block text-sm font-medium text-gray-700 mb-1">
                                RG
                            </label>
                            <input
                                id="rg"
                                name="rg"
                                type="text"
                                minLength={5}
                                maxLength={20}
                                value={form.rg}
                                onChange={handleChange}
                                placeholder="12.345.678-9"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                            />
                        </div>

                        <div>
                            <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">
                                Profissão
                            </label>
                            <input
                                id="profession"
                                name="profession"
                                type="text"
                                maxLength={100}
                                value={form.profession}
                                onChange={handleChange}
                                placeholder="Engenheira de Software"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                            Endereço
                        </label>
                        <input
                            id="address"
                            name="address"
                            type="text"
                            maxLength={200}
                            autoComplete="street-address"
                            value={form.address}
                            onChange={handleChange}
                            placeholder="Rua das Flores, 123 — Belo Horizonte, MG"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        />
                    </div>

                    {/* Empresa empregadora */}
                    <div className="pt-2 border-t border-gray-100">
                        <label htmlFor="employerEntityId" className="block text-sm font-medium text-gray-700 mb-1">
                            Empresa empregadora
                        </label>
                        <select
                            id="employerEntityId"
                            name="employerEntityId"
                            value={form.employerEntityId}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white"
                        >
                            <option value={EMPLOYER_OPTION_NONE}>Nenhuma / Não informar</option>
                            {employerEntities.map((entity) => (
                                <option key={entity.id} value={entity.id}>
                                    {entity.name}
                                </option>
                            ))}
                            <option value={EMPLOYER_OPTION_OTHER}>Outra (cadastrar nova)</option>
                        </select>
                    </div>

                    {/* Campos extras para nova empresa */}
                    {isOtherEmployer && (
                        <div className="space-y-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nova empresa empregadora</p>

                            <div>
                                <label htmlFor="newEmployerName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nome da empresa <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="newEmployerName"
                                    name="newEmployerName"
                                    type="text"
                                    required={isOtherEmployer}
                                    minLength={2}
                                    maxLength={150}
                                    value={form.newEmployerName}
                                    onChange={handleChange}
                                    placeholder="Empresa Ltda."
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white"
                                />
                            </div>

                            <div>
                                <label htmlFor="newEmployerCnpj" className="block text-sm font-medium text-gray-700 mb-1">
                                    CNPJ <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="newEmployerCnpj"
                                    name="newEmployerCnpj"
                                    type="text"
                                    required={isOtherEmployer}
                                    value={form.newEmployerCnpj}
                                    onChange={handleChange}
                                    placeholder="00.000.000/0001-00"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white"
                                />
                            </div>
                        </div>
                    )}

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
                        {isLoading ? 'Cadastrando…' : 'Criar conta'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Já tem conta?{' '}
                    <Link href="/login" className="text-blue-600 hover:underline font-medium">
                        Faça login
                    </Link>
                </p>
            </div>
        </main>
    );
}
