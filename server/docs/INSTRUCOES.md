# Instruções de Desenvolvimento — Back-end

Este documento define os padrões obrigatórios para desenvolvimento no back-end do projeto, visando garantir organização, clareza e manutenibilidade. Siga todas as instruções abaixo ao desenvolver novas funcionalidades ou ao realizar ajustes.

---

## Índice

1. [Estrutura do Projeto](#estrutura-do-projeto)
2. [Arquitetura em Camadas](#arquitetura-em-camadas)
3. [Guia para Novas Funcionalidades](#guia-para-novas-funcionalidades)
4. [Convenções de Código](#convenções-de-código)
5. [Convenções de Nomenclatura](#convenções-de-nomenclatura)
6. [Entidades e Modelos](#entidades-e-modelos)
7. [DTOs](#dtos)
8. [Repositórios](#repositórios)
9. [Serviços](#serviços)
10. [Controllers](#controllers)
11. [Exceções e Handlers](#exceções-e-handlers)
12. [Enumerações](#enumerações)
13. [Segurança e Autenticação](#segurança-e-autenticação)
14. [Variáveis de Ambiente](#variáveis-de-ambiente)
15. [Docker](#docker)
16. [Resumo](#resumo)

---

## Estrutura do Projeto

```
server/src/main/java/br/pucminas/
├── Application.java
├── controller/          # Controllers REST (endpoints HTTP)
├── service/             # Lógica de negócio
├── repository/          # Acesso a dados (JPA)
├── model/               # Entidades JPA
├── enums/               # Enumerações do domínio
├── dto/
│   ├── request/         # DTOs de entrada (request bodies)
│   └── response/        # DTOs de saída (response bodies)
├── exception/           # Exceções de domínio
│   └── handler/         # Exception handlers (traduzem exceções em respostas HTTP)
└── security/            # Autenticação e autorização (JWT)
```

---

## Arquitetura em Camadas

O projeto segue a arquitetura em camadas (Layered Architecture):

```
Controller → Service → Repository → Database
```

- **Controller**: Recebe requisições HTTP, delega ao Service e retorna respostas. Não contém lógica de negócio.
- **Service**: Contém toda a lógica de negócio, validações e orquestração. Retorna DTOs de resposta.
- **Repository**: Interface JPA para acesso a dados. Sem lógica de negócio.
- **Model**: Entidades JPA mapeadas para tabelas do banco de dados.
- **DTO**: Objetos de transferência para entrada e saída de dados. Nunca exponha entidades diretamente na API.

---

## Guia para Novas Funcionalidades

Ao criar uma nova funcionalidade (ex: CRUD de um novo recurso), siga esta ordem:

1. **Enum** (se necessário) → `enums/`
2. **Model** (entidade JPA) → `model/`
3. **DTOs** (request + response) → `dto/request/` e `dto/response/`
4. **Repository** → `repository/`
5. **Service** → `service/`
6. **Exceptions + Handlers** → `exception/` e `exception/handler/`
7. **Controller** → `controller/`
8. **Configurações** → `application.properties`, `.env`, `docker-compose.yml` (se necessário)

---

## Convenções de Código

- Todo o código (nomes de classes, métodos, variáveis, enums, endpoints) deve ser escrito em **inglês**.
- **Não utilize comentários** no código (`//`, `/* */`, Javadoc). O código deve ser autoexplicativo pela escolha de nomes claros e boa estrutura.
- Não utilize nomes genéricos como `data`, `info`, `temp`, `obj`. Prefira nomes descritivos e específicos.
- Não altere a estrutura de pacotes sem alinhamento prévio.
- Não adicione dependências ao `pom.xml` sem necessidade real e sem validação.

---

## Convenções de Nomenclatura

| Item                                | Convenção                                  | Exemplo                                        |
| ----------------------------------- | ------------------------------------------ | ---------------------------------------------- |
| Classes (entidades, services, etc.) | `PascalCase`                               | `VehicleService`, `RentalRequest`              |
| Interfaces (repositórios)           | `PascalCase` com sufixo `Repository`       | `VehicleRepository`                            |
| Métodos                             | `camelCase`                                | `findById`, `resolveCompany`                   |
| Variáveis e parâmetros              | `camelCase`                                | `companyEmail`, `rentalRequestId`              |
| Constantes e Enums                  | `UPPER_SNAKE_CASE`                         | `AVAILABLE`, `UNDER_REVIEW`                    |
| Pacotes                             | `lowercase`                                | `br.pucminas.controller`                       |
| Tabelas (JPA `@Table`)              | `snake_case` plural                        | `vehicles`, `rental_requests`                  |
| Colunas (JPA `@Column`)             | `snake_case`                               | `registration_code`, `company_id`              |
| Endpoints (URLs)                    | `kebab-case` plural                        | `/vehicles`, `/rental-requests`                |
| DTOs de request                     | `PascalCase` com prefixo de ação           | `CreateVehicleRequest`, `UpdateVehicleRequest` |
| DTOs de response                    | `PascalCase` com sufixo `Response`         | `VehicleResponse`, `RentalRequestResponse`     |
| Exceções                            | `PascalCase` com sufixo `Exception`        | `VehicleNotFoundException`                     |
| Handlers                            | `PascalCase` com sufixo `ExceptionHandler` | `VehicleNotFoundExceptionHandler`              |

---

## Entidades e Modelos

- Anotadas com `@Entity`, `@Table`, `@Introspected`.
- Usar `UUID` como tipo de ID com `@GeneratedValue(strategy = GenerationType.UUID)`.
- Construtor protegido vazio (`protected`) obrigatório para JPA.
- Construtor público com todos os campos (exceto `id`).
- Getters e setters explícitos (sem Lombok).
- Relacionamentos com `@ManyToOne`, `@OneToMany`, etc., sempre com `optional` e `nullable` definidos.
- Enums persistidos com `@Enumerated(EnumType.STRING)`.

```java
@Entity
@Table(name = "vehicles")
@Introspected
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String plate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleStatus status;

    @ManyToOne(optional = false)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    protected Vehicle() {}

    public Vehicle(String plate, VehicleStatus status, Company company) {
        this.plate = plate;
        this.status = status;
        this.company = company;
    }

    // getters e setters
}
```

---

## DTOs

- Usar Java `record` para imutabilidade.
- Anotados com `@Serdeable` e `@Introspected`.
- Validações com Bean Validation (`@NotBlank`, `@NotNull`, `@Size`, etc.).
- Separar em `dto/request/` (entrada) e `dto/response/` (saída).
- Campos opcionais anotados com `@Nullable`.

```java
@Serdeable
@Introspected
public record CreateVehicleRequest(
        @NotBlank @Size(max = 50) String registrationCode,
        @NotNull Integer year,
        @NotBlank @Size(max = 10) String plate) {
}
```

```java
@Serdeable
@Introspected
public record VehicleResponse(
        UUID id,
        String plate,
        String status,
        UUID companyId,
        String companyName) {
}
```

---

## Repositórios

- Interfaces que estendem `CrudRepository<Entity, UUID>`.
- Anotadas com `@Repository`.
- Utilizar convenção de nomes do Micronaut Data para queries derivadas.
- Não adicionar lógica de negócio.

```java
@Repository
public interface VehicleRepository extends CrudRepository<Vehicle, UUID> {

    boolean existsByPlate(String plate);

    boolean existsByPlateAndIdNot(String plate, UUID id);

    List<Vehicle> findByStatus(VehicleStatus status);

    List<Vehicle> findByCompanyId(UUID companyId);
}
```

---

## Serviços

- Anotados com `@Singleton`.
- Injeção de dependência via construtor (sem `@Inject`).
- Métodos que alteram dados devem ser anotados com `@Transactional`.
- Conversão de entidade para DTO via método privado `toResponse()`.
- Validações de unicidade e regras de negócio devem ficar no Service.
- Não lançar exceções genéricas; usar exceções de domínio específicas.

```java
@Singleton
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    @Transactional
    public VehicleResponse create(CreateVehicleRequest request) {
        validatePlateUniqueness(request.plate());
        Vehicle vehicle = new Vehicle(/* ... */);
        return toResponse(vehicleRepository.save(vehicle));
    }

    private VehicleResponse toResponse(Vehicle vehicle) {
        return new VehicleResponse(/* ... */);
    }
}
```

---

## Controllers

- Anotados com `@Controller("/recurso")` e `@Validated`.
- Segurança definida com `@Secured` (por role ou `IS_ANONYMOUS`/`IS_AUTHENTICATED`).
- Não contêm lógica de negócio — apenas delegam ao Service.
- `@Consumes` e `@Produces` explícitos.
- Upload de arquivos via `@Part` com `multipart/form-data`.
- Campos opcionais de upload anotados com `@Nullable`.
- Respostas de criação retornam `HttpResponse.created(body)`.
- Respostas de exclusão retornam `HttpResponse.noContent()`.

```java
@Controller("/vehicles")
@Validated
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @Post
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    @Secured({"COMPANY"})
    public HttpResponse<VehicleResponse> create(
            @Part("plate") String plate,
            @Nullable @Part("image") CompletedFileUpload image,
            Principal principal) {
        // delega ao service
    }

    @Get
    @Produces(MediaType.APPLICATION_JSON)
    @Secured(SecurityRule.IS_ANONYMOUS)
    public List<VehicleResponse> listAll() {
        return vehicleService.listAll();
    }
}
```

---

## Exceções e Handlers

### Exceção de domínio

- Estendem `RuntimeException`.
- Mensagem descritiva em inglês.
- Um arquivo por exceção em `exception/`.

```java
public class VehicleNotFoundException extends RuntimeException {
    public VehicleNotFoundException(UUID id) {
        super("Vehicle not found with id: " + id);
    }
}
```

### Handler

- Anotados com `@Produces`, `@Singleton`, `@Requires`.
- Implementam `ExceptionHandler<ExceptionType, HttpResponse<ErrorResponse>>`.
- Retornam o status HTTP adequado (404, 409, etc.).
- Um handler por exceção em `exception/handler/`.

```java
@Produces
@Singleton
@Requires(classes = {VehicleNotFoundException.class, ExceptionHandler.class})
public class VehicleNotFoundExceptionHandler
        implements ExceptionHandler<VehicleNotFoundException, HttpResponse<ErrorResponse>> {

    @Override
    @SuppressWarnings("rawtypes")
    public HttpResponse<ErrorResponse> handle(HttpRequest request, VehicleNotFoundException exception) {
        return HttpResponse.notFound(new ErrorResponse(exception.getMessage()));
    }
}
```

---

## Enumerações

- Localizadas no pacote `enums/`.
- Valores em `UPPER_SNAKE_CASE`.
- Persistidas como `STRING` no banco (`@Enumerated(EnumType.STRING)`).

```java
package br.pucminas.enums;

public enum VehicleStatus {
    AVAILABLE,
    UNDER_REVIEW,
    APPROVED,
    UNAVAILABLE
}
```

---

## Segurança e Autenticação

- Autenticação via JWT Bearer Token.
- Roles derivadas do tipo de usuário: `CLIENT`, `COMPANY`, `BANK`.
- Anotação `@Secured` nos controllers para controle de acesso:
  - `@Secured(SecurityRule.IS_ANONYMOUS)` — acesso público.
  - `@Secured(SecurityRule.IS_AUTHENTICATED)` — qualquer usuário autenticado.
  - `@Secured({"COMPANY"})` — apenas empresas.
  - `@Secured({"CLIENT"})` — apenas clientes.
  - `@Secured({"BANK"})` — apenas bancos.
- Usuário autenticado é acessado via `Principal principal` no controller.
- E-mail do usuário: `principal.getName()`.
- Resolução do usuário autenticado feita no Service (ex: `resolveCompany(email)`).

---

## Variáveis de Ambiente

As variáveis são definidas no arquivo `.env` na raiz do projeto e injetadas via `docker-compose.yml`.

| Variável                         | Descrição                                       |
| -------------------------------- | ----------------------------------------------- |
| `DB_NAME`                        | Nome do banco de dados PostgreSQL               |
| `DB_USER`                        | Usuário do banco de dados                       |
| `DB_PASSWORD`                    | Senha do banco de dados                         |
| `DB_PORT_HOST`                   | Porta exposta do PostgreSQL no host             |
| `APP_PORT`                       | Porta da aplicação Micronaut                    |
| `SECURITY_ENABLED`               | Ativar/desativar segurança JWT (`true`/`false`) |
| `JWT_GENERATOR_SIGNATURE_SECRET` | Chave secreta para assinatura JWT               |
| `CLOUDINARY_CLOUD_NAME`          | Nome da cloud no Cloudinary                     |
| `CLOUDINARY_API_KEY`             | Chave de API do Cloudinary                      |
| `CLOUDINARY_API_SECRET`          | Segredo de API do Cloudinary                    |

Para referenciar variáveis de ambiente no `application.properties`:

```properties
cloudinary.cloud-name=${CLOUDINARY_CLOUD_NAME}
```

Para injetar no código Java:

```java
@Value("${cloudinary.cloud-name}")
private String cloudName;
```

---

## Docker

- O build utiliza Dockerfile multi-stage (`maven:3.9.9-eclipse-temurin-21` → `eclipse-temurin:21-jre`).
- Comando de build: `mvn -B package`.
- Orquestração via `docker-compose.yml` na raiz do projeto.
- PostgreSQL 16-alpine com health check.
- Micronaut gerencia o schema automaticamente via Hibernate (`hbm2ddl.auto=update`).

### Comandos úteis

```bash
# Subir app + banco
docker-compose up -d --build

# Ver logs
docker-compose logs -f app

# Rebuild completo (limpa imagens locais)
docker-compose down --rmi local ; docker-compose up -d --build

# Reset total (apaga dados do banco)
docker-compose down -v ; docker-compose up -d --build
```

---

## Resumo

Siga sempre este documento e mantenha o padrão do projeto. Em caso de dúvida, consulte este arquivo ou peça revisão antes de implementar algo fora do padrão.
