# ContractIQ - AI Contract Analyzer SaaS

> Understand any contract in 60 seconds — no lawyer needed.

ContractIQ is a production-ready AI-powered SaaS application that helps users analyze contracts, identify risks, and understand legal clauses in plain English.

## 🚀 Features

- **AI-Powered Analysis**: Upload PDF or DOCX contracts and get instant analysis
- **Risk Detection**: Automatically flags red flags like non-compete clauses, auto-renewal terms, and liability issues
- **Plain English Summaries**: Complex legal language explained simply
- **Subscription Plans**: Free, Pro, Business, and Enterprise tiers
- **Team Collaboration**: Workspace features for Business/Enterprise plans
- **Shareable Reports**: Generate secure links to share analysis results
- **Dark Mode UI**: Beautiful, modern dark-mode interface

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Material-UI (MUI) v5
- Zustand (state management)
- React Query
- React Hook Form + Zod
- Framer Motion
- Axios

### Backend
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- OpenAI API (GPT-4o)
- Paddle (payments)
- Resend (email)
- AWS S3 (file storage)
- JWT authentication

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- AWS S3 bucket (for file storage)
- OpenAI API key
- Paddle account
- Resend account

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd contractIQ
```

2. **Install dependencies**

Frontend:
```bash
cd frontend
npm install
```

Backend:
```bash
cd backend
npm install
```

3. **Configure environment variables**

Copy `.env.example` to `.env` in the backend directory and fill in your values:
```bash
cd backend
cp ../.env.example .env
# Edit .env with your actual values
```

4. **Start the development servers**

Backend (from `backend/` directory):
```bash
npm run dev
```

Frontend (from `frontend/` directory):
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:5000`.

## 🏗️ Project Structure

```
contractIQ/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── store/         # Zustand stores
│   │   ├── services/      # API client
│   │   ├── utils/         # Utilities
│   │   └── theme/         # MUI theme
│   └── package.json
├── backend/           # Express API
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── models/        # Mongoose models
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utilities
│   │   └── config/        # Configuration
│   └── package.json
├── shared/            # Shared TypeScript types
└── README.md
```

## 🔐 Environment Variables

See `.env.example` for all required environment variables. Key variables:

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT token signing
- `OPENAI_API_KEY`: OpenAI API key
- `AWS_*`: AWS S3 credentials
- `PADDLE_API_KEY`: Paddle API key
- `RESEND_API_KEY`: Resend API key

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Contracts
- `POST /api/contracts/upload` - Upload contract file
- `GET /api/contracts` - List user's contracts
- `GET /api/contracts/:id` - Get contract details
- `GET /api/contracts/:id/analysis` - Get analysis results
- `DELETE /api/contracts/:id` - Delete contract

### Subscriptions
- `POST /api/subscription/create-checkout` - Create Paddle checkout
- `GET /api/subscription/status` - Get subscription status
- `POST /api/subscription/webhook` - Paddle webhook handler

## 🚢 Deployment

### Frontend (Vercel/Netlify)

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy to Vercel:
```bash
vercel --prod
```

Or deploy to Netlify via their dashboard.

### Backend

The backend can be deployed to:
- Vercel Serverless Functions
- AWS Lambda
- Heroku
- Railway
- DigitalOcean App Platform

Make sure to set all environment variables in your deployment platform.

### Database

Use MongoDB Atlas for production:
1. Create a cluster
2. Get connection string
3. Set `MONGODB_URI` in environment variables

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📧 Support

For support, email support@contractiq.com or open an issue.

