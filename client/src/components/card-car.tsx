interface CardCarProps {
    imageSrc: string;
    category: string;
    model: string;
    price: string;
    score: number;
}
export default function CardCar({ imageSrc, category, model, price, score }: CardCarProps) {
    return (
        <article className="border-border bg-card hover:border-primary hover:bg-card/80 h-full cursor-pointer overflow-hidden rounded-xl border transition-all duration-300 ease-in-out">
            <div className="bg-secondary aspect-video w-full overflow-hidden">
                <img
                    src={imageSrc}
                    alt={model}
                    className="h-full w-full object-cover object-center"
                />
            </div>
            <div className="p-4">
                <p className="text-primary text-[11px] tracking-wide uppercase">{category}</p>
                <h3 className="mt-1 font-semibold">{model}</h3>
                <div className="mt-2 flex items-center justify-between">
                    <p className="text-primary text-sm font-bold">{price}</p>
                    <p className="text-muted-foreground text-xs">
                        {' '}
                        <span className="text-yellow-500">★</span> {score}
                    </p>
                </div>
            </div>
        </article>
    );
}
