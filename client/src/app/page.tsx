'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { BrandLogo } from '@/components/brand-logo';
import Footer from '@/components/Footer';
import CardCar from '@/components/card-car';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

const fleet = [
    {
        imageSrc: '/cars/car-1.png',
        category: 'Executivo',
        model: 'Sedan Executivo',
        price: 'R$ 189/dia',
        score: 4.8,
    },
    {
        imageSrc: '/cars/car-2.png',
        category: 'SUV',
        model: 'SUV Familiar',
        price: 'R$ 249/dia',
        score: 4.9,
    },
    {
        imageSrc: '/cars/car-3.png',
        category: 'Econômico',
        model: 'Hatch Econômico',
        price: 'R$ 99/dia',
        score: 4.7,
    },
    {
        imageSrc: '/cars/car-4.png',
        category: 'Utilitário',
        model: 'Pickup Adventure',
        price: 'R$ 299/dia',
        score: 4.8,
    },
];

const faq = [
    {
        q: 'Como posso alugar um carro?',
        a: 'Crie sua conta, faça login, escolha um veículo disponível e envie sua solicitação com comprovantes. Após análise, você recebe o retorno no sistema.',
    },
    {
        q: 'O que é necessário para aprovação do aluguel?',
        a: 'Documentos pessoais, comprovante de renda recente e dados de contato atualizados. O banco parceiro analisa as informações antes da aprovação final.',
    },
    {
        q: 'Posso acompanhar o status do meu pedido?',
        a: 'Sim. Dentro do painel você acompanha etapas como em análise, pendente, aprovado ou recusado em tempo real.',
    },
];

