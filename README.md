# To-Do List API

A small Express + TypeScript REST API that manages an in-memory to-do list.
It supports the four CRUD operations — create, read, update, and delete — on tasks,
and ships with interactive Swagger UI documentation at `/docs`.

## Install & run

```bash
npm install && node src/app.ts
```

The server starts on **http://localhost:3000**.  
Interactive API docs are available at **http://localhost:3000/docs**.

## Endpoints

| Method   | Path               | Description                              | Success |
|----------|--------------------|------------------------------------------|---------|
| `GET`    | `/api/`            | API info (name, version, endpoints)      | 200     |
| `GET`    | `/api/health`      | Health check                             | 200     |
| `GET`    | `/api/tasks`       | List all tasks                           | 200     |
| `POST`   | `/api/tasks`       | Create a new task (`{ "title": "..." }`) | 201     |
| `GET`    | `/api/tasks/:id`   | Get a single task by ID                  | 200     |
| `PUT`    | `/api/tasks/:id`   | Update a task's `title` and/or `done`    | 200     |
| `DELETE` | `/api/tasks/:id`   | Delete a task                            | 204     |

## Example

```
$ curl -i http://localhost:3000/api/tasks

HTTP/1.1 200 OK
Connection: keep-alive
Keep-Alive: timeout=5
Content-Length: 117
Content-Type: text/html; charset=utf-8
Date: Mon, 27 Jul 2026 01:42:05 GMT
ETag: W/"75-7hvHNFe4C9UBIYQ/i1+IZv+x3F..."

[{"id":1,"title":"Task 1","done":false},{"id":2,"title":"Task 2","done":true},{"id":3,"title":"Task 3","done":false}]
```
