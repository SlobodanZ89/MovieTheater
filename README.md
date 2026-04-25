# MovieTheater

Full-stack movie theater app:

- `backend/kino`: Spring Boot API (H2 in-memory DB, JWT auth)
- `frontend/kino-app`: React + Vite web app

## Prerequisites

- Java 17+ (for the backend)
- Node.js 18+ (for the frontend)

## Backend (Spring Boot)

From `backend/kino`:

```bash
./mvnw spring-boot:run
```

Backend runs on `http://localhost:8080` by default.

- H2 console: `http://localhost:8080/h2`
- H2 JDBC URL (default): `jdbc:h2:mem:testdb`

### Environment variables

- `OMDB_API_KEY`: optional, used for OMDb lookups (see `application.properties`)

## Frontend (React + Vite)

From `frontend/kino-app`:

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## Repo notes

- Frontend and backend each have their own `.gitignore`.
- A root `.gitignore` exists to ignore common build artifacts and secrets across the whole repo.

