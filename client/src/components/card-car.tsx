import Link from 'next/link';
import type { ReactNode } from 'react';

interface CardCarProps {
    imageSrc: string;
    category?: string;
    model: string;
    price?: string;
    score?: number;
    href?: string;
    statusLabel?: string;
    actions?: ReactNode;
}

function CardContent({
    imageSrc,
    category,
    model,
    price,
    score,
    statusLabel,
    href,
    actions,
}: CardCarProps) {
    const Body = (
        <>
            <div className="bg-secondary relative aspect-16/10 w-full overflow-hidden">
                <img
                    src={imageSrc}
                    alt={model}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/65 via-black/15 to-transparent" />
                {statusLabel && (
                    <span className="bg-secondary/90 text-secondary-foreground absolute top-3 right-3 rounded-full px-3 py-1 text-[11px] font-semibold">
                        {statusLabel}
                    </span>
                )}
            </div>
            <div className="space-y-3 p-4">
                <div>
                    {category && (
                        <p className="text-primary text-[11px] font-semibold tracking-[0.2em] uppercase">
                            {category}
                        </p>
                    )}
                    <h3 className="mt-1 text-lg font-semibold">{model}</h3>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-primary text-sm font-bold">{price || 'Consulte valores'}</p>
                    {typeof score === 'number' && (
                        <p className="text-muted-foreground text-xs">
                            <span className="text-yellow-500">★</span> {score}
                        </p>
                    )}
                </div>
            </div>
        </>
    );

    return (
        <article className="border-border bg-card hover:border-primary/70 hover:bg-card/90 group flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 ease-in-out">
            {href ? (
                <Link href={href} className="block">
                    {Body}
                </Link>
            ) : (
                Body
            )}
            {actions && (
                <div className="border-border/60 bg-secondary/40 mt-auto flex items-center justify-between gap-2 border-t px-4 py-3">
                    {actions}
                </div>
            )}
        </article>
    );
}

export default function CardCar({ href, actions, ...props }: CardCarProps) {
    return <CardContent {...props} href={href} actions={actions} />;
}
