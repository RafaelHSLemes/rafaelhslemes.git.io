# SargentTasks – Catálogo de Tarefas (To‑Do Kanban) 12/01/2025

Projeto de portfólio com um Kanban simples (TODO, DOING, DONE) implementado em Java (Spring Boot + PostgreSQL + Thymeleaf). Inclui DTOs com MapStruct, validação, paginação, filtros por status, migrações com Flyway e um setup de Docker Compose para desenvolvimento local.

Autor: RafaelHSLemes

## Estrutura do Projeto

- `kanban-spring/`
  - `pom.xml`: Configuração Maven (Spring Boot, JPA, Validation, Thymeleaf, MapStruct, Flyway, Testcontainers).
  - `Dockerfile`: Build multi-stage da aplicação.
  - `src/main/java/com/example/kanban/`
    - `Application.java`: Classe principal Spring Boot.
    - `domain/Task.java`: Entidade JPA da Task (id, title, description, status, createdAt, updatedAt, userId).
    - `domain/TaskStatus.java`: Enum de status (TODO, DOING, DONE).
    - `repository/TaskRepository.java`: Repositório Spring Data JPA com filtros e paginação.
    - `dto/TaskDto.java`: DTO para exposições REST e View.
    - `dto/TaskCreateRequest.java`: DTO para criação com Bean Validation.
    - `dto/TaskUpdateRequest.java`: DTO para atualização com Bean Validation.
    - `mapper/TaskMapper.java`: Interface MapStruct (componentModel Spring) entre Entidade e DTOs.
    - `service/TaskService.java`: Regras de negócio (CRUD, filtro por status, paginação, validações de domínio).
    - `web/TaskRestController.java`: API REST `/api/tasks` (CRUD, filtro por status, paginação).
    - `web/TaskViewController.java`: Views Thymeleaf para Kanban simples.
  - `src/main/resources/`
    - `application.yml`: Configuração (datasource via variáveis de ambiente, JPA, Flyway, Thymeleaf).
    - `db/migration/V1__create_tasks.sql`: Migração Flyway para a tabela de tasks.
    - `templates/board.html`: View do Kanban com colunas por status.
    - `static/js/board.js`: JS leve para atualizar status e UX da view.
  - `src/test/java/com/example/kanban/`
    - `service/TaskServiceTest.java`: Testes unitários com JUnit + Mockito.
    - `web/TaskRestControllerIT.java`: Teste de integração com Spring Boot Test + Testcontainers (PostgreSQL).

- `docker-compose.yml`: PostgreSQL + app (perfil de dev) com variáveis de ambiente.

## Principais Funcionalidades

- CRUD de tarefas com validação (Bean Validation).
- Filtro por status e busca por título (opcional via query param).
- Paginação e ordenação via `Pageable`.
- DTOs + MapStruct para separação de camadas e contrato estável.
- Migrações de banco com Flyway.
- View Kanban com Thymeleaf (3 colunas) e ação rápida de mudança de status.

## Endpoints

- `GET /api/tasks`: Lista paginada; filtros `status`, `title` (contém), `page`, `size`, `sort`.
- `GET /api/tasks/{id}`: Detalhe.
- `POST /api/tasks`: Criação.
- `PUT /api/tasks/{id}`: Atualização.
- `DELETE /api/tasks/{id}`: Exclusão.
- `GET /tasks`: Board Kanban (Thymeleaf).

## Como Executar (Docker Compose)

1. Pré-requisitos: Docker e Docker Compose instalados.
2. No diretório raiz do repositório, execute:
   - `docker compose up --build`
3. A aplicação sobe em `http://localhost:8080` e o PostgreSQL em `localhost:5432`.

Variáveis importantes (ajustáveis em `docker-compose.yml`):
- `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`.

## Como Executar (Local com Maven)

- Requisitos: JDK 17+ e Maven 3.9+.
- Com PostgreSQL rodando localmente e variáveis configuradas, execute:
  - `cd kanban-spring`
  - `mvn spring-boot:run`

## Testes

- Unitários: `TaskServiceTest` (JUnit + Mockito).
- Integração: `TaskRestControllerIT` usando Testcontainers (PostgreSQL) + MockMvc.
- Executar:
  - `cd kanban-spring`
  - `mvn test`

## Próximos Passos (Stretch)

- Autenticação com Spring Security + JWT.
- Migrações avançadas e dados de seed.
- Containerização multi-ambiente e CI.
- Board com drag-and-drop (JS leve ou biblioteca dedicada).
