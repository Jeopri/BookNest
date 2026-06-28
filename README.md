# Book Inventory

A Next.js book inventory management system with dashboard analytics, full CRUD operations, Cloudinary image hosting, borrow/return tracking, email notifications, role-based access control, Google OAuth, and an activity timeline.

## Features

- **Dashboard** — view key metrics (total books, active loans, etc.) with interactive charts
- **Book Inventory** — add, edit, view, and delete books with search, sort, filter, and pagination
- **Borrow Books** — browse books grouped by status (Available, On Loan, Reserved, Out of Stock); borrow with one click; paginated activity data table showing all borrow/return/overdue events
- **User Roles** — Admin, Staff, and Customer roles; role badge displayed in sidebar and header; role-based UI (e.g. Users page visible to admins only)
- **User Management** — admin-only Users page with table of all registered users, search, role update modal, delete confirmation, and create user form
- **Email Notifications** — automated confirmation emails sent via SMTP when a book is borrowed
- **In-App Notifications** — bell icon in header with live unread count; dropdown shows latest notifications; marks as read on click
- **Google OAuth** — sign in / sign up with Google; auto-creates account with Customer role on first login; profile avatar synced from Google
- **Image Hosting** — book cover images uploaded to Cloudinary (URL stored in DB)
- **Authentication** — secure sign-in with NextAuth (credentials + Google providers)
- **Responsive Layout** — shared sidebar, header, and footer across all authenticated pages

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** MongoDB (Mongoose)
- **Auth:** NextAuth (Credentials + Google Provider)
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
NEXTAUTH_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your-email@gmail.com>
EMAIL_PASS=<your-app-password>

GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create an OAuth 2.0 Client ID (Web application)
3. Add `http://localhost:3000` to **Authorized JavaScript origins**
4. Add `http://localhost:3000/api/auth/callback/google` to **Authorized redirect URIs**
5. Copy the Client ID and Client Secret into your `.env`

## Roles

| Role     | Description                                      |
|----------|--------------------------------------------------|
| Admin    | Full access — can manage users, books, and all settings |
| Staff    | Can manage books and borrowing operations        |
| Customer | Can browse and borrow books                      |

New users registered via the sign-up form or Google OAuth are assigned the **Customer** role by default. Admins can change roles from the Users page.

## Project Structure

```
src/
  app/
    (auth)/              — authenticated pages (dashboard, listing, profile, borrow, users)
    api/
      auth/              — auth routes (signin, signup, user, upload)
      books/             — book CRUD
      borrow/            — borrow records
      notifications/     — in-app notifications
      users/             — admin user management (list, create, update, delete)
    signin/              — sign-in page
    register/            — registration page
  components/            — reusable UI components (BookCard, MetricCard, Sidebar, Header)
  context/               — React contexts (sidebar)
  hook/                  — custom hooks
  lib/                   — utilities (mongodb, cloudinary, email)
  model/                 — Mongoose schemas (book, user, borrow, notification)
```
