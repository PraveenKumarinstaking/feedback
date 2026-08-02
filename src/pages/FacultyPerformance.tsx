import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ArrowUpDown, Eye, Award, Users, Download, Printer, FileSpreadsheet, X, CheckCircle2, Star, Building2, BookOpen } from 'lucide-react';
import { PerformanceBadge } from '../components/common/PerformanceBadge';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { dbService } from '../services/dbService';
import { FacultyPerformanceSummary } from '../types';

export const FacultyPerformance: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || searchParams.get('dept') || '';

  const [loading, setLoading] = useState<boolean>(true);
  const [facultyPerf, setFacultyPerf] = useState<FacultyPerformanceSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
  const [sortField, setSortField] = useState<'average_percentage' | 'response_count'>('average_percentage');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Preview Modal state
  const [previewFac, setPreviewFac] = useState<FacultyPerformanceSummary | null>(null);

  useEffect(() => {
    async function loadData(silent: boolean = false) {
      if (!silent) setLoading(true);
      try {
        const data = await dbService.getFacultyPerformance();
        setFacultyPerf(data);
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

    const unsubscribeRealtime = dbService.subscribeToRealtimeSubmissions(handleRealtimeUpdate);

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
      unsubscribeRealtime();
      if (channel) channel.close();
      clearInterval(pollInterval);
    };
  }, []);

  const handleSort = (field: 'average_percentage' | 'response_count') => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExportCSV = () => {
    if (filteredData.length === 0) return;

    const headers = ['Faculty Name', 'Department', 'Courses Evaluated', 'Total Responses', 'Avg Rating (/5.0)', 'Percentage (%)', 'Grade', 'Performance Classification', 'IQAC Interpretation'];
    const rows = filteredData.map(f => [
      `"${f.faculty_name.replace(/"/g, '""')}"`,
      `"${f.department_name.replace(/"/g, '""')}"`,
      f.courses_evaluated_count,
      f.response_count,
      f.average_rating,
      `${f.average_percentage}%`,
      f.grade,
      `"${f.performance}"`,
      `"${f.iqac_interpretation}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Faculty_Performance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const filteredData = facultyPerf.filter(f =>
    f.faculty_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.department_name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    return sortDirection === 'desc' ? valB - valA : valA - valB;
  });

  if (loading) {
    return <LoadingState message="Loading faculty evaluation rankings..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm print:hidden">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Faculty Evaluation & Performance</h1>
          <p className="text-xs text-gray-500 mt-1">
            Aggregated student evaluation scores across multiple students per course, automatically calculating percentages, letter grades (A+ to D) & IQAC standards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Total Evaluated: {facultyPerf.length} Faculty
          </span>
          <button
            onClick={handleExportCSV}
            disabled={filteredData.length === 0}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={handlePrintReport}
            className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Download PDF
          </button>
        </div>
      </div>

      {/* Printable Institutional Header (Only visible in Print Mode) */}
      <div className="hidden print:block mb-6 p-4 border-b border-gray-300">
        <div className="text-center">
          <h1 className="text-xl font-black uppercase text-gray-900">National Institute of Engineering & Technology</h1>
          <p className="text-xs text-gray-600 font-bold">Internal Quality Assurance Cell (IQAC)</p>
          <h2 className="text-base font-bold mt-2 text-brand-800">Faculty Evaluation & Performance Ranking Report</h2>
          <p className="text-xs text-gray-500">Generated on: {new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}</p>
        </div>
      </div>

      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm print:hidden">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search faculty name or department..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border-gray-200 text-xs font-medium focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        {/* Sort Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleSort('average_percentage')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
              sortField === 'average_percentage' ? 'bg-brand-50 text-brand-700 border-brand-200' : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort by Score % {sortField === 'average_percentage' && (sortDirection === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => handleSort('response_count')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
              sortField === 'response_count' ? 'bg-brand-50 text-brand-700 border-brand-200' : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort by Responses {sortField === 'response_count' && (sortDirection === 'desc' ? '↓' : '↑')}
          </button>
        </div>
      </div>

      {/* Datatable */}
      {filteredData.length === 0 ? (
        <EmptyState title="No Faculty Records Found" message="No faculty evaluation summary matched your search term." />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-4">Faculty Member</th>
                  <th className="p-4">Department</th>
                  <th className="p-4 text-center">Courses</th>
                  <th className="p-4 text-center">Responses</th>
                  <th className="p-4 text-center">Avg Rating / 5.0</th>
                  <th className="p-4 text-center">Percentage</th>
                  <th className="p-4 text-center">Grade</th>
                  <th className="p-4 text-center">Performance</th>
                  <th className="p-4 text-right print:hidden">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((f) => (
                  <tr key={f.faculty_id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{f.faculty_name}</td>
                    <td className="p-4 text-gray-600">{f.department_name}</td>
                    <td className="p-4 text-center font-semibold">{f.courses_evaluated_count}</td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md font-bold">
                        {f.response_count}
                      </span>
                    </td>
                    <td className="p-4 text-center font-extrabold text-gray-900">{f.average_rating}</td>
                    <td className="p-4 text-center">
                      <span className="font-black text-brand-600">{f.average_percentage}%</span>
                    </td>
                    <td className="p-4 text-center">
                      <PerformanceBadge label={f.grade} size="sm" />
                    </td>
                    <td className="p-4 text-center">
                      <PerformanceBadge label={f.performance} size="sm" />
                    </td>
                    <td className="p-4 text-right print:hidden">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewFac(f)}
                          className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs transition-colors"
                          title="Quick preview scorecard"
                        >
                          Quick View
                        </button>
                        <Link
                          to={`/admin/faculty/${f.faculty_id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white font-bold rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Full Scorecard</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Signature Block (Only visible in Print Mode) */}
      <div className="hidden print:flex justify-between items-end mt-12 pt-8 border-t border-gray-300 text-xs">
        <div>
          <p className="font-bold">Prepared By:</p>
          <p className="text-gray-600 mt-6">IQAC Data Analyst</p>
        </div>
        <div className="text-center">
          <p className="font-bold">Verified By:</p>
          <p className="text-gray-600 mt-6">IQAC Coordinator</p>
        </div>
        <div className="text-right">
          <p className="font-bold">Approved By:</p>
          <p className="text-gray-600 mt-6">Principal / Head of Institution</p>
        </div>
      </div>

      {/* Quick Preview & Export Modal */}
      {previewFac && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in print:hidden">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 text-brand-700 font-black text-xl flex items-center justify-center">
                  {previewFac.faculty_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-lg text-gray-900">{previewFac.faculty_name}</h3>
                  <p className="text-xs text-gray-500 font-medium">{previewFac.department_name}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewFac(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scorecard Metrics */}
            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="bg-white p-3 rounded-xl border border-gray-200/80">
                <span className="text-[11px] font-semibold text-gray-400 uppercase block">Total Student Responses</span>
                <span className="text-lg font-black text-gray-900">{previewFac.response_count} Submissions</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-200/80">
                <span className="text-[11px] font-semibold text-gray-400 uppercase block">Courses Evaluated</span>
                <span className="text-lg font-black text-gray-900">{previewFac.courses_evaluated_count} Courses</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-200/80">
                <span className="text-[11px] font-semibold text-gray-400 uppercase block">Average Rating</span>
                <span className="text-lg font-black text-brand-600">{previewFac.average_rating} / 5.0</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-200/80">
                <span className="text-[11px] font-semibold text-gray-400 uppercase block">Percentage Score</span>
                <span className="text-lg font-black text-emerald-600">{previewFac.average_percentage}%</span>
              </div>
            </div>

            {/* Grades & IQAC Interpretation */}
            <div className="flex items-center justify-between p-3.5 bg-brand-50/50 rounded-2xl border border-brand-100 text-xs">
              <div>
                <span className="font-bold text-gray-700 block">Grade Assignment:</span>
                <span className="text-xs text-gray-500">{previewFac.iqac_interpretation}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <PerformanceBadge label={previewFac.grade} size="sm" />
                <PerformanceBadge label={previewFac.performance} size="sm" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setPreviewFac(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Close Preview
              </button>
              <Link
                to={`/admin/faculty/${previewFac.faculty_id}`}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Eye className="w-4 h-4" /> Open Full Scorecard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

