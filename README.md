# TimeManager Secure

This project is a Next.js + Prisma + NextAuth time-management app with role-based access for employees, supervisors, and HR.

## What you need before starting

Make sure these are installed on your PC:

- Node.js 18 or newer
- npm 9 or newer
- PostgreSQL 14+ (local install or Docker)
- Git

If you do not have PostgreSQL yet, install it first. The app uses Prisma with a PostgreSQL database.

---

## 1. Clone the project

```bash
git clone <your-repo-url>
cd timemanager_secure
```

---

## 2. Install dependencies

Run this in the project folder:

```bash
npm install
```

If you get permission or network issues, try:

```bash
npm install --legacy-peer-deps
```

---

## 3. Create your database

You need a PostgreSQL database before the app can start.

### Option A: Local PostgreSQL

1. Start PostgreSQL on your machine.
2. Create a database named `timemanager`.
3. Note your username, password, host, and port.

Example connection string:

```text
postgresql://postgres:your_password@localhost:5432/timemanager
```

### Option B: Docker (fastest option)

If you have Docker installed, this is the easiest way:

```bash
docker run --name timemanager-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=timemanager \
  -p 5432:5432 \
  -d postgres:16
```

Then use this URL:

```text
postgresql://postgres:postgres@localhost:5432/timemanager
```

---

## 4. Create the environment file

Create a file named `.env` in the project root.

Use this template:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/timemanager?schema=public"
NEXTAUTH_SECRET="replace-this-with-a-long-random-string"
NEXTAUTH_URL="http://localhost:3000"
BCRYPT_SALT_ROUNDS="10"
```

### Generate a good `NEXTAUTH_SECRET`

On Windows PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

On macOS/Linux:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated string into `NEXTAUTH_SECRET`.

---

## 5. Set up Prisma

This project uses Prisma to talk to PostgreSQL.

Run:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

If the database is empty, this creates the tables. If Prisma asks for a name for the migration, use `init`.

---

## 6. Seed demo users

The project includes a seed script with sample users for testing.

Run:

```bash
node scripts/seed.js
```

This creates demo accounts:

- `alice@example.com` — HR — password `Password123!`
- `bob@example.com` — Supervisor — password `Supervisor123!`
- `carol@example.com` — Employee — password `Employee123!`

---

## 7. Start the app

Now run the development server:

```bash
npm run dev
```

Open this in your browser:

```text
http://localhost:3000
```

---

## 8. Log in

Use one of the seeded users from step 6.

Example:

- Email: `alice@example.com`
- Password: `Password123!`

---

## 9. Useful development commands

```bash
npm run dev      # start the app
npm run build    # create a production build
npm run start    # run the production build
npm run lint     # run ESLint
npx prisma studio # open Prisma database GUI
```

---

## 10. Troubleshooting

### Error: `Environment variable not found: DATABASE_URL`

Make sure you created a real `.env` file in the project root and not just the `env template` file.

### Error: `Prisma schema validation error`

Make sure your PostgreSQL database is running and the `DATABASE_URL` is correct.

### Error: `NEXTAUTH_SECRET is not set`

Add `NEXTAUTH_SECRET` to `.env` before starting the app.

### Port already in use

If port 3000 is busy, stop the other process or run:

```bash
npm run dev -- --port 3001
```

---

## 11. Production note

For production, use a real secret key, a production PostgreSQL database, and a proper domain in `NEXTAUTH_URL`.

If you want, you can also deploy this app to Vercel or another hosting platform later.

