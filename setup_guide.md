# Project Setup Guide

This guide provides exact steps to set up and run the **Architect X** project (The Unknowns S-T) locally.

## Project Architecture
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js (Express) + Prisma (PostgreSQL)

---

## 1. Prerequisites
Ensure you have the following installed on your system:
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **PostgreSQL** (or a cloud provider like [Neon](https://neon.tech/))

---

## 2. Backend Setup

### Installation
Navigate to the `Backend` directory and install the required dependencies:
```bash
cd Backend
npm install
```

### Environment Variables
Create a `.env` file in the `Backend` directory. You can use the provided `.env.example` as a template:
```bash
cp .env.example .env
```

Define the following variables in your `.env` file:
- `DATABASE_URL`: Your PostgreSQL connection string. (e.g., `postgresql://user:password@host:port/database?sslmode=require`)
- `JWT_SECRET`: A secure random string for signing JWT tokens. (e.g., `your_very_secret_key_here`)
- `PORT`: (Optional) The port where the backend server will run. Defaults to `3001`.

OR use this Backend `.env` Template:
```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
JWT_SECRET="your_secret_key"
PORT=3001
```

### Database Initialization
After configuring the `DATABASE_URL`, initialize the database schema using Prisma:
```bash
npx prisma generate
npx prisma db push
```

### Running the Backend
Start the backend server in development mode:
```bash
npm run dev
```
The server will start on `http://localhost:3001`.

---

## 3. Frontend Setup

### Installation
Navigate to the `Frontend` directory and install the required dependencies:
```bash
cd Frontend
npm install
```

### Configuration
The frontend is pre-configured to connect to the backend at `http://localhost:3001/api`. If you change the backend port, update the `baseURL` in:
`Frontend/src/api/axiosConfig.js`

### Running the Frontend
Start the Vite development server:
```bash
npm run dev
```
The frontend will usually be accessible at `http://localhost:5173`.

---

## 4. Summary of Dependencies

### Backend Dependencies (`Backend/package.json`)
- **Core:** `express`, `cors`, `dotenv`, `pg`
- **Database:** `prisma`, `@prisma/client`
- **Security:** `bcrypt`, `jsonwebtoken`
- **Validation:** `joi`
- **Dev Tools:** `nodemon`, `tsx`, `typescript`, `jest`

### Frontend Dependencies (`Frontend/package.json`)
- **Core:** `react`, `react-dom`, `react-router-dom`
- **Build/Styling:** `vite`, `tailwindcss`, `postcss`, `autoprefixer`
- **API/Utilities:** `axios`, `lottie-web`, `lucide-react`, `sweetalert2`
- **Linting:** `eslint`

---

## 5. Troubleshooting
- **Database Connection Error:** Ensure your `DATABASE_URL` is correct and the PostgreSQL server is reachable.
- **CORS Issues:** If the frontend cannot reach the backend, verify the CORS origin setting in `Backend/index.js` matches your frontend URL.
- **Node Version:** If you encounter installation errors, ensure you are using a compatible Node.js version.
