import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Award,
  Users,
  BookOpen,
  Building2,
  AlertTriangle,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';

import { StatCard } from '../components/common/StatCard';
import { FilterBar } from '../components/common/FilterBar';
import { LoadingState } from '../components/common/LoadingState';
import { dbService } from '../services/dbService';
import {
  GlobalFilterState,
  DashboardStats,
  FacultyPerformanceSummary,
  DepartmentPerformanceSummary,
  QuestionAnalysis,
  FeedbackSubmission
} from '../types';

export const Dashboard: React.FC = () => {
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

  const [stats, setStats] = useState<DashboardStats>({
    total_responses: 0,
    overall_average_percentage: 0,
    overall_average_rating: 0,
    faculty_evaluated_count: 0,
    courses_evaluated_count: 0,
    active_departments_count: 0,
    improvement_required_count: 0
  });

  const [facultyPerf, setFacultyPerf] = useState<FacultyPerformanceSummary[]>([]);
  const [deptPerf, setDeptPerf] = useState<DepartmentPerformanceSummary[]>([]);
  const [questionAnalysis, setQuestionAnalysis] = useState<QuestionAnalysis[]>([]);
  const [submissions, setSubmissions] = useState<FeedbackSubmission[]>([]);

  const loadDashboardData = async (currentFilters: GlobalFilterState, silent: boolean = false) => {
    if (!silent) setLoading(true);
    try {
      const [statsData, facData, deptData, qData, subsData] = await Promise.all([
        dbService.getDashboardStats(currentFilters),
        dbService.getFacultyPerformance(currentFilters),
        dbService.getDepartmentPerformance(currentFilters),
        dbService.getQuestionAnalysis(currentFilters),
        dbService.getSubmissions(currentFilters)
      ]);

      setStats(statsData);
      setFacultyPerf(facData);
      setDeptPerf(deptData);
      setQuestionAnalysis(qData);
      setSubmissions(subsData);
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData(filters, false);

    const handleRealtimeUpdate = () => {
      loadDashboardData(filters, true);
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

    // Silent background sync
    const pollInterval = setInterval(() => {
      loadDashboardData(filters, true);
    }, 10000);

    return () => {
      window.removeEventListener('storage', handleRealtimeUpdate);
      window.removeEventListener('edu_feedback_submitted', handleRealtimeUpdate);
      unsubscribeRealtime();
      if (channel) channel.close();
      clearInterval(pollInterval);
    };
  }, [filters]);

  const handleFilterChange = (newFilters: GlobalFilterState) => {
    setFilters(newFilters);
    loadDashboardData(newFilters);
  };

  const handleResetFilters = () => {
    const emptyFilters: GlobalFilterState = {
      academicYearId: '',
      departmentId: '',
      programmeId: '',
      semester: '',
      courseId: '',
      facultyId: '',
      startDate: '',
      endDate: ''
    };
    setFilters(emptyFilters);
    loadDashboardData(emptyFilters);
  };

  // ----------------------------------------------------
  // Chart Data Formatting
  // ----------------------------------------------------
  // Grade Distribution Donut Chart Data
  const gradeCounts: Record<string, number> = { 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'D': 0 };
  facultyPerf.forEach(f => {
    if (gradeCounts[f.grade] !== undefined) gradeCounts[f.grade]++;
  });

  const gradeChartData = Object.entries(gradeCounts).map(([grade, count]) => ({
    name: grade,
    value: count
  })).filter(g => g.value > 0);

  const GRADE_COLORS: Record<string, string> = {
    'A+': '#10B981', // Emerald
    'A': '#3B82F6',  // Blue
    'B+': '#06B6D4', // Cyan
    'B': '#F59E0B',  // Amber
    'C': '#F97316',  // Orange
    'D': '#EF4444'   // Rose
  };

  // Feedback Trend Chart Data (Grouped by Date)
  const dateMap = new Map<string, { date: string; count: number; totalScoreSum: number }>();
  submissions.forEach(sub => {
    const dateStr = new Date(sub.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const existing = dateMap.get(dateStr) || { date: dateStr, count: 0, totalScoreSum: 0 };
    existing.count++;
    existing.totalScoreSum += sub.percentage || 0;
    dateMap.set(dateStr, existing);
  });

  const trendChartData = Array.from(dateMap.values()).map(d => ({
    date: d.date,
    responses: d.count,
    averagePct: Math.round((d.totalScoreSum / d.count) * 100) / 100
  })).reverse();

  if (loading) {
    return <LoadingState message="Calculating real-time analytics & loading dashboard charts..." />;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Executive Analytics Dashboard</h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time teaching quality metrics, grade distributions & IQAC department performance insights.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
            Current Filtered Responses: {stats.total_responses}
          </span>
        </div>
      </div>

      {/* Global Filter Toolbar */}
      <FilterBar filters={filters} onFilterChange={handleFilterChange} onReset={handleResetFilters} />

      {/* 6 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Responses"
          value={stats.total_responses}
          subtitle="Feedback Submissions"
          icon={MessageSquare}
          color="blue"
        />
        <StatCard
          title="Overall Average"
          value={`${stats.overall_average_percentage}%`}
          subtitle={`Score: ${stats.overall_average_rating} / 5.0`}
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Faculty Evaluated"
          value={stats.faculty_evaluated_count}
          subtitle="Faculty Members"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Courses Evaluated"
          value={stats.courses_evaluated_count}
          subtitle="Active Courses"
          icon={BookOpen}
          color="violet"
        />
        <StatCard
          title="Departments"
          value={stats.active_departments_count}
          subtitle="Academic Units"
          icon={Building2}
          color="amber"
        />
        <StatCard
          title="Improvement Required"
          value={stats.improvement_required_count}
          subtitle="Score < 60%"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Recharts Row 1: Faculty Performance & Department Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faculty Performance Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-600" />
              Faculty Performance Average (%)
            </h3>
            <span className="text-xs text-gray-400 font-medium">Higher is better</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={facultyPerf.slice(0, 8)} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="faculty_name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, 'Average Score']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="average_percentage" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Performance Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Department Comparative Performance (%)
            </h3>
            <span className="text-xs text-gray-400 font-medium">By Department Code</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptPerf} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="department_code" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, 'Department Average']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="average_percentage" fill="#6366F1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recharts Row 2: Grade Distribution Donut & Question-wise Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grade Distribution Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-1">
          <h3 className="text-base font-bold text-gray-900 mb-4">Grade Distribution</h3>

          {gradeChartData.length > 0 ? (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {gradeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.name] || '#6B7280'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value} Faculty`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-gray-400">
              No faculty performance grade data available.
            </div>
          )}
        </div>

        {/* Question-wise Breakdown Q1 to Q15 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
          <h3 className="text-base font-bold text-gray-900 mb-4">Question-wise Analysis (Q1 – Q15 Average / 5.0)</h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={questionAnalysis} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="question_number" tickFormatter={q => `Q${q}`} tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: any) => [`${value} / 5.0`, 'Average Rating']}
                  labelFormatter={q => `Question ${q}`}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB' }}
                />
                <Bar dataKey="average_rating" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recharts Row 3: Feedback Trend Line Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Feedback Submission Volume & Average Trend Over Time
          </h3>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB' }} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="responses" name="Submissions Count" stroke="#3B82F6" strokeWidth={3} />
              <Line yAxisId="right" type="monotone" dataKey="averagePct" name="Average Score %" stroke="#10B981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
