# 🚗 Rent Cars -  Aluguel de carros

O Rent Cars é um sistema web voltado à gestão de aluguel de automóveis, desenvolvido por estudantes de Engenharia de Software da PUC Minas — Artur Bomtempo Colen, Eduarda Vieira Gonçalves e Vitor Azevedo — como projeto acadêmico sob orientação do Prof. Dr. João Paulo Aramuni.

A aplicação permite que empresas e clientes cadastrem, consultem e gerenciem veículos, clientes, contratos e pedidos de aluguel de forma centralizada e organizada, contribuindo para maior eficiência no controle das operações.

Seu desenvolvimento tem como objetivo aplicar, na prática, conceitos fundamentais da Engenharia de Software, como arquitetura MVC, modelagem UML e boas práticas de desenvolvimento. Além disso, o projeto proporciona experiência com tecnologias modernas, documentação técnica e trabalho colaborativo em equipe.

---

## 🚧 Status do Projeto e Tecnologias

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow?style=for-the-badge)
![Versão](https://img.shields.io/badge/versão-1.0.0-blue?style=for-the-badge)
![Licença](https://img.shields.io/github/license/eduardavieira-dev/rent-cars?style=for-the-badge)

![Java](https://img.shields.io/badge/Java-21-007ec6?style=for-the-badge&logo=openjdk&logoColor=white)
![Micronaut](https://img.shields.io/badge/Micronaut-4.x-007ec6?style=for-the-badge&logo=micronaut&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-3.9+-007ec6?style=for-the-badge&logo=apachemaven&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-007ec6?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-24.x-007ec6?style=for-the-badge&logo=docker&logoColor=white)
![Docker Compose](https://img.shields.io/badge/Docker%20Compose-2.x-007ec6?style=for-the-badge&logo=docker&logoColor=white)

---

## 📚 Índice
- [Links Úteis](#-links-úteis)
- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Arquitetura](#-arquitetura)
  - [Exemplos de diagramas](#exemplos-de-diagramas)
- [Instalação e Execução](#-instalação-e-execução)
  - [Pré-requisitos](#pré-requisitos)
  - [Variáveis de Ambiente](#-variáveis-de-ambiente)
  - [Preparação do Projeto](#-preparação-do-projeto)
  - [Banco de Dados](#-banco-de-dados)
  - [Como Executar a Aplicação](#-como-executar-a-aplicação)
- [Deploy](#-deploy)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Testes](#-testes)
- [Demonstração](#-demonstração)
  - [Aplicativo Mobile](#-aplicativo-mobile)
  - [Aplicação Web](#-aplicação-web)
  - [Exemplo de saída no Terminal (para Back-end, API, CLI)](#-exemplo-de-saída-no-terminal-para-back-end-api-cli)
- [Testes](#-testes)
- [Documentações utilizadas](#-documentações-utilizadas)
- [Autores](#-autores)
- [Contribuição](#-contribuição)
- [Agradecimentos](#-agradecimentos)
- [Licença](#-licença)

---

## 🔗 Links Úteis
* 🌐 **Demo Online:** [Acesse a Aplicação Web](<link-da-demo-web>)
  > 💻 **Descrição:** Link para a aplicação em ambiente de produção (Ex: hospedado na Vercel, Netlify ou AWS S3).
* 📱 **Download Mobile:** [App Store](<link-app-store>) | [Google Play](<link-google-play>) | [APK Direto](<link-para-apk-direto>)
  > 📱 **Descrição:** Links diretos para download nas lojas de aplicativos (se aplicável) e para o arquivo de instalação direta no Android (APK).
* 📖 **Documentação:** [Leia a Wiki/Docs](<link-para-docs>)
  > 📚 **Descrição:** Acesso à documentação técnica completa do projeto (Ex: Swagger/OpenAPI para API, ou Wiki interna).

---

## 📝 Sobre o Projeto
Nesta seção, descreva de forma clara e objetiva **o propósito do seu projeto**, explicando:

- **Por que ele existe** — qual motivação levou à sua criação.  
- **Qual problema ele resolve** — que dor, necessidade ou oportunidade ele atende.  
- **Qual o contexto** — acadêmico, profissional, pessoal, experimental, etc.  
- **Onde ele pode ser utilizado** — cenários reais ou simulados.  

Procure responder perguntas como:
- *Qual foi a ideia inicial do projeto?*
- *O que ele entrega de valor ao usuário?*
- *Por que alguém utilizaria ou contribuiria com esse projeto?*
- *O que o torna relevante ou interessante?*

Escreva de forma objetiva, mas completa, para que qualquer pessoa entenda rapidamente **o que é** e **por que importa**.

> [!NOTE]
> Esta seção segue boas práticas de documentação profissional e deve ser ajustada conforme o tipo e o objetivo do seu projeto.

---

## ✨ Funcionalidades Principais
Liste as funcionalidades de forma clara e objetiva.

- 🔐 **Autenticação Segura:** Login, Cadastro e Recuperação de Senha.
- 📈 **Painel de Controle:** Visualização de dados em tempo real com gráficos.
- ⚙️ **Gerenciamento de CRUD:** Criação, Leitura, Atualização e Deleção de recursos (e.g., Usuários, Itens, Posts).
- 📊 **Relatórios Exportáveis:** Exportação de dados em PDF, CSV ou Excel.
- 🌐 **Internacionalização (i18n):** Suporte a múltiplos idiomas.
- 🧵 **Logs e Monitoramento:** Registro detalhado de atividades e análise de desempenho.
- 🔄 **Integração com APIs Externas:** Conexão com serviços de terceiros (pagamentos, mapas, autenticação, etc.).
- 📨 **Sistema de Notificações:** Envio de alertas por e-mail, push ou notificações internas.

---

## 🛠 Tecnologias Utilizadas

As seguintes ferramentas, frameworks e bibliotecas foram utilizados na construção deste projeto. Recomenda-se o uso das versões listadas (ou superiores) para garantir a compatibilidade.

### 💻 Front-end

* **Framework/Biblioteca:** Vue.js
* **Linguagem/Superset:** TypeScript
* **Estilização:** Tailwind CSS
* **Build Tool:** Vite

### 🖥️ Back-end

* **Linguagem:** Java 17
* **Framework:** Micronaut
* **Banco de Dados:** PostgreSQL
* **ORM:** JPA / Hibernate
* **Autenticação:** JWT

### 📱 Mobile (Opcional)

* **Framework:** [Ex: React Native, Flutter, Kotlin Multiplatform]
* **Ferramentas:** [Ex: Expo, Android Studio, Xcode]

### ⚙️ Infraestrutura & DevOps

* **Containerização:** Docker
* **Orquestração:** [Ex: Kubernetes (K8s)]
* **Cloud:** [Ex: AWS (EC2, RDS, S3), Vercel, Heroku, Google Cloud]
* **CI/CD:** [Ex: GitHub Actions, Jenkins, SonarQube]

---

## 🏗 Arquitetura

Descreva aqui a **arquitetura completa do sistema**, explicando como as camadas, módulos e componentes foram organizados. Informe também **por que** essa arquitetura foi escolhida e **quais problemas ela ajuda a resolver**.

Você pode incluir:

- **Visão geral da arquitetura** (ex.: camadas, módulos, microsserviços, monólito modular, hexagonal, MVC etc.)
- **Principais componentes** e o papel de cada um
- **Padrões de design adotados** (ex.: Repository, Service Layer, DTOs, Factory, Observer)
- **Fluxo de dados** entre as partes do sistema
- **Tecnologias utilizadas em cada camada**
- **Decisões arquiteturais importantes**
- **Trade-offs** ou limitações relevantes

### Exemplos de diagramas

Para melhor visualização e entendimento da estrutura do sistema, os diagramas principais estão organizados lado a lado.

| Diagrama de Arquitetura | Detalhe da Arquitetura |
| :---: | :---: |
| **Visão Geral (Macro)** | **Camada de Serviço (Micro)** |
| <img src="https://joaopauloaramuni.github.io/image/aramunilogo.png" alt="Diagrama de Visão Geral do Sistema" width="120px" height="120px"> | <img src="https://joaopauloaramuni.github.io/image/aramunilogo.png" alt="Diagrama de Componentes ou Serviço X" width="120px" height="120px"> |
| **Modelo de Dados (Entidades)** | **Fluxo de Autenticação** |
| <img src="https://joaopauloaramuni.github.io/image/aramunilogo.png" alt="Diagrama de Entidade-Relacionamento (DER)" width="120px" height="120px"> | <img src="https://joaopauloaramuni.github.io/image/aramunilogo.png" alt="Diagrama de Sequência de Login" width="120px" height="120px"> |
| **Infraestrutura (Cloud)** | **API Gateway (Rotas)** |
| <img src="https://joaopauloaramuni.github.io/image/aramunilogo.png" alt="Diagrama de Deploy na AWS/Vercel" width="120px" height="120px"> | <img src="https://joaopauloaramuni.github.io/image/aramunilogo.png" alt="Mapa de Endpoints da API" width="120px" height="120px"> |

---

## 🔧 Instalação e Execução

### Pré-requisitos
Certifique-se de que o usuário tenha o ambiente configurado:

* **Docker** (Necessário) — [Instale o Docker Desktop](https://www.docker.com/products/docker-desktop)
* **Docker Compose** (Incluído no Docker Desktop) — Para orquestração de múltiplos serviços
* **Git** (Opcional) — Para clonar o repositório

---

### 🔑 Variáveis de Ambiente

Crie um arquivo **`.env`** na raiz do projeto (mesmo nível do `docker-compose.yml`) com as configurações necessárias para o banco de dados e aplicação.

#### Back-end (Micronaut + PostgreSQL)

O arquivo `.env` precisa conter as seguintes variáveis:

| Variável | Descrição | Exemplo | Padrão |
| :--- | :--- | :--- | :--- |
| `DB_NAME` | Nome do banco de dados PostgreSQL. | `rentcars` | `rentcars` |
| `DB_USER` | Usuário do banco de dados. | `postgres` | `postgres` |
| `DB_PASSWORD` | Senha do banco de dados. | `postgres123` | `postgres` |
| `DB_PORT_HOST` | Porta exposta do PostgreSQL na máquina host. | `5432` | `5432` |
| `APP_PORT` | Porta onde a aplicação Micronaut será executada. | `8080` | `8080` |
| `SECURITY_ENABLED` | Ativar/desativar segurança JWT. | `false` ou `true` | `false` |
| `JWT_GENERATOR_SIGNATURE_SECRET` | Chave secreta para assinatura de tokens JWT. | `sua_chave_secreta_aqui` | (Obrigatório) |

**Exemplo de arquivo `.env`:**

```bash
# Database Configuration
DB_NAME=rentcars
DB_USER=postgres
DB_PASSWORD=postgres123
DB_PORT_HOST=5432

# Application Configuration
APP_PORT=8080

# Security Configuration
SECURITY_ENABLED=false
JWT_GENERATOR_SIGNATURE_SECRET=my-secret-key-change-in-production
```

> ⚠️ **Segurança:** Altere a senha do banco de dados e a chave JWT em **produção**. Nunca cometa o arquivo `.env` com valores reais em um repositório público.

### 📦 Preparação do Projeto

Clone o repositório e configure o arquivo de variáveis de ambiente.

1.  **Clone o Repositório:**

```bash
git clone <URL_DO_SEU_REPOSITÓRIO>
cd <pasta-do-projeto>
```

2.  **Crie o arquivo `.env`:**

Na raiz do projeto (mesmo nível do `docker-compose.yml`), crie um arquivo `.env` com as variáveis listadas na seção anterior.

```bash
# Exemplo:
DB_NAME=rentcars
DB_USER=postgres
DB_PASSWORD=postgres123
DB_PORT_HOST=5432
APP_PORT=8080
SECURITY_ENABLED=false
JWT_GENERATOR_SIGNATURE_SECRET=minha-chave-secreta
```

> 💡 **Dica:** Se o arquivo `.env` já existir no repositório, verifique se os valores estão corretos para seu ambiente.

---

### 💾 Banco de Dados (PostgreSQL)

O projeto utiliza **PostgreSQL 16** como banco de dados. O banco é automaticamente inicializado e gerenciado via **Docker Compose**.

**Schema do Banco:**
O Micronaut gerencia o schema automaticamente via **Hibernate** (`hbm2ddl.auto=update`), criando e atualizando as tabelas conforme necessário no startup da aplicação.

> ✅ **Nenhuma ação manual de migração é necessária** — o banco será criado automaticamente quando você rodar `docker-compose up`.

---

### ⚡ Como Executar a Aplicação

A aplicação roda completamente em Docker Compose com a API Micronaut e o banco de dados PostgreSQL.

#### 🐳 Docker Compose (Recomendado)

Esta é a forma mais simples e recomendada para rodar a aplicação completa localmente.

1. **Acesse a raiz do projeto:**

```bash
cd /Users/artur/Desktop/rent-cars
```

2. **Suba app + banco:**

```bash
docker-compose up -d --build
```

> 💡 O parâmetro `--build` reconstrói as imagens Docker com o código mais recente, e `-d` executa em segundo plano.

3. **Verifique se os containers estão rodando:**

```bash
docker-compose ps
```

Você deve ver:
- `rentcars-db` (PostgreSQL) com status `Healthy`
- `rentcars-app` (Micronaut API) com status `Running`

4. **Visualize os logs da aplicação:**

```bash
# Ver logs em tempo real
docker-compose logs -f app

# Ver apenas os últimos logs
docker-compose logs app
```

🚀 *A API estará disponível em **http://localhost:8080***

---

#### 📝 Testes Rápidos com cURL

Depois que a aplicação estiver rodando, você pode testar as rotas:

**Criar um novo usuário:**

```bash
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","email":"joao@example.com"}'
```

**Listar todos os usuários:**

```bash
curl http://localhost:8080/users
```

---

#### 🛑 Como Parar a Aplicação

**Parar containers (manter dados):**

```bash
docker-compose stop
```

**Parar e remover containers:**

```bash
docker-compose down
```

**Reset completo (limpar todos os dados):**

```bash
docker-compose down -v
docker-compose up -d --build
```

> ⚠️ O parâmetro `-v` remove os volumes, apagando todos os dados do banco de dados.

---

#### 🔧 Troubleshooting Rápido

| Problema | Solução |
| :--- | :--- |
| Erro: "no configuration file provided" | Execute o comando na raiz do projeto (onde está `docker-compose.yml`) |
| Erro: "port 8080 is already in use" | Altere `APP_PORT` no arquivo `.env` para outra porta (ex: `9090`) |
| Containers não iniciam | Verifique se o Docker Desktop está rodando e execute: `docker system prune` |
| Erro de conexão com banco | Verifique os logs: `docker-compose logs db` |

---

#### 📱 Verificar Saúde do Sistema

```bash
# Ver status detalhado
docker-compose ps

# Ver logs de um serviço específico
docker-compose logs app    # API
docker-compose logs db     # Banco de dados

# Acessar o banco PostgreSQL diretamente
docker-compose exec db psql -U postgres -d rentcars -c "\dt"
```
---

## 🚀 Deploy

Instruções para deploy em produção usando Docker.

1.  **Build das Imagens Docker:**
    Execute o build das imagens Docker.

```bash
# Na raiz do projeto, construir as imagens
cd /caminho/do/projeto
docker-compose build
```

2.  **Configuração do Ambiente de Produção:** Configure as variáveis de ambiente no arquivo `.env`.

> 🔑 **Variáveis Cruciais:** Configure credenciais seguras usando secret managers.

3.  **Execução em Produção:** A forma de execução depende do seu provedor (Docker, Kubernetes, Cloud Platforms).

---

## 📂 Estrutura de Pastas

Descreva o propósito das pastas principais.

```
.
├── .editorconfig                # ✍️ Padronização de estilo de código.
├── .env                         # 🔑 Variáveis de ambiente (NÃO versionado - adicionar ao .gitignore).
├── .env.example                 # 🧩 Exemplo de variáveis de ambiente necessárias.
├── .gitignore                   # 🧹 Ignora arquivos/pastas não versionadas (.env, target, etc.).
├── .github/                     # 🤖 CI/CD (Actions), templates de Issues e Pull Requests.
├── README.md                    # 📘 Documentação principal do projeto.
├── CONTRIBUTING.md              # 🤝 Guia de contribuição.
├── LICENSE                      # ⚖️ Licença do projeto.
├── docker-compose.yml           # 🐳 Orquestração dos containers (Micronaut API + PostgreSQL).
│
├── /server                      # 📁 API Micronaut (Back-end)
│   ├── pom.xml                  # 📦 Dependências Maven.
│   ├── Dockerfile               # 🐳 Build multi-stage: Maven + Java 21.
│   ├── mvnw / mvnw.bat          # 🔧 Maven Wrapper (cross-platform).
│   │
│   └── /src                     # 📂 Código-fonte
│       ├── /main/java/br/pucminas                # 📁 Código principal
│       │   ├── Application.java                  # 🚀 Ponto de entrada.
│       │   ├── /controller      # 🎛️ Controllers REST (endpoints).
│       │   ├── /service         # 🔧 Lógica de negócio.
│       │   ├── /repository      # 💾 Acesso a dados (JPA).
│       │   ├── /model           # 📋 Entidades/DTOs.
│       │   └── /...             # Outras camadas conforme necessário.
│       │
│       ├── /main/resources                       # 📁 Recursos
│       │   ├── application.properties            # ⚙️ Configurações da aplicação.
│       │   ├── logback.xml                       # 📝 Configuração de logs.
│       │   └── db/migration/                     # 📊 Scripts SQL (se usar Flyway/Liquibase).
│       │
│       └── /test/java                           # 🧪 Testes unitários e de integração.
│
├── /docs                        # 📚 Documentação do projeto
│   ├── /diagrams                # 📊 Diagramas (UML, arquitetura, etc.).
│   │   ├── /class-diagram       # 🏗️ Diagrama de classes.
│   │   ├── /package-diagram     # 📦 Diagrama de pacotes.
│   │   └── /use-case            # 👥 Diagramas de caso de uso.
│   │
│   └── /user-history            # 📖 Histórias de usuário e requisitos.
│
└── .vscode/                     # ⚙️ Configurações recomendadas do VS Code (opcional).
```

---

## 🧪 Testes

Execute os testes unitários da API Micronaut:
| **Tela Inicial (Home)** | **Tela de Perfil / Settings** |
| <img src="https://joaopauloaramuni.github.io/image/aramunilogo.png" alt="Tela 1 do Mobile" width="120px" height="120px"> | <img src="https://joaopauloaramuni.github.io/image/aramunilogo.png" alt="Tela 2 do Mobile" width="120px" height="120px"> |
| **Tela de Cadastro** | **Tela de Lista / Detalhes** |
| <img src="https://joaopauloaramuni.github.io/image/aramunilogo.png" alt="Tela 3 do Mobile" width="120px" height="120px"> | <img src="https://joaopauloaramuni.github.io/image/aramunilogo.png" alt="Tela 4 do Mobile" width="120px" height="120px"> |

### 🌐 Aplicação Web

Para melhor visualização, as telas principais estão organizadas lado a lado.

| Tela | Captura de Tela |
| :---: | :---: |
| **Página Inicial (Home)** | **Página de Login** |
| <img src="https://joaopauloaramuni.github.io/image/aramunilogo.png" alt="Tela Inicial da Aplicação Web" width="120px" height="120px"> | <img src="https://joaopauloaramuni.github.io/image/aramunilogo.png" alt="Tela de Login" width="120px" height="120px"> |
| **Cadastro de Clientes** | **Cadastro de Produtos** |
| <img src="https://joaopauloaramuni.github.io/image/aramunilogo.png" alt="Tela de Cadastro de Clientes" width="120px" height="120px"> | <img src="https://joaopauloaramuni.github.io/image/aramunilogo.png" alt="Tela de Cadastro de Produtos" width="120px" height="120px"> |
| **Dashboard (Visão Geral)** | **Página Admin / Configurações** |
| <img src="https://joaopauloaramuni.github.io/image/aramunilogo.png" alt="Tela de Dashboard" width="120px" height="120px"> | <img src="https://joaopauloaramuni.github.io/image/aramunilogo.png" alt="Tela Administrativa" width="120px" height="120px"> |

### 💻 Exemplo de Saída no Terminal (para Back-end, API, CLI)

Caso o projeto seja focado em serviços de Back-end (API, microserviço, CLI), utilize esta seção para demonstrar a interação com o sistema e a resposta esperada.

#### 1. Demonstração da API (Exemplo com cURL)

Mostra uma chamada simples para um endpoint da API (ex: GET de listagem).

```bash
# Chama o endpoint de listagem de usuários com o token de autenticação
curl -X GET 'http://localhost:3000/api/v1/users' \
     -H 'Authorization: Bearer <seu-jwt-token>'
```

**Saída Esperada:**
```json
{
  "total": 2,
  "users": [
    {
      "id": "1a2b3c",
      "name": "Prof. Aramuni",
      "email": "contato@exemplo.com",
      "status": "active"
    },
    {
      "id": "4d5e6f",
      "name": "Colaborador Teste",
      "email": "teste@exemplo.com",
      "status": "inactive"
    }
  ]
}
```

---

#### 2. Demonstração de Execução de CLI/Script

Mostra como executar uma ferramenta de linha de comando ou um script de manutenção do projeto (ex: rodar migrações ou um job agendado).

```bash
# Executa a ferramenta de validação de Schema
npm run cli validate:schema --target=production
```

**Saída Esperada:**
```text
[INFO] Iniciando validação do banco de dados...
[SUCCESS] 15/15 tabelas verificadas.
[WARNING] Coluna 'descricao' na tabela 'produtos' é nullable.
[SUCCESS] Validação concluída. Nenhum erro crítico encontrado.
Tempo de execução: 1.25s
```

---

## 🧪 Testes

### Testes Unitários e de Integração
Para rodar os testes da unidade e integração:

```
npm run test
```
*Ferramenta utilizada: Jest, Vitest, Mocha, etc.*

### Testes End-to-End (E2E)
Para rodar os testes de ponta a ponta (E2E):

```
npm run test:e2e
```
*Ferramenta utilizada: Cypress, Playwright, Selenium, etc.*

---

## 🔗 Documentações utilizadas

Liste aqui links para documentação técnica, referências de bibliotecas complexas ou guias de estilo que foram cruciais para o projeto.

* 📖 **Framework/Biblioteca (Front-end):** [Documentação Oficial do **React**](https://react.dev/reference/react)
* 📖 **Build Tool (Front-end):** [Guia de Configuração do **Vite**](https://vitejs.dev/config/)
* 📖 **Framework (Back-end):** [Documentação Oficial do **Spring Boot**](https://docs.spring.io/spring-boot/docs/current/reference/html/)
* 📖 **Containerização:** [Documentação de Referência do **Docker**](https://docs.docker.com/)
* 📖 **Guia de Estilo:** [**Conventional Commits** (Padrão de Mensagens)](https://www.conventionalcommits.org/en/v1.0.0/)
* 📖 **Documentação Interna:** [Design System do Projeto](./docs/design-system.md)

---

## 👥 Autores
Liste os principais contribuidores. Você pode usar links para seus perfis.

| 👤 Nome                  | 🖼️ Foto                                                                                                                                           | :octocat: GitHub                                                                                                                                                                                   | 💼 LinkedIn                                                                                                                                                                                                                          | 📤 Gmail                                                                                                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Artur Bomtempo Colen     | <div align="center"><img src="https://avatars.githubusercontent.com/u/96635074?v=4" width="70px" height="70px" style="object-fit: cover;"></div>  | <div align="center"><a href="https://github.com/arturbomtempo-dev"><img src="https://arturbomtempo-dev.github.io/artur-bomtempo-cdn/assets/icons/github.png" width="50px" height="50px"></a></div> | <div align="center"><a href="https://www.linkedin.com/in/artur-bomtempo/"><img src="https://arturbomtempo-dev.github.io/artur-bomtempo-cdn/assets/icons/linkedin.png" width="50px" height="50px"></a></div>                          | <div align="center"><a href="mailto:arturbcolen@gmail.com"><img src="https://arturbomtempo-dev.github.io/artur-bomtempo-cdn/assets/icons/gmail.png" width="50px" height="50px"></a></div>                |
| Eduarda Vieira Gonçalves | <div align="center"><img src="https://avatars.githubusercontent.com/u/159597766?v=4" width="70px" height="70px" style="object-fit: cover;"></div> | <div align="center"><a href="https://github.com/eduardavieira-dev"><img src="https://arturbomtempo-dev.github.io/artur-bomtempo-cdn/assets/icons/github.png" width="50px" height="50px"></a></div> | <div align="center"><a href="https://www.linkedin.com/in/eduarda-vieira-gon%C3%A7alves-01a584297/"><img src="https://arturbomtempo-dev.github.io/artur-bomtempo-cdn/assets/icons/linkedin.png" width="50px" height="50px"></a></div> | <div align="center"><a href="mailto:eduarda.vieira.goncalves7@gmail.com"><img src="https://arturbomtempo-dev.github.io/artur-bomtempo-cdn/assets/icons/gmail.png" width="50px" height="50px" ></a></div> |
| Vitor Azevedo | <div align="center"><img src="https://avatars.githubusercontent.com/u/116930371?v=4" width="70px" height="70px" style="object-fit: cover;"></div> | <div align="center"><a href="https://github.com/vitorazevedop7"><img src="https://arturbomtempo-dev.github.io/artur-bomtempo-cdn/assets/icons/github.png" width="50px" height="50px"></a></div> | <div align="center"><a href="https://www.linkedin.com/in/vitor-azevedo-293609343/"><img src="https://arturbomtempo-dev.github.io/artur-bomtempo-cdn/assets/icons/linkedin.png" width="50px" height="50px"></a></div> | <div align="center"><a href="mailto:vitorazevedo.p7@gmail.com"><img src="https://arturbomtempo-dev.github.io/artur-bomtempo-cdn/assets/icons/gmail.png" width="50px" height="50px"></a></div> |



---

## 🤝 Contribuição
Guia para contribuições ao projeto.

1.  Faça um `fork` do projeto.
2.  Crie uma branch para sua feature (`git checkout -b feature/minha-feature`).
3. Commit suas mudanças (`git commit -m 'feat: Adiciona nova funcionalidade X'`). **(Utilize [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/))**
4.  Faça o `push` para a branch (`git push origin feature/minha-feature`).
5.  Abra um **Pull Request (PR)**.

> [!IMPORTANT]
> 📝 **Regras:** Por favor, verifique o arquivo [`CONTRIBUTING.md`](./CONTRIBUTING.md) para detalhes sobre nosso guia de estilo de código e o processo de submissão de PRs.

---
## 🙏 Agradecimentos

Esta seção reconhece as instituições, professores e iniciativas que contribuíram significativamente para a realização deste projeto acadêmico.

- [**Engenharia de Software PUC Minas**](https://www.instagram.com/engsoftwarepucminas/) - Pelo suporte institucional, infraestrutura acadêmica e incentivo à aplicação prática de conhecimentos técnicos em engenharia de software.

- [**Prof. Dr. João Paulo Aramuni**](https://github.com/joaopauloaramuni) - Pela orientação acadêmica e oportunidade oferecida para o desenvolvimento deste projeto, possibilitando a aplicação de conceitos e metodologias de engenharia de software em um contexto real.

- [**WebTech Network**](https://webtech.network/) - Projeto de extensão da PUC Minas que tem proporcionado oportunidades práticas para desenvolvimento de habilidades em tecnologias front-end e back-end, complementando a formação acadêmica com experiência aplicada em projetos reais.

---

## 📄 Licença

Este projeto é distribuído sob a **[Licença MIT](./LICENSE.md)**.