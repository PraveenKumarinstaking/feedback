import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';

import { LandingPage } from './pages/LandingPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { FeedbackSuccessPage } from './pages/FeedbackSuccessPage';
import { AdminLogin } from './pages/AdminLogin';

import { AdminLayout } from './components/layout/AdminLayout';
import { Dashboard } from './pages/Dashboard';
import { FacultyPerformance } from './pages/FacultyPerformance';
import { FacultyDetail } from './pages/FacultyDetail';
import { DepartmentPerformance } from './pages/DepartmentPerformance';
import { FeedbackResponses } from './pages/FeedbackResponses';
import { ReportsPage } from './pages/ReportsPage';

import { AcademicYears } from './pages/AcademicYears';
import { Departments } from './pages/Departments';
import { Programmes } from './pages/Programmes';
import { FacultyPage } from './pages/FacultyPage';
import { CoursesPage } from './pages/CoursesPage';
import { MappingsPage } from './pages/MappingsPage';
import { SettingsPage } from './pages/SettingsPage';
import { DatasetManager } from './pages/DatasetManager';
import { FeedDataPage } from './pages/FeedDataPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/feedback/success" element={<FeedbackSuccessPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Portal Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="analytics" element={<Dashboard />} />
              <Route path="faculty-performance" element={<FacultyPerformance />} />
              <Route path="faculty/:id" element={<FacultyDetail />} />
              <Route path="department-performance" element={<DepartmentPerformance />} />
              <Route path="responses" element={<FeedbackResponses />} />
              <Route path="reports" element={<ReportsPage />} />

              {/* Master Data CRUD & Data Feeding */}
              <Route path="feed-data" element={<FeedDataPage />} />
              <Route path="academic-years" element={<AcademicYears />} />
              <Route path="departments" element={<Departments />} />
              <Route path="programmes" element={<Programmes />} />
              <Route path="faculty" element={<FacultyPage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="mappings" element={<MappingsPage />} />
              <Route path="dataset-manager" element={<DatasetManager />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  );
};
