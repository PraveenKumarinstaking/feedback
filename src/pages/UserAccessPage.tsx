import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Smartphone,
  Monitor,
  Users,
  Eye,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Save,
  Activity,
  Layers,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { UserRoleAccess, PageViewAnalytics } from '../types';
import { LoadingState } from '../components/common/LoadingState';

export const UserAccessPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<UserRoleAccess[]>([]);
  const [pageViews, setPageViews] = useState<PageViewAnalytics[]>([]);
  const [activeTab, setActiveTab] = useState<'matrix' | 'traffic'>('matrix');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const rolesData = await dbService.getUserRoles();
      const viewsData = await dbService.getPageViewAnalytics();
      setRoles(rolesData);
      setPageViews(viewsData);
    } catch (e) {
      console.error('Failed to load user access data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = async (roleId: string, permissionKey: keyof UserRoleAccess) => {
    const updatedRoles = roles.map(r => {
      if (r.role_id === roleId) {
        return {
          ...r,
          [permissionKey]: !r[permissionKey]
        };
      }
      return r;
    });
    setRoles(updatedRoles);
    const targetRole = updatedRoles.find(r => r.role_id === roleId);
    if (targetRole) {
      await dbService.saveUserRole(targetRole);
      setSaveSuccess(`Updated permissions for ${targetRole.role_name}`);
      setTimeout(() => setSaveSuccess(null), 3000);
    }
  };

  if (loading) {
    return <LoadingState message="Loading User Access & Device Analytics..." />;
  }

  // Calculate totals
  const totalDesktopViews = pageViews.reduce((acc, curr) => acc + curr.desktop_views, 0);
  const totalMobileViews = pageViews.reduce((acc, curr) => acc + curr.mobile_views, 0);
  const grandTotalViews = totalDesktopViews + totalMobileViews;
  const mobilePct = grandTotalViews > 0 ? Math.round((totalMobileViews / grandTotalViews) * 100) : 0;
  const desktopPct = grandTotalViews > 0 ? Math.round((totalDesktopViews / grandTotalViews) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">User Access & Device Matrix</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-100 text-brand-700">
              Desktop + Mobile Control
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Configure access control privileges, monitor desktop vs mobile user traffic, and manage module permissions.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'matrix'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>Role Permissions Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('traffic')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'traffic'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Activity className="w-4 h-4 text-indigo-600" />
            <span>Desktop & Mobile Traffic</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* KPI Cards: Device & Access Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Desktop Views */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-400">Desktop Access</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Monitor className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{totalDesktopViews.toLocaleString()}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>Desktop Share</span>
            <span className="font-bold text-blue-600">{desktopPct}%</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${desktopPct}%` }}></div>
          </div>
        </div>

        {/* Mobile Views */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-400">Mobile Access</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{totalMobileViews.toLocaleString()}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>Mobile Share</span>
            <span className="font-bold text-purple-600">{mobilePct}%</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full" style={{ width: `${mobilePct}%` }}></div>
          </div>
        </div>

        {/* Total Page Views */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-400">Total System Views</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{grandTotalViews.toLocaleString()}</p>
          <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> High Mobile Engagement
          </p>
        </div>

        {/* User Roles */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-400">Configured Roles</span>
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{roles.length} Access Roles</p>
          <p className="text-xs text-gray-500 mt-2">Active Session Routing Enabled</p>
        </div>
      </div>

      {activeTab === 'matrix' ? (
        /* Role Permissions Matrix */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">User Access Control Matrix</h2>
              <p className="text-xs text-gray-500 mt-0.5">Toggle live module permissions for Students, Faculty, HODs, and Administrators.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="p-4">User Role</th>
                  <th className="p-4 text-center">Give Feedback</th>
                  <th className="p-4 text-center">View Analytics</th>
                  <th className="p-4 text-center">Manage Faculty</th>
                  <th className="p-4 text-center">Feed Data</th>
                  <th className="p-4 text-center">Export Reports</th>
                  <th className="p-4 text-center">Manage Settings</th>
                  <th className="p-4 text-right">Active Users</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                {roles.map(role => (
                  <tr key={role.role_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 max-w-xs">
                      <div className="font-bold text-gray-900 text-sm">{role.role_name}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{role.description}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-600 rounded">
                        Target: {role.target_users}
                      </span>
                    </td>

                    {/* Give Feedback */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleTogglePermission(role.role_id, 'can_give_feedback')}
                        className={`p-2 rounded-xl transition-all ${
                          role.can_give_feedback
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        title="Toggle Give Feedback Access"
                      >
                        {role.can_give_feedback ? <CheckCircle2 className="w-5 h-5 mx-auto" /> : <Lock className="w-5 h-5 mx-auto" />}
                      </button>
                    </td>

                    {/* View Analytics */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleTogglePermission(role.role_id, 'can_view_analytics')}
                        className={`p-2 rounded-xl transition-all ${
                          role.can_view_analytics
                            ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        title="Toggle View Analytics Access"
                      >
                        {role.can_view_analytics ? <CheckCircle2 className="w-5 h-5 mx-auto" /> : <Lock className="w-5 h-5 mx-auto" />}
                      </button>
                    </td>

                    {/* Manage Faculty */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleTogglePermission(role.role_id, 'can_manage_faculty')}
                        className={`p-2 rounded-xl transition-all ${
                          role.can_manage_faculty
                            ? 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        title="Toggle Manage Faculty Access"
                      >
                        {role.can_manage_faculty ? <CheckCircle2 className="w-5 h-5 mx-auto" /> : <Lock className="w-5 h-5 mx-auto" />}
                      </button>
                    </td>

                    {/* Feed Data */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleTogglePermission(role.role_id, 'can_feed_data')}
                        className={`p-2 rounded-xl transition-all ${
                          role.can_feed_data
                            ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        title="Toggle Feed Data Access"
                      >
                        {role.can_feed_data ? <CheckCircle2 className="w-5 h-5 mx-auto" /> : <Lock className="w-5 h-5 mx-auto" />}
                      </button>
                    </td>

                    {/* Export Reports */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleTogglePermission(role.role_id, 'can_export_reports')}
                        className={`p-2 rounded-xl transition-all ${
                          role.can_export_reports
                            ? 'bg-teal-50 text-teal-600 hover:bg-teal-100'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        title="Toggle Export Reports Access"
                      >
                        {role.can_export_reports ? <CheckCircle2 className="w-5 h-5 mx-auto" /> : <Lock className="w-5 h-5 mx-auto" />}
                      </button>
                    </td>

                    {/* Manage Settings */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleTogglePermission(role.role_id, 'can_manage_settings')}
                        className={`p-2 rounded-xl transition-all ${
                          role.can_manage_settings
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        title="Toggle Manage Settings Access"
                      >
                        {role.can_manage_settings ? <CheckCircle2 className="w-5 h-5 mx-auto" /> : <Lock className="w-5 h-5 mx-auto" />}
                      </button>
                    </td>

                    {/* Active Sessions */}
                    <td className="p-4 text-right">
                      <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full text-xs">
                        {role.active_sessions_count} users
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Page View Traffic & Device Access Log */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Desktop & Mobile Page Access Analytics</h2>
              <p className="text-xs text-gray-500 mt-0.5">Track traffic volume across mobile smartphones, tablets, and desktop browsers.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="p-4">Module / Page Title</th>
                  <th className="p-4">Route Path</th>
                  <th className="p-4">Primary Audience</th>
                  <th className="p-4 text-center">Desktop Views</th>
                  <th className="p-4 text-center">Mobile Views</th>
                  <th className="p-4 text-center">Device Ratio</th>
                  <th className="p-4 text-right">Avg Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                {pageViews.map(item => {
                  const total = item.desktop_views + item.mobile_views;
                  const mPct = total > 0 ? Math.round((item.mobile_views / total) * 100) : 0;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{item.page_title}</td>
                      <td className="p-4 font-mono text-gray-500 text-[11px]">{item.route_path}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700">
                          {item.access_role}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-blue-700">{item.desktop_views.toLocaleString()}</td>
                      <td className="p-4 text-center font-bold text-purple-700">{item.mobile_views.toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <div className="w-32 mx-auto flex items-center gap-1">
                          <span className="text-[10px] font-bold text-blue-600">{100 - mPct}%</span>
                          <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden flex">
                            <div className="bg-blue-500 h-full" style={{ width: `${100 - mPct}%` }}></div>
                            <div className="bg-purple-500 h-full" style={{ width: `${mPct}%` }}></div>
                          </div>
                          <span className="text-[10px] font-bold text-purple-600">{mPct}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-right font-bold text-gray-700">{Math.floor(item.avg_time_seconds / 60)}m {item.avg_time_seconds % 60}s</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
