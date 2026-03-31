# Instruções de Desenvolvimento — Rent Cars Front-end

Este documento serve como guia de referência para desenvolvedores e IAs que trabalham neste projeto. Leia-o antes de implementar qualquer nova funcionalidade.

---

## Índice

1. [Estrutura do Projeto](#estrutura-do-projeto)
2. [Variáveis de Ambiente](#variáveis-de-ambiente)
3. [Autenticação](#autenticação)
4. [Papéis de Usuário](#papéis-de-usuário)
5. [Proteção de Rotas](#proteção-de-rotas)
6. [Como Adicionar Novas Páginas](#como-adicionar-novas-páginas)
7. [Integração com a API](#integração-com-a-api)
8. [Convenções de Nomenclatura](#convenções-de-nomenclatura)
9. [Rotas Disponíveis](#rotas-disponíveis)

---

## Estrutura do Projeto

```
client/
├── .env.local                  # Variáveis de ambiente (não versionado)
├── .env.example                # Exemplo de variáveis de ambiente
├── docs/
│   └── INSTRUCOES.md           # Este arquivo
└── src/
    ├── app/
    │   ├── (public)/           # Rotas públicas (sem autenticação)
    │   │   ├── login/
    │   │   └── cadastro/
    │   │       ├── cliente/
    │   │       ├── banco/
    │   │       └── empresa/
    │   ├── (private)/          # Rotas privadas (qualquer usuário autenticado)
    │   │   ├── layout.tsx      # Guard: redireciona para /login se não autenticado
    │   │   ├── dashboard/
    │   │   ├── usuarios/
    │   │   ├── entidades-empregadoras/
    │   │   ├── vinculos-empregaticos/
    │   │   ├── (cliente)/      # Sub-grupo: apenas papel CLIENT
    │   │   │   ├── layout.tsx  # Guard: redireciona para /dashboard se não for CLIENT
    │   │   │   └── meus-vinculos/
    │   │   ├── (banco)/        # Sub-grupo: apenas papel BANK
    │   │   │   └── layout.tsx
    │   │   └── (empresa)/      # Sub-grupo: apenas papel COMPANY
    │   │       └── layout.tsx
    │   ├── not-found.tsx       # Página 404 global
    │   ├── layout.tsx          # Layout raiz (envolve com Providers)
    │   ├── page.tsx            # Redireciona / → /login
    │   └── providers.tsx       # Client component com AuthProvider
    ├── contexts/
    │   └── AuthContext.tsx     # Context de autenticação (estado global)
    ├── hooks/
    │   └── useAuth.ts          # Hook público de autenticação
    ├── lib/
    │   └── axios.ts            # Instância configurada do Axios
    ├── middleware.ts            # Proteção de rotas no servidor (via cookie)
    └── types/
        └── auth.ts             # Tipos TypeScript para autenticação
```

> Os grupos de rotas entre parênteses `(public)`, `(private)`, `(cliente)`, etc. são **invisíveis na URL**. São apenas uma forma de organizar layouts e proteções.

---

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto `client/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Todas as variáveis expostas ao browser devem ter o prefixo `NEXT_PUBLIC_`.

---

## Autenticação

### Como funciona

1. O usuário faz login via `POST /login` na API do back-end.
2. A API retorna um `access_token` (JWT).
3. O front-end armazena o token em dois lugares:
   - **`localStorage`** — para leitura client-side (hook, axios).
   - **Cookie `access_token`** — para leitura server-side (middleware Next.js).
4. O hook `useAuth` decodifica o JWT e expõe o estado de autenticação.
5. Ao fazer logout, ambos são apagados.

### Como usar o hook

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';

export default function MeuComponente() {
    const { user, isAuthenticated, token, login, logout, hasRole } = useAuth();

    return <div>{user?.sub}</div>;
}
```

### API do `useAuth`

| Propriedade / Método | Tipo | Descrição |
|---|---|---|
| `token` | `string \| null` | JWT bruto |
| `user` | `AuthUser \| null` | Payload decodificado do JWT |
| `isAuthenticated` | `boolean` | `true` quando há usuário válido |
| `isLoading` | `boolean` | `true` durante a leitura inicial do localStorage |
| `login(token)` | `(token: string) => void` | Persiste o token e atualiza o estado |
| `logout()` | `() => void` | Remove o token e limpa o estado |
| `hasRole(role)` | `(role: UserRole) => boolean` | Verifica se o usuário tem determinado papel |

### Estrutura do `AuthUser` (payload do JWT)

```typescript
interface AuthUser {
    sub: string;        // username/email do usuário
    roles: UserRole[];  // papéis: 'CLIENT' | 'BANK' | 'COMPANY'
    exp: number;        // timestamp de expiração (Unix)
    iat: number;        // timestamp de emissão (Unix)
}
```

> **Atenção:** Os nomes dos campos (`sub`, `roles`) dependem do que o back-end Micronaut inclui no JWT. Verifique o `AuthenticationProvider` no back-end se os campos forem diferentes.

---

## Papéis de Usuário

O back-end possui três tipos de usuário, representados como papéis no JWT:

| Papel | Constante `UserRole` | Descrição |
|---|---|---|
| Cliente | `'CLIENT'` | Pessoa física que aluga veículos |
| Banco | `'BANK'` | Instituição financeira |
| Empresa | `'COMPANY'` | Empresa locadora de veículos |

Use `hasRole('CLIENT')`, `hasRole('BANK')` ou `hasRole('COMPANY')` para verificar o papel do usuário logado.

---

## Proteção de Rotas

A proteção funciona em **duas camadas**:

### Camada 1 — Middleware (servidor)

Arquivo: `src/middleware.ts`

Roda no edge do Next.js e lê o **cookie** `access_token`. Redireciona automaticamente:
- Usuário sem token tentando acessar rota privada → `/login`
- Usuário com token tentando acessar `/login` ou `/cadastro` → `/dashboard`

> Para o middleware funcionar corretamente, a função `login()` do `useAuth` já seta o cookie automaticamente.

### Camada 2 — Guard de Layout (client-side)

Arquivo: `src/app/(private)/layout.tsx`

Verifica o estado do `AuthContext` no cliente. Garante que mesmo que o cookie expire ou seja manipulado, o componente não renderize sem autenticação válida.

### Proteção por papel (role)

Layouts nos sub-grupos `(cliente)/`, `(banco)/` e `(empresa)/` fazem a verificação de papel via `hasRole()` e redirecionam para `/dashboard` se o papel não bater.

---

## Como Adicionar Novas Páginas

### Página pública (sem login)

Crie o arquivo dentro de `src/app/(public)/`:

```
src/app/(public)/nova-rota/page.tsx
```

Acesso via URL: `/nova-rota`

### Página privada (qualquer usuário autenticado)

Crie dentro de `src/app/(private)/`:

```
src/app/(private)/nova-rota/page.tsx
```

Acesso via URL: `/nova-rota` — protegida automaticamente pelo `layout.tsx` do grupo.

### Página exclusiva por papel

Adicione dentro do sub-grupo correspondente:

```
src/app/(private)/(cliente)/nova-rota/page.tsx   → apenas CLIENT
src/app/(private)/(banco)/nova-rota/page.tsx     → apenas BANK
src/app/(private)/(empresa)/nova-rota/page.tsx   → apenas COMPANY
```

Acesso via URL: `/nova-rota` — protegida pelo `layout.tsx` do sub-grupo.

---

## Integração com a API

Use sempre a instância configurada `api` de `src/lib/axios.ts`. Ela automaticamente:
- Injeta o `Authorization: Bearer <token>` em todas as requisições.
- Redireciona para `/login` se receber `401 Unauthorized`.

### Exemplo de uso

```typescript
import api from '@/lib/axios';

async function listarUsuarios() {
    const response = await api.get('/users');
    return response.data;
}

async function criarVinculo(data: CreateEmploymentRequest) {
    const response = await api.post('/employments', data);
    return response.data;
}
```

### Endpoints disponíveis no back-end

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `POST` | `/login` | Pública | Login (retorna JWT) |
| `POST` | `/auth/register/client` | Pública | Cadastro de cliente |
| `POST` | `/auth/register/bank` | Pública | Cadastro de banco |
| `POST` | `/auth/register/company` | Pública | Cadastro de empresa |
| `GET` | `/users` | JWT | Lista todos os usuários |
| `GET` | `/users/:id` | JWT | Busca usuário por ID |
| `PUT` | `/users/client/:id` | JWT | Atualiza cliente |
| `PUT` | `/users/bank/:id` | JWT | Atualiza banco |
| `PUT` | `/users/company/:id` | JWT | Atualiza empresa |
| `DELETE` | `/users/:id` | JWT | Remove usuário |
| `GET` | `/employer-entities` | JWT | Lista entidades empregadoras |
| `POST` | `/employer-entities` | JWT | Cria entidade empregadora |
| `GET` | `/employer-entities/:id` | JWT | Busca entidade por ID |
| `PUT` | `/employer-entities/:id` | JWT | Atualiza entidade |
| `DELETE` | `/employer-entities/:id` | JWT | Remove entidade |
| `GET` | `/employments` | JWT | Lista vínculos empregatícios |
| `POST` | `/employments` | JWT | Cria vínculo |
| `GET` | `/employments/:id` | JWT | Busca vínculo por ID |
| `GET` | `/employments/client/:clientId` | JWT | Vínculos de um cliente |
| `PUT` | `/employments/:id` | JWT | Atualiza vínculo |
| `DELETE` | `/employments/:id` | JWT | Remove vínculo |

---

## Convenções de Nomenclatura

| Item | Convenção | Exemplo |
|---|---|---|
| Arquivos de componentes | `PascalCase` | `UserCard.tsx` |
| Hooks | `camelCase` com prefixo `use` | `useAuth.ts` |
| Arquivos de lib/util | `camelCase` | `axios.ts` |
| Tipos/Interfaces | `PascalCase` | `AuthUser` |
| Variáveis e funções | `camelCase` | `isAuthenticated` |
| Rotas (URL) | `kebab-case` em português | `/entidades-empregadoras` |
| Títulos visíveis na UI | Português (pt-BR) | `"Vínculos Empregatícios"` |
| Código (variáveis, funções) | Inglês | `earnedIncome`, `jobTitle` |

---

## Rotas Disponíveis

### Públicas

| URL | Página | Componente |
|---|---|---|
| `/login` | Login | `(public)/login/page.tsx` |
| `/cadastro` | Cadastro (seleção de tipo) | `(public)/cadastro/page.tsx` |
| `/cadastro/cliente` | Cadastro de Cliente | `(public)/cadastro/cliente/page.tsx` |
| `/cadastro/banco` | Cadastro de Banco | `(public)/cadastro/banco/page.tsx` |
| `/cadastro/empresa` | Cadastro de Empresa | `(public)/cadastro/empresa/page.tsx` |

### Privadas (qualquer usuário autenticado)

| URL | Página | Componente |
|---|---|---|
| `/dashboard` | Painel | `(private)/dashboard/page.tsx` |
| `/usuarios` | Usuários | `(private)/usuarios/page.tsx` |
| `/usuarios/:id` | Detalhes do Usuário | `(private)/usuarios/[id]/page.tsx` |
| `/usuarios/:id/editar` | Editar Usuário | `(private)/usuarios/[id]/editar/page.tsx` |
| `/entidades-empregadoras` | Entidades Empregadoras | `(private)/entidades-empregadoras/page.tsx` |
| `/entidades-empregadoras/nova` | Nova Entidade | `(private)/entidades-empregadoras/nova/page.tsx` |
| `/entidades-empregadoras/:id` | Detalhes da Entidade | `(private)/entidades-empregadoras/[id]/page.tsx` |
| `/entidades-empregadoras/:id/editar` | Editar Entidade | `(private)/entidades-empregadoras/[id]/editar/page.tsx` |
| `/vinculos-empregaticos` | Vínculos Empregatícios | `(private)/vinculos-empregaticos/page.tsx` |
| `/vinculos-empregaticos/novo` | Novo Vínculo | `(private)/vinculos-empregaticos/novo/page.tsx` |
| `/vinculos-empregaticos/:id` | Detalhes do Vínculo | `(private)/vinculos-empregaticos/[id]/page.tsx` |
| `/vinculos-empregaticos/:id/editar` | Editar Vínculo | `(private)/vinculos-empregaticos/[id]/editar/page.tsx` |

### Privadas — Papel CLIENT

| URL | Página | Componente |
|---|---|---|
| `/meus-vinculos` | Meus Vínculos Empregatícios | `(private)/(cliente)/meus-vinculos/page.tsx` |

### Privadas — Papel BANK

> Nenhuma rota exclusiva ainda. Adicione dentro de `(private)/(banco)/`.

### Privadas — Papel COMPANY

> Nenhuma rota exclusiva ainda. Adicione dentro de `(private)/(empresa)/`.
