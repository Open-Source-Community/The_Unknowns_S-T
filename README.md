# Digital Marketplace - The Unknowns

Welcome to the **Digital Marketplace** backend! This project is built using **Node.js (Express)**, **Prisma**, and **PostgreSQL (Neon)**. It features a robust architecture with a wallet system, product management, and secure authentication.

---

## Prerequisites

Before you start, ensure you have the following installed on your machine:

* **Node.js** (v22 LTS recommended for stability)
* **npm** (v10 or higher)
###### Note
* **PostgreSQL** (Managed via Neon.tech)
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
DATABASE_URL="your_neon_link_here"
```

### 4. Initialize Prisma

Generate the Prisma Client to sync with the database schema:

```bash
npx prisma generate

```

### 5. Run the Application

Start the server using nodemon for development:

```bash
npm run dev

```

---

### 📂 Project Structure (Clean Architecture)
The project is organized within the src/ directory to separate concerns:

`src/config`: Global configurations (e.g., Prisma Client instance).

`src/routes`: Defines API endpoints and maps them to controllers.

`src/controllers`: Handles incoming requests and sends back responses.

`src/services`: Contains the core business logic and database interactions.

`src/middlewares`: Logic that runs before reaching controllers (e.g., Auth checks).

###  Testing
API Base URL: http://localhost:3001/api.

Testing Tool: Use the REST Client extension in VS Code. Check `test.http` for example requests.

Database GUI: Run Prisma Studio to visualize your Neon data:

```bash
npx prisma studio

```
