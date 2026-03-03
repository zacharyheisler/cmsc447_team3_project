# CMSC 447 Team 3 Project

This repository contains the full-stack application for CMSC 447 Team 3.

Tech Stack:
- Frontend: TanStack / React
- Backend: NestJS
- Database: PostgreSQL
- ORM: Prisma
- Package Manager: pnpm

---

## 1. Clone the Repository

Using SSH:

```bash
git clone git@github.com:zacharyheisler/cmsc447_team3_project.git
cd cmsc447_team3_project
```

---

## 2. Install pnpm (If Not Installed)

Check if pnpm is installed:

```bash
pnpm -v
```

If pnpm is not installed, install it globally:

```bash
npm install -g pnpm
```

Verify installation:

```bash
pnpm -v
```

---

## 3. Install Dependencies

From the project root:

```bash
pnpm install
```

If the project contains separate frontend and backend folders, install dependencies in each:

```bash
cd server
pnpm install

cd ../client
pnpm install
```

Adjust folder names if different.

---

## 4. Configure Environment Variables

Create a `.env` file inside the backend/server directory with your database connection string:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
```
Change the values to match your username, password, port, and database

Ensure PostgreSQL is running before proceeding.

---

## 5. Generate Prisma Client

From the backend/server directory:

```bash
pnpm prisma generate
```

If this is the first time setting up the database:

```bash
pnpm prisma migrate dev
```

If the database already exists and you only need to sync the schema:

```bash
pnpm prisma db push
```

---

## 6. Run the Application

### Start the Backend

```bash
cd server
pnpm run start:dev
```

### Start the Frontend

Open a new terminal:

```bash
cd client
pnpm run dev
```

Adjust folder names if needed.

---

## Application URLs

Frontend (default):
```
http://localhost:5173
```

Backend (default):
```
http://localhost:3000
```

Ports may vary depending on your configuration.

---

## Common Commands

Regenerate Prisma client after schema changes:

```bash
pnpm prisma generate
```

Create a new migration:

```bash
pnpm prisma migrate dev --name migration_name
```

Reinstall dependencies:

```bash
pnpm install # or pnpm i
```

---

## Project Structure

```
/client   → Frontend application
/server   → Backend (NestJS + Prisma)
/prisma   → Prisma schema
```

---

Ensure PostgreSQL is running before starting the backend. Always run `pnpm prisma generate` after modifying the Prisma schema.