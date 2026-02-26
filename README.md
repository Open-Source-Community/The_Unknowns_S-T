# Digital Marketplace - The Unknowns

Welcome to the **Digital Marketplace** backend! This project is built using **NestJS**, **Prisma**, and **PostgreSQL (Neon)**. It features a robust architecture with a wallet system, product management, and secure authentication.

---

## Prerequisites

Before you start, ensure you have the following installed on your machine:

* **Node.js** (v18 or higher)
* **npm** (v9 or higher)

---

## Getting Started

Follow these steps to set up the project locally:

### 1. Clone the Repository

```bash
git clone https://github.com/Open-Source-Community/The_Unknowns_S-T.git
cd The_Unknowns_S-T

```

### 2. Install Dependencies

```bash
npm install

```

### 3. Environment Configuration

Create a `.env` file in the root directory and add your **Neon PostgreSQL** connection string:

```env
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[ENDPOINT]/neondb?sslmode=require"

```

### 4. Initialize Prisma

Generate the Prisma Client to sync with the database schema:

```bash
npx prisma generate

```

### 5. Run the Application

Start the server in development mode:

```bash
npm run start:dev

```

---

## 📂 Project Structure & Team Roles

* **Auth & User Management**: Responsible for `src/modules/auth` and `src/modules/users`. Handles secure registration and JWT-based login.
* **Product Catalog**: Responsible for `src/modules/products`. Manages product listings with validation (e.g., `@Min(0)` for prices).
* **Wallet & Wallet Transactions**: Responsible for `src/modules/wallet`. Handles balance updates, deposits, and transaction history.

---

## 🧪 Testing and Debugging

* **API Testing**: The server runs on `http://localhost:3000`. Use **Postman** to test endpoints.
* **Database Management**: Use **Prisma Studio** to view and edit data via a GUI:
```bash
npx prisma studio

```



---

### **Next Step for you, Sara:**

دلوقتي تقدري تاخدي الكلام ده وتعدلي ملف الـ `README.md` اللي عندك وتعملي `Push`. تحبي أساعدك في تجهيز الـ **Postman Collection** عشان تبعتيها ليهم يجربوا بيها الـ APIs أول ما تخلص؟
