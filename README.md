# SplitWise Clone

A beautiful, modern, fully functional clone of SplitWise with AI-powered receipt scanning, real-time group balancing, and stunning UI.

## Tech Stack
- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion, Lucide Icons, Sonner (Toasts)
- **Backend**: FastAPI, Python, Prisma ORM, SQLite
- **Authentication**: JWT-based session management

---

## 🚀 Getting Started

Follow these steps to run the application locally on your machine.

### 1. Database & Backend Setup

The backend is built with FastAPI and uses Prisma to manage an SQLite database.

1. Open a new terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   - **Windows**:
     ```bash
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **Mac/Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Push the Prisma schema to create the SQLite database tables:
   ```bash
   prisma db push
   ```
5. Generate the Prisma Python client:
   ```bash
   prisma generate
   ```
6. Start the FastAPI backend server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *The backend API will now be running at http://localhost:8000*

### 2. Frontend Setup

The frontend is a Next.js web application built with Tailwind CSS.

1. Open a **second** terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend application will now be running at http://localhost:3000*

### 3. Usage

1. Open your browser and navigate to [http://localhost:3000](http://localhost:3000).
2. Register a new account or log in.
3. Start creating groups, inviting friends, adding expenses, and scanning receipts!

---

## Folder Structure

- `/backend`: Contains the FastAPI application (`main.py`) and Prisma schema (`prisma/schema.prisma`).
- `/frontend`: Contains the Next.js application, including components and app routes (`src/app`).
- `/frontend/public`: Contains the UI static assets (like generated avatars and group covers).
