# Rising Roots - Backend

Node.js & Express API server for the Rising Roots platform.

## Setup & Running

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

The backend server runs on `http://localhost:5000` by default.

## API Endpoints

- `GET /api/health` - Server health status
- `GET /api/members` - Retrieve members list
