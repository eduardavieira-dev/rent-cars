'use client';

import { ImagePlus, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useIMask } from 'react-imask';
import { toast } from 'sonner';

import CardCar from '@/components/card-car';
import { useAuth } from '@/hooks/useAuth';
import {
    createVehicle,
    deleteVehicleApi,
    fetchMyVehicles,
    fetchVehicles,
    updateVehicleApi,
    uploadVehicleImage,
} from '@/lib/vehicle-api';
import { statusLabel } from '@/lib/vehicle-store';
import type { Vehicle, VehicleStatus } from '@/types/vehicle';

function parseBRLCurrency(masked: string): number {
    return parseFloat(masked.replace(/\./g, '').replace(',', '.')) || 0;
}

function formatBRLForDisplay(value: number): string {
    return value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

type FormFieldErrors = Partial<
    Record<
        'registration' | 'year' | 'brand' | 'model' | 'plate' | 'description' | 'dailyRate',
        string
    >
>;

const emptyForm: Omit<Vehicle, 'id' | 'imageUrl' | 'status' | 'dailyRate'> = {
    registration: '',
    year: 0,
    brand: '',
    model: '',
    plate: '',
    description: null,
};

export default function VehiclesPage() {
    const { hasRole } = useAuth();
    const isCompany = hasRole('COMPANY');
    const isClient = hasRole('CLIENT');
    const isReviewer = hasRole('COMPANY') || hasRole('BANK');

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'ALL'>('ALL');
    const [formOpen, setFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [yearInput, setYearInput] = useState('');

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { ref: dailyRateIMaskRef, maskRef: dailyRateMaskRef } = useIMask({
        mask: Number,
        scale: 2,
        signed: false,
        thousandsSeparator: '.',
        padFractionalZeros: true,
        normalizeZeros: true,
        radix: ',',
        mapToRadix: ['.'],
    });
    const dailyRateRef = dailyRateIMaskRef as unknown as RefObject<HTMLInputElement>;
    const pendingDailyRate = useRef<string>('');

    useEffect(() => {
        if (!formOpen) return;
        const mask = dailyRateMaskRef.current;
        if (!mask) return;
        mask.value = pendingDailyRate.current;
    }, [formOpen]);

    useEffect(() => {
        let isActive = true;
        const load = async () => {
            try {
                setIsLoading(true);
                const data = isCompany ? await fetchMyVehicles() : await fetchVehicles();
                if (isActive) setVehicles(data);
            } catch {
                toast.error('Não foi possível carregar os veículos.');
            } finally {
                if (isActive) setIsLoading(false);
            }
        };
        load();
        return () => {
            isActive = false;
        };
    }, [isCompany]);

    async function refreshVehicles(): Promise<void> {
        try {
            setIsLoading(true);
            const data = isCompany ? await fetchMyVehicles() : await fetchVehicles();
            setVehicles(data);
        } catch {
            toast.error('Não foi possível atualizar os veículos.');
        } finally {
            setIsLoading(false);
        }
    }

    function handleOpenCreate(): void {
        setEditingId(null);
        setForm({ ...emptyForm });
        setYearInput('');
        setImageFile(null);
        setImagePreview(null);
        setExistingImageUrl(null);
        pendingDailyRate.current = '';
        setFieldErrors({});
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
            description: vehicle.description ?? null,
        });
        setYearInput(String(vehicle.year));
        setImageFile(null);
        setImagePreview(null);
        setExistingImageUrl(vehicle.imageUrl || null);
        pendingDailyRate.current =
            vehicle.dailyRate != null ? formatBRLForDisplay(vehicle.dailyRate) : '';
        setFieldErrors({});
        setFormOpen(true);
    }

    function handleImageChange(file: File | null): void {
        if (file) {
            setImageFile(file);
            const url = URL.createObjectURL(file);
            setImagePreview(url);
        } else {
            setImageFile(null);
            setImagePreview(null);
        }
    }

    function handleRemoveImage(): void {
        setImageFile(null);
        setImagePreview(null);
        setExistingImageUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        const errors: FormFieldErrors = {};

        if (!form.registration.trim()) errors.registration = 'Informe o registro do veículo.';

        const year = Number(yearInput);
        const currentYear = new Date().getFullYear();
        if (!yearInput || !year || Number.isNaN(year)) {
            errors.year = 'Informe um ano válido.';
        } else if (year > currentYear) {
            errors.year = `O ano não pode ser superior a ${currentYear}.`;
        }

        if (!form.brand.trim()) errors.brand = 'Informe a marca do veículo.';
        if (!form.model.trim()) errors.model = 'Informe o modelo do veículo.';
        if (!form.plate.trim()) errors.plate = 'Informe a placa do veículo.';

        const rawDailyRate = (dailyRateRef.current as HTMLInputElement | null)?.value ?? '';
        const parsedDailyRate = parseBRLCurrency(rawDailyRate);
        if (!rawDailyRate || parsedDailyRate <= 0)
            errors.dailyRate = 'Informe um valor diário válido maior que zero.';

        const description = form.description?.trim();
        if (!description) errors.description = 'Informe a descrição do veículo.';

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setFieldErrors({});
        const payload = { ...form, year, description: description!, dailyRate: parsedDailyRate };
        try {
            let vehicleId: string;
            if (editingId) {
                await updateVehicleApi({ id: editingId, ...payload });
                vehicleId = editingId;
                if (imageFile) await uploadVehicleImage(vehicleId, imageFile);
                toast.success('Veículo atualizado com sucesso.');
            } else {
                const created = await createVehicle(payload);
                vehicleId = created.id;
                if (imageFile) await uploadVehicleImage(vehicleId, imageFile);
                toast.success('Veículo cadastrado com sucesso.');
            }
            await refreshVehicles();
            setFormOpen(false);
        } catch {
            toast.error('Não foi possível salvar o veículo.');
        }
    }

    function handleDelete(vehicle: Vehicle): void {
        if (vehicle.status !== 'AVAILABLE') {
            toast.error('Somente veículos disponíveis podem ser desativados.');
            return;
        }
        toast('Deseja desativar este veículo?', {
            description: `${vehicle.brand} ${vehicle.model} • ${vehicle.plate}`,
            action: {
                label: 'Desativar',
                onClick: () => {
                    deleteVehicleApi(vehicle.id)
                        .then(() => refreshVehicles())
                        .then(() => toast.success('Veículo desativado com sucesso.'))
                        .catch(() => toast.error('Não foi possível desativar o veículo.'));
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
                    <h1 className="text-2xl font-bold">Veículos</h1>
                    <p className="text-muted-foreground">
                        {isCompany
                            ? 'Gerencie a frota e mantenha os dados atualizados.'
                            : 'Explore os veículos disponíveis e escolha o ideal.'}
                    </p>
                </div>
                {isCompany && (
                    <button
                        type="button"
                        onClick={handleOpenCreate}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold inline-flex cursor-pointer items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold"
                    >
                        <Plus size={16} />
                        Novo veículo
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
                            { label: 'Disponíveis', value: 'AVAILABLE' },
                            { label: 'Em análise', value: 'IN_REVIEW' },
                            { label: 'Alugados', value: 'RENTED' },
                        ] as Array<{ label: string; value: VehicleStatus | 'ALL' }>
                    ).map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() => setStatusFilter(item.value)}
                            className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
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
                        category={`Ano ${vehicle.year}`}
                        model={`${vehicle.brand} ${vehicle.model}`}
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
                    Nenhum veículo encontrado com os filtros atuais.
                </div>
            )}

            {formOpen && isCompany && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-background border-border w-full max-w-2xl rounded-2xl border p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">
                                {editingId ? 'Editar veículo' : 'Cadastrar veículo'}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setFormOpen(false)}
                                className="text-muted-foreground hover:bg-secondary inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors"
                                aria-label="Fechar"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2 text-sm">
                                <span>
                                    Registro <span className="text-destructive">*</span>
                                </span>
                                <input
                                    value={form.registration}
                                    onChange={(event) => {
                                        setForm((prev) => ({
                                            ...prev,
                                            registration: event.target.value,
                                        }));
                                        if (fieldErrors.registration)
                                            setFieldErrors((prev) => ({
                                                ...prev,
                                                registration: undefined,
                                            }));
                                    }}
                                    placeholder="ABC123"
                                    className="bg-secondary border-border rounded-lg border px-3 py-2"
                                />
                                {fieldErrors.registration && (
                                    <p className="text-destructive text-xs font-bold">
                                        {fieldErrors.registration}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2 text-sm">
                                <span>
                                    Ano <span className="text-destructive">*</span>
                                </span>
                                <input
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={yearInput}
                                    onChange={(event) => {
                                        setYearInput(event.target.value.replace(/\D/g, ''));
                                        if (fieldErrors.year)
                                            setFieldErrors((prev) => ({
                                                ...prev,
                                                year: undefined,
                                            }));
                                    }}
                                    placeholder="2024"
                                    className="bg-secondary border-border rounded-lg border px-3 py-2"
                                />
                                {fieldErrors.year && (
                                    <p className="text-destructive text-xs font-bold">
                                        {fieldErrors.year}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2 text-sm">
                                <span>
                                    Marca <span className="text-destructive">*</span>
                                </span>
                                <input
                                    value={form.brand}
                                    onChange={(event) => {
                                        setForm((prev) => ({
                                            ...prev,
                                            brand: event.target.value,
                                        }));
                                        if (fieldErrors.brand)
                                            setFieldErrors((prev) => ({
                                                ...prev,
                                                brand: undefined,
                                            }));
                                    }}
                                    placeholder="Toyota"
                                    className="bg-secondary border-border rounded-lg border px-3 py-2"
                                />
                                {fieldErrors.brand && (
                                    <p className="text-destructive text-xs font-bold">
                                        {fieldErrors.brand}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2 text-sm">
                                <span>
                                    Modelo <span className="text-destructive">*</span>
                                </span>
                                <input
                                    value={form.model}
                                    onChange={(event) => {
                                        setForm((prev) => ({
                                            ...prev,
                                            model: event.target.value,
                                        }));
                                        if (fieldErrors.model)
                                            setFieldErrors((prev) => ({
                                                ...prev,
                                                model: undefined,
                                            }));
                                    }}
                                    placeholder="Corolla"
                                    className="bg-secondary border-border rounded-lg border px-3 py-2"
                                />
                                {fieldErrors.model && (
                                    <p className="text-destructive text-xs font-bold">
                                        {fieldErrors.model}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2 text-sm">
                                <span>
                                    Placa <span className="text-destructive">*</span>
                                </span>
                                <input
                                    value={form.plate}
                                    onChange={(event) => {
                                        setForm((prev) => ({
                                            ...prev,
                                            plate: event.target.value,
                                        }));
                                        if (fieldErrors.plate)
                                            setFieldErrors((prev) => ({
                                                ...prev,
                                                plate: undefined,
                                            }));
                                    }}
                                    placeholder="ABC1D23"
                                    className="bg-secondary border-border rounded-lg border px-3 py-2"
                                />
                                {fieldErrors.plate && (
                                    <p className="text-destructive text-xs font-bold">
                                        {fieldErrors.plate}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2 text-sm">
                                <span>
                                    Valor diário (R$) <span className="text-destructive">*</span>
                                </span>
                                <input
                                    ref={dailyRateRef}
                                    placeholder="0,00"
                                    inputMode="decimal"
                                    onChange={() => {
                                        if (fieldErrors.dailyRate)
                                            setFieldErrors((prev) => ({
                                                ...prev,
                                                dailyRate: undefined,
                                            }));
                                    }}
                                    className="bg-secondary border-border rounded-lg border px-3 py-2"
                                />
                                {fieldErrors.dailyRate && (
                                    <p className="text-destructive text-xs font-bold">
                                        {fieldErrors.dailyRate}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2 text-sm sm:col-span-2">
                                <span>
                                    Descrição <span className="text-destructive">*</span>
                                </span>
                                <textarea
                                    value={form.description ?? ''}
                                    onChange={(event) => {
                                        setForm((prev) => ({
                                            ...prev,
                                            description: event.target.value || null,
                                        }));
                                        if (fieldErrors.description)
                                            setFieldErrors((prev) => ({
                                                ...prev,
                                                description: undefined,
                                            }));
                                    }}
                                    rows={3}
                                    placeholder="Descreva as características e diferenciais do veículo..."
                                    className="bg-secondary border-border resize-none rounded-lg border px-3 py-2 text-sm"
                                />
                                {fieldErrors.description && (
                                    <p className="text-destructive text-xs font-bold">
                                        {fieldErrors.description}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-2 text-sm sm:col-span-2">
                                <span>Imagem do veículo</span>
                                {imagePreview || existingImageUrl ? (
                                    <div className="border-border relative overflow-hidden rounded-lg border">
                                        <img
                                            src={imagePreview ?? existingImageUrl ?? ''}
                                            alt="Pré-visualização"
                                            className="h-44 w-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="bg-background/80 text-destructive hover:bg-background absolute top-2 right-2 cursor-pointer rounded-full p-1.5 backdrop-blur-sm transition-colors"
                                            aria-label="Remover imagem"
                                        >
                                            <X size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="bg-background/80 text-foreground hover:bg-background absolute right-2 bottom-2 cursor-pointer rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm transition-colors"
                                        >
                                            Alterar imagem
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-border hover:border-primary/60 hover:bg-secondary/60 flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 transition-colors"
                                    >
                                        <ImagePlus size={24} className="text-muted-foreground" />
                                        <span className="text-muted-foreground text-xs">
                                            Clique para selecionar uma imagem
                                        </span>
                                    </button>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                        handleImageChange(event.target.files?.[0] ?? null)
                                    }
                                    className="hidden"
                                />
                            </div>

                            <div className="flex items-end justify-end gap-2 sm:col-span-2">
                                <button
                                    type="button"
                                    onClick={() => setFormOpen(false)}
                                    className="text-secondary-foreground hover:bg-secondary cursor-pointer rounded-full px-4 py-2 text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer rounded-full px-5 py-2 text-sm font-semibold"
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
