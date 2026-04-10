import { BrandLogo } from './brand-logo';

export default function Footer() {
    return (
        <footer className="border-border bg-background border-t">
            <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 md:grid-cols-4">
                <div>
                    <BrandLogo
                        size="sm"
                        className="gap-1"
                        textClassName="text-secondary-foreground"
                    />
                    <p className="text-muted-foreground mt-3 text-xs">
                        Sistema completo de aluguel e gestão de carros.
                    </p>
                </div>
                <div>
                    <p className="font-semibold">Navegação</p>
                    <ul className="text-muted-foreground mt-3 space-y-2 text-sm">
                        <li>
                            <a href="#sobre">Sobre</a>
                        </li>
                        <li>
                            <a href="#frota">Frota</a>
                        </li>
                        <li>
                            <a href="#faq">Perguntas</a>
                        </li>
                    </ul>
                </div>
                <div>
                    <p className="font-semibold">Serviços</p>
                    <ul className="text-muted-foreground mt-3 space-y-2 text-sm">
                        <li>Aluguel de carros</li>
                        <li>Análise financeira</li>
                        <li>Relatórios e dashboards</li>
                    </ul>
                </div>
                <div>
                    <p className="font-semibold">Contato</p>
                    <ul className="text-muted-foreground mt-3 space-y-2 text-sm">
                        <li>(31) 99999-9999</li>
                        <li>contato@rentcars.com</li>
                    </ul>
                </div>
            </div>

            <p className="border-border text-muted-foreground border-t py-4 text-center text-xs">
                © 2026 Rent Cars. Todos os direitos reservados.
            </p>
        </footer>
    );
}
