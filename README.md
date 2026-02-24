# AmeriLend Loan Application

A full-stack loan application platform built with React, TypeScript, Express, and PostgreSQL.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Radix UI
- **Backend:** Node.js, Express, tRPC
- **Database:** PostgreSQL (via Drizzle ORM + Supabase)
- **Auth:** JWT-based sessions with OAuth support
- **Deployment:** Vercel (frontend) + Railway (backend)

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Phillipjr9/amerilendloan.git
   cd amerilendloan
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the example environment file and fill in your values:
   ```bash
   cp .env.example .env
   ```

4. Push the database schema:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (Express + Vite HMR) |
| `npm run build` | Build for production (client + server) |
| `npm start` | Run the production build |
| `npm run check` | TypeScript type checking |
| `npm test` | Run unit tests (Vitest) |
| `npm run format` | Format code with Prettier |
| `npm run db:push` | Generate and apply database migrations |

## Environment Variables

See `.env.example` for all required environment variables. **Never commit `.env.production` or other env files with real secrets.**

## Deployment

- **Vercel:** Deploy the client by pointing Vercel to this repository. Set all `VITE_*` environment variables in the Vercel dashboard.
- **Railway:** Deploy the server using the included `railway.json` and `Dockerfile`. Set all server-side environment variables in the Railway dashboard.

## License

MIT — see [LICENSE](./LICENSE) for details.
