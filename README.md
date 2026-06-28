# 💻 Stack Underflow

An AI-powered developer Q&A community platform inspired by Stack Overflow. Built with modern web technologies including Next.js 16, React 19, Tailwind CSS v4, Prisma, PostgreSQL, and Gemini AI.

---

## 📸 Screenshot

![Stack Underflow Main Landing Page](public/screenshots/landing-page.png)
*Figure 1: Main landing page dashboard.*

---

## ✨ Features

- **🤖 AI-Powered Answers**: Generate detailed, context-aware answers to programming questions in real time using the Vercel AI SDK and the `gemini-3.5-flash` model.
- **📝 Markdown Editor**: Create, view, and edit questions or answers using a rich Markdown editor, complete with live previews and syntax highlighting for code blocks.
- **🗳️ Voting & Reputation System**: Upvote or downvote questions and answers. Earn reputation points for high-quality contributions.
- **🔖 Collections & Bookmarks**: Save and bookmark your favorite questions to access them later from your profile.
- **🏷️ Tagging System**: Categorize questions with multiple tags to improve searchability and discoverability.
- **💼 Jobs Portal**: Search for developer jobs via an integrated jobs board powered by the JSearch API.
- **🔐 Modern Authentication**: Secure social sign-ins (GitHub, Google) and email/password authentication using NextAuth.js v5 (Beta).
- **🌓 Dark & Light Modes**: Seamless theme switching using `next-themes` styled with Tailwind CSS v4.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Frontend library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) & [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js v5 (Beta)](https://authjs.dev/)
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/) & [Google Gemini 3.5 Flash](https://deepmind.google/technologies/gemini/)
- **Markdown Processing**: [@mdxeditor/editor](https://mdxeditor.dev/) & [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote)

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [pnpm](https://pnpm.io/) (preferred), `npm`, or `yarn`
- A [PostgreSQL](https://www.postgresql.org/) database instance (e.g., Supabase, local PostgreSQL, CockroachDB)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/stackunderflow.git
cd stackunderflow
```

### 2. Install Dependencies

Install project dependencies using your package manager of choice:

```bash
pnpm install
# or
npm install
# or
yarn install
```

### 3. Environment Variables Configuration

Create a `.env` file in the root directory and configure the following environment variables:

```env
# NextAuth Configuration
AUTH_SECRET="your_nextauth_secret_key"
AUTH_GITHUB_ID="your_github_oauth_client_id"
AUTH_GITHUB_SECRET="your_github_oauth_client_secret"
AUTH_GOOGLE_ID="your_google_oauth_client_id"
AUTH_GOOGLE_SECRET="your_google_oauth_client_secret"

# Database Configuration (Supabase/PostgreSQL)
# Connection to database (e.g. pooler connection)
DATABASE_URL="postgresql://username:password@host:port/database?pgbouncer=true"
# Direct connection for schema migrations
DIRECT_URL="postgresql://username:password@host:port/database"

# Gemini AI API Key
GOOGLE_GENERATIVE_AI_API_KEY="your_google_gemini_api_key"

# RapidAPI Key for Jobs search (JSearch)
RAPID_API_KEY="your_rapidapi_jsearch_key"
```

### 4. Database Setup & Migrations

Run the Prisma command to sync your database schema and generate the client:

```bash
npx prisma db push
```

If you need to run/apply migrations:

```bash
npx prisma migrate dev
```

### 5. Running the Application

Start the local development server:

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📂 Project Structure

```text
├── app/                    # Next.js App Router Pages & API Routes
│   ├── (auth)/             # Authentication views (Login, Register)
│   ├── (root)/             # Main application views (Questions, Profile, Community)
│   ├── api/                # API Endpoints (ai, auth, accounts, users)
│   └── layout.tsx          # Root Layout configuration
├── components/             # Reusable UI Components
├── constants/              # Fixed values (navigation links, configurations)
├── context/                # React Context Providers (Themes, Auth)
├── lib/                    # Helper functions, schemas, database clients
├── prisma/                 # Database schema definitions and migrations
├── public/                 # Static assets (images, icons)
│   └── screenshots/        # Project screenshots and visuals
└── types/                  # TypeScript interfaces and type definitions
```
