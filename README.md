# medmaxpub Platform

This repository contains a full-stack journal and conference platform for `medmaxpub`, rebuilt with:

- `frontend/`: React + Vite + Tailwind CSS + React Router DOM + Axios
- `backend/`: Express.js + MongoDB + JWT + pluggable file storage

## Folder Architecture

```text
medmaxpub/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   ├── common/
│   │   │   ├── journal/
│   │   │   └── layout/
│   │   ├── context/
│   │   ├── data/
│   │   └── pages/
│   │       ├── admin/
│   │       ├── journal/
│   │       └── public/
│   ├── .env.example
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── seed/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
└── README.md
```

## Frontend Features

- medmaxpub-inspired homepage structure and visual direction
- Public pages:
  - Home
  - Journals
  - Journal Details
  - Videos
  - About
  - Contact
  - Submit Manuscript
  - Start Journal
- Journal internal navigation:
  - Home
  - About
  - Aim & Scope
  - Editorial Board
  - Author Guidelines
  - Article In Press
  - Current Issue
  - Archive
- Protected admin route at `/admin`
- Axios client with JWT token handling and auto logout on `401`
- Public journal onboarding flow that creates a journal admin account and assigned journal in one step

## Admin Dashboard

The React admin area includes:

- Admin login
- Dashboard summary
- Journal creation form
- Journal-owner edit portal for assigned journals
- Issue and article overview
- Journal-linked PPT upload area
- Journal video playback area
- Testimonials module area
- Manuscript inbox viewer
- Contact inbox viewer

## Backend Features

- Express.js REST API
- MongoDB with Mongoose
- JWT authentication for super admins and journal-specific admins
- Local file uploads for development, with Cloudinary-ready production support
- Automatic bootstrap admin account
- Local development seed data for journals, journal-linked PPTs, journal-linked videos, and testimonials

## MongoDB Collections

- `users`
- `journals`
- `issues`
- `articles`
- `ppts`
- `videos`
- `testimonials`
- `contacts`
- `manuscripts`

## File Storage

The backend can store uploads in two ways:

- Local disk storage for development
- Cloudinary for production deployments

Local development defaults to `FILE_STORAGE=local`, which writes files into `backend/uploads/` and serves them from `/uploads`.

Cloudinary can be enabled by setting `FILE_STORAGE=cloudinary` and adding credentials.

Uploads are used for:

- Journal cover images
- Article PDFs
- PPT/PPTX files
- Optional PPT preview PDFs
- Manuscript uploads
- Video thumbnails
- Video files

Stored metadata includes:

- `storage`
- `secure_url`
- `public_id`
- `resource_type`
- `format`
- `file_type`
- `original_filename`
- `size`

## API Routes

Authentication:

- `POST /api/auth/login`
- `POST /api/auth/signup-admin`

Journals:

- `GET /api/journals`
- `GET /api/journals/:slug`
- `GET /api/admin/journals`
- `POST /api/journals`
- `PUT /api/journals/:id`
- `DELETE /api/journals/:id`
- `GET /api/journals/:id/issues`

Issues:

- `POST /api/issues`

Articles:

- `POST /api/articles`
- `GET /api/issues/:id/articles`
- `GET /api/articles/:id`

Journal Onboarding:

- `POST /api/journals/onboard`

Journal PPTs:

- `POST /api/journals/:journalId/ppts`
- `GET /api/admin/ppts`
- `GET /api/ppts`
- `GET /api/ppts/:id`

Journal Videos:

- `POST /api/journals/:journalId/videos`
- `GET /api/admin/videos`
- `POST /api/videos`
- `GET /api/videos`

Testimonials:

- `POST /api/testimonials`
- `GET /api/testimonials`

Contact:

- `POST /api/contact`
- `GET /api/admin/contact`

Manuscripts:

- `POST /api/manuscripts/submit`
- `GET /api/admin/manuscripts`

## Environment Variables

Frontend `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_DEFAULT_CONTACT_EMAIL=contact@medmaxpub.com
VITE_DEFAULT_CONTACT_PHONE=+1 (970) 642-3881
```

Backend `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medmaxpub
JWT_SECRET=local-dev-jwt-secret-medmaxpub-2026
JWT_EXPIRES_IN=1d
FILE_STORAGE=local
BACKEND_PUBLIC_URL=http://localhost:5000
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ADMIN_NAME=medmaxpub Super Admin 1
ADMIN_EMAIL=admin@medmaxpub.com
ADMIN_PASSWORD=ChangeMe123!
SECOND_SUPER_ADMIN_NAME=medmaxpub Super Admin 2
SECOND_SUPER_ADMIN_EMAIL=superadmin2@medmaxpub.com
SECOND_SUPER_ADMIN_PASSWORD=ChangeMe123!
JOURNAL_ADMIN_NAME=Journal Admin
JOURNAL_ADMIN_EMAIL=journaladmin@medmaxpub.com
JOURNAL_ADMIN_PASSWORD=ChangeMe123!
FRONTEND_URL=http://localhost:5173
```

## Local Development

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
npm install
npm run dev
```

Local requirements:

- MongoDB running at `mongodb://localhost:27017/medmaxpub`
- Local uploads work out of the box
- Set `FILE_STORAGE=cloudinary` and add Cloudinary credentials when you are ready for production media storage

## Deployment

Frontend:

1. Deploy `frontend/` to Vercel or Netlify
2. Set `VITE_API_BASE_URL` to your deployed API URL
3. Build command: `npm run build`

Backend:

1. Deploy `backend/` to Render, Railway, or VPS
2. Set all environment variables from `backend/.env.example`
3. Start command: `npm start`

Database:

1. Create MongoDB Atlas cluster
2. Replace `MONGODB_URI` with the real Atlas connection string

Cloudinary:

1. Create a Cloudinary account
2. Add the three credentials to backend env
3. Keep only metadata and URLs in MongoDB
