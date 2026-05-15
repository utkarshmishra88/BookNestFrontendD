# BookNest — React Frontend

A production-grade, feature-driven React frontend for the BookNest Spring Boot Microservices ecosystem.

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Framework      | React 18 + Vite                     |
| Routing        | React Router v6                     |
| State          | Zustand (auth, cart, wishlist)      |
| Server State   | React Query v3                      |
| Forms          | React Hook Form + Yup validation    |
| Styling        | Tailwind CSS 3                      |
| Animations     | Framer Motion                       |
| HTTP Client    | Axios (with JWT interceptors)       |
| Notifications  | React Hot Toast                     |
| Payments       | Razorpay Web SDK                    |

## Microservices Mapped

| Microservice         | API Base Path  | Feature Module            |
|----------------------|----------------|---------------------------|
| auth-service         | /auth          | features/auth             |
| book-service         | /books         | features/catalog          |
| cart-service         | /carts         | features/cart             |
| wishlist-service     | /wishlists     | features/wishlist         |
| order-service        | /orders        | features/checkout, account|
| wallet-service       | /wallets       | features/wallet           |
| review-service       | /reviews       | features/catalog          |
| api-gateway          | (port 8080)    | src/lib/axios.js          |

## Quick Start

```bash
# Install dependencies
npm install

# Copy env file and fill in values
cp .env.example .env

# Start dev server (proxies /api → localhost:8080)
npm run dev
```

## Folder Structure

```
src/
├── features/          # Feature-driven modules (auth, catalog, cart…)
│   ├── auth/
│   │   └── pages/
│   ├── catalog/
│   │   └── pages/
│   ├── cart/
│   ├── wishlist/
│   ├── checkout/
│   ├── account/
│   ├── wallet/
│   └── admin/
├── components/
│   ├── ui/            # Shared UI primitives (BookCard, Spinner…)
│   └── routing/       # PrivateRoute, AdminRoute guards
├── layouts/           # MainLayout, AdminLayout, AuthLayout
├── services/          # Axios service modules (one per microservice)
├── store/             # Zustand stores (auth, cart, wishlist)
├── lib/               # Axios instance + interceptors
└── styles/            # Tailwind globals
```

## Environment Variables

| Variable              | Description                          |
|-----------------------|--------------------------------------|
| VITE_API_BASE_URL     | API Gateway URL (default: /api)      |
| VITE_RAZORPAY_KEY_ID  | Razorpay Test/Live Key ID            |

## Authentication Flow

1. `POST /auth/register` → Creates account, sends OTP
2. `POST /auth/verify` → Verifies OTP, activates account
3. `POST /auth/login` → Returns JWT, stored in Zustand + localStorage
4. All subsequent API calls attach `Authorization: Bearer <token>`
5. 401 responses auto-clear auth state and redirect to /login

## Payment Integration

- **Razorpay**: For wallet top-up and order checkout
- The Razorpay checkout.js script is loaded in index.html
- Order flow: place order → get razorpayOrderId → open modal → verify signature
