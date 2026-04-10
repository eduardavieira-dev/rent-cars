'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface StepInfo {
    label: string;
}

interface StepProgressBarProps {
    steps: StepInfo[];
    currentStep: number;
}

export function StepProgressBar({ steps, currentStep }: StepProgressBarProps) {
    return (
        <div className="flex w-full items-start">
            {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;
                const isLast = index === steps.length - 1;

                return (
                    <div key={step.label} className={`flex items-start ${isLast ? '' : 'flex-1'}`}>
                        <div className="flex shrink-0 flex-col items-center">
                            <motion.div
                                initial={false}
                                animate={{
                                    backgroundColor: isCompleted
                                        ? 'var(--success)'
                                        : isActive
                                          ? 'var(--primary)'
                                          : 'var(--border)',
                                    borderColor: isCompleted
                                        ? 'var(--success)'
                                        : isActive
                                          ? 'var(--primary)'
                                          : 'var(--border)',
                                }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                className="flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold"
                            >
                                {isCompleted ? (
                                    <Check size={13} className="text-background" />
                                ) : (
                                    <span
                                        className={
                                            isActive
                                                ? 'text-primary-foreground'
                                                : 'text-muted-foreground'
                                        }
                                    >
                                        {index + 1}
                                    </span>
                                )}
                            </motion.div>

                            <span
                                className={`mt-1.5 text-center text-[11px] leading-tight font-medium whitespace-nowrap ${
                                    isActive
                                        ? 'text-foreground'
                                        : isCompleted
                                          ? 'text-success'
                                          : 'text-muted-foreground'
                                }`}
                            >
                                {step.label}
                            </span>
                        </div>

                        {!isLast && (
                            <div className="bg-border relative mx-3 mt-3.5 h-px flex-1 overflow-hidden">
                                <motion.div
                                    initial={false}
                                    animate={{ scaleX: isCompleted ? 1 : 0 }}
                                    transition={{ duration: 0.35, ease: 'easeOut' }}
                                    className="bg-success absolute inset-0 origin-left"
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
