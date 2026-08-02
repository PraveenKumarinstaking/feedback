import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Users, BookOpen, MessageSquare, Award, Eye, ChevronRight, X, ExternalLink, ArrowRight, Star } from 'lucide-react';
import { PerformanceBadge } from '../components/common/PerformanceBadge';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { dbService } from '../services/dbService';
import { DepartmentPerformanceSummary, Faculty, FacultyPerformanceSummary } from '../types';

interface DepartmentFacultyItem extends Faculty {
  perfSummary: FacultyPerformanceSummary | null;
}

export const DepartmentPerformance: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [deptPerf, setDeptPerf] = useState<DepartmentPerformanceSummary[]>([]);
  
  // Selected department for modal / detailed view
  const [selectedDept, setSelectedDept] = useState<DepartmentPerformanceSummary | null>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [departmentFaculty, setDepartmentFaculty] = useState<DepartmentFacultyItem[]>([]);

  useEffect(() => {
    async function loadData(silent: boolean = false) {
      if (!silent) setLoading(true);
      try {
        const data = await dbService.getDepartmentPerformance();
        setDeptPerf(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (!silent) setLoading(false);
      }
    }
    loadData(false);

    const handleRealtimeUpdate = () => {
      loadData(true);
    };

    window.addEventListener('storage', handleRealtimeUpdate);
    window.addEventListener('edu_feedback_submitted', handleRealtimeUpdate);

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        channel = new BroadcastChannel('edu_feedback_channel');
        channel.onmessage = () => handleRealtimeUpdate();
      } catch (e) {}
    }

    const pollInterval = setInterval(() => {
      loadData(true);
    }, 10000);

    return () => {
      window.removeEventListener('storage', handleRealtimeUpdate);
      window.removeEventListener('edu_feedback_submitted', handleRealtimeUpdate);
      if (channel) channel.close();
      clearInterval(pollInterval);
    };
  }, []);

  const handleOpenDepartmentDetails = async (dept: DepartmentPerformanceSummary) => {
    setSelectedDept(dept);
    setModalLoading(true);
    try {
      const [allFaculty, facPerfList] = await Promise.all([
        dbService.getFaculty(),
        dbService.getFacultyPerformance({ departmentId: dept.department_id })
      ]);

      const deptFacs = allFaculty.filter(f => f.department_id === dept.department_id);
      const perfMap = new Map(facPerfList.map(p => [p.faculty_id, p]));

      const combined: DepartmentFacultyItem[] = deptFacs.map(f => ({
        ...f,
        perfSummary: perfMap.get(f.id) || null
      }));

      setDepartmentFaculty(combined);
    } catch (e) {
      console.error('Failed to load department faculty details:', e);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Calculating department performance summaries..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Department Performance Overview</h1>
          <p className="text-xs text-gray-500 mt-1">
            Comparative performance metrics across all active academic departments. Tap any department card to view faculty details and evaluation scores.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
            {deptPerf.length} Academic Departments
          </span>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deptPerf.map(d => (
          <div
            key={d.department_id}
            onClick={() => handleOpenDepartmentDetails(d)}
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:border-brand-300 transition-all duration-200 flex flex-col justify-between cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 bg-brand-50 text-brand-700 font-extrabold text-xs rounded-lg border border-brand-200 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  {d.department_code}
                </span>
                <PerformanceBadge label={d.performance} size="sm" />
              </div>

              <h3 className="text-lg font-black text-gray-900 mb-1 group-hover:text-brand-600 transition-colors flex items-center justify-between">
                <span>{d.department_name}</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-[11px] text-gray-400 mb-4 font-medium">Tap card to inspect faculty scores & evaluation records</p>

              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs mb-4">
                <div>
                  <span className="text-gray-500 font-semibold block">Faculty Count</span>
                  <span className="text-sm font-bold text-gray-900 flex items-center gap-1 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-gray-400" /> {d.faculty_count}
                  </span>
                </div>

                <div>
                  <span className="text-gray-500 font-semibold block">Courses Evaluated</span>
                  <span className="text-sm font-bold text-gray-900 flex items-center gap-1 mt-0.5">
                    <BookOpen className="w-3.5 h-3.5 text-gray-400" /> {d.courses_evaluated_count}
                  </span>
                </div>

                <div>
                  <span className="text-gray-500 font-semibold block">Responses</span>
                  <span className="text-sm font-bold text-gray-900 flex items-center gap-1 mt-0.5">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-400" /> {d.response_count}
                  </span>
                </div>

                <div>
                  <span className="text-gray-500 font-semibold block">Average Score</span>
                  <span className="text-sm font-black text-brand-600 flex items-center gap-1 mt-0.5">
                    <Award className="w-3.5 h-3.5 text-brand-600" /> {d.average_rating} / 5.0
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 block">Overall Score Percentage</span>
                <span className="text-xl font-black text-gray-900">{d.average_percentage}%</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDepartmentDetails(d);
                }}
                className="px-3 py-1.5 bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white font-extrabold text-xs rounded-xl border border-brand-200 transition-all flex items-center gap-1 shadow-sm"
              >
                <Eye className="w-3.5 h-3.5" /> View Faculty & Scores
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Department Faculty Details & Scores Modal */}
      {selectedDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-gray-900 via-brand-950 to-gray-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                  <Building2 className="w-6 h-6 text-brand-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-brand-500/30 text-brand-200 font-extrabold text-[11px] rounded-full border border-brand-400/30">
                      {selectedDept.department_code}
                    </span>
                    <PerformanceBadge label={selectedDept.performance} size="sm" />
                  </div>
                  <h2 className="text-xl font-black tracking-tight mt-1">{selectedDept.department_name}</h2>
                  <p className="text-xs text-gray-300 mt-0.5">Faculty Members, Evaluation Scores & Performance Details</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDept(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Department Summary Header Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-gray-50 border-b border-gray-100">
              <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-xs">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Faculty</span>
                <span className="text-lg font-black text-gray-900 mt-0.5 block">{selectedDept.faculty_count} Members</span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-xs">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Courses Evaluated</span>
                <span className="text-lg font-black text-gray-900 mt-0.5 block">{selectedDept.courses_evaluated_count} Courses</span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-xs">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Responses</span>
                <span className="text-lg font-black text-gray-900 mt-0.5 block">{selectedDept.response_count} Submissions</span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-brand-200 bg-brand-50/40 shadow-xs">
                <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wider block">Average Score</span>
                <span className="text-lg font-black text-brand-700 mt-0.5 block">{selectedDept.average_percentage}% ({selectedDept.average_rating}/5.0)</span>
              </div>
            </div>

            {/* Modal Body - Faculty Members Table */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Faculty Evaluation Scores ({departmentFaculty.length})
                </h3>
                <Link
                  to={`/admin/faculty-performance?search=${encodeURIComponent(selectedDept.department_code)}`}
                  className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 hover:underline"
                >
                  View in Full Faculty Table <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {modalLoading ? (
                <LoadingState message="Loading department faculty members & scores..." />
              ) : departmentFaculty.length === 0 ? (
                <EmptyState
                  title="No Faculty Members Assigned"
                  message={`No faculty members found assigned to ${selectedDept.department_name}.`}
                />
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-700">
                      <thead className="bg-gray-50/90 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                        <tr>
                          <th className="p-3.5">Faculty Member</th>
                          <th className="p-3.5 text-center">Courses</th>
                          <th className="p-3.5 text-center">Responses</th>
                          <th className="p-3.5 text-center">Avg Rating</th>
                          <th className="p-3.5 text-center">Score %</th>
                          <th className="p-3.5 text-center">Grade</th>
                          <th className="p-3.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {departmentFaculty.map((f) => {
                          const perf = f.perfSummary;
                          return (
                            <tr key={f.id} className="hover:bg-gray-50/80 transition-colors">
                              <td className="p-3.5">
                                <div className="font-bold text-gray-900">{f.faculty_name}</div>
                                <div className="text-[11px] text-gray-400 font-medium">{f.designation} • {f.faculty_code}</div>
                              </td>
                              <td className="p-3.5 text-center font-bold text-gray-700">
                                {perf ? perf.courses_evaluated_count : 0}
                              </td>
                              <td className="p-3.5 text-center font-bold text-gray-700">
                                {perf ? (
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-md">
                                    {perf.response_count}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">0</span>
                                )}
                              </td>
                              <td className="p-3.5 text-center font-extrabold text-gray-900">
                                {perf ? `${perf.average_rating} / 5.0` : 'N/A'}
                              </td>
                              <td className="p-3.5 text-center font-black text-brand-600">
                                {perf ? `${perf.average_percentage}%` : 'N/A'}
                              </td>
                              <td className="p-3.5 text-center">
                                {perf ? (
                                  <PerformanceBadge label={perf.grade} size="sm" />
                                ) : (
                                  <span className="text-xs text-gray-400 font-medium">Pending</span>
                                )}
                              </td>
                              <td className="p-3.5 text-right">
                                <Link
                                  to={`/admin/faculty/${f.id}`}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white font-bold rounded-xl transition-all shadow-xs"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Details</span>
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-semibold">
                Clicking "Details" opens complete faculty scorecard with student suggestions and Q1-Q15 breakdown.
              </span>
              <button
                onClick={() => setSelectedDept(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

