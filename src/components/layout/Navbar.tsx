import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquarePlus, GraduationCap, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const { settings } = useSettings();
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <Link to="/" className="flex items-center gap-3">
            {settings.institution_logo ? (
              <img
                src={settings.institution_logo}
                alt={settings.institution_name}
                className="w-10 h-10 object-cover rounded-lg border border-gray-200"
              />
            ) : (
              <div className="p-2 bg-brand-600 text-white rounded-lg">
                <GraduationCap className="w-6 h-6" />
              </div>
            )}
            <div>
              <span className="text-lg font-extrabold tracking-tight text-gray-900 flex items-center gap-1.5">
                EduFeedback
                <span className="text-[10px] uppercase font-bold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                  IQAC System
                </span>
              </span>
              <p className="text-xs text-gray-500 hidden sm:block">
                {settings.institution_short_name} • Student Evaluation Portal
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-3">
            <Link
              to="/feedback"
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all shadow-sm ${
                location.pathname === '/feedback'
                  ? 'bg-brand-600 text-white shadow-brand-200'
                  : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
              }`}
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Give Feedback</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

