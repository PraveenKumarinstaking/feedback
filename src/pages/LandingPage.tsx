import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquarePlus, ShieldCheck, Award, BarChart2, CheckCircle2, ArrowRight, GraduationCap } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { useSettings } from '../contexts/SettingsContext';

export const LandingPage: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-brand-50/30 flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/80 text-brand-800 text-xs font-bold mb-6 border border-brand-200 shadow-sm animate-fadeIn">
            Official Student Feedback & IQAC Evaluation Portal
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Your Feedback Shapes <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">Better Learning</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            A secure, confidential, and structured student feedback system designed to improve teaching quality and strengthen academic governance across all programmes.
          </p>

          {!settings.feedback_form_open && (
            <div className="mt-6 p-4 max-w-lg mx-auto bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
              <span>⚠️ Student feedback collection is currently closed by the academic administration.</span>
            </div>
          )}

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/feedback"
              className={`w-full sm:w-auto px-8 py-4 text-base font-extrabold text-white rounded-xl shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 ${
                settings.feedback_form_open
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-brand-500/25'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <MessageSquarePlus className="w-5 h-5" />
              <span>Give Feedback Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/admin/login"
              className="w-full sm:w-auto px-7 py-4 text-base font-extrabold text-gray-800 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5 text-brand-600" />
              <span>Admin Portal Login</span>
            </Link>
          </div>

          <p className="mt-4 text-xs text-gray-400">
            🔒 Your feedback is 100% confidential and anonymous by default.
          </p>
        </section>

        {/* Features & IQAC Standards Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">100% Confidential</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Student ratings are stored anonymously. Individual student identities are never revealed to subject teachers or external reports.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">15 Teaching Parameters</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Evaluates key criteria including subject knowledge, ICT tools usage, syllabus completion, assessment fairness, and mentoring accessibility.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Direct IQAC Impact</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Submitted feedback is automatically aggregated into IQAC performance reports to continuously elevate teaching standards and course design.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-100 py-8 no-print">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-500">
          <p>© 2026 {settings.institution_name}. All rights reserved.</p>
          <p className="mt-1">EduFeedback Student Feedback & Teaching Evaluation System • IQAC Module</p>
        </div>
      </footer>
    </div>
  );
};
