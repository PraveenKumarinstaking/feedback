import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, RotateCcw, Home } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { useSettings } from '../contexts/SettingsContext';

export const FeedbackSuccessPage: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-100 max-w-lg w-full shadow-xl animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Feedback Submitted Successfully
          </h1>

          <p className="text-sm text-gray-600 mt-3 leading-relaxed">
            Thank you for your valuable feedback. Your confidential response has been recorded and will help improve the teaching–learning process at <strong className="text-gray-800">{settings.institution_name}</strong>.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/feedback"
              className="w-full sm:w-auto px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Submit Another Feedback</span>
            </Link>

            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
