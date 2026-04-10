'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Circle, XCircle } from 'lucide-react';

interface PasswordRule {
    label: string;
    met: boolean;
    active: boolean;
}

interface PasswordStrengthCheckerProps {
    password: string;
    confirmPassword: string;
    visible: boolean;
}

export function PasswordStrengthChecker({
    password,
    confirmPassword,
    visible,
}: PasswordStrengthCheckerProps) {
    const hasTyped = password.length > 0;
    const hasConfirmTyped = confirmPassword.length > 0;
    const shouldShow = visible || hasTyped;

    const rules: PasswordRule[] = [
        {
            label: 'Mínimo 8 caracteres',
            met: password.length >= 8,
            active: hasTyped,
        },
        {
            label: 'Pelo menos uma letra',
            met: /[A-Za-z]/.test(password),
            active: hasTyped,
        },
        {
            label: 'Pelo menos um número',
            met: /\d/.test(password),
            active: hasTyped,
        },
        {
            label: 'Pelo menos um caractere especial',
            met: /[^A-Za-z\u00C0-\u00ff0-9]/.test(password),
            active: hasTyped,
        },
        {
            label: 'Senhas coincidem',
            met: hasTyped && hasConfirmTyped && password === confirmPassword,
            active: hasConfirmTyped,
        },
    ];

    return (
        <AnimatePresence>
            {shouldShow && (
                <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="border-border bg-card rounded-xl border p-3.5"
                >
                    <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                        {rules.map((rule) => (
                            <li key={rule.label} className="flex items-center gap-2 text-xs">
                                {rule.active ? (
                                    rule.met ? (
                                        <CheckCircle2 size={13} className="text-success shrink-0" />
                                    ) : (
                                        <XCircle size={13} className="text-destructive shrink-0" />
                                    )
                                ) : (
                                    <Circle size={13} className="text-muted-foreground shrink-0" />
                                )}
                                <span
                                    className={`transition-colors duration-200 ${
                                        rule.active
                                            ? rule.met
                                                ? 'text-success'
                                                : 'text-destructive'
                                            : 'text-muted-foreground'
                                    }`}
                                >
                                    {rule.label}
                                </span>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
