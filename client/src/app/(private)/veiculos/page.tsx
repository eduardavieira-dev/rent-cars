'use client';

import { useMemo, useState, useEffect } from 'react';
import { Plus, Search, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

import CardCar from '@/components/card-car';
import { useAuth } from '@/hooks/useAuth';
import {
    addVehicle,
    deleteVehicle,
    getVehicles,
    statusLabel,
    updateVehicle,
} from '@/lib/vehicle-store';
import type { Vehicle, VehicleStatus } from '@/types/vehicle';

const emptyForm: Omit<Vehicle, 'id'> = {
    registration: '',
    year: new Date().getFullYear(),
    brand: '',
    model: '',
    plate: '',
    category: '',
    pricePerDay: 320,
    rating: 4.6,
    imageUrl: '/cars/car-1.png',
    status: 'AVAILABLE',
};

export default function VehiclesPage() {
    const { hasRole } = useAuth();
    const isCompany = hasRole('COMPANY');
    const isClient = hasRole('CLIENT');
    const isReviewer = hasRole('COMPANY') || hasRole('BANK');

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'ALL'>('ALL');
    const [formOpen, setFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [priceInput, setPriceInput] = useState(String(emptyForm.pricePerDay));
    const [yearInput, setYearInput] = useState(String(emptyForm.year));
    const [ratingInput, setRatingInput] = useState(String(emptyForm.rating));

    useEffect(() => {
        setVehicles(getVehicles());
    }, []);

    function refreshVehicles(): void {
        setVehicles(getVehicles());
    }

    function handleOpenCreate(): void {
        setEditingId(null);
        setForm({ ...emptyForm });
        setPriceInput(String(emptyForm.pricePerDay));
        setYearInput(String(emptyForm.year));
        setRatingInput(String(emptyForm.rating));
        setFormOpen(true);
    }

    function handleOpenEdit(vehicle: Vehicle): void {
        setEditingId(vehicle.id);
        setForm({
            registration: vehicle.registration,
            year: vehicle.year,
            brand: vehicle.brand,
            model: vehicle.model,
            plate: vehicle.plate,
            category: vehicle.category,
            pricePerDay: vehicle.pricePerDay,
            rating: vehicle.rating,
            imageUrl: vehicle.imageUrl,
            status: vehicle.status,
        });
        setPriceInput(String(vehicle.pricePerDay));
        setYearInput(String(vehicle.year));
        setRatingInput(String(vehicle.rating));
        setFormOpen(true);
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        const price = Number(priceInput);
        const year = Number(yearInput);
        const rating = Number(ratingInput.replace(',', '.'));
        if (!price || Number.isNaN(price)) {
            toast.error('Informe um preco valido.');
            return;
        }
        if (!year || Number.isNaN(year)) {
            toast.error('Informe um ano valido.');
            return;
        }
        if (!rating || Number.isNaN(rating)) {
            toast.error('Informe uma avaliacao valida.');
            return;
        }
        if (rating < 0 || rating > 5) {
            toast.error('A avaliacao deve estar entre 0 e 5.');
            return;
        }
        const payload = { ...form, pricePerDay: price, year, rating };
        if (editingId) {
            updateVehicle(editingId, payload);
        } else {
            addVehicle(payload);
        }
        refreshVehicles();
        setFormOpen(false);
    }

    function handleDelete(vehicle: Vehicle): void {
        if (vehicle.status !== 'AVAILABLE') {
            toast.error('Somente veiculos disponiveis podem ser desativados.');
            return;
        }
        toast('Deseja desativar este veiculo?', {
            description: `${vehicle.brand} ${vehicle.model} • ${vehicle.plate}`,
            action: {
                label: 'Desativar',
                onClick: () => {
                    deleteVehicle(vehicle.id);
                    refreshVehicles();
                    toast.success('Veiculo desativado com sucesso.');
                },
            },
        });
    }

    const filteredVehicles = useMemo(() => {
        return vehicles.filter((vehicle) => {
            if (isClient && vehicle.status !== 'AVAILABLE') return false;
            if (statusFilter !== 'ALL' && vehicle.status !== statusFilter) return false;
            const query = search.toLowerCase();
            return (
                vehicle.brand.toLowerCase().includes(query) ||
                vehicle.model.toLowerCase().includes(query) ||
                vehicle.plate.toLowerCase().includes(query)
            );
        });
    }, [vehicles, search, statusFilter, isClient]);

    return (
        <section className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Veiculos</h1>
                    <p className="text-muted-foreground">
                        {isCompany
                            ? 'Gerencie a frota e mantenha os dados atualizados.'
                            : 'Explore os veiculos disponiveis e escolha o ideal.'}
                    </p>
                </div>
                {isCompany && (
                    <button
                        type="button"
                        onClick={handleOpenCreate}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold"
                    >
                        <Plus size={16} />
                        Novo veiculo
                    </button>
                )}
            </div>

            <div className="bg-gradient-card border-border/70 flex flex-wrap items-center gap-3 rounded-2xl border p-4">
                <div className="bg-secondary flex flex-1 items-center gap-2 rounded-full">
                    <Search size={16} className="text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Buscar por marca, modelo ou placa"
                        className="w-full bg-transparent text-sm outline-none"
                    />
                </div>
            </div>

            {isReviewer && (
                <div className="flex flex-wrap gap-2">
                    {(
                        [
                            { label: 'Todos', value: 'ALL' },
                            { label: 'Disponiveis', value: 'AVAILABLE' },
                            { label: 'Em analise', value: 'IN_REVIEW' },
                            { label: 'Alugados', value: 'RENTED' },
                            ...(isCompany
                                ? [{ label: 'Indisponiveis', value: 'UNAVAILABLE' }]
                                : []),
                        ] as Array<{ label: string; value: VehicleStatus | 'ALL' }>
                    ).map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() => setStatusFilter(item.value)}
                            className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                                statusFilter === item.value
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredVehicles.map((vehicle) => (
                    <CardCar
                        key={vehicle.id}
                        imageSrc={vehicle.imageUrl}
                        category={`${vehicle.year} · ${vehicle.category}`}
                        model={`${vehicle.brand} ${vehicle.model}`}
                        price={`R$ ${vehicle.pricePerDay}/dia`}
                        score={vehicle.rating}
                        href={`/veiculos/${vehicle.id}`}
                        statusLabel={statusLabel(vehicle.status)}
                        actions={
                            isCompany ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => handleOpenEdit(vehicle)}
                                        className="text-secondary-foreground hover:bg-primary/15 hover:text-primary inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors duration-200 ease-in-out"
                                    >
                                        <Pencil size={14} />
                                        Editar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(vehicle)}
                                        disabled={vehicle.status !== 'AVAILABLE'}
                                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                                            vehicle.status === 'AVAILABLE'
                                                ? 'text-destructive hover:bg-destructive/10 cursor-pointer'
                                                : 'text-muted-foreground cursor-not-allowed'
                                        }`}
                                    >
                                        <Trash2 size={14} />
                                        Desativar
                                    </button>
                                </>
                            ) : null
                        }
                    />
                ))}
            </div>

            {filteredVehicles.length === 0 && (
                <div className="border-border/70 bg-secondary/40 rounded-2xl border p-6 text-center text-sm">
                    Nenhum veiculo encontrado com os filtros atuais.
                </div>
            )}

            {formOpen && isCompany && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-background border-border w-full max-w-2xl rounded-2xl border p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">
                                {editingId ? 'Editar veiculo' : 'Cadastrar veiculo'}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setFormOpen(false)}
                                className="text-muted-foreground text-sm"
                            >
                                Fechar
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
                            <label className="grid gap-2 text-sm">
                                Registro
                                <input
                                    required
                                    value={form.registration}
                                    onChange={(event) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            registration: event.target.value,
                                        }))
                                    }
                                    placeholder="ABC123"
                                    className="bg-secondary border-border rounded-lg border px-3 py-2"
                                />
                            </label>
                            <label className="grid gap-2 text-sm">
                                Ano
                                <input
                                    required
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={yearInput}
                                    onChange={(event) =>
                                        setYearInput(event.target.value.replace(/\D/g, ''))
                                    }
                                    placeholder="2024"
                                    className="bg-secondary border-border rounded-lg border px-3 py-2"
                                />
                            </label>
                            <label className="grid gap-2 text-sm">
                                Marca
                                <input
                                    required
                                    value={form.brand}
                                    onChange={(event) =>
                                        setForm((prev) => ({ ...prev, brand: event.target.value }))
                                    }
                                    placeholder="Toyota"
                                    className="bg-secondary border-border rounded-lg border px-3 py-2"
                                />
                            </label>
                            <label className="grid gap-2 text-sm">
                                Modelo
                                <input
                                    required
                                    value={form.model}
                                    onChange={(event) =>
                                        setForm((prev) => ({ ...prev, model: event.target.value }))
                                    }
                                    placeholder="Corolla"
                                    className="bg-secondary border-border rounded-lg border px-3 py-2"
                                />
                            </label>
                            <label className="grid gap-2 text-sm">
                                Placa
                                <input
                                    required
                                    value={form.plate}
                                    onChange={(event) =>
                                        setForm((prev) => ({ ...prev, plate: event.target.value }))
                                    }
                                    placeholder="ABC1D23"
                                    className="bg-secondary border-border rounded-lg border px-3 py-2"
                                />
                            </label>
                            <label className="grid gap-2 text-sm">
                                Categoria
                                <input
                                    required
                                    value={form.category}
                                    onChange={(event) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            category: event.target.value,
                                        }))
                                    }
                                    placeholder="SUV"
                                    className="bg-secondary border-border rounded-lg border px-3 py-2"
                                />
                            </label>
                            <label className="grid gap-2 text-sm">
                                Preco/dia
                                <input
                                    required
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={priceInput}
                                    onChange={(event) => {
                                        const cleaned = event.target.value.replace(/\D/g, '');
                                        setPriceInput(cleaned);
                                    }}
                                    placeholder="350"
                                    className="bg-secondary border-border rounded-lg border px-3 py-2"
                                />
                            </label>
                            <label className="grid gap-2 text-sm">
                                Avaliacao
                                <input
                                    required
                                    inputMode="decimal"
                                    pattern="[0-9]+([\.,][0-9]+)?"
                                    value={ratingInput}
                                    onChange={(event) =>
                                        setRatingInput(event.target.value.replace(/[^0-9.,]/g, ''))
                                    }
                                    placeholder="4.8"
                                    className="bg-secondary border-border rounded-lg border px-3 py-2"
                                />
                            </label>
                            <label className="grid gap-2 text-sm sm:col-span-2">
                                URL da imagem
                                <input
                                    required
                                    value={form.imageUrl}
                                    onChange={(event) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            imageUrl: event.target.value,
                                        }))
                                    }
                                    placeholder="/cars/car-1.png"
                                    className="bg-secondary border-border rounded-lg border px-3 py-2"
                                />
                            </label>
                            {editingId && (
                                <label className="grid gap-2 text-sm">
                                    Status
                                    <select
                                        value={form.status}
                                        onChange={(event) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                status: event.target.value as VehicleStatus,
                                            }))
                                        }
                                        className="bg-secondary border-border rounded-lg border px-3 py-2"
                                    >
                                        <option value="AVAILABLE">Disponivel</option>
                                        <option value="IN_REVIEW">Em analise</option>
                                        <option value="RENTED">Alugado</option>
                                        <option value="UNAVAILABLE">Indisponivel</option>
                                    </select>
                                </label>
                            )}
                            <div className="flex items-end justify-end gap-2 sm:col-span-2">
                                <button
                                    type="button"
                                    onClick={() => setFormOpen(false)}
                                    className="text-secondary-foreground hover:bg-secondary rounded-full px-4 py-2 text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5 py-2 text-sm font-semibold"
                                >
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
