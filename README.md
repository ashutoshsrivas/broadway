# Broadway Opticals

An online optical store — sunglasses, eyeglasses, computer glasses, contact
lenses and accessories — built on the same stack as `stylestatement`, trimmed
to the features a single shop actually needs.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Prisma 5 + MySQL · NextAuth v5 · Zustand · Razorpay

---

## Quick start

1. **Start MySQL.** Open the XAMPP Manager app → *Manage Servers* → start
   **MySQL Database**. (It needs an admin prompt, which is why it can't be
   started from a script.)

2. **Create the database.** In phpMyAdmin (http://localhost/phpmyadmin) create
   a schema named `broadway_opticals`, or from a terminal:

   ```bash
   /Applications/XAMPP/xamppfiles/bin/mysql -u root -e "CREATE DATABASE IF NOT EXISTS broadway_opticals"
   ```

3. **Configure the environment.** Copy `.env.example` to `.env` and adjust if
   your MySQL user/password differ from XAMPP's default (`root`, no password).

4. **Create the tables and seed the catalogue:**

   ```bash
   npm run db:push && npm run db:seed
   ```

5. **Run it:**

   ```bash
   npm run dev
   ```

   Storefront → http://localhost:3000 · Admin → http://localhost:3000/admin

### Seeded admin account

| Email | Password |
| --- | --- |
| `admin@broadwayopticals.com` | `broadway123` |

Change this before the site goes anywhere near production. Override the
defaults by setting `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` before seeding.

---

## Payments

Razorpay is **optional**. With `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
unset the store runs in Cash-on-Delivery-only mode — the online option is
hidden at checkout rather than shown and then failing at the gateway.

To turn it on, drop your test keys into `.env` and restart. The flow is:

1. `POST /api/orders` creates the order as `PENDING` and asks Razorpay for a
   gateway order. **No stock is deducted yet.**
2. The browser opens Razorpay Checkout.
3. `POST /api/payments/razorpay/verify` re-computes the HMAC signature with the
   key secret. Only a matching signature marks the order `PAID` and deducts
   stock.

The browser is never believed about whether money moved, and the stock
deduction is guarded by a `stockDeducted` flag flipped inside the same
transaction, so a callback delivered twice can't double-deduct.

---

## Project layout

```
prisma/
  schema.prisma          9 models — the whole data layer
  seed.ts                Demo catalogue + admin account (idempotent)
src/
  app/
    (store)/             Storefront: home, shop, product, cart, checkout, account
    (auth)/              Sign in / register
    (admin)/admin/       Dashboard, products, categories, orders
    api/                 Route handlers
  components/
    layout/              Header, footer, announcement marquee, search
    sections/            Homepage sections
    store/               Product card, filters, cart, checkout, PDP
    account/ admin/      Account and admin UI
  lib/
    catalog.ts           One query builder for every product grid
    order.ts             Server-side pricing, order numbers, stock deduction
    razorpay.ts          Gateway client + signature verification
    auth.ts              NextAuth config + admin guard
    store.ts             Zustand cart (persisted to localStorage)
```

### Where the money logic lives

`src/lib/order.ts` is the file to read first. `priceCart()` takes only variant
ids and quantities from the browser and re-derives every price from the
database — a `price` in the request body is ignored outright. Trusting it would
let a buyer order a ₹40,000 frame for ₹1, and since the payment check only
compares the paid amount against the stored order total, that ₹1 payment would
then verify cleanly.

---

## Design system

The look is *"Quiet Deco"* — warm paper and espresso ink ruled with brass
hairlines, after the Art Deco marquees of a theatre district. All of it lives
in `src/app/globals.css`.

| Token | Value | Used for |
| --- | --- | --- |
| `ink` | `#2A1F17` | Primary dark — espresso, not black |
| `paper` | `#F6F1E8` | The page |
| `paper-raised` | `#FCFAF5` | Cards and panels |
| `brass` | `#B08D4F` | Accent — rules, active states, ornament |
| `forest` | `#1F3A2E` | Full-bleed editorial bands |
| `clay` | `#9C4A2F` | Sale badges, errors, low stock |

Type is **Bodoni Moda** for display (`.display`) and **Jost** for everything
readable, including the tracked-uppercase house label (`.label`).

Utility classes worth knowing: `.rule-deco` (double marquee rule),
`.deco-frame` (corner brackets), `.grain` (paper texture), `.btn-ink` /
`.btn-outline` (brass wipe on hover), `.field` / `.field-box` (storefront and
admin inputs).

---

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (runs `prisma generate` first) |
| `npm run db:push` | Push the schema to MySQL without a migration file |
| `npm run db:migrate` | Create and apply a named migration |
| `npm run db:seed` | Seed categories, brands, products and the admin |
| `npm run db:studio` | Prisma Studio |

---

## Deliberately out of scope

This is the lighter sibling of `stylestatement`. The following were left out on
purpose, and should stay out unless the shop genuinely needs them: POS and cash
register, loyalty points, store credit / wallet, coupons and discount engines,
salesman commissions, suppliers and purchase bills, stock transfers between
locations, exchanges and credit notes, WhatsApp/SMS notifications, S3 image
hosting (uploads go to `public/uploads`), and AI image generation.
