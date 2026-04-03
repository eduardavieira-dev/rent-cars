'use client';

import { Car } from '@phosphor-icons/react';

type BrandLogoSize = 'sm' | 'md' | 'lg';

interface BrandLogoProps {
    size?: BrandLogoSize;
    className?: string;
    textClassName?: string;
    label?: string;
}

const sizeMap = {
    sm: {
        box: 'w-9 h-9 rounded-xl',
        text: 'text-lg',
    },
    md: {
        box: 'w-10 h-10 rounded-xl',
        text: 'text-xl',
    },
    lg: {
        box: 'w-14 h-14 rounded-2xl',
        text: 'text-2xl',
    },
} as const;

function mergeClassNames(...classes: Array<string | undefined>): string {
    return classes.filter(Boolean).join(' ');
}

export function BrandLogo({
    size = 'md',
    className,
    textClassName,
    label = 'Rent Cars',
}: BrandLogoProps) {
    const config = sizeMap[size];

    return (
        <a href="/" className={mergeClassNames('flex items-center', className)}>
            <div className={mergeClassNames(' flex items-center justify-center shrink-0', config.box)}>
                <Car size="22" className="text-primary" />
            </div>
            <span
                className={mergeClassNames(
                    'font-heading font-bold text-primary tracking-tight',
                    config.text,
                    textClassName,
                )}
            >
                {label}
            </span>
        </a>
    );
}