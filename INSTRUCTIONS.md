# Frontend Setup and Execution Guide

This document provides complete instructions for setting up, developing, building, and running the Angular frontend application for the **AI-Driven Office Management System**.

---

## Table of Contents
1. [Overview and Tech Stack](#overview-and-tech-stack)
2. [Prerequisites](#prerequisites)
3. [Environment Configuration](#environment-configuration)
4. [Installation](#installation)
5. [Running the Development Server](#running-the-development-server)
6. [Building for Production](#building-for-production)
7. [Enterprise Panels and Application Modules](#enterprise-panels-and-application-modules)
8. [Default Demo Credentials](#default-demo-credentials)
9. [Project Structure](#project-structure)
10. [Troubleshooting and Common Issues](#troubleshooting-and-common-issues)

---

## 1. Overview and Tech Stack

The frontend is an enterprise-grade Single Page Application (SPA):
* **Framework:** [Angular 17 (Standalone Components & Signals)](https://angular.dev/)
* **Language:** TypeScript 5.4+
* **Styling:** [Tailwind CSS 3](https://tailwindcss.com/) & Modern CSS utilities
* **Reactive Programming:** [RxJS 7](https://rxjs.dev/)
* **Document and PDF Export:** `html2pdf.js`, `marked` (Markdown parsing)
* **API Communication:** Angular `HttpClient` with Bearer Token JWT Interceptor

---

## 2. Prerequisites

Ensure your system has the following installed:
* **Node.js:** v18.x, v20.x, or v22.x (`node -v`)
* **npm:** v9.x or v10.x (`npm -v`)
* **Angular CLI (Optional/Global):** `npm install -g @angular/cli` (Local CLI is included in `node_modules`)
* **Running Backend:** FastAPI backend running at `http://localhost:8000`

---

## 3. Environment Configuration (`src/environments/`)

Review the environment settings in [environment.ts](file:///home/abdullah/Abdullah/Software%20Developement/frontend/src/environments/environment.ts):

```typescript
export const environment = {
  production: false,
  version: '1.0.0-dev',
  baseUrl: 'http://localhost:8000/api/v1',
  apiUrl: 'http://localhost:8000/api/v1'
};
```

If your backend is hosted on a remote server or different port, update `baseUrl` / `apiUrl` accordingly.

---

## 4. Installation

Execute the following commands from your terminal:

### Step 4.1: Navigate to the frontend directory
```bash
cd frontend
```

### Step 4.2: Install npm dependencies
```bash
npm install
```

*(If you ever encounter dependency resolution conflicts, run `npm install --legacy-peer-deps`)*

---

## 5. Running the Development Server

### Option 1: Standard npm script
```bash
npm start
```

### Option 2: Accessible across the local network (LAN)
```bash
npm start -- --host 0.0.0.0 --port 4200
```
or via npx:
```bash
npx ng serve --host 0.0.0.0 --port 4200
```

### Accessing the Web Application
Open your browser and navigate to:
* **Application URL:** [http://localhost:4200](http://localhost:4200)

The development server supports Live Reloading, meaning changes to `.ts`, `.html`, or `.css` files automatically refresh the page.

---

## 6. Building for Production

To compile the application bundle for production deployment:

```bash
npm run build
```

* **Output Directory:** `dist/frontend/`
* Includes code minification, tree-shaking, ahead-of-time (AOT) compilation, and optimized bundles.

To preview the production build locally:
```bash
npx serve -s dist/frontend/browser
```

---

## 7. Enterprise Panels and Application Modules

The application includes 23 dedicated panels and features:

| Module / Route | Description |
| :--- | :--- |
| `/login` | Secure JWT authentication with role-based redirection |
| `/dashboard` | Executive KPIs, attendance metrics, quick stats, AI summaries |
| `/employees` | Employee directory, profile creation, and skill matrix |
| `/attendance` | Clock-in / clock-out tracking and monthly history |
| `/leaves` | Leave requests, balance tracking, and approval workflow |
| `/projects` | Multi-project tracking, progress bars, and milestones |
| `/tasks` | Kanban and list views with priorities, statuses, and assignees |
| `/burnout` | AI-driven employee workload and burnout risk assessment |
| `/reports` | Exportable analytics, summaries, and PDF report downloads |
| `/qa` | Bug tracking, severity flags, QA metrics |
| `/finance` | Financial records, department budgets, and expense analytics |
| `/it-support` | IT ticketing, issue categories, resolution states |
| `/inventory` | Asset allocations, serials, and condition tracking |
| `/documents` | File repository and document management |
| `/sales` | Lead pipeline, conversion stages, and customer contacts |
| `/meetings` | Meeting scheduler, agendas, and conference links |
| `/payroll` | Salary generation, slip distribution, and adjustments |
| `/permissions` | Role-Based Access Control (RBAC) panel configuration |
| `/offices` | Multi-branch office location manager |
| `/ranks` & `/designations` | Hierarchical corporate designations and salary bands |
| `/audit-logs` | Comprehensive security and administrative audit trail |

---

## 8. Default Demo Credentials

All seeded accounts share the default password: `password123`

* **Super Admin / CEO:** `ceo@office.ai` *(Full access to all 12+ enterprise panels)*
* **Head of HR:** `hrhead@office.ai` *(HR, Payroll, Leaves, Attendance)*
* **Project Manager:** `pm@office.ai` *(Projects, Tasks, Meetings, Sprints)*
* **Dev Lead:** `devlead@office.ai` *(Dev, QA, Tickets, Tasks)*
* **Developer:** `developer@office.ai` *(Tasks, Attendance, Profile)*

---

## 9. Project Structure

```text
frontend/
├── angular.json           # Angular CLI workspace configuration
├── package.json           # npm dependencies and scripts
├── tailwind.config.js     # Tailwind CSS styles and themes
├── tsconfig.json          # TypeScript compiler configuration
└── src/
    ├── index.html         # Application entry HTML
    ├── main.ts            # Bootstrapping Standalone Angular App
    ├── styles.css         # Global Tailwind and custom theme styles
    ├── environments/      # Environment API URL configurations
    └── app/
        ├── app.component.ts   # Root container component
        ├── app.routes.ts      # Application routing & route guards
        ├── components/        # Reusable UI widgets (Navbar, Sidebar, Drawer)
        ├── guards/            # AuthGuard & RoleGuard route protections
        ├── interceptors/      # JWT Bearer Token HttpInterceptor
        ├── models/            # TypeScript interfaces & DTO definitions
        ├── pages/             # 23 enterprise view components
        └── services/          # HTTP services (Auth, Employee, AI, etc.)
```

---

## 10. Troubleshooting and Common Issues

1. **Port 4200 already in use:**
   * Run on an alternate port:
     ```bash
     npx ng serve --port 4201
     ```

2. **Backend API connection failed / CORS error:**
   * Verify the FastAPI backend is running at `http://localhost:8000`.
   * Check [environment.ts](file:///home/abdullah/Abdullah/Software%20Developement/frontend/src/environments/environment.ts) has the correct `apiUrl` (`http://localhost:8000/api/v1`).
   * Test API health: `curl http://localhost:8000/`

3. **Dependency or build cache issues:**
   * Clear node modules and reinstall:
     ```bash
     rm -rf node_modules package-lock.json
     npm install
     ```
