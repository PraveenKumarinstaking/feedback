export interface AcademicYear {
  id: string;
  year_name: string;
  is_current: boolean;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface Department {
  id: string;
  department_code: string;
  department_name: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface Programme {
  id: string;
  programme_code: string;
  programme_name: string;
  department_id: string;
  semesters_count: number;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface Faculty {
  id: string;
  faculty_code: string;
  faculty_name: string;
  email: string;
  department_id: string;
  designation: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface Course {
  id: string;
  course_code: string;
  course_title: string;
  department_id: string;
  programme_id: string;
  semester: number;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface FacultyCourseMapping {
  id: string;
  academic_year_id: string;
  faculty_id: string;
  course_id: string;
  programme_id: string;
  semester: number;
  section: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface FeedbackQuestion {
  id: string;
  question_number: number;
  question_text: string;
  category: string;
  is_active: boolean;
  display_order: number;
}

export interface FeedbackRating {
  question_number: number;
  rating: number;
}

export interface FeedbackSubmission {
  id: string;
  academic_year_id: string;
  department_id: string;
  programme_id: string;
  semester: number;
  course_id: string;
  faculty_id: string;
  mapping_id?: string;
  suggestion_positive?: string;
  suggestion_improvement?: string;
  additional_comments?: string;
  submitted_at: string;
  ratings?: FeedbackRating[];
  // Calculated properties
  total_score?: number;
  percentage?: number;
  grade?: Grade;
  performance?: PerformanceClassification;
}

export type Grade = 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
export type PerformanceClassification = 'Outstanding' | 'Excellent' | 'Very Good' | 'Good' | 'Satisfactory' | 'Needs Improvement';
export type IQACInterpretation = 'Excellent Performance' | 'Very Good' | 'Good' | 'Satisfactory' | 'Improvement Required';

export interface InstitutionSettings {
  institution_name: string;
  institution_short_name: string;
  institution_logo: string;
  address: string;
  report_header: string;
  feedback_form_open: boolean;
  anonymous_mode: boolean;
  report_footer: string;
  principal_name: string;
  iqac_coordinator_name: string;
}

export interface GlobalFilterState {
  academicYearId: string;
  departmentId: string;
  programmeId: string;
  semester: string;
  courseId: string;
  facultyId: string;
  startDate: string;
  endDate: string;
}

export interface FacultyPerformanceSummary {
  faculty_id: string;
  faculty_name: string;
  department_name: string;
  courses_evaluated_count: number;
  response_count: number;
  average_rating: number;
  average_percentage: number;
  grade: Grade;
  performance: PerformanceClassification;
  iqac_interpretation: IQACInterpretation;
}

export interface DepartmentPerformanceSummary {
  department_id: string;
  department_code: string;
  department_name: string;
  faculty_count: number;
  courses_evaluated_count: number;
  response_count: number;
  average_rating: number;
  average_percentage: number;
  performance: PerformanceClassification;
}

export interface QuestionAnalysis {
  question_number: number;
  question_text: string;
  category: string;
  average_rating: number;
  percentage: number;
  response_count: number;
}

export interface DashboardStats {
  total_responses: number;
  overall_average_percentage: number;
  overall_average_rating: number;
  faculty_evaluated_count: number;
  courses_evaluated_count: number;
  active_departments_count: number;
  improvement_required_count: number;
}

export interface StudentFormStep1 {
  academic_year_id: string;
  department_id: string;
  programme_id: string;
  semester: number;
  course_id: string;
  faculty_id: string;
  mapping_id: string;
}

export interface ImplementationPlanRow {
  id: string;
  phase: string;
  phase_name: string;
  target_modules: string;
  key_tasks: string;
  status: string;
  expected_output: string;
}

export interface DatabaseSchemaRow {
  id: string;
  table_name: string;
  column_name: string;
  data_type: string;
  constraints: string;
  description: string;
}

export interface GradingStandardRow {
  id: string;
  score_range: string;
  grade: string;
  performance: string;
  action_level: string;
}

export type DatasetTargetKey = 
  | 'implementation_plan'
  | 'database_schema'
  | 'questions'
  | 'grading_standards'
  | 'academic_years'
  | 'departments'
  | 'programmes'
  | 'faculty'
  | 'courses'
  | 'mappings';

export interface UserRoleAccess {
  role_id: string;
  role_name: string;
  description: string;
  target_users: string;
  can_give_feedback: boolean;
  can_view_analytics: boolean;
  can_manage_faculty: boolean;
  can_feed_data: boolean;
  can_export_reports: boolean;
  can_manage_settings: boolean;
  active_sessions_count: number;
}

export interface PageViewAnalytics {
  id: string;
  page_title: string;
  route_path: string;
  access_role: string;
  desktop_views: number;
  mobile_views: number;
  avg_time_seconds: number;
  status: 'active' | 'restricted';
}


