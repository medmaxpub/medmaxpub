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
  - PPTs
  - Journal Details
  - Videos
  - About
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

## Admin Dashboard

The React admin area includes:

- Admin login
- Journals module with linked-user journal creation/editing
- Users module with journal-owner listing and admin impersonation
- Testimonials module area

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

## File Storage

The backend can store uploads in two ways:

- Local disk storage for development
- Cloudinary for production deployments

Local development defaults to `FILE_STORAGE=local`, which writes files into `backend/uploads/` and serves them from `/uploads`.

Cloudinary can be enabled by setting `FILE_STORAGE=cloudinary` and adding credentials.

Uploads are used for:

- Article PDFs
- PPT/PPTX files
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
- `POST /api/auth/impersonate/:id`
- `POST /api/contact`

Journals:

- `GET /api/journals`
- `GET /api/journals/:journalUrl`
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
- `PUT /api/testimonials/:id`
- `DELETE /api/testimonials/:id`
- `GET /api/testimonials`

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
CLIENT_URL=
CORS_ORIGINS=http://localhost:5173
RESEND_API_KEY=
CONTACT_FROM_EMAIL=Medmax Contact Form <no-reply@yourdomain.com>
CONTACT_TO_EMAIL=contact@medmaxpub.com
```

## Local Development

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Frontend API behavior:

- In local development, the frontend uses `http://localhost:5000/api`
- In production, the frontend uses `https://medmaxpub.onrender.com/api`
- `VITE_API_BASE_URL` is optional and overrides the defaults, but if a production build is accidentally given a localhost URL, the app now falls back to the production API automatically

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
3. On Render, set the Root Directory to `backend`
4. Start command: `npm start`

Database:

1. Create MongoDB Atlas cluster
2. Replace `MONGODB_URI` with the real Atlas connection string
3. Do not leave `MONGODB_URI` as `mongodb://localhost:27017/medmaxpub` on Render, because Render does not provide a local MongoDB server

Render backend env values:

- `MONGODB_URI`: your MongoDB Atlas connection string
- `JWT_SECRET`: a long random secret
- `FILE_STORAGE`: `cloudinary` for production media, or `local` only for temporary testing
- `BACKEND_PUBLIC_URL`: your Render backend URL, for example `https://your-backend.onrender.com`
- `FRONTEND_URL`: your deployed frontend URL
- `CORS_ORIGINS`: comma-separated frontend origins, for example `https://medmaxpub.pages.dev,http://localhost:5173`

Render note:

- If you keep `FILE_STORAGE=local`, uploaded files are not durable on Render and can disappear after redeploys or restarts. Use Cloudinary in production.

Cloudinary:

1. Create a Cloudinary account
2. Add the three credentials to backend env
3. Keep only metadata and URLs in MongoDB
