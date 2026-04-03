interface CardCarProps {
    imageSrc: string;
    category: string;
    model: string;
    price: string;
    score: number;
}
export default function CardCar({ imageSrc, category, model, price, score }: CardCarProps) {
    return (
        <article className="h-full overflow-hidden rounded-xl border border-border bg-card cursor-pointer transition-all duration-300 ease-in-out hover:border-primary hover:bg-card/80">
            <div className="aspect-video w-full overflow-hidden bg-secondary">
                <img src={imageSrc} alt={model} className="h-full w-full object-cover object-center" />
            </div>
            <div className="p-4">
                <p className="text-[11px] uppercase tracking-wide text-primary">{category}</p>
                <h3 className="mt-1 font-semibold">{model}</h3>
                <div className="flex justify-between items-center mt-2">
                    <p className="text-sm font-bold text-primary">{price}</p>
                    <p className="text-xs text-muted-foreground"> <span className="text-yellow-500">★</span> {score}</p>
                </div>
            </div>
        </article>
    );
}