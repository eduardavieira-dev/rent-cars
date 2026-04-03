import type { Metadata } from 'next';
import { Geist, Geist_Mono, Raleway } from 'next/font/google';

import './globals.css';
import Providers from './providers';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

const raleway = Raleway({
    variable: '--font-raleway',
    subsets: ['latin'],
    weight: ['500', '600', '700', '800'],
});

export const metadata: Metadata = {
    title: 'Rent Cars',
    description: 'Sistema de gerenciamento de aluguel de automóveis',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="pt-BR"
            className={`${geistSans.variable} ${geistMono.variable} ${raleway.variable} h-full antialiased`}
        >
            <body className="flex min-h-full flex-col">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
