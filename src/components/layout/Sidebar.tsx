import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Building2,
  MessageSquare,
  FileSpreadsheet,
  Calendar,
  Layers,
  GraduationCap,
  Users,
  BookOpen,
  Link2,
  Settings,
  LogOut,
  X,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onCloseMobile }) => {
  const { logout, adminUser } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Faculty Performance', path: '/admin/faculty-performance', icon: BarChart3 },
    { label: 'Department Performance', path: '/admin/department-performance', icon: Building2 },
    { label: 'Feedback Responses', path: '/admin/responses', icon: MessageSquare },
    { label: 'Reports', path: '/admin/reports', icon: FileSpreadsheet },
    
    { header: 'DATA FEED & MANAGEMENT' },
    { label: 'Feed Data (Bulk Import)', path: '/admin/feed-data', icon: FileSpreadsheet },
    { label: 'Academic Years', path: '/admin/academic-years', icon: Calendar },
    { label: 'Departments', path: '/admin/departments', icon: Building2 },
    { label: 'Programmes', path: '/admin/programmes', icon: Layers },
    { label: 'Faculty Members', path: '/admin/faculty', icon: Users },
    { label: 'Courses', path: '/admin/courses', icon: BookOpen },
    { label: 'Faculty-Course Mappings', path: '/admin/mappings', icon: Link2 },
    
    { header: 'SYSTEM CONTROL' },
    { label: 'Dataset Manager (Excel)', path: '/admin/dataset-manager', icon: FileSpreadsheet },
    { label: 'Institution Settings', path: '/admin/settings', icon: Settings },
  ];

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800 w-64 select-none no-print">
      {/* Sidebar Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {settings.institution_logo ? (
            <img
              src={settings.institution_logo}
              alt="Logo"
              className="w-9 h-9 object-cover rounded-lg border border-slate-700"
            />
          ) : (
            <div className="p-2 bg-brand-600 text-white rounded-lg">
              <GraduationCap className="w-5 h-5" />
            </div>
          )}
          <div>
            <span className="text-base font-extrabold text-white tracking-tight">EduFeedback</span>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              {settings.institution_short_name} IQAC Admin
            </p>
          </div>
        </div>

        {onCloseMobile && (
          <button onClick={onCloseMobile} className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
        {navItems.map((item, idx) => {
          if (item.header) {
            return (
              <div key={idx} className="pt-4 pb-1 px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                {item.header}
              </div>
            );
          }

          const Icon = item.icon!;
          return (
            <NavLink
              key={item.path}
              to={item.path!}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/30'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User Footer & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-bold text-white truncate">{adminUser?.name || 'Administrator'}</p>
            <p className="text-[11px] text-slate-500 truncate">{adminUser?.email || 'admin@niet.edu'}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 z-30">
        {content}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative z-10 animate-slideRight">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
