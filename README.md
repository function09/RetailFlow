# RetailFlow

An internal order management dashboard for tracking products, customers and sales orders.

## Tech Stack

**Backend:** Go, PostgreSQL, JWT
**Frontend:** React, Typescript, TanStack Query, TailwindCSS, Shadcn/ui
**Deployment:**: Fly.io, Docker

## Features

- JWT authentication with register, login, and logout
- Product and category management with inventory tracking
- Customer management with address book
- Order creation with line items and fulfillment type (pickup or shipping)
- Dashboard metrics

## Technical Decisions

**Order creation is fully transactional.** When an order is placed, inventory is adjusted + order and line items are created in a single database transaction. If any step fails, the whole operation rolls back; the inventory is returned to its prior state.

**Shipping addresses are snapshotted at order time.** Address fields are copied onto the order record rather than a foreign key to a customer's current address. This means historical orders are never affected by address changes or deletion.

**Customer deactivation is transactional.** Soft-deleting a customer also cancels all of their pending orders atomically in the same transaction.

**Cross-domain auth via HttpOnly cookies.** The frontend and backend are deployed separately on Fly.io. The JWT is stored in an `HttpOnly`, `SameSite=None`, `Secure` cookie to support cross-origin requests without exposing the token to JavaScript.

## Local Setup

**Prerequisites:** Go, Node.js, pnpm, golang-migrate, Docker

1. Start the database:

```bash
docker-compose up postgres
```

2. Create a `.env` file in the project root:

```env

DATABASE_URL=postgres://admin:password@localhost:5432/oms?sslmode=disable
JWT_SECRET=your-secret-here
PORT=:8080
CORS_ORIGIN=http://localhost:5173


```

3. Run migrations:

```bash
migrate -path server/db/migrations -database "postgres://admin:password@localhost:5432/oms?sslmode=disable" up
```

4. Start the server:

```bash
cd server && go run cmd/main.go
```

5. Start the client:

```bash
cd client && pnpm install && pnpm dev
```

Or run everything with Docker:

```bash
docker-compose up --build
```

## API Reference

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Get current user |
| GET | `/products` | List all products |
| GET | `/products/:id` | Get a product |
| POST | `/products` | Create a product |
| PUT | `/products/:id` | Update a product |
| DELETE | `/products/:id` | Delete a product |
| GET | `/categories` | List all categories |
| POST | `/categories` | Create a category |
| GET | `/customers` | List all customers |
| GET | `/customers/:id` | Get a customer |
| POST | `/customers` | Create a customer |
| PUT | `/customers/:id` | Update a customer |
| PATCH | `/customers/:id` | Deactivate a customer |
| GET | `/customers/:id/orders` | Get a customer's orders |
| GET | `/customers/:id/addresses` | List a customer's addresses |
| POST | `/customers/:id/addresses` | Add an address |
| GET | `/addresses/:id` | Get an address |
| DELETE | `/addresses/:id` | Delete an address |
| PATCH | `/customers/:cid/addresses/:aid/default` | Set default address |
| GET | `/orders` | List all orders |
| GET | `/orders/:id` | Get an order |
| POST | `/orders` | Create an order |
| PATCH | `/orders/:id/status` | Update order status |
| GET | `/orders/:id/details` | Get order with line items |
| GET | `/metrics` | Get dashboard metrics |
