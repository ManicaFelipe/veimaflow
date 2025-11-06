# VEIMANFLOW - Example API

This folder contains a minimal Express + JWT example API to use while developing the frontend.

Endpoints
- POST /auth/register  { name, email, password } -> 201 { user, token }
- POST /auth/login     { email, password } -> 200 { user, token }
- GET  /auth/me        Header: Authorization: Bearer <token> -> 200 { user }

Run locally

1. Copy `.env.example` to `.env` and (optionally) edit values.
2. Install and start:

```powershell
cd server
npm install
npm start
```

The API listens on port 3000 by default and allows CORS from http://127.0.0.1:5173 (Vite dev server).

This is a demo only: it uses an in-memory user store. Don't use in production.
