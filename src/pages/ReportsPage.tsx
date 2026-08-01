import React, { useState, useEffect } from 'react';
import { Printer, Download, Filter, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { FilterBar } from '../components/common/FilterBar';
import { LoadingState } from '../components/common/LoadingState';
import { PerformanceBadge } from '../components/common/PerformanceBadge';
import { dbService } from '../services/dbService';
import {
  GlobalFilterState,
  FeedbackSubmission,
  QuestionAnalysis,
  AcademicYear,
  Department,
  Programme,
  Course,
  Faculty
} from '../types';
import { calculateGrade, calculateIQACInterpretation, formatPercentage, formatRating } from '../utils/calculations';

export const ReportsPage: React.FC = () => {
  const { settings } = useSettings();
  const [loading, setLoading] = useState<boolean>(true);

  const [filters, setFilters] = useState<GlobalFilterState>({
    academicYearId: '',
    departmentId: '',
    programmeId: '',
    semester: '',
    courseId: '',
    facultyId: '',
    startDate: '',
    endDate: ''
  });

  // Master lookup data
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);

  // Analytics Output for Report
  const [submissions, setSubmissions] = useState<FeedbackSubmission[]>([]);
  const [questionAnalysis, setQuestionAnalysis] = useState<QuestionAnalysis[]>([]);

  const loadReportData = async (currentFilters: GlobalFilterState) => {
    setLoading(true);
    try {
      const [ays, depts, progs, crss, facs, subs, qData] = await Promise.all([
        dbService.getAcademicYears(),
        dbService.getDepartments(),
        dbService.getProgrammes(),
        dbService.getCourses(),
        dbService.getFaculty(),
        dbService.getSubmissions(currentFilters),
        dbService.getQuestionAnalysis(currentFilters)
      ]);

      setAcademicYears(ays);
      setDepartments(depts);
      setProgrammes(progs);
      setCourses(crss);
      setFacultyList(facs);
      setSubmissions(subs);
      setQuestionAnalysis(qData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData(filters);

    const handleRealtimeUpdate = () => {
      loadReportData(filters);
    };

    window.addEventListener('storage', handleRealtimeUpdate);
    window.addEventListener('edu_feedback_submitted', handleRealtimeUpdate);

    return () => {
      window.removeEventListener('storage', handleRealtimeUpdate);
      window.removeEventListener('edu_feedback_submitted', handleRealtimeUpdate);
    };
  }, [filters]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "S.No,Evaluation Criteria,Category,Average Rating (/5.0),Percentage (%)\n";

    questionAnalysis.forEach(q => {
      csvContent += `"${q.question_number}","${q.question_text.replace(/"/g, '""')}","${q.category}","${q.average_rating}","${q.percentage}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Student_Feedback_Analysis_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Selected Names
  const selAY = academicYears.find(a => a.id === filters.academicYearId)?.year_name || 'All Academic Years';
  const selDept = departments.find(d => d.id === filters.departmentId)?.department_name || 'All Departments';
  const selProg = programmes.find(p => p.id === filters.programmeId)?.programme_name || 'All Programmes';
  const selCourse = courses.find(c => c.id === filters.courseId)?.course_title || 'All Courses';
  const selFaculty = facultyList.find(f => f.id === filters.facultyId)?.faculty_name || 'All Faculty';

  // Overall Score Calculations
  let totalRatingPoints = 0;
  let totalRatingCount = 0;
  submissions.forEach(s => {
    if (s.ratings) {
      s.ratings.forEach(r => {
        totalRatingPoints += r.rating;
        totalRatingCount++;
      });
    }
  });

  const overallAvgRating = totalRatingCount > 0 ? totalRatingPoints / totalRatingCount : 0;
  const overallAvgPct = formatPercentage((overallAvgRating / 5) * 100);
  const overallScore75 = formatRating(overallAvgRating * 15);
  const { grade, performance } = calculateGrade(overallAvgRating * 15);
  const iqac = calculateIQACInterpretation(overallAvgPct);

  // Grouped Comments for Report
  const posComments = submissions.map(s => s.suggestion_positive).filter(Boolean);
  const impComments = submissions.map(s => s.suggestion_improvement).filter(Boolean);
  const addComments = submissions.map(s => s.additional_comments).filter(Boolean);

  if (loading) {
    return <LoadingState message="Generating IQAC analysis report..." />;
  }

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm no-print">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">IQAC Feedback Analysis Report</h1>
          <p className="text-xs text-gray-500 mt-1">
            Generate printable academic reports & export institutional feedback records to CSV/PDF.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-brand-500/20 flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Filter Bar (Hidden on print) */}
      <div className="no-print">
        <FilterBar filters={filters} onFilterChange={loadReportData} onReset={() => loadReportData({
          academicYearId: '', departmentId: '', programmeId: '', semester: '', courseId: '', facultyId: '', startDate: '', endDate: ''
        })} />
      </div>

      {/* ============================================================ */}
      {/* PRINTABLE REPORT CONTENT (Visible on screen and browser print) */}
      {/* ============================================================ */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-gray-200 shadow-sm printable-area">
        {/* Printable Header */}
        <div className="text-center border-b-2 border-gray-900 pb-6 mb-6">
          {settings.institution_logo && (
            <img src={settings.institution_logo} alt="Logo" className="w-16 h-16 object-cover rounded-xl mx-auto mb-3" />
          )}
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">{settings.institution_name}</h1>
          <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mt-1">{settings.report_header}</p>
          <h2 className="text-lg font-extrabold text-brand-900 uppercase tracking-wider mt-3">
            STUDENT FEEDBACK ANALYSIS REPORT
          </h2>
          <p className="text-xs font-semibold text-gray-500">Teaching–Learning Evaluation Process</p>
        </div>

        {/* Report Metadata Block */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 mb-6">
          <div><span className="text-gray-500 block text-[11px]">Academic Year:</span> {selAY}</div>
          <div><span className="text-gray-500 block text-[11px]">Department:</span> {selDept}</div>
          <div><span className="text-gray-500 block text-[11px]">Programme:</span> {selProg}</div>
          <div><span className="text-gray-500 block text-[11px]">Semester:</span> {filters.semester ? `Semester ${filters.semester}` : 'All Semesters'}</div>
          <div><span className="text-gray-500 block text-[11px]">Course:</span> {selCourse}</div>
          <div><span className="text-gray-500 block text-[11px]">Faculty Member:</span> {selFaculty}</div>
          <div className="col-span-2 sm:col-span-3 pt-2 border-t border-gray-200 flex justify-between items-center text-gray-600">
            <span>Total Student Responses Evaluated: <strong className="text-gray-900">{submissions.length}</strong></span>
            <span>Date Generated: <strong>{new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</strong></span>
          </div>
        </div>

        {/* Overall Performance Box */}
        <div className="bg-brand-50/50 border border-brand-200 rounded-xl p-5 mb-8">
          <h3 className="text-sm font-extrabold text-brand-900 uppercase tracking-wider mb-3">
            Overall Teaching Performance Summary
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
            <div className="bg-white p-3 rounded-lg border border-brand-100">
              <span className="block text-[11px] font-semibold text-gray-500">Average Score</span>
              <span className="text-xl font-black text-gray-900">{overallScore75} / 75</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-brand-100">
              <span className="block text-[11px] font-semibold text-gray-500">Percentage</span>
              <span className="text-xl font-black text-brand-600">{overallAvgPct}%</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-brand-100">
              <span className="block text-[11px] font-semibold text-gray-500">Grade</span>
              <span className="text-lg font-black text-gray-900 mt-1 block">{grade}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-brand-100">
              <span className="block text-[11px] font-semibold text-gray-500">Performance</span>
              <span className="text-xs font-bold text-gray-800 mt-2 block">{performance}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-brand-100 col-span-2 sm:col-span-1">
              <span className="block text-[11px] font-semibold text-gray-500">IQAC Level</span>
              <span className="text-xs font-bold text-emerald-700 mt-2 block">{iqac}</span>
            </div>
          </div>
        </div>

        {/* 15 Evaluation Criteria Table */}
        <div className="mb-8">
          <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-3">
            15 Evaluation Criteria Breakdown
          </h3>

          <table className="w-full text-left text-xs border border-gray-300">
            <thead className="bg-gray-100 text-gray-900 font-bold border-b border-gray-300">
              <tr>
                <th className="p-3 w-12 text-center">S.No</th>
                <th className="p-3">Evaluation Criteria</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-center w-28">Average Rating (/ 5.0)</th>
                <th className="p-3 text-center w-24">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {questionAnalysis.map((q) => (
                <tr key={q.question_number}>
                  <td className="p-2.5 text-center font-bold text-gray-700">{q.question_number}</td>
                  <td className="p-2.5 font-medium text-gray-900">{q.question_text}</td>
                  <td className="p-2.5 text-gray-600 font-medium">{q.category}</td>
                  <td className="p-2.5 text-center font-bold text-gray-900">{q.average_rating}</td>
                  <td className="p-2.5 text-center font-black text-brand-600">{q.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Student Suggestions Summary */}
        <div className="mb-12 space-y-4">
          <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
            Student Suggestions Summary (Anonymous)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl">
              <h4 className="font-bold text-emerald-900 mb-2">Positive Feedback Highlights:</h4>
              {posComments.length === 0 ? (
                <p className="text-gray-500 italic">No specific comments recorded.</p>
              ) : (
                <ul className="list-disc pl-4 space-y-1 text-emerald-950 font-medium">
                  {posComments.slice(0, 4).map((c, i) => <li key={i}>“{c}”</li>)}
                </ul>
              )}
            </div>

            <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl">
              <h4 className="font-bold text-amber-900 mb-2">Areas for Suggested Improvement:</h4>
              {impComments.length === 0 ? (
                <p className="text-gray-500 italic">No specific suggestions recorded.</p>
              ) : (
                <ul className="list-disc pl-4 space-y-1 text-amber-950 font-medium">
                  {impComments.slice(0, 4).map((c, i) => <li key={i}>“{c}”</li>)}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Signature Placeholders (Printable) */}
        <div className="pt-12 border-t border-gray-300 grid grid-cols-2 gap-8 text-center text-xs font-bold text-gray-800">
          <div>
            <div className="h-12 border-b border-gray-400 max-w-xs mx-auto mb-2"></div>
            <p>{settings.iqac_coordinator_name}</p>
            <p className="text-gray-500 font-semibold text-[11px]">IQAC Coordinator</p>
          </div>
          <div>
            <div className="h-12 border-b border-gray-400 max-w-xs mx-auto mb-2"></div>
            <p>{settings.principal_name}</p>
            <p className="text-gray-500 font-semibold text-[11px]">Principal / Head of Institution</p>
          </div>
        </div>

        <div className="mt-8 text-center text-[10px] text-gray-400 border-t border-gray-100 pt-4">
          {settings.report_footer} • Confidential Academic Document
        </div>
      </div>
    </div>
  );
};
