# AI-Driven Office Management System — Frontend (Angular)

A modern, responsive, enterprise-grade Single Page Application (SPA) built with **Angular 17**, **Tailwind CSS**, and **Angular Signals**. Designed with sleek aesthetics, intuitive workflows, and direct integration with an intelligent FastAPI backend and **Google Gemini AI**.

---

## 📌 Project Overview

The frontend serves as the interactive control center for modern enterprise operations. Replacing fragmented tools and manual spreadsheets, it delivers a unified user experience across all departments—from staff clocking in and submitting leaves to HR managers configuring dynamic designations, finance officers running payroll, and executives reviewing real-time **AI-generated health summaries**.

The user interface features a **glassmorphism dark/light modern UI**, dynamic organograms, interactive calendar logs, visual burnout radar gauges, and an integrated **AI Assistant Drawer** accessible from anywhere in the application.

---

## 🚀 Key Feature Modules

### 1. 👥 HR, Designation Matrix & Visual Organogram
* **Designation-Driven Access:** The UI dynamically adapts based on the user's Designation and Rank. Navigation menus and action buttons (`Create`, `Edit`, `Delete`) automatically show or hide using reactive permission helpers (`canView`, `canCreate`, `canEdit`, `canDelete`).
* **Visual Organogram:** Interactive hierarchical tree visualizing the company's organizational chart across branches and departments.
* **Granular Permission Matrix Editor:** HR leaders can customize access to 25+ functional panels across 10 business domains without touching backend code.
* **Employee Directory:** Complete staff profiles with contact details, branch assignments, designation history, salary structures, and status toggles.

### 2. ⏱️ Smart Attendance Dashboard
* **1-Click Clock-In / Clock-Out:** Intuitive header and dashboard clock widget displaying live elapsed time, today's check-in/out timestamps, and real-time status badges (`Present`, `Late`, `Half-day`).
* **Overtime & Shift Tracking:** Displays computed daily working hours and overtime hours with weekend-shift badges.
* **Attendance Calendar & Table Views:** Filterable monthly attendance history with office-wise analytics and attendance percentage metrics.

### 3. 🏖️ Leave Management & Approval Portal
* **Employee Self-Service Portal:** Visual leave balance cards showing available quotas across categories (Sick, Casual, Annual, Unpaid).
* **Interactive Leave Application:** Clean modal form with date pickers, reason inputs, and emergency contact fields.
* **Two-Tier Approval Inbox:** Designated managers and HR officers receive pending leave applications with 1-click **Approve** or **Reject** actions and remarks.
* **Real-time Synchronization:** Approved leaves instantly reflect on employee attendance logs and payroll calculations.

### 4. 💰 Automated Smart Payroll & PDF Payslip Generator
* **Monthly Salary Overview:** View and filter payroll runs by month, office branch, and payment status (`Draft`, `Approved`, `Paid`).
* **Detailed Salary Breakdown:** Transparent modal showcasing Basic Salary, Allowances (House Rent, Medical, Transport, Food), Overtime Earnings, and Deductions (Late Penalties, Unpaid Leaves, Tax, Provident Fund).
* **1-Click PDF Payslip Download:** Built-in client-side PDF export utilizing `html2pdf.js`, generating beautifully formatted, print-ready corporate payslips with company branding.

### 5. 🔥 Predictive Burnout Risk Radar (AI Health)
* **Visual Risk Gauges:** Color-coded status radar cards categorizing employee fatigue into **Low**, **Moderate**, **High**, and **Critical** risk levels.
* **30-Day Multi-Vector Metrics:** Interactive data table displaying 30-day overtime hours, average daily work duration, late arrival counts, and pending high-priority task backlogs.
* **AI-Generated Intervention Plans:** Gemini-powered root-cause diagnosis explaining why a staff member is overwhelmed, paired with actionable managerial workload-rebalancing suggestions.

