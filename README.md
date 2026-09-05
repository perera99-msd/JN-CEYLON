# JN Ceylon ERP

JN Ceylon ERP is a small quote-to-cash system for managing companies, quotations, invoices, payments, statements, printing, users, and recycle-bin recovery.

## Current workflow

Quotation -> Invoice -> Payment -> Statement

The server is an Express/Mongoose application and the client is a React/Vite application.

## Requirements

- Node.js 20 or newer
- MongoDB 7 or newer
- npm

## Local setup

1. Copy `.env.example` to `.env`.
2. Fill in the local MongoDB URI, session secret, CORS origin, and admin bootstrap values.
3. Install dependencies:

   ```powershell
   npm install
   npm install --prefix client
   ```

4. Start the application:

   ```powershell
   npm run dev
   ```

The Vite client runs on `http://localhost:5173` and proxies API requests to the server on port `5000`.

## Commands

```powershell
npm test          # API smoke tests
npm run build     # Production client build
npm start         # Production server
npm run seed      # Seed the default company and sequences
```

## Deployment

Read [DEPLOYMENT.md](DEPLOYMENT.md) before deploying. Production requires a real MongoDB connection, a strong session secret, an explicit CORS allowlist, HTTPS, backups, and admin bootstrap credentials supplied through the environment.

Use `/api/health` for process liveness and `/api/ready` for MongoDB readiness.

## Security

See [SECURITY.md](SECURITY.md) for reporting guidance and known operational requirements. Never commit `.env`, credentials, database dumps, private keys, or build output.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
