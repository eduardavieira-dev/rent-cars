'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ProfileDangerZoneProps {
    isEditing: boolean;
    isSaving: boolean;
    isDeleting: boolean;
    onDeleteAccount: () => void;
}

export function ProfileDangerZone({
    isEditing,
    isSaving,
    isDeleting,
    onDeleteAccount,
}: ProfileDangerZoneProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    if (!isEditing) {
        return null;
    }

    return (
        <section className="border-destructive/40 bg-destructive/5 rounded-2xl border p-5">
            <h3 className="text-destructive text-sm font-semibold tracking-[0.16em] uppercase">
                Zona de risco
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">
                A exclusão desativa sua conta e você será desconectada imediatamente.
            </p>

            {!showDeleteConfirm ? (
                <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isSaving || isDeleting}
                    className="border-destructive/60 text-destructive mt-4 inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-medium disabled:opacity-60"
                >
                    <Trash2 size={14} />
                    Excluir conta
                </button>
            ) : (
                <div className="bg-card border-destructive/30 mt-4 space-y-3 rounded-xl border p-4">
                    <p className="text-sm font-medium">Tem certeza que deseja excluir sua conta?</p>
                    <p className="text-muted-foreground text-xs">
                        Esta ação vai desativar o acesso atual e encerrar sua sessão.
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isDeleting}
                            className="border-border text-foreground h-9 rounded-md border px-3 text-sm font-medium"
                        >
                            Voltar
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                onDeleteAccount();
                                setShowDeleteConfirm(false);
                            }}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground h-9 rounded-md px-3 text-sm font-medium disabled:opacity-60"
                        >
                            {isDeleting ? 'Excluindo...' : 'Confirmar exclusão'}
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}