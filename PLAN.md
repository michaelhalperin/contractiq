# ContractIQ - Complete SaaS Application Build

## Project Structure

```
contractIQ/
├── frontend/                 # React + Vite app
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route pages
│   │   ├── hooks/           # Custom React hooks
│   │   ├── store/           # Zustand state management
│   │   ├── services/        # API client functions
│   │   ├── utils/           # Helper functions
│   │   ├── theme/           # MUI dark theme config
│   │   └── App.tsx
│   ├── public/
│   └── package.json
├── backend/                 # Express API server
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── models/          # Mongoose schemas
│   │   ├── middleware/      # Auth, validation, rate limiting
│   │   ├── services/        # Business logic (AI, email, payments)
│   │   ├── utils/           # Helpers (file parsing, validation)
│   │   ├── config/          # Database, AWS, env configs
│   │   └── server.ts
│   └── package.json
├── shared/                  # Shared types/utilities
│   └── types.ts
├── .env.example
└── README.md
```

## Implementation Phases

### Phase 1: Project Setup & Configuration

- Initialize Vite React app with TypeScript
- Initialize Express backend with TypeScript
- Configure ESLint, Prettier
- Set up environment variables structure
- Create shared TypeScript types
- Configure MongoDB connection
- Set up AWS S3 client configuration

### Phase 2: Authentication System

