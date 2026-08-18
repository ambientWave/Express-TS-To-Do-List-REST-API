# To-Do List API

A small Express + TypeScript REST API that manages a to-do list backed by SQLite (`better-sqlite3`).
It supports the four CRUD operations — create, read, update, and delete — on tasks, search, filtering, and stats, and ships with interactive Swagger UI documentation at `/docs`.

## Screenshots
<img width="1918" height="901" alt="swagger_docs" src="https://github.com/user-attachments/assets/6e9e0667-8dd8-439b-a850-c8e1dcc6c706" />
<img width="1919" height="984" alt="DB_browser" src="https://github.com/user-attachments/assets/c1de0ca4-153b-4475-8af2-1b4f3f7663d8" />


## Why SQLite?

- **Single file**: The entire database is stored in a single disk file without needing external database engines.
- **Zero setup**: No configuration, servers to run, credentials to manage, or installation beyond the npm package.
- **Survives restarts**: Unlike an in-memory list, data persists across server restarts and crashes.

## Database Location & Initialization

- The database file is located at **`tasks.db`** in the project root.
- It is **created automatically** if missing on server startup, along with the `tasks` table schema.
- Three initial seed tasks are inserted automatically only on the first run (when the table is empty).
- `tasks.db` (and SQLite WAL/SHM files) are typically **git-ignored** so each clone or fresh environment starts cleanly.

## Layered Monolithic Architecture & DAO vs Repository

In this task, I aimed to learn and practice layered monolithic architecture. I even refactored my codebase into DTOs and DAOs. Finally, I clarified the distinction between the Repository and DAO layers, and when to use each separately or in combination. The following table highlights the differences clearly:

| Aspect | DAO (Data Access Object) | Repository |
|--------|--------------------------|------------|
| **Abstraction level** | Low—mirrors database structure closely | High—models domain concepts |
| **Concern** | How data is persisted (SQL, queries) | What data is needed for business logic |
| **Design focus** | Database-centric | Domain-centric (DDD influence) |
| **Typical use** | CRUD operations on tables | Business aggregate operations |
| **Query complexity** | Often exposes raw queries | Encapsulates complex queries into named methods |

### High-Level Architectural Schematic Diagram

```mermaid
flowchart TD
    Client(["🌐 Client / Front-end"])

    subgraph TransportLayer ["1. Presentation & Transport Layer"]
        MW["🛡️ Middleware Layer\n(Auth, Logging, Validation, Rate Limiting)"]
        Ctrl["🎮 Controllers / Routes\n(HTTP / REST / GraphQL Endpoints)"]
        ReqDTO["📦 Request DTO\n(Validated & Sanitized Input)"]
        ResDTO["📦 Response DTO / View Model\n(Filtered & Formatted Output)"]
    end

    subgraph DomainLayer ["2. Business Logic Layer"]
        Service["⚙️ Service Layer\n(Business Rules, Orchestration, Transactions)"]
        DomainModel["💎 Domain Models / Business Entities"]
    end

    subgraph PersistenceLayer ["3. Data Access & Persistence Layer"]
        Repo["📚 Repository Layer\n(Collection-oriented abstraction,\nDomain Entity mapping)"]
        DAO["💾 DAO Layer (Data Access Object)\n(Low-level CRUD, SQL / Query generation)"]
        DBEntity["🗄️ Raw Data / DB Entities"]
    end

    subgraph DataStorage ["4. Database / External Storage"]
        DB[("🗃️ Database (RDBMS / NoSQL)")]
    end

    %% Inbound flow
    Client -->|"1. HTTP Request (JSON/Params)"| MW
    MW -->|"2. Validated payload"| ReqDTO
    ReqDTO -->|"3. Injected into handler"| Ctrl
    Ctrl -->|"4. Calls domain logic (pass DTO / Domain Model)"| Service
    Service -.->|"Manipulates"| DomainModel
    Service -->|"5. Requests domain data"| Repo
    Repo -->|"6. Invokes low-level queries"| DAO
    DAO -->|"7. Executes SQL / Driver queries"| DB

    %% Outbound flow
    DB -->|"8. Raw Records / Rows"| DAO
    DAO -->|"9. DB Entities / Raw Data"| Repo
    Repo -->|"10. Maps to Domain Entities"| Service
    Service -->|"11. Returns Business Result"| Ctrl
    Ctrl -->|"12. Transforms to Response DTO"| ResDTO
    ResDTO -->|"13. HTTP Response (JSON)"| Client

    %% Styles
    classDef transport fill:#e1f5fe,stroke:#0288d1,stroke-width:2px,color:#01579b;
    classDef domain fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#4a148c;
    classDef persistence fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#1b5e20;
    classDef dtos fill:#fff3e0,stroke:#f57c00,stroke-width:1.5px,stroke-dasharray: 5 5,color:#e65100;
    classDef storage fill:#eceff1,stroke:#455a64,stroke-width:2px,color:#263238;

    class MW,Ctrl transport;
    class ReqDTO,ResDTO dtos;
    class Service,DomainModel domain;
    class Repo,DAO,DBEntity persistence;
    class DB storage;
```