### 6. 🧠 Integrated Gemini AI Assistant & Executive Copilot
* **Slide-Out AI Assistant Drawer:** Global, collapsible conversational drawer accessible from any page.
* **Context-Aware Inquiries:** Natural-language chat grounded in real-time company telemetry (e.g., *"Which projects are currently delayed?"*, *"Who has the highest overtime this month?"*).
* **Smart Task Recommendation Engine:** Recommends the best-fit employee for new assignments based on required skills and real-time workload availability.
* **Executive Performance Summaries:** 1-click generation of comprehensive company-wide executive reports with rich Markdown rendering via `marked`.

---

## 🛠️ Technology Stack & Architecture

* **Framework:** [Angular 17](https://angular.dev/) (Standalone Components, No NgModules)
* **Styling & Design System:** [Tailwind CSS](https://tailwindcss.com/) with PostCSS & Autoprefixer
* **Reactive State Management:** Angular Signals & RxJS
* **Routing & Security:** Angular Router with reactive `AuthGuard` and role-based guards
* **Document Export:** `html2pdf.js` for instant client-side payslip generation
* **Markdown Rendering:** `marked` for rendering AI assistant markdown responses
* **Testing:** Jasmine & Karma (`ng test`)

---

## 📁 Project Structure

```text
frontend/src/app/
├── components/          # Reusable UI widgets, navigation bars, and AI Assistant drawer
├── models/              # TypeScript interfaces, enums, and API data models
├── pages/               # Functional feature pages:
│   ├── attendance/      # Clock-in/out, logs, time-slot management
│   ├── audit-logs/      # Compliance and administrative action trails
│   ├── burnout/         # Predictive AI burnout risk radar
│   ├── dashboard/       # Executive KPIs, quick actions, and recent activities
│   ├── designations/    # Designation hierarchy and permission matrix editor
│   ├── documents/       # Central document repository
│   ├── employees/       # Staff profiles, directory, and organogram
│   ├── finance/         # Corporate expenses, revenue, and invoices
│   ├── inventory/       # IT asset and equipment tracking
│   ├── it-support/      # Internal ticketing desk
│   ├── leaves/          # Self-service leave portal and approval workflows
│   ├── login/           # Secure JWT authentication
│   ├── meetings/        # Meeting scheduler with AI summaries
│   ├── offices/         # Branch office management
│   ├── payroll/         # Salary structures, processing, and PDF payslips
│   ├── permissions/     # System-wide permission control center
│   ├── projects/        # Project milestones and delivery tracking
│   ├── qa/              # QA test cases and bug tracking
│   ├── ranks/           # Organizational seniority ranks
│   ├── reports/         # AI analytics and executive report view
│   ├── sales/           # Sales pipeline and CRM lead tracking
│   └── tasks/           # Sprint boards and Kanban task management
└── services/            # Angular HTTP services with reactive state & signal stores
```

---

## ⚙️ Environment Configuration

Configuration files are located in `src/environments/`:

```typescript
// src/environments/environment.ts (Development)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/v1'
};
```

---

## 🚦 Quick Start Guide

### 1. Prerequisites
Ensure **Node.js** (v18.x, v20.x, or v22.x) and **npm** are installed:
```bash
node -v
npm -v
```

### 2. Navigate to Frontend Directory & Install Dependencies
```bash
cd frontend
npm install
```

### 3. Run Development Server
```bash
npm start
# or: npx ng serve --host 0.0.0.0 --port 4200
```

* **Application URL:** [http://localhost:4200/](http://localhost:4200/)
* The development server supports Live Reloading on code changes.

### 4. Build for Production
```bash
npm run build
```
Compiled production assets will be output to the `dist/frontend/browser/` directory.

---

## 🔑 Demo Login Credentials

You can sign in with any of the seeded enterprise accounts (Password for all: `password123`):

* **Managing Director:** `md@company.com` (Unrestricted view of all panels)
* **HR Manager:** `hr@company.com` (Full HR, Attendance, Leaves, Designations)
* **Finance Director:** `finance@company.com` (Payroll runs, Expense logs, Salary structures)
* **Engineering Lead:** `techlead@company.com` (Sprint tasks, QA bugs, Project milestones)
* **Employee:** `employee@company.com` (Personal dashboard, Clock-in, Leave requests)
