# EduFeedback – Student Feedback & Teaching Evaluation Management System

**EduFeedback** is a complete, modern, responsive web application designed for colleges and higher education institutions to collect confidential student feedback on teaching quality, automatically calculate faculty & department performance scores, and generate official IQAC reports.

---

## 🌟 Key Features

1. **Student Feedback Portal (`/feedback`)**:
   - 4-Step progressive feedback wizard optimized for mobile and desktop.
   - Dynamic dependent selection: Academic Year → Department → Programme → Semester → Course & mapped Faculty.
   - 15 Mandatory Evaluation Criteria evaluated on a 1–5 scale.
   - Anonymous student suggestions with remaining character counters.
   - Review screen & confirmation before submission.

2. **Admin / IQAC Management Portal (`/admin/*`)**:
   - Protected admin authentication with demo quick-login shortcut.
   - 6 KPI summary cards: Total Responses, Overall Average %, Faculty Evaluated, Courses Evaluated, Active Departments, Improvement Required count.
   - 5 Interactive Recharts Visualizations: Faculty Performance, Department Comparative Bar Chart, Grade Distribution Donut, Question-by-Question Analysis, Feedback Volume Trend Line Chart.
   - Global Filtering Toolbar: Academic Year, Department, Programme, Semester, Course, Faculty, Date Range.

3. **Faculty & Department Analytics**:
   - Searchable, sortable faculty performance tables with letter grades (A+ to D) and IQAC performance classifications.
   - Detailed faculty drill-down view (`/admin/faculty/:id`) with Q1–Q15 score breakdowns, key strengths, areas for focus, and anonymous student comments.

4. **Printable IQAC Reports & Export (`/admin/reports`)**:
   - `@media print` optimized printable report view formatting institution logo, header, metadata, overall score/grade, 15 criteria table, student comments summary, and signature placeholders.
   - One-click CSV export of filtered evaluation data.

5. **Master Data CRUD Modules**:
   - Management interfaces for Academic Years, Departments, Programmes, Faculty Members, Courses, and Faculty-Course-Section Mappings with active/inactive status toggles.

6. **Institutional Settings (`/admin/settings`)**:
   - Configure institution name, short name, logo URL, address, report headers, Principal & IQAC coordinator signatures.
   - Global **Open/Close Feedback Form** switch and **Anonymous Feedback Mode** toggle.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

> [!NOTE]
> The application includes an integrated mock data engine pre-seeded with realistic institutional demo data (departments, programmes, faculty, courses, mappings, and feedback responses). You can immediately test all student and admin features without setting up Supabase upfront!

---

## 🗄️ Supabase Database Migration Setup

To deploy with live Supabase database backend:

1. Create a new project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Paste and execute the contents of `supabase/schema.sql`.
4. Copy your Supabase Project URL and Anon API Key.
5. Create a `.env` file based on `.env.example`:
   ```env
   VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
   ```
6. Restart the development server (`npm run dev`).

---

## 🌐 Deploying to Vercel (Deployment Guide)

### 1. Import Repository on Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Select and Import `PraveenKumarinstaking/feedback`.

### 2. Configure Vercel Project & Deployment Region (Country Source)
- **Framework Preset**: `Vite`
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Deployment Region / Country Source**:
  - In Vercel Project Settings → **Functions & Region** (or during project initialization):
  - Select your preferred server location for lowest latency:
    - 🇮🇳 **Mumbai, India (`bom1`)** — *Recommended for Indian Institutions & Colleges*
    - 🇸🇬 **Singapore (`sin1`)** — *Asia-Pacific*
    - 🇺🇸 **Washington, D.C., USA (`iad1`)** — *North America*
    - 🇪🇺 **Frankfurt, Germany (`fra1`)** — *Europe*

### 3. Environment Variables (Optional for Live Supabase Integration)
Add the following in Vercel **Settings** → **Environment Variables**:
- `VITE_SUPABASE_URL`: `https://your-supabase-project.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: `your-supabase-anon-key-here`

Click **Deploy**! Vercel will automatically build and publish your application. Client-side SPA routing (`/admin/*`, `/feedback`, etc.) is pre-configured via `vercel.json`.

---

## 📄 License & Attribution

Built for academic institutional governance and Internal Quality Assurance Cell (IQAC) reporting standards.

