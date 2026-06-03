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

**Cross-domain auth via HttpOnly cookies.** The frontend and backend are deployed separately on Fly.io. + The JWT is stored in an `HttpOnly`, `SameSite=None`, `Secure` cookie to support cross-origin requests
+without exposing the token to JavaScript.

## Local Setup

**Prerequisites:** Go, Node.js, pnpm, Docker

1. Start the database:

```bash
docker-compose up postgres
```