export default function Home() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [hasScrolled, setHasScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setHasScrolled(window.scrollY > 24);

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <main className="bg-background text-foreground min-h-screen">
            <section className="relative min-h-[80vh] overflow-hidden sm:min-h-[78vh]">
                <div className="absolute inset-0 bg-[url('/hero.png')] bg-cover bg-position-[62%_center] bg-no-repeat sm:bg-center" />
                <div className="to-background absolute inset-0 bg-linear-to-b from-black/75 via-black/65" />

                <header
                    className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
                        hasScrolled
                            ? 'border-border/60 bg-background/80 backdrop-blur-md'
                            : 'border-transparent bg-transparent'
                    }`}
                >
                    <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
                        <BrandLogo
                            size="sm"
                            className="gap-2.5"
                            textClassName="text-secondary-foreground"
                        />

                        <nav className="text-secondary-foreground hidden items-center gap-7 text-sm md:flex">
                            <a href="#home" className="hover:text-foreground transition-colors">
                                Home
                            </a>
                            <a href="#sobre" className="hover:text-foreground transition-colors">
                                Sobre
                            </a>
                            <a href="#frota" className="hover:text-foreground transition-colors">
                                Frota
                            </a>
                            <a href="#faq" className="hover:text-foreground transition-colors">
                                Perguntas
                            </a>
                        </nav>

                        <div className="hidden items-center gap-2 md:flex">
                            <Link
                                href="/cadastro"
                                className="border-primary text-primary hover:bg-primary/10 rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
                            >
                                Cadastrar
                            </Link>
                            <Link
                                href="/login"
                                className="bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
                            >
                                Entrar
                            </Link>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsMenuOpen((prev) => !prev)}
                            className="text-secondary-foreground hover:text-foreground inline-flex cursor-pointer items-center justify-center rounded-lg p-2 transition-colors md:hidden"
                            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
                            aria-expanded={isMenuOpen}
                        >
                            {isMenuOpen ? <X size={18} /> : <Menu size={20} />}
                        </button>
                    </div>
                </header>

                <div
                    className={`fixed inset-0 z-40 bg-black/55 transition-opacity duration-300 md:hidden ${
                        isMenuOpen
                            ? 'pointer-events-auto opacity-100'
                            : 'pointer-events-none opacity-0'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                    aria-hidden="true"
                />

                <aside
                    className={`border-border bg-background/95 fixed top-0 right-0 z-50 h-screen w-72 border-l p-6 backdrop-blur-md transition-transform duration-300 md:hidden ${
                        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                    aria-hidden={!isMenuOpen}
                >
                    <div className="mb-8 flex items-center justify-between">
                        <BrandLogo size="sm" textClassName="text-secondary-foreground" />
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen(false)}
                            className="border-border/70 text-secondary-foreground cursor-pointer rounded-lg border p-2"
                            aria-label="Fechar menu"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <nav className="text-secondary-foreground space-y-4 text-sm">
                        <a
                            href="#home"
                            onClick={() => setIsMenuOpen(false)}
                            className="hover:text-foreground block transition-colors"
                        >
                            Home
                        </a>
                        <a
                            href="#sobre"
                            onClick={() => setIsMenuOpen(false)}
                            className="hover:text-foreground block transition-colors"
                        >
                            Sobre
                        </a>
                        <a
                            href="#frota"
                            onClick={() => setIsMenuOpen(false)}
                            className="hover:text-foreground block transition-colors"
                        >
                            Frota
                        </a>
                        <a
                            href="#faq"
                            onClick={() => setIsMenuOpen(false)}
                            className="hover:text-foreground block transition-colors"
                        >
                            Perguntas
                        </a>
                    </nav>

                    <div className="mt-8 flex flex-col gap-3">
                        <Link
                            href="/cadastro"
                            onClick={() => setIsMenuOpen(false)}
                            className="border-primary text-primary hover:bg-primary/10 inline-flex rounded-full border px-5 py-2 text-sm font-semibold transition-colors"
                        >
                            Cadastrar
                        </Link>
                        <Link
                            href="/login"
                            onClick={() => setIsMenuOpen(false)}
                            className="bg-primary text-primary-foreground inline-flex rounded-full px-5 py-2 text-sm font-semibold"
                        >
                            Entrar
                        </Link>
                    </div>
                </aside>

                <div
                    id="home"
                    className="relative z-10 mx-auto flex min-h-[76vh] w-full max-w-6xl scroll-mt-28 items-center justify-center px-6 pt-28 pb-16 text-center sm:pt-24"
                >
                    <div className="mx-auto max-w-3xl">
                        <h1 className="font-heading text-foreground text-4xl leading-tight font-bold sm:text-5xl">
                            Gerencie e alugue veículos de forma simples e segura
                        </h1>
                        <p className="text-secondary-foreground mt-4 max-w-2xl text-sm sm:text-base">
                            O Rent Cars conecta clientes, empresas e banco em um único sistema para
                            tornar o processo de aluguel mais rápido, organizado e confiável.
                        </p>
                        <div className="mt-7 flex flex-wrap justify-center gap-3">
                            <Link
                                href="/cadastro"
                                className="bg-primary text-primary-foreground rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                            >
                                Alugar um carro
                            </Link>
                            <a
                                href="#sobre"
                                className="border-border bg-secondary/70 text-foreground hover:bg-secondary rounded-full border px-6 py-3 text-sm font-medium backdrop-blur-sm transition-colors"
                            >
                                Ver mais
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <section
                id="sobre"
                className="mx-auto w-full max-w-6xl scroll-mt-28 px-6 py-5 md:py-10"
            >
                <h2 className="font-heading text-center text-4xl font-bold">
                    O que é o Rent Cars?
                </h2>
                <p className="text-muted-foreground mx-auto mt-5 max-w-3xl text-center">
                    O Rent Cars é um sistema web desenvolvido para facilitar a gestão de aluguel de
                    veículos. Ele permite que clientes solicitem aluguéis, enquanto funcionários
                    acompanham e gerenciam todos os pedidos de forma centralizada.
                </p>

                <div className="mt-12 grid gap-3 p-0 sm:p-4">
                    <div className="border-border bg-card relative overflow-hidden rounded-2xl border">
                        <Image
                            src="/about/about-1.png"
                            alt="Painel principal do Rent Cars"
                            width={1400}
                            height={860}
                            className="h-auto w-full object-cover"
                            priority
                        />
                        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-transparent" />
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="border-border bg-card relative overflow-hidden rounded-2xl border">
                            <Image
                                src="/about/about-2.png"
                                alt="Visão operacional do sistema"
                                width={900}
                                height={620}
                                className="h-auto w-full object-cover"
                            />
                            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-transparent" />
                        </div>

                        <div className="border-border bg-card relative overflow-hidden rounded-2xl border">
                            <Image
                                src="/about/about-3.png"
                                alt="Visão da frota disponível"
                                width={900}
                                height={620}
                                className="h-auto w-full object-cover"
                            />
                            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-transparent" />
                        </div>
                    </div>
                </div>
            </section>

            <section id="frota" className="mx-auto w-full max-w-6xl scroll-mt-28 px-6 py-8">
                <h2 className="font-heading text-center text-4xl font-bold">
                    Conheça a nossa Frota
                </h2>
                <p className="text-muted-foreground mt-3 text-center">
                    As melhores condições para você reservar e aproveitar.
                </p>

                <div className="mt-10 grid gap-4 px-4 sm:grid-cols-2 sm:p-1 lg:grid-cols-4">
                    {fleet.map((car) => (
                        <CardCar
                            key={car.model}
                            imageSrc={car.imageSrc}
                            category={car.category}
                            model={car.model}
                            price={car.price}
                            score={car.score}
                        />
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <Link
                        href="/cadastro"
                        className="border-primary/60 text-primary hover:bg-primary/10 inline-flex rounded-full border px-5 py-2 text-sm font-medium transition-colors"
                    >
                        Ver toda frota
                    </Link>
                </div>
            </section>

            <section className="border-border bg-secondary/40 mt-10 border-y">
                <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-6 py-12 text-center sm:grid-cols-4">
                    <div>
                        <p className="text-primary text-4xl font-bold">500+</p>
                        <p className="text-muted-foreground mt-1 text-sm">Veículos</p>
                    </div>
                    <div>
                        <p className="text-primary text-4xl font-bold">15k+</p>
                        <p className="text-muted-foreground mt-1 text-sm">Clientes</p>
                    </div>
                    <div>
                        <p className="text-primary text-4xl font-bold">98%</p>
                        <p className="text-muted-foreground mt-1 text-sm">Satisfação</p>
                    </div>
                    <div>
                        <p className="text-primary text-4xl font-bold">50+</p>
                        <p className="text-muted-foreground mt-1 text-sm">Cidades</p>
                    </div>
                </div>
            </section>

            <section
                id="faq"
                className="mx-auto grid w-full max-w-6xl scroll-mt-28 gap-10 px-8 py-20 lg:grid-cols-2"
            >
                <div>
                    <h2 className="font-heading text-4xl font-bold">Perguntas Frequentes</h2>
                    <p className="text-muted-foreground mt-4">
                        Tire suas dúvidas sobre o funcionamento do Rent Cars e entenda como realizar
                        aluguéis de forma simples, rápida e segura.
                    </p>
                    <Link
                        href="/cadastro"
                        className="bg-primary text-primary-foreground mt-6 inline-flex rounded-full px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
                    >
                        Entrar em contato
                    </Link>
                </div>

                <div>
                    <Accordion type="single" collapsible className="w-full">
                        {faq.map((item, index) => (
                            <AccordionItem key={item.q} value={`item-${index}`}>
                                <AccordionTrigger>{item.q}</AccordionTrigger>
                                <AccordionContent>{item.a}</AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>

            <Footer />
        </main>
    );
}