## End-to-End Request/Response Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Client as 🌐 Client
    participant MW as 🛡️ Middleware
    participant Controller as 🎮 Controller / Route
    participant DTO as 📦 DTO (Req/Res)
    participant Service as ⚙️ Service
    participant Repo as 📚 Repository
    participant DAO as 💾 DAO
    participant DB as 🗄️ Database

    Client->>MW: HTTP Request (Headers + Body)
    Note over MW: Auth check, Rate limiting, Schema validation
    MW->>DTO: Deserialize & Validate into RequestDTO
    MW->>Controller: Route to handler (with RequestDTO)
    
    Controller->>Service: executeBusinessLogic(RequestDTO)
    Note over Service: Apply domain rules, calculate state, coordinate workflows
    
    Service->>Repo: findByCriteria(DomainFilter)
    Note over Repo: Abstract collection semantics (hides storage engine details)
    
    Repo->>DAO: executeQuery(querySpec / tableParams)
    Note over DAO: Table/Collection specific CRUD & raw queries
    
    DAO->>DB: SQL Query (SELECT / INSERT / UPDATE)
    DB-->>DAO: Raw Result Set / Row Data
    DAO-->>Repo: Raw DB Entity
    
    Note over Repo: Maps DB Entity ➔ Domain Model
    Repo-->>Service: Domain Model
    
    Note over Service: Completes business logic & invariants
    Service-->>Controller: Service Result / Domain Entity
    
    Note over Controller: Maps Domain Model ➔ ResponseDTO (masks sensitive fields)
    Controller-->>Client: HTTP 200 OK (ResponseDTO JSON)
```

## Layer Responsibilities & Separation of Concerns

| Layer / Component | Primary Responsibility | Input / Output | Key Patterns & Technologies |
| :--- | :--- | :--- | :--- |
| **Middleware** | Interception, authentication, CORS, rate-limiting, and input sanitization. | `Raw HTTP Request` ➔ `Enriched Context` | Chain of Responsibility, Interceptor |
| **DTO (Data Transfer Object)** | Decouples internal database/domain structures from public API contracts; enforces validation schemas. | `JSON/Query` ➔ `Typed Object` (and vice versa) | Data Transfer Object, Schema Validators (Zod, Joi, class-validator) |
| **Controller / Routes** | Parses HTTP status codes, handles headers/cookies, and maps requests to services. | `Request DTO` ➔ `Response DTO` | MVC, Front Controller |
| **Service Layer** | Implements core business logic, transaction boundaries, and orchestration. | `DTO / Domain Model` ➔ `Domain Result` | Transaction Script, Domain Service |
| **Repository Layer** | Emulates an in-memory collection of domain objects; mediates between domain models and data mapping. | `Domain Model` ➔ `Domain Model` | Repository Pattern, Data Mapper |
| **DAO Layer** | Direct low-level persistence operations (SQL/NoSQL query execution, table schemas). | `Domain/Query Params` ➔ `Raw DB Rows / Entities` | Data Access Object, Table Data Gateway |
| **Database** | Permanent storage engine. | `SQL / BSON / CQL` ➔ `Storage I/O` | PostgreSQL, MySQL, MongoDB, Redis |

## Install & Run

One documented command to install dependencies and start the server:

```bash
npm install && node src/app.ts
```

The server starts on **http://localhost:3000**.  
Interactive API docs are available at **http://localhost:3000/docs**.

## Endpoints

| Method   | Path         | Description                                                        | Success |
|----------|--------------|--------------------------------------------------------------------|---------|
| `GET`    | `/`          | API info (name, version, endpoints)                                | 200     |
| `GET`    | `/health`    | Health check (`{ "status": "ok" }`)                                | 200     |
| `GET`    | `/tasks`     | List tasks (supports `?done=true/false` and `?search=<query>`)    | 200     |
| `POST`   | `/tasks`     | Create a new task (`{ "title": "...", "done": false }`)            | 201     |
| `GET`    | `/tasks/:id` | Get a single task by ID                                            | 200     |
| `PUT`    | `/tasks/:id` | Update a task's `title` and/or `done`                              | 200     |
| `DELETE` | `/tasks/:id` | Delete a task                                                      | 204     |
| `GET`    | `/stats`     | Task statistics via SQL `COUNT()` (`{ total, done, open }`)         | 200     |
| `POST`   | `/reset`     | Reset database to the initial 3 seed tasks                         | 200     |

## Example

```bash
$ curl -i http://localhost:3000/tasks

HTTP/1.1 200 OK
Connection: keep-alive
Keep-Alive: timeout=5
Content-Length: 117
Content-Type: text/html; charset=utf-8
Date: Mon, 27 Jul 2026 01:42:05 GMT
ETag: W/"75-7hvHNFe4C9UBIYQ/i1+IZv+x3F..."

[{"id":1,"title":"Task 1","done":false},{"id":2,"title":"Task 2","done":true},{"id":3,"title":"Task 3","done":false}]
```
