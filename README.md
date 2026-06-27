# Book Inventory

A Next.js book inventory management system with dashboard analytics, full CRUD operations, and Cloudinary image hosting.

## Features

- **Dashboard** — view key metrics (total books, active loans, etc.) with interactive charts
- **Book Inventory** — add, edit, view, and delete books with search, sort, filter, and pagination
- **Image Hosting** — book cover images uploaded to Cloudinary (URL stored in DB)
- **Authentication** — secure sign-in with NextAuth
- **Responsive Layout** — shared sidebar, header, and footer across all authenticated pages

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** MongoDB (Mongoose)
- **Auth:** NextAuth
- **Image Hosting:** Cloudinary
- **Styling:** Tailwind CSS

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

Create a `.env` file in the project root:

```
MONGO=<your-mongodb-connection-string>
NEXTAUTH_SECRET=<your-nextauth-secret>
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
```

## Project Structure

```
src/
  app/
    (auth)/          — authenticated pages (dashboard, listing, profile)
    api/             — API routes (auth, books, upload)
    signin/          — sign-in page
  components/        — reusable UI components
  context/           — React contexts (sidebar)
  hook/              — custom hooks
  lib/               — utilities (mongodb, cloudinary)
  model/             — Mongoose schemas
```
