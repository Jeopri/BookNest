# Book Inventory

A Next.js book inventory management system with dashboard analytics, full CRUD operations, Cloudinary image hosting, borrow/return tracking, email notifications, and an activity timeline.

## Features

- **Dashboard** — view key metrics (total books, active loans, etc.) with interactive charts
- **Book Inventory** — add, edit, view, and delete books with search, sort, filter, and pagination
- **Borrow Books** — browse books grouped by status (Available, On Loan, Reserved, Out of Stock); borrow with one click; activity timeline showing all borrow/return/overdue events
- **Email Notifications** — automated confirmation emails sent via SMTP when a book is borrowed
- **In-App Notifications** — bell icon in header with live unread count; dropdown shows latest 6 notifications; marks as read on click
- **Image Hosting** — book cover images uploaded to Cloudinary (URL stored in DB)
- **Authentication** — secure sign-in with NextAuth
- **Responsive Layout** — shared sidebar, header, and footer across all authenticated pages

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** MongoDB (Mongoose)
- **Auth:** NextAuth
- **Image Hosting:** Cloudinary
- **Email:** Nodemailer (SMTP)
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

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your-email@gmail.com>
EMAIL_PASS=<your-app-password>
```

## Project Structure

```
src/
  app/
    (auth)/              — authenticated pages (dashboard, listing, profile, borrow)
    api/
      auth/              — auth routes (signin, user, upload)
      books/             — book CRUD
      borrow/            — borrow records
      notifications/     — in-app notifications
    signin/              — sign-in page
  components/            — reusable UI components (BookCard, MetricCard, Sidebar, Header)
  context/               — React contexts (sidebar)
  hook/                  — custom hooks
  lib/                   — utilities (mongodb, cloudinary, email)
  model/                 — Mongoose schemas (book, user, borrow, notification)
```