- Backend: User model (Mongoose schema) with email, password hash, subscription fields
- Backend: JWT token generation/verification middleware
- Backend: Auth routes (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`)
- Backend: Password hashing with bcrypt
- Frontend: Auth context/store (Zustand)
- Frontend: Protected route wrapper component
- Frontend: Login/Register pages with React Hook Form + Zod validation
- Frontend: Token storage in httpOnly cookies or localStorage

### Phase 3: File Upload & Processing

- Backend: File upload route with multer middleware
- Backend: File validation (type, size limits)
- Backend: PDF parsing service (`pdf-parse`)
- Backend: DOCX parsing service (`mammoth`)
- Backend: Text extraction and sanitization
- Backend: S3 upload service
- Frontend: UploadThing or custom drag-and-drop upload component
- Frontend: Upload progress indicator
- Frontend: File preview before submission

### Phase 4: AI Contract Analysis Engine

- Backend: OpenAI service client configuration
- Backend: Contract model (Mongoose) - stores contract metadata, analysis results
- Backend: AI analysis pipeline:
  - `analyzeContract()` - Main orchestrator
  - `extractClauses()` - Structure extraction
  - `summarizeContract()` - Plain English summary
  - `detectRisks()` - Red flag detection (non-compete, auto-renewal, termination, liability)
  - `explainClauses()` - Legal term explanations
- Backend: Analysis result storage in MongoDB
- Backend: Background job queue (optional: Bull/BullMQ) for async processing
- Frontend: Analysis status polling/WebSocket
- Frontend: Loading states with Framer Motion animations

### Phase 5: Dashboard & Results UI

- Frontend: Dark theme configuration (MUI theme with teal/amber accents)
- Frontend: Dashboard layout with collapsible sidebar navigation
- Frontend: Contract list view (table/cards)
- Frontend: Contract detail page with:
  - Summary section
  - Risk flags section (color-coded, icons)
  - Clause explanations section
  - Timeline visualization component
- Frontend: Download PDF report functionality
- Frontend: Shareable link generation UI
- Frontend: Framer Motion page transitions

### Phase 6: Payment Integration (Paddle)

- Backend: Subscription model (Mongoose) - links user to plan, billing cycle
- Backend: Paddle service client (`@paddle/paddle-node`)
- Backend: Webhook handler for Paddle events (subscription created/updated/cancelled)
- Backend: Plan limits middleware (check contract count vs plan limits)
- Backend: Subscription routes (`/api/subscription/create-checkout`, `/api/subscription/status`)
- Frontend: Pricing page with plan comparison
- Frontend: Paddle checkout integration (embedded or hosted checkout)
- Frontend: Subscription management page (upgrade/downgrade)
- Frontend: Usage indicators (contracts used/remaining)

### Phase 7: Email Notifications (Resend)

- Backend: Resend service client configuration
- Backend: Email templates (analysis complete, subscription updates)
- Backend: Email service (`sendAnalysisCompleteEmail()`, `sendSubscriptionEmail()`)
- Backend: Trigger emails after analysis completion
- Backend: Trigger emails on subscription changes

### Phase 8: Team & Sharing Features

- Backend: Workspace model (Mongoose) - for Business/Enterprise plans
- Backend: Workspace member model - role-based access
- Backend: Shareable report model - secure links with optional passwords
- Backend: Workspace routes (invite, remove members, manage roles)
- Backend: Share routes (create shareable link, verify password)
- Frontend: Team management UI (invite members, role management)
- Frontend: Share modal (generate link, set password)
- Frontend: Public share view (for shared links)

### Phase 9: Admin Dashboard

- Backend: Admin middleware (role check)
- Backend: Admin routes (`/api/admin/users`, `/api/admin/metrics`, `/api/admin/revenue`)
- Backend: Analytics aggregation (active users, churn, plan breakdown, contract usage)
- Frontend: Admin dashboard page (metrics cards, charts, user table)
- Frontend: CSV export functionality
- Frontend: Admin route protection

### Phase 10: Marketing Landing Page

- Frontend: Landing page route (`/`)
- Frontend: Hero section with animated upload dropzone
- Frontend: Problem/Solution sections
- Frontend: UI screenshot showcase
- Frontend: Pricing table
- Frontend: Testimonials section
- Frontend: FAQ accordion
- Frontend: Footer (Legal, Privacy, Contact links)
- SEO: Meta tags, OpenGraph, sitemap.xml, robots.txt

### Phase 11: Onboarding & UX Polish

- Frontend: Onboarding modal (3-step walkthrough)
- Frontend: First-time user detection
- Frontend: Sample contract upload for onboarding
- Frontend: Micro-interactions (hover states, button feedback)
- Frontend: Error boundaries
- Frontend: Toast notifications (react-hot-toast)
- Frontend: Loading skeletons

### Phase 12: Security & Production Readiness

- Backend: Input validation (express-validator or Zod)
- Backend: Rate limiting (express-rate-limit)
- Backend: CORS configuration
- Backend: File scanning/malware check (ClamAV or cloud service)
- Backend: Error handling middleware
- Backend: Request logging (Winston or Pino)
- Frontend: API error handling
- Frontend: Form validation (Zod schemas)
- Environment: `.env.example` with all required variables
- Documentation: Comprehensive README with setup instructions

### Phase 13: Deployment Configuration

- Frontend: Vercel/Netlify configuration files
- Backend: Dockerfile (optional) or serverless config
- Database: MongoDB Atlas connection string setup
- Monitoring: Sentry integration (frontend + backend)
- Analytics: PostHog initialization
- Analytics: Google Analytics 4 setup

## Key Files to Create

### Frontend Core Files

- `frontend/src/App.tsx` - Main app component with routing
- `frontend/src/main.tsx` - Entry point
- `frontend/src/theme/theme.ts` - MUI dark theme configuration
- `frontend/src/store/authStore.ts` - Zustand auth state
- `frontend/src/services/api.ts` - Axios client with interceptors
- `frontend/src/components/UploadZone.tsx` - Drag-and-drop upload component
- `frontend/src/pages/Dashboard.tsx` - Main dashboard
- `frontend/src/pages/ContractDetail.tsx` - Analysis results view
- `frontend/src/components/RiskFlags.tsx` - Risk visualization component
- `frontend/src/components/ContractTimeline.tsx` - Timeline visualization

### Backend Core Files

- `backend/src/server.ts` - Express server setup
- `backend/src/models/User.ts` - User Mongoose schema
- `backend/src/models/Contract.ts` - Contract Mongoose schema
- `backend/src/models/Subscription.ts` - Subscription Mongoose schema
- `backend/src/routes/auth.routes.ts` - Authentication endpoints
- `backend/src/routes/contract.routes.ts` - Contract upload/analysis endpoints
- `backend/src/routes/subscription.routes.ts` - Payment/subscription endpoints
- `backend/src/services/openai.service.ts` - OpenAI integration
- `backend/src/services/paddle.service.ts` - Paddle payment integration
- `backend/src/services/email.service.ts` - Resend email service
- `backend/src/services/fileParser.service.ts` - PDF/DOCX parsing
- `backend/src/middleware/auth.middleware.ts` - JWT verification
- `backend/src/middleware/planLimits.middleware.ts` - Subscription limit checks

### Configuration Files

- `frontend/package.json` - Frontend dependencies
- `backend/package.json` - Backend dependencies
- `.env.example` - Environment variables template
- `README.md` - Setup and deployment guide

## Technology Stack Summary

**Frontend:**

- React 18 + TypeScript
- Vite
- Material-UI (MUI) v5
- Zustand
- React Query
- React Hook Form + Zod
- Framer Motion
- Axios

**Backend:**

- Node.js + Express + TypeScript
- MongoDB + Mongoose
- OpenAI API (GPT-4o)
- Paddle SDK
- Resend SDK
- AWS SDK (S3)
- pdf-parse, mammoth
- bcrypt, jsonwebtoken
- express-validator
- express-rate-limit

**Infrastructure:**

- MongoDB Atlas
- AWS S3
- Vercel/Netlify (frontend)
- Vercel Serverless/AWS Lambda (backend)
- Sentry (monitoring)
- PostHog (analytics)
- Google Analytics 4