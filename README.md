<div align="center">

<img src="assets/banner.png" alt="Internship & Placement Tracker" width="100%">

<br>

**A full-stack internship and placement application management system built to keep the entire recruiting pipeline organized in one place.**

<br>

[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=111827)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/API-Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![JavaScript](https://img.shields.io/badge/Language-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=111827)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

</div>

---

## ✦ Overview

Keeping track of internship and placement applications becomes surprisingly difficult once applications start spreading across different companies, portals, deadlines, resumes, notes and interview stages.

**Internship & Placement Tracker** brings that workflow into one focused workspace.

The application supports both:

- **Guest Mode** — quickly track applications locally in the browser without creating an account.
- **Account Mode** — create an account and persist application data through the backend and PostgreSQL database.

The project was built as a practical full-stack application to explore **React, REST API design, authentication, PostgreSQL, file handling, application state management and responsive UI development**.

---

## ✦ What the Application Does

### 📊 Dashboard
A career command center that gives an immediate overview of the recruiting pipeline.

- Total applications
- Applied
- Online Assessments
- Interviews
- Offers
- Rejected
- Upcoming deadlines
- Click-through status filtering

### 📋 Application Management

Create and manage applications with:

- Company
- Role
- Location
- Deadline
- Application status
- Application URL
- Personal notes
- Original job posting
- CV / resume attachment for authenticated users
- Favorite applications

Applications can be edited, deleted, searched, filtered and sorted.

### ⏰ Deadline Intelligence

The tracker makes deadlines easier to act on by distinguishing:

- Due today
- Approaching deadlines
- Upcoming deadlines
- Overdue applications

The dashboard surfaces applications with deadlines coming up within the next 10 days.

### 🔎 Search, Filter & Sort

Find applications quickly using:

- Company / role / location search
- Status filter
- Location filter
- Newest / oldest sorting
- Deadline sorting
- Company A–Z sorting

### 📈 Application Analytics

The Analytics page provides a simple view of the application pipeline and the number of applications at each recruitment stage.

### ⭐ Favorites & Status History

Important applications can be bookmarked with favorites.

Application status progression is also recorded, allowing the recruitment journey to be viewed over time.

### 📝 Personal Notes

A separate notes area keeps general preparation notes and ideas independent from application-specific notes.

### 📄 Documents & Job Information

Authenticated users can associate a CV / resume with an application and store the original job posting text for later reference.

### 🔐 Authentication

The account system includes:

- Sign up
- Email verification through OTP
- Login / logout
- Forgot password
- Password reset through OTP
- Change password
- Profile management
- Protected application data
- User-specific records

Passwords are hashed on the backend, and authentication is handled through JWT-based sessions.

---

## ✦ Screenshots

### Dashboard

<p align="center">
  <img src="assets/dashboard.png" alt="Dashboard" width="96%">
</p>

The dashboard provides a quick snapshot of the application pipeline and surfaces time-sensitive deadlines.

### Applications

<p align="center">
  <img src="assets/applications.png" alt="Applications table" width="96%">
</p>

A centralized application table combines status, deadline, location, documents and management actions with search, filtering and sorting.

### Analytics

<p align="center">
  <img src="assets/analytics.png" alt="Application analytics" width="96%">
</p>

The application pipeline gives a compact view of where applications currently stand.

### Add Application

<p align="center">
  <img src="assets/add-application.png" alt="Add application form" width="96%">
</p>

The application form keeps the information needed to revisit an opportunity in one place.

### Authentication

<p align="center">
  <img src="assets/login.png" alt="Login page" width="520">
</p>

The authentication flow separates account-based data from guest/local tracking.

---

## ✦ System Architecture

```mermaid
flowchart LR
    A["React + Vite<br/>Frontend"] -->|REST API / JSON| B["Node.js + Express<br/>Backend"]
    B --> C["Authentication<br/>JWT + bcrypt"]
    B --> D["PostgreSQL<br/>Database"]
    B --> E["File Storage<br/>CV / Resume Uploads"]
    B --> F["Email Service<br/>OTP / Password Reset"]
```

### Data Modes

```text
                    Internship & Placement Tracker
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
           Guest Mode                 Account Mode
                 │                           │
            localStorage              React Frontend
                                             │
                                         REST API
                                             │
                                      Node + Express
                                             │
                                      PostgreSQL DB
```

---

## ✦ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React, Vite, JavaScript, React Router, CSS |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **Authentication** | JWT, bcrypt, HTTP-only cookies |
| **Email** | Nodemailer / SMTP |
| **File Handling** | Multer |
| **Development** | VS Code, Git, GitHub |
| **API Style** | REST |

---

## ✦ Project Structure

```text
Internship Tracker/
│
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── uploads/
│   ├── auth.js
│   ├── db.js
│   ├── schema.sql
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── internship-tracker-frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ApplicationForm.jsx
│   │   │   ├── ApplicationTable.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Filters.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── UpcomingDeadlines.jsx
│   │   │
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   │
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## ✦ Getting Started

### Prerequisites

Make sure the following are installed:

- [Node.js](https://nodejs.org/)
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd internship-placement-tracker
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` and configure the database, authentication and email variables required by the application.

Example:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/internship_tracker
JWT_SECRET=your_secret
EMAIL_HOST=your_smtp_host
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASSWORD=your_password
EMAIL_FROM=your_sender
```

> **Never commit `.env` or credentials to GitHub.**

### 3. Set up PostgreSQL

Create the database and execute the schema:

```bash
psql -U postgres -d internship_tracker -f schema.sql
```

### 4. Start the backend

```bash
npm start
```

The backend runs on:

```text
http://localhost:5000
```

### 5. Start the frontend

Open a second terminal:

```bash
cd internship-tracker-frontend
npm install
npm run dev
```

The Vite development server will provide the local frontend URL.

---

## ✦ Security & Data Handling

The project was designed with account separation and credential protection in mind.

- Passwords are hashed before storage.
- Authentication tokens are handled through cookies.
- Protected routes require authentication.
- Application records are associated with individual users.
- Guest data remains local to the browser.
- Sensitive environment variables are excluded from version control.
- Uploaded CV / resume files are handled through the backend.

> This project is intended as a portfolio / educational application and should undergo additional security hardening before handling sensitive production data at scale.

---

## ✦ Design Principles

The interface was intentionally designed around a few principles:

**Clarity over clutter**  
The tracker focuses on the information needed while managing applications.

**Action-oriented dashboard**  
Important statuses and deadlines are visible without navigating through multiple screens.

**Responsive workflow**  
Core application-management functionality is designed to work across laptop and smaller screens.

**Progressive complexity**  
A user can start in Guest Mode and move to a persistent account when needed.

---

## ✦ Current Scope

### Implemented

- [x] React frontend
- [x] Express REST backend
- [x] PostgreSQL persistence
- [x] Guest Mode with local storage
- [x] Account-based application storage
- [x] Email verification
- [x] Password recovery
- [x] Application CRUD
- [x] Search / filter / sort
- [x] Deadline tracking
- [x] Application analytics
- [x] Favorites
- [x] Status history
- [x] Personal notes
- [x] Original job posting storage
- [x] CV / resume upload for authenticated users
- [x] Responsive navigation and UI
- [x] Dark theme

---

## ✦ Future Scope

The project can be extended further without changing its core workflow.

### 🤖 AI-Assisted Application Understanding
Use a genuine AI/NLP service to understand pasted job descriptions or uploaded screenshots and intelligently extract structured information such as company, role, location, deadline and requirements.

### 🔔 Automated Notifications
Add email or browser notifications for approaching application deadlines, interview dates and important status changes.

### ☁️ Production Deployment
Deploy the frontend, backend and database using production infrastructure with environment-specific configuration.

### 📥 Guest-to-Account Migration
Allow users to transfer their locally stored Guest Mode applications into a newly created account.

### 📊 Advanced Analytics
Add trends over time, response rates, application-source analysis and stage conversion metrics.

### 📱 Progressive Web App
Improve the mobile experience and explore installable / offline capabilities.

---

## ✦ Why I Built It

Internship and placement preparation often involves applying to many companies simultaneously. Important information can end up scattered across job portals, spreadsheets, browser tabs, resumes and personal notes.

This project turns that fragmented workflow into a single application-management system.

Beyond solving a practical problem, the project provided hands-on experience with:

- Full-stack application architecture
- REST API development
- Relational database design
- Authentication and authorization
- Frontend state management
- File uploads
- Email-based workflows
- Responsive UI design
- Git and GitHub-based development

---

## ✦ Learning Outcomes

Through this project, I worked across the complete application stack:

```text
UI Design
   ↓
React Components
   ↓
Client-side State & Routing
   ↓
REST API
   ↓
Express Backend
   ↓
Authentication / Authorization
   ↓
PostgreSQL
```

This helped bridge the gap between individual programming concepts and building a complete software system.

---

## ✦ Author

<div align="center">

### B. Shruthika

**B.Tech. Electrical Engineering · IIT Tirupati**

Built as a full-stack software project for internship and placement workflow management.

</div>

---

<div align="center">

**Internship & Placement Tracker**

*Organize applications. Track progress. Stay ahead of deadlines.*

</div>
