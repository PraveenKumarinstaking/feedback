import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Award, BookOpen, MessageSquare, ThumbsUp, HelpCircle, CheckCircle2, TrendingDown, Star, Download, Printer } from 'lucide-react';
import { PerformanceBadge } from '../components/common/PerformanceBadge';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { dbService } from '../services/dbService';
import { Faculty, Department, FeedbackSubmission, QuestionAnalysis, Course } from '../types';
import { calculateGrade, calculateIQACInterpretation, formatPercentage, formatRating } from '../utils/calculations';

export const FacultyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState<boolean>(true);

  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [submissions, setSubmissions] = useState<FeedbackSubmission[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [questionBreakdown, setQuestionBreakdown] = useState<QuestionAnalysis[]>([]);

  useEffect(() => {
    async function loadFacultyDetails() {
      setLoading(true);
      try {
        const [facList, deptList, subs, crsList, qList] = await Promise.all([
          dbService.getFaculty(),
          dbService.getDepartments(),
          dbService.getSubmissions({ facultyId: id }),
          dbService.getCourses(),
          dbService.getQuestions()
        ]);

        const targetFac = facList.find(f => f.id === id);
        if (targetFac) {
          setFaculty(targetFac);
          const dept = deptList.find(d => d.id === targetFac.department_id);
          setDepartment(dept || null);
        }

        setSubmissions(subs);
        setCourses(crsList);

        // Calculate Q1-Q15 Breakdown for this specific faculty
        const qMap = new Map<number, { sum: number; count: number }>();
        qList.forEach(q => qMap.set(q.question_number, { sum: 0, count: 0 }));

        subs.forEach(s => {
          if (s.ratings) {
            s.ratings.forEach(r => {
              const rec = qMap.get(r.question_number);
              if (rec) {
                rec.sum += r.rating;
                rec.count++;
              }
            });
          }
        });

        const breakdown: QuestionAnalysis[] = qList.map(q => {
          const rec = qMap.get(q.question_number) || { sum: 0, count: 0 };
          const avg = rec.count > 0 ? rec.sum / rec.count : 0;
          return {
            question_number: q.question_number,
            question_text: q.question_text,
            category: q.category,
            average_rating: formatRating(avg),
            percentage: formatPercentage((avg / 5) * 100),
            response_count: rec.count
          };
        });

        setQuestionBreakdown(breakdown);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadFacultyDetails();
  }, [id]);

  if (loading) {
    return <LoadingState message="Loading faculty evaluation profile..." />;
  }

  if (!faculty) {
    return <EmptyState title="Faculty Not Found" message="The requested faculty profile does not exist." />;
  }

  // Calculate overall metrics
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
  const totalScore75 = formatRating(overallAvgRating * 15);
  const { grade, performance } = calculateGrade(overallAvgRating * 15);
  const iqac = calculateIQACInterpretation(overallAvgPct);

  // Identified Strengths (top 3 Qs) and Areas for Improvement (bottom 3 Qs)
  const sortedQs = [...questionBreakdown].sort((a, b) => b.average_rating - a.average_rating);
  const strengths = sortedQs.slice(0, 3);
  const improvements = [...sortedQs].reverse().slice(0, 3);

  // Grouped Anonymous Comments
  const posComments = submissions.map(s => s.suggestion_positive).filter(Boolean);
  const impComments = submissions.map(s => s.suggestion_improvement).filter(Boolean);
  const addComments = submissions.map(s => s.additional_comments).filter(Boolean);

  const handleExportCSV = () => {
    let csvContent = `Faculty Evaluation Scorecard - ${faculty.faculty_name}\n`;
    csvContent += `Employee Code,${faculty.faculty_code}\n`;
    csvContent += `Department,${department?.department_name || ''}\n`;
    csvContent += `Total Submissions,${submissions.length}\n`;
    csvContent += `Total Score (/75),${totalScore75}\n`;
    csvContent += `Percentage,${overallAvgPct}%\n`;
    csvContent += `Grade,${grade}\n`;
    csvContent += `Performance,${performance}\n\n`;

    csvContent += "Q.No,Evaluation Question,Category,Avg Rating (/5.0),Percentage (%)\n";
    questionBreakdown.forEach(q => {
      csvContent += `"${q.question_number}","${q.question_text.replace(/"/g, '""')}","${q.category}","${q.average_rating}","${q.percentage}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Faculty_Scorecard_${faculty.faculty_code}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Printable Institutional Header (Print Mode Only) */}
      <div className="hidden print:block mb-6 p-4 border-b border-gray-300 text-center">
        <h1 className="text-xl font-black uppercase text-gray-900">National Institute of Engineering & Technology</h1>
        <p className="text-xs text-gray-600 font-bold">Internal Quality Assurance Cell (IQAC)</p>
        <h2 className="text-base font-bold mt-2 text-brand-800">Faculty Individual Evaluation Scorecard</h2>
        <p className="text-xs text-gray-500">Academic Year: 2026-2027 • Date: {new Date().toLocaleDateString('en-US')}</p>
      </div>

      {/* Top Header & Actions */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <Link
          to="/admin/faculty-performance"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Faculty Performance List</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs border border-emerald-200 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export Scorecard CSV
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Download PDF
          </button>
        </div>
      </div>

      {/* Faculty Profile Summary Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 font-black text-2xl flex items-center justify-center">
            {faculty.faculty_name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-900">{faculty.faculty_name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                {faculty.faculty_code}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1">
              {faculty.designation} • {department?.department_name || 'Department'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{faculty.email}</p>
          </div>
        </div>

        {/* Score KPI Badges */}
        <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="text-center px-3 border-r border-gray-200">
            <span className="block text-[11px] font-semibold text-gray-500">Responses</span>
            <span className="text-lg font-black text-gray-900">{submissions.length}</span>
          </div>
          <div className="text-center px-3 border-r border-gray-200">
            <span className="block text-[11px] font-semibold text-gray-500">Score / 75</span>
            <span className="text-lg font-black text-gray-900">{totalScore75}</span>
          </div>
          <div className="text-center px-3 border-r border-gray-200">
            <span className="block text-[11px] font-semibold text-gray-500">Percentage</span>
            <span className="text-lg font-black text-brand-600">{overallAvgPct}%</span>
          </div>
          <div className="text-center px-3">
            <span className="block text-[11px] font-semibold text-gray-500">Grade & IQAC</span>
            <div className="mt-1 flex items-center gap-1">
              <PerformanceBadge label={grade} size="sm" />
              <PerformanceBadge label={performance} size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Q1-Q15 Breakdown & Strengths/Improvements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Q1 to Q15 Evaluation Criteria Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
            Question-wise Evaluation Rating (Q1 – Q15)
          </h2>

          <div className="space-y-3">
            {questionBreakdown.map((q) => (
              <div key={q.question_number} className="p-3 rounded-xl bg-gray-50/60 border border-gray-100">
                <div className="flex items-center justify-between text-xs font-bold text-gray-800 mb-1.5">
                  <span>Q{q.question_number}. {q.question_text}</span>
                  <span className="font-extrabold text-brand-700 ml-2 shrink-0">{q.average_rating} / 5.0 ({q.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-600 h-full rounded-full transition-all"
                    style={{ width: `${q.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Improvement Areas Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          {/* Key Strengths */}
          <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
            <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2 mb-3">
              <ThumbsUp className="w-4 h-4 text-emerald-600" />
              Key Teaching Strengths
            </h3>
            <div className="space-y-2">
              {strengths.map(s => (
                <div key={s.question_number} className="p-2.5 rounded-lg bg-emerald-50 text-xs font-semibold text-emerald-900 border border-emerald-100">
                  <span className="font-bold">Q{s.question_number}:</span> {s.question_text} ({s.average_rating}/5)
                </div>
              ))}
            </div>
          </div>

          {/* Areas Needing Improvement */}
          <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm">
            <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-amber-600" />
              Areas Recommended for Focus
            </h3>
            <div className="space-y-2">
              {improvements.map(imp => (
                <div key={imp.question_number} className="p-2.5 rounded-lg bg-amber-50 text-xs font-semibold text-amber-900 border border-amber-100">
                  <span className="font-bold">Q{imp.question_number}:</span> {imp.question_text} ({imp.average_rating}/5)
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Anonymous Student Comments Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-base font-bold text-gray-900">Anonymous Student Feedback Comments</h2>
          <span className="text-xs font-semibold text-gray-400">Student Identity Protected</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Positive Feedback */}
          <div>
            <h3 className="text-xs font-extrabold uppercase text-emerald-700 mb-3 flex items-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5" /> Positive Feedback ({posComments.length})
            </h3>
            {posComments.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No positive comments recorded.</p>
            ) : (
              <div className="space-y-2.5">
                {posComments.map((c, i) => (
                  <div key={i} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs text-emerald-950 font-medium">
                    “{c}”
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggested Improvements */}
          <div>
            <h3 className="text-xs font-extrabold uppercase text-amber-700 mb-3 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> Suggested Improvements ({impComments.length})
            </h3>
            {impComments.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No improvement comments recorded.</p>
            ) : (
              <div className="space-y-2.5">
                {impComments.map((c, i) => (
                  <div key={i} className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-xs text-amber-950 font-medium">
                    “{c}”
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Comments */}
          <div>
            <h3 className="text-xs font-extrabold uppercase text-gray-700 mb-3 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> Additional Comments ({addComments.length})
            </h3>
            {addComments.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No additional comments recorded.</p>
            ) : (
              <div className="space-y-2.5">
                {addComments.map((c, i) => (
                  <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-800 font-medium">
                    “{c}”
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
