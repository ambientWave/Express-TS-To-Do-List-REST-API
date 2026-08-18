# To-Do List API

A small Express + TypeScript REST API that manages a to-do list backed by SQLite (`better-sqlite3`).
It supports the four CRUD operations — create, read, update, and delete — on tasks, search, filtering, and stats, and ships with interactive Swagger UI documentation at `/docs`.

## Screenshot
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
