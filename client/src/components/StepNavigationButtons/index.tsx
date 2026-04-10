'use client';

import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

interface StepNavigationButtonsProps {
    currentStep: number;
    totalSteps: number;
    onBack: () => void;
    onNext: () => void;
    isLoading?: boolean;
    submitLabel?: string;
    loadingLabel?: string;
}

export function StepNavigationButtons({
    currentStep,
    totalSteps,
    onBack,
    onNext,
    isLoading = false,
    submitLabel = 'Criar conta',
    loadingLabel = 'Cadastrando…',
}: StepNavigationButtonsProps) {
    const isLastStep = currentStep === totalSteps - 1;

    return (
        <div className="flex gap-3 pt-2">
            {currentStep > 0 && (
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isLoading}
                    className="border-border text-foreground flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-80 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <ArrowLeft size={15} />
                    Voltar
                </button>
            )}
            <button
                type="button"
                onClick={onNext}
                disabled={isLoading}
                className="bg-gradient-gold shadow-gold text-primary-foreground flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isLoading ? (
                    <>
                        <Loader2 size={15} className="animate-spin" />
                        {loadingLabel}
                    </>
                ) : isLastStep ? (
                    <>
                        {submitLabel} <ArrowRight size={15} />
                    </>
                ) : (
                    <>
                        Próximo <ArrowRight size={15} />
                    </>
                )}
            </button>
        </div>
    );
}
