import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, Download, ChevronLeft, ChevronRight, Trash2, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { PerformanceBadge } from '../components/common/PerformanceBadge';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { dbService } from '../services/dbService';
import { FeedbackSubmission } from '../types';

export const FeedbackResponses: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [submissions, setSubmissions] = useState<FeedbackSubmission[]>([]);

  // Lookup maps
  const [ayMap, setAyMap] = useState<Map<string, string>>(new Map());
  const [deptMap, setDeptMap] = useState<Map<string, string>>(new Map());
  const [progMap, setProgMap] = useState<Map<string, string>>(new Map());
  const [courseMap, setCourseMap] = useState<Map<string, string>>(new Map());
  const [facultyMap, setFacultyMap] = useState<Map<string, string>>(new Map());

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Deletion modals state
  const [deletingSub, setDeletingSub] = useState<FeedbackSubmission | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async (silent: boolean = false) => {
    if (!silent) setLoading(true);
    try {
      const [subs, ays, depts, progs, crss, facs] = await Promise.all([
        dbService.getSubmissions(),
        dbService.getAcademicYears(),
        dbService.getDepartments(),
        dbService.getProgrammes(),
        dbService.getCourses(),
        dbService.getFaculty()
      ]);

      setSubmissions(subs);
      setAyMap(new Map(ays.map(a => [a.id, a.year_name])));
      setDeptMap(new Map(depts.map(d => [d.id, d.department_code])));
      setProgMap(new Map(progs.map(p => [p.id, p.programme_code])));
      setCourseMap(new Map(crss.map(c => [c.id, `${c.course_code} - ${c.course_title}`])));
      setFacultyMap(new Map(facs.map(f => [f.id, f.faculty_name])));
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
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

  const showNotification = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDeleteSingle = async () => {
    if (!deletingSub) return;
    try {
      await dbService.deleteSubmission(deletingSub.id);
      showNotification('success', 'Feedback submission record removed successfully.');
      setDeletingSub(null);
      await loadData();
    } catch (error) {
      showNotification('error', 'Failed to delete submission record.');
    }
  };

  const handleClearAll = async () => {
    try {
      await dbService.clearAllSubmissions();
      showNotification('success', 'All feedback submission records removed successfully.');
      setShowClearAllModal(false);
      setCurrentPage(1);
      await loadData();
    } catch (error) {
      showNotification('error', 'Failed to remove feedback submission data.');
    }
  };

  const handleExportCSV = () => {
    if (filteredSubmissions.length === 0) return;

    const headers = ['ID', 'Submitted At', 'Academic Year', 'Department', 'Programme', 'Semester', 'Course', 'Faculty', 'Total Score', 'Percentage', 'Grade'];
    const rows = filteredSubmissions.map(s => [
      s.id,
      new Date(s.submitted_at).toLocaleString(),
      ayMap.get(s.academic_year_id) || '',
      deptMap.get(s.department_id) || '',
      progMap.get(s.programme_id) || '',
      s.semester,
      `"${(courseMap.get(s.course_id) || '').replace(/"/g, '""')}"`,
      `"${(facultyMap.get(s.faculty_id) || '').replace(/"/g, '""')}"`,
      s.total_score || '',
      `${s.percentage || ''}%`,
      s.grade || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `feedback_submission_records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredSubmissions = submissions.filter(s => {
    const facultyName = facultyMap.get(s.faculty_id) || '';
    const courseTitle = courseMap.get(s.course_id) || '';
    return (
      facultyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredSubmissions.length / pageSize) || 1;
  const paginatedSubmissions = filteredSubmissions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) {
    return <LoadingState message="Loading submitted feedback records log..." />;
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold animate-in fade-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-gray-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Feedback Submission Records</h1>
          <p className="text-xs text-gray-500 mt-1">
            Complete raw audit log of student feedback submissions. Student identity is hidden per anonymity settings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Anonymous Mode Active
          </span>
          {submissions.length > 0 && (
            <button
              onClick={() => setShowClearAllModal(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
              title="Remove all feedback submission data"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove All Data
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Search by faculty name or course title..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border-gray-200 text-xs font-medium focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs font-semibold text-gray-500">
            Showing {paginatedSubmissions.length} of {filteredSubmissions.length} submissions
          </span>

          <button
            onClick={handleExportCSV}
            disabled={filteredSubmissions.length === 0}
            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-40 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" /> Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      {filteredSubmissions.length === 0 ? (
        <EmptyState title="No Submissions Found" message="No student feedback records matched your search criteria or the submission log is empty." />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-4">Submission Date</th>
                  <th className="p-4">Academic Year</th>
                  <th className="p-4">Dept / Prog</th>
                  <th className="p-4">Sem</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">Faculty Member</th>
                  <th className="p-4 text-center">Score / 75</th>
                  <th className="p-4 text-center">Percentage</th>
                  <th className="p-4 text-center">Grade</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedSubmissions.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 text-gray-500 font-medium">
                      {new Date(s.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="p-4 font-semibold text-gray-800">{ayMap.get(s.academic_year_id) || 'AY'}</td>
                    <td className="p-4 font-semibold text-gray-800">
                      {deptMap.get(s.department_id)} • {progMap.get(s.programme_id)}
                    </td>
                    <td className="p-4 font-bold text-gray-700">Sem {s.semester}</td>
                    <td className="p-4 font-medium text-gray-900">{courseMap.get(s.course_id)}</td>
                    <td className="p-4 font-bold text-brand-700">{facultyMap.get(s.faculty_id)}</td>
                    <td className="p-4 text-center font-extrabold text-gray-900">{s.total_score}</td>
                    <td className="p-4 text-center font-black text-emerald-600">{s.percentage}%</td>
                    <td className="p-4 text-center">
                      <PerformanceBadge label={s.grade || 'A'} size="sm" />
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setDeletingSub(s)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove submission record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 disabled:opacity-40 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-xs font-semibold text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 disabled:opacity-40 flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Single Record Delete Confirmation Modal */}
      {deletingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-50 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Remove Submission Record</h3>
                <p className="text-xs text-gray-500">Confirm deletion of this feedback record</p>
              </div>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1.5 text-xs text-gray-700">
              <div><span className="font-bold text-gray-900">Faculty:</span> {facultyMap.get(deletingSub.faculty_id)}</div>
              <div><span className="font-bold text-gray-900">Course:</span> {courseMap.get(deletingSub.course_id)}</div>
              <div><span className="font-bold text-gray-900">Score:</span> {deletingSub.total_score}/75 ({deletingSub.percentage}%)</div>
              <div><span className="font-bold text-gray-900">Date:</span> {new Date(deletingSub.submitted_at).toLocaleString()}</div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Are you sure you want to remove this feedback record? This action cannot be undone and will affect faculty performance calculations.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingSub(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSingle}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Data Confirmation Modal */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-50 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Remove ALL Feedback Records</h3>
                <p className="text-xs text-rose-600 font-semibold">Irreversible Action</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl text-xs text-rose-800 leading-relaxed">
              <strong>Warning:</strong> This will permanently delete <strong>{submissions.length}</strong> feedback submission records from local storage. All dashboard scores, ratings breakdown, and evaluation metrics will be reset to zero.
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Are you sure you want to wipe all feedback submission data from the system?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearAllModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

