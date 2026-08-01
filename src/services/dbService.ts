import {
  AcademicYear,
  Department,
  Programme,
  Faculty,
  Course,
  FacultyCourseMapping,
  FeedbackQuestion,
  FeedbackSubmission,
  InstitutionSettings,
  GlobalFilterState,
  DashboardStats,
  FacultyPerformanceSummary,
  DepartmentPerformanceSummary,
  QuestionAnalysis,
  ImplementationPlanRow,
  DatabaseSchemaRow,
  GradingStandardRow,
  DatasetTargetKey,
  UserRoleAccess,
  PageViewAnalytics
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_ACADEMIC_YEARS,
  INITIAL_DEPARTMENTS,
  INITIAL_PROGRAMMES,
  INITIAL_FACULTY,
  INITIAL_COURSES,
  INITIAL_MAPPINGS,
  INITIAL_QUESTIONS,
  INITIAL_IMPLEMENTATION_PLAN,
  INITIAL_SCHEMA_ROWS,
  INITIAL_GRADING_STANDARDS,
  generateSeedSubmissions
} from '../lib/mockData';
import { calculateGrade, calculateIQACInterpretation, formatPercentage, formatRating } from '../utils/calculations';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Local storage key constants
const STORAGE_KEYS = {
  SETTINGS: 'edu_settings',
  ACADEMIC_YEARS: 'edu_academic_years',
  DEPARTMENTS: 'edu_departments',
  PROGRAMMES: 'edu_programmes',
  FACULTY: 'edu_faculty',
  COURSES: 'edu_courses',
  MAPPINGS: 'edu_mappings',
  QUESTIONS: 'edu_questions',
  SUBMISSIONS: 'edu_submissions',
  IMPLEMENTATION_PLAN: 'edu_implementation_plan',
  DATABASE_SCHEMA: 'edu_database_schema',
  GRADING_STANDARDS: 'edu_grading_standards',
  USER_ROLES: 'edu_user_roles',
  PAGE_VIEWS: 'edu_page_views'
};

// Robust UUID generator compatible with Supabase PostgreSQL UUID primary keys
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (e) {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Initialize localStorage if empty or outdated
function initializeLocalStorage() {
  let currentMappings = getStored<any[]>(STORAGE_KEYS.MAPPINGS, []);
  
  // Clean out legacy sample mappings map-1 through map-7 if present
  if (currentMappings.some(m => /^map-[1-7]$/.test(m.id))) {
    currentMappings = currentMappings.filter(m => !/^map-[1-7]$/.test(m.id));
    localStorage.setItem(STORAGE_KEYS.MAPPINGS, JSON.stringify(currentMappings.length > 0 ? currentMappings : INITIAL_MAPPINGS));
    localStorage.setItem(STORAGE_KEYS.FACULTY, JSON.stringify(INITIAL_FACULTY));
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
  }

  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACADEMIC_YEARS)) {
    localStorage.setItem(STORAGE_KEYS.ACADEMIC_YEARS, JSON.stringify(INITIAL_ACADEMIC_YEARS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DEPARTMENTS)) {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(INITIAL_DEPARTMENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROGRAMMES)) {
    localStorage.setItem(STORAGE_KEYS.PROGRAMMES, JSON.stringify(INITIAL_PROGRAMMES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FACULTY)) {
    localStorage.setItem(STORAGE_KEYS.FACULTY, JSON.stringify(INITIAL_FACULTY));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MAPPINGS)) {
    localStorage.setItem(STORAGE_KEYS.MAPPINGS, JSON.stringify(INITIAL_MAPPINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS)) {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(generateSeedSubmissions()));
  }
  if (!localStorage.getItem(STORAGE_KEYS.IMPLEMENTATION_PLAN)) {
    localStorage.setItem(STORAGE_KEYS.IMPLEMENTATION_PLAN, JSON.stringify(INITIAL_IMPLEMENTATION_PLAN));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DATABASE_SCHEMA)) {
    localStorage.setItem(STORAGE_KEYS.DATABASE_SCHEMA, JSON.stringify(INITIAL_SCHEMA_ROWS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.GRADING_STANDARDS)) {
    localStorage.setItem(STORAGE_KEYS.GRADING_STANDARDS, JSON.stringify(INITIAL_GRADING_STANDARDS));
  }
}

// Ensure storage initialized on module load
initializeLocalStorage();

// Helper getters/setters
function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ----------------------------------------------------
// DB Service Interface Implementation
// ----------------------------------------------------
export const dbService = {
  // Settings
  async getSettings(): Promise<InstitutionSettings> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('settings').select('*').limit(1).single();
        if (data && !error) {
          const mapped: InstitutionSettings = {
            institution_name: data.institution_name,
            institution_short_name: data.institution_short_name,
            institution_logo: data.institution_logo,
            address: data.address,
            report_header: data.report_header,
            feedback_form_open: data.feedback_form_open,
            anonymous_mode: data.anonymous_mode,
            report_footer: data.report_footer,
            principal_name: data.principal_name,
            iqac_coordinator_name: data.iqac_coordinator_name
          };
          setStored(STORAGE_KEYS.SETTINGS, mapped);
          return mapped;
        }
      } catch (e) {
        console.warn('Supabase settings fetch error, using local storage:', e);
      }
    }
    return getStored<InstitutionSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  async updateSettings(settings: Partial<InstitutionSettings>): Promise<InstitutionSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    setStored(STORAGE_KEYS.SETTINGS, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('settings').upsert({
          id: '00000000-0000-0000-0000-000000000001',
          ...updated
        });
      } catch (e) {
        console.warn('Supabase settings update error:', e);
      }
    }
    return updated;
  },

  // Academic Years
  async getAcademicYears(): Promise<AcademicYear[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('academic_years').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0 && !error) {
          setStored(STORAGE_KEYS.ACADEMIC_YEARS, data);
          return data as AcademicYear[];
        }
      } catch (e) {
        console.warn('Supabase academic years fetch error:', e);
      }
    }
    return getStored<AcademicYear[]>(STORAGE_KEYS.ACADEMIC_YEARS, INITIAL_ACADEMIC_YEARS);
  },

  async saveAcademicYear(year: Partial<AcademicYear>): Promise<AcademicYear> {
    const list = await this.getAcademicYears();
    let updatedYear: AcademicYear;
    if (year.id) {
      const updatedList = list.map(item => {
        if (item.id === year.id) {
          updatedYear = { ...item, ...year } as AcademicYear;
          return updatedYear;
        }
        return year.is_current ? { ...item, is_current: false } : item;
      });
      setStored(STORAGE_KEYS.ACADEMIC_YEARS, updatedList);
    } else {
      updatedYear = {
        id: generateUUID(),
        year_name: year.year_name || 'New Academic Year',
        is_current: year.is_current || false,
        status: year.status || 'active',
        created_at: new Date().toISOString()
      };
      let newList = list;
      if (year.is_current) {
        newList = list.map(item => ({ ...item, is_current: false }));
      }
      newList.push(updatedYear);
      setStored(STORAGE_KEYS.ACADEMIC_YEARS, newList);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('academic_years').upsert(updatedYear!);
      } catch (e) {
        console.warn('Supabase academic year save error:', e);
      }
    }

    return updatedYear!;
  },

  // Departments
  async getDepartments(): Promise<Department[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('departments').select('*').order('department_code', { ascending: true });
        if (data && data.length > 0 && !error) {
          setStored(STORAGE_KEYS.DEPARTMENTS, data);
          return data as Department[];
        }
      } catch (e) {
        console.warn('Supabase departments fetch error:', e);
      }
    }
    return getStored<Department[]>(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
  },

  async saveDepartment(dept: Partial<Department>): Promise<Department> {
    const list = await this.getDepartments();
    let updatedDept: Department;
    if (dept.id) {
      const newList = list.map(item => {
        if (item.id === dept.id) {
          updatedDept = { ...item, ...dept } as Department;
          return updatedDept;
        }
        return item;
      });
      setStored(STORAGE_KEYS.DEPARTMENTS, newList);
    } else {
      updatedDept = {
        id: generateUUID(),
        department_code: dept.department_code || 'CODE',
        department_name: dept.department_name || 'New Department',
        status: dept.status || 'active',
        created_at: new Date().toISOString()
      };
      list.push(updatedDept);
      setStored(STORAGE_KEYS.DEPARTMENTS, list);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('departments').upsert(updatedDept!);
      } catch (e) {
        console.warn('Supabase department save error:', e);
      }
    }

    return updatedDept!;
  },

  // Programmes
  async getProgrammes(): Promise<Programme[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('programmes').select('*').order('programme_code', { ascending: true });
        if (data && data.length > 0 && !error) {
          setStored(STORAGE_KEYS.PROGRAMMES, data);
          return data as Programme[];
        }
      } catch (e) {
        console.warn('Supabase programmes fetch error:', e);
      }
    }
    return getStored<Programme[]>(STORAGE_KEYS.PROGRAMMES, INITIAL_PROGRAMMES);
  },

  async saveProgramme(prog: Partial<Programme>): Promise<Programme> {
    const list = await this.getProgrammes();
    let updatedProg: Programme;
    if (prog.id) {
      const newList = list.map(item => {
        if (item.id === prog.id) {
          updatedProg = { ...item, ...prog } as Programme;
          return updatedProg;
        }
        return item;
      });
      setStored(STORAGE_KEYS.PROGRAMMES, newList);
    } else {
      updatedProg = {
        id: generateUUID(),
        programme_code: prog.programme_code || 'PROG',
        programme_name: prog.programme_name || 'New Programme',
        department_id: prog.department_id || '',
        semesters_count: prog.semesters_count || 8,
        status: prog.status || 'active',
        created_at: new Date().toISOString()
      };
      list.push(updatedProg);
      setStored(STORAGE_KEYS.PROGRAMMES, list);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('programmes').upsert(updatedProg!);
      } catch (e) {
        console.warn('Supabase programme save error:', e);
      }
    }

    return updatedProg!;
  },

  // Faculty
  async getFaculty(): Promise<Faculty[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('faculty').select('*').order('faculty_name', { ascending: true });
        if (data && data.length > 0 && !error) {
          setStored(STORAGE_KEYS.FACULTY, data);
          return data as Faculty[];
        }
      } catch (e) {
        console.warn('Supabase faculty fetch error:', e);
      }
    }
    return getStored<Faculty[]>(STORAGE_KEYS.FACULTY, INITIAL_FACULTY);
  },

  async saveFaculty(fac: Partial<Faculty>): Promise<Faculty> {
    const list = await this.getFaculty();
    let updatedFac: Faculty;
    if (fac.id) {
      const newList = list.map(item => {
        if (item.id === fac.id) {
          updatedFac = { ...item, ...fac } as Faculty;
          return updatedFac;
        }
        return item;
      });
      setStored(STORAGE_KEYS.FACULTY, newList);
    } else {
      updatedFac = {
        id: generateUUID(),
        faculty_code: fac.faculty_code || `FAC-${Date.now().toString().slice(-3)}`,
        faculty_name: fac.faculty_name || 'New Faculty',
        email: fac.email || 'faculty@niet.edu',
        department_id: fac.department_id || '',
        designation: fac.designation || 'Assistant Professor',
        status: fac.status || 'active',
        created_at: new Date().toISOString()
      };
      list.push(updatedFac);
      setStored(STORAGE_KEYS.FACULTY, list);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('faculty').upsert(updatedFac!);
      } catch (e) {
        console.warn('Supabase faculty save error:', e);
      }
    }

    return updatedFac!;
  },

  // Courses
  async getCourses(): Promise<Course[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('courses').select('*').order('course_code', { ascending: true });
        if (data && data.length > 0 && !error) {
          setStored(STORAGE_KEYS.COURSES, data);
          return data as Course[];
        }
      } catch (e) {
        console.warn('Supabase courses fetch error:', e);
      }
    }
    return getStored<Course[]>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
  },

  async saveCourse(crs: Partial<Course>): Promise<Course> {
    const list = await this.getCourses();
    let updatedCrs: Course;
    if (crs.id) {
      const newList = list.map(item => {
        if (item.id === crs.id) {
          updatedCrs = { ...item, ...crs } as Course;
          return updatedCrs;
        }
        return item;
      });
      setStored(STORAGE_KEYS.COURSES, newList);
    } else {
      updatedCrs = {
        id: generateUUID(),
        course_code: crs.course_code || 'CRS',
        course_title: crs.course_title || 'New Course',
        department_id: crs.department_id || '',
        programme_id: crs.programme_id || '',
        semester: crs.semester || 1,
        status: crs.status || 'active',
        created_at: new Date().toISOString()
      };
      list.push(updatedCrs);
      setStored(STORAGE_KEYS.COURSES, list);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('courses').upsert(updatedCrs!);
      } catch (e) {
        console.warn('Supabase course save error:', e);
      }
    }

    return updatedCrs!;
  },

  // Faculty Course Mappings
  async getMappings(): Promise<FacultyCourseMapping[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('faculty_course_mappings').select('*');
        if (data && data.length > 0 && !error) {
          setStored(STORAGE_KEYS.MAPPINGS, data);
          return data as FacultyCourseMapping[];
        }
      } catch (e) {
        console.warn('Supabase mappings fetch error:', e);
      }
    }
    return getStored<FacultyCourseMapping[]>(STORAGE_KEYS.MAPPINGS, INITIAL_MAPPINGS);
  },

  async saveMapping(mapItem: Partial<FacultyCourseMapping>): Promise<FacultyCourseMapping> {
    const list = await this.getMappings();
    let updatedMap: FacultyCourseMapping;
    if (mapItem.id) {
      const newList = list.map(item => {
        if (item.id === mapItem.id) {
          updatedMap = { ...item, ...mapItem } as FacultyCourseMapping;
          return updatedMap;
        }
        return item;
      });
      setStored(STORAGE_KEYS.MAPPINGS, newList);
    } else {
      updatedMap = {
        id: generateUUID(),
        academic_year_id: mapItem.academic_year_id || '',
        faculty_id: mapItem.faculty_id || '',
        course_id: mapItem.course_id || '',
        programme_id: mapItem.programme_id || '',
        semester: mapItem.semester || 1,
        section: mapItem.section || 'A',
        status: mapItem.status || 'active',
        created_at: new Date().toISOString()
      };
      list.push(updatedMap);
      setStored(STORAGE_KEYS.MAPPINGS, list);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('faculty_course_mappings').upsert(updatedMap!);
      } catch (e) {
        console.warn('Supabase mapping save error:', e);
      }
    }

    return updatedMap!;
  },

  // Evaluation Questions
  async getQuestions(): Promise<FeedbackQuestion[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('feedback_questions').select('*').order('display_order', { ascending: true });
        if (data && data.length > 0 && !error) {
          setStored(STORAGE_KEYS.QUESTIONS, data);
          return data as FeedbackQuestion[];
        }
      } catch (e) {
        console.warn('Supabase questions fetch error:', e);
      }
    }
    return getStored<FeedbackQuestion[]>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
  },

  // Feedback Submissions
  async getSubmissions(filters?: Partial<GlobalFilterState>): Promise<FeedbackSubmission[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('feedback').select('*, ratings:feedback_ratings(*)').order('submitted_at', { ascending: false });
        if (filters?.academicYearId) query = query.eq('academic_year_id', filters.academicYearId);
        if (filters?.departmentId) query = query.eq('department_id', filters.departmentId);
        if (filters?.programmeId) query = query.eq('programme_id', filters.programmeId);
        if (filters?.semester) query = query.eq('semester', parseInt(filters.semester));
        if (filters?.courseId) query = query.eq('course_id', filters.courseId);
        if (filters?.facultyId) query = query.eq('faculty_id', filters.facultyId);

        const { data, error } = await query;
        if (data && !error) {
          const mappedList: FeedbackSubmission[] = data.map((sub: any) => {
            const ratingsList = sub.ratings ? sub.ratings.map((r: any) => ({
              question_number: r.question_number,
              rating: r.rating
            })) : [];
            const totalScore = ratingsList.reduce((acc: number, curr: any) => acc + curr.rating, 0);
            const percentage = formatPercentage((totalScore / 75) * 100);
            const { grade, performance } = calculateGrade(totalScore);

            return {
              id: sub.id,
              academic_year_id: sub.academic_year_id,
              department_id: sub.department_id,
              programme_id: sub.programme_id,
              semester: sub.semester,
              course_id: sub.course_id,
              faculty_id: sub.faculty_id,
              mapping_id: sub.mapping_id,
              suggestion_positive: sub.suggestion_positive,
              suggestion_improvement: sub.suggestion_improvement,
              additional_comments: sub.additional_comments,
              submitted_at: sub.submitted_at,
              ratings: ratingsList,
              total_score: totalScore,
              percentage: percentage,
              grade: grade,
              performance: performance
            };
          });
          setStored(STORAGE_KEYS.SUBMISSIONS, mappedList);
          return mappedList;
        }
      } catch (e) {
        console.warn('Supabase submissions fetch error:', e);
      }
    }

    let list = getStored<FeedbackSubmission[]>(STORAGE_KEYS.SUBMISSIONS, []);
    if (!filters) return list;

    return list.filter(sub => {
      if (filters.academicYearId && sub.academic_year_id !== filters.academicYearId) return false;
      if (filters.departmentId && sub.department_id !== filters.departmentId) return false;
      if (filters.programmeId && sub.programme_id !== filters.programmeId) return false;
      if (filters.semester && sub.semester.toString() !== filters.semester) return false;
      if (filters.courseId && sub.course_id !== filters.courseId) return false;
      if (filters.facultyId && sub.faculty_id !== filters.facultyId) return false;
      if (filters.startDate && new Date(sub.submitted_at) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(sub.submitted_at) > new Date(filters.endDate + 'T23:59:59')) return false;
      return true;
    });
  },

  async submitFeedback(payload: {
    academic_year_id: string;
    department_id: string;
    programme_id: string;
    semester: number;
    course_id: string;
    faculty_id: string;
    mapping_id?: string;
    ratings: { question_number: number; rating: number }[];
    suggestion_positive?: string;
    suggestion_improvement?: string;
    additional_comments?: string;
  }): Promise<FeedbackSubmission> {
    const list = getStored<FeedbackSubmission[]>(STORAGE_KEYS.SUBMISSIONS, []);
    
    const totalScore = payload.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    const percentage = formatPercentage((totalScore / 75) * 100);
    const { grade, performance } = calculateGrade(totalScore);
    const submissionId = generateUUID();

    const newSubmission: FeedbackSubmission = {
      id: submissionId,
      academic_year_id: payload.academic_year_id,
      department_id: payload.department_id,
      programme_id: payload.programme_id,
      semester: payload.semester,
      course_id: payload.course_id,
      faculty_id: payload.faculty_id,
      mapping_id: payload.mapping_id,
      suggestion_positive: payload.suggestion_positive,
      suggestion_improvement: payload.suggestion_improvement,
      additional_comments: payload.additional_comments,
      submitted_at: new Date().toISOString(),
      ratings: payload.ratings,
      total_score: totalScore,
      percentage: percentage,
      grade: grade,
      performance: performance
    };

    list.unshift(newSubmission);
    setStored(STORAGE_KEYS.SUBMISSIONS, list);

    if (isSupabaseConfigured && supabase) {
      try {
        // Try atomic procedure first
        const { data, error } = await supabase.rpc('submit_feedback_atomic', {
          p_academic_year_id: payload.academic_year_id,
          p_department_id: payload.department_id,
          p_programme_id: payload.programme_id,
          p_semester: payload.semester,
          p_course_id: payload.course_id,
          p_faculty_id: payload.faculty_id,
          p_mapping_id: payload.mapping_id || null,
          p_suggestion_positive: payload.suggestion_positive || null,
          p_suggestion_improvement: payload.suggestion_improvement || null,
          p_additional_comments: payload.additional_comments || null,
          p_ratings: payload.ratings
        });

        if (error) {
          // Direct fallback insert
          const { data: fbRow, error: fbErr } = await supabase.from('feedback').insert({
            id: submissionId,
            academic_year_id: payload.academic_year_id,
            department_id: payload.department_id,
            programme_id: payload.programme_id,
            semester: payload.semester,
            course_id: payload.course_id,
            faculty_id: payload.faculty_id,
            mapping_id: payload.mapping_id,
            suggestion_positive: payload.suggestion_positive,
            suggestion_improvement: payload.suggestion_improvement,
            additional_comments: payload.additional_comments
          }).select().single();

          if (fbRow && !fbErr) {
            const ratingRows = payload.ratings.map(r => ({
              feedback_id: fbRow.id,
              question_number: r.question_number,
              rating: r.rating
            }));
            await supabase.from('feedback_ratings').insert(ratingRows);
          }
        }
      } catch (e) {
        console.warn('Supabase feedback submit error:', e);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('edu_feedback_submitted'));
    }

    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const channel = new BroadcastChannel('edu_feedback_channel');
        channel.postMessage({ type: 'NEW_SUBMISSION', timestamp: Date.now() });
        channel.close();
      } catch (e) {}
    }

    return newSubmission;
  },

  async deleteSubmission(id: string): Promise<boolean> {
    const list = getStored<FeedbackSubmission[]>(STORAGE_KEYS.SUBMISSIONS, []);
    const updated = list.filter(sub => sub.id !== id);
    setStored(STORAGE_KEYS.SUBMISSIONS, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('feedback').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete submission error:', e);
      }
    }

    return true;
  },

  async clearAllSubmissions(): Promise<boolean> {
    setStored(STORAGE_KEYS.SUBMISSIONS, []);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('feedback').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (e) {
        console.warn('Supabase clear submissions error:', e);
      }
    }

    return true;
  },

  // ----------------------------------------------------
  // Analytics & Summary Calculations
  // ----------------------------------------------------
  async getDashboardStats(filters?: Partial<GlobalFilterState>): Promise<DashboardStats> {
    const submissions = await this.getSubmissions(filters);
    const facultyList = await this.getFaculty();
    const coursesList = await this.getCourses();
    const deptsList = await this.getDepartments();

    if (submissions.length === 0) {
      return {
        total_responses: 0,
        overall_average_percentage: 0,
        overall_average_rating: 0,
        faculty_evaluated_count: 0,
        courses_evaluated_count: 0,
        active_departments_count: deptsList.filter(d => d.status === 'active').length,
        improvement_required_count: 0
      };
    }

    let totalPointsSum = 0;
    let totalRatingsCount = 0;
    const evaluatedFacultySet = new Set<string>();
    const evaluatedCoursesSet = new Set<string>();
    
    // Faculty performance map for improvement required calculation (< 60%)
    const facScoresMap = new Map<string, { totalPoints: number; count: number }>();

    submissions.forEach(sub => {
      evaluatedFacultySet.add(sub.faculty_id);
      evaluatedCoursesSet.add(sub.course_id);

      if (!facScoresMap.has(sub.faculty_id)) {
        facScoresMap.set(sub.faculty_id, { totalPoints: 0, count: 0 });
      }

      if (sub.ratings) {
        sub.ratings.forEach(r => {
          totalPointsSum += r.rating;
          totalRatingsCount++;
          const facRecord = facScoresMap.get(sub.faculty_id)!;
          facRecord.totalPoints += r.rating;
          facRecord.count++;
        });
      }
    });

    const avgRating = totalRatingsCount > 0 ? totalPointsSum / totalRatingsCount : 0;
    const avgPercentage = formatPercentage((avgRating / 5) * 100);

    let improvementCount = 0;
    facScoresMap.forEach((val) => {
      const facAvg = val.count > 0 ? val.totalPoints / val.count : 0;
      const facPct = (facAvg / 5) * 100;
      if (facPct < 60) {
        improvementCount++;
      }
    });

    return {
      total_responses: submissions.length,
      overall_average_percentage: avgPercentage,
      overall_average_rating: formatRating(avgRating),
      faculty_evaluated_count: evaluatedFacultySet.size,
      courses_evaluated_count: evaluatedCoursesSet.size,
      active_departments_count: deptsList.filter(d => d.status === 'active').length,
      improvement_required_count: improvementCount
    };
  },

  async getFacultyPerformance(filters?: Partial<GlobalFilterState>): Promise<FacultyPerformanceSummary[]> {
    const submissions = await this.getSubmissions(filters);
    const facultyList = await this.getFaculty();
    const deptsList = await this.getDepartments();
    const deptMap = new Map(deptsList.map(d => [d.id, d.department_name]));

    const facMap = new Map<string, {
      faculty: Faculty;
      coursesSet: Set<string>;
      responsesCount: number;
      totalPoints: number;
      ratingsCount: number;
    }>();

    facultyList.forEach(fac => {
      facMap.set(fac.id, {
        faculty: fac,
        coursesSet: new Set(),
        responsesCount: 0,
        totalPoints: 0,
        ratingsCount: 0
      });
    });

    submissions.forEach(sub => {
      const record = facMap.get(sub.faculty_id);
      if (record) {
        record.responsesCount++;
        record.coursesSet.add(sub.course_id);
        if (sub.ratings) {
          sub.ratings.forEach(r => {
            record.totalPoints += r.rating;
            record.ratingsCount++;
          });
        }
      }
    });

    const result: FacultyPerformanceSummary[] = [];

    facMap.forEach((val, facId) => {
      if (val.responsesCount > 0) {
        const avgRating = val.ratingsCount > 0 ? val.totalPoints / val.ratingsCount : 0;
        const avgPct = formatPercentage((avgRating / 5) * 100);
        const totalScoreEstimate = avgRating * 15;
        const { grade, performance } = calculateGrade(totalScoreEstimate);
        const iqac = calculateIQACInterpretation(avgPct);

        result.push({
          faculty_id: facId,
          faculty_name: val.faculty.faculty_name,
          department_name: deptMap.get(val.faculty.department_id) || 'Unknown Dept',
          courses_evaluated_count: val.coursesSet.size,
          response_count: val.responsesCount,
          average_rating: formatRating(avgRating),
          average_percentage: avgPct,
          grade: grade,
          performance: performance,
          iqac_interpretation: iqac
        });
      }
    });

    return result.sort((a, b) => b.average_percentage - a.average_percentage);
  },

  async getDepartmentPerformance(filters?: Partial<GlobalFilterState>): Promise<DepartmentPerformanceSummary[]> {
    const submissions = await this.getSubmissions(filters);
    const deptsList = await this.getDepartments();
    const facultyList = await this.getFaculty();

    const deptStats = new Map<string, {
      dept: Department;
      facultySet: Set<string>;
      coursesSet: Set<string>;
      responsesCount: number;
      totalPoints: number;
      ratingsCount: number;
    }>();

    deptsList.forEach(dept => {
      const deptFac = facultyList.filter(f => f.department_id === dept.id);
      deptStats.set(dept.id, {
        dept: dept,
        facultySet: new Set(deptFac.map(f => f.id)),
        coursesSet: new Set(),
        responsesCount: 0,
        totalPoints: 0,
        ratingsCount: 0
      });
    });

    submissions.forEach(sub => {
      const record = deptStats.get(sub.department_id);
      if (record) {
        record.responsesCount++;
        record.coursesSet.add(sub.course_id);
        if (sub.ratings) {
          sub.ratings.forEach(r => {
            record.totalPoints += r.rating;
            record.ratingsCount++;
          });
        }
      }
    });

    const result: DepartmentPerformanceSummary[] = [];

    deptStats.forEach((val, deptId) => {
      const avgRating = val.ratingsCount > 0 ? val.totalPoints / val.ratingsCount : 0;
      const avgPct = formatPercentage((avgRating / 5) * 100);
      const { performance } = calculateGrade(avgRating * 15);

      result.push({
        department_id: deptId,
        department_code: val.dept.department_code,
        department_name: val.dept.department_name,
        faculty_count: val.facultySet.size,
        courses_evaluated_count: val.coursesSet.size,
        response_count: val.responsesCount,
        average_rating: formatRating(avgRating),
        average_percentage: avgPct,
        performance: performance
      });
    });

    return result;
  },

  async getQuestionAnalysis(filters?: Partial<GlobalFilterState>): Promise<QuestionAnalysis[]> {
    const submissions = await this.getSubmissions(filters);
    const questions = await this.getQuestions();

    const qStatsMap = new Map<number, { sum: number; count: number }>();
    questions.forEach(q => qStatsMap.set(q.question_number, { sum: 0, count: 0 }));

    submissions.forEach(sub => {
      if (sub.ratings) {
        sub.ratings.forEach(r => {
          const rec = qStatsMap.get(r.question_number);
          if (rec) {
            rec.sum += r.rating;
            rec.count++;
          }
        });
      }
    });

    return questions.map(q => {
      const rec = qStatsMap.get(q.question_number) || { sum: 0, count: 0 };
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
  },

  // Implementation Plan Dataset
  async getImplementationPlan(): Promise<ImplementationPlanRow[]> {
    return getStored<ImplementationPlanRow[]>(STORAGE_KEYS.IMPLEMENTATION_PLAN, INITIAL_IMPLEMENTATION_PLAN);
  },

  async saveImplementationPlan(data: ImplementationPlanRow[]): Promise<void> {
    setStored(STORAGE_KEYS.IMPLEMENTATION_PLAN, data);
  },

  // Database Schema Dataset
  async getDatabaseSchemaRows(): Promise<DatabaseSchemaRow[]> {
    return getStored<DatabaseSchemaRow[]>(STORAGE_KEYS.DATABASE_SCHEMA, INITIAL_SCHEMA_ROWS);
  },

  async saveDatabaseSchemaRows(data: DatabaseSchemaRow[]): Promise<void> {
    setStored(STORAGE_KEYS.DATABASE_SCHEMA, data);
  },

  // Grading Standards Dataset
  async getGradingStandards(): Promise<GradingStandardRow[]> {
    return getStored<GradingStandardRow[]>(STORAGE_KEYS.GRADING_STANDARDS, INITIAL_GRADING_STANDARDS);
  },

  async saveGradingStandards(data: GradingStandardRow[]): Promise<void> {
    setStored(STORAGE_KEYS.GRADING_STANDARDS, data);
  },

  // Reset Datasets to Dataform Excel Defaults
  async resetToDataformDataset(): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.ACADEMIC_YEARS, JSON.stringify(INITIAL_ACADEMIC_YEARS));
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(INITIAL_DEPARTMENTS));
    localStorage.setItem(STORAGE_KEYS.PROGRAMMES, JSON.stringify(INITIAL_PROGRAMMES));
    localStorage.setItem(STORAGE_KEYS.FACULTY, JSON.stringify(INITIAL_FACULTY));
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
    localStorage.setItem(STORAGE_KEYS.MAPPINGS, JSON.stringify(INITIAL_MAPPINGS));
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
    localStorage.setItem(STORAGE_KEYS.IMPLEMENTATION_PLAN, JSON.stringify(INITIAL_IMPLEMENTATION_PLAN));
    localStorage.setItem(STORAGE_KEYS.DATABASE_SCHEMA, JSON.stringify(INITIAL_SCHEMA_ROWS));
    localStorage.setItem(STORAGE_KEYS.GRADING_STANDARDS, JSON.stringify(INITIAL_GRADING_STANDARDS));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('departments').upsert(INITIAL_DEPARTMENTS);
        await supabase.from('academic_years').upsert(INITIAL_ACADEMIC_YEARS);
        await supabase.from('programmes').upsert(INITIAL_PROGRAMMES);
        await supabase.from('faculty').upsert(INITIAL_FACULTY);
        await supabase.from('courses').upsert(INITIAL_COURSES);
        await supabase.from('faculty_course_mappings').upsert(INITIAL_MAPPINGS);
        await supabase.from('feedback_questions').upsert(INITIAL_QUESTIONS);
      } catch (e) {
        console.warn('Supabase reset error:', e);
      }
    }
  },

  // Generic Bulk Insert / Import
  async bulkInsert(targetKey: DatasetTargetKey, rows: any[], overwrite: boolean = false): Promise<number> {
    switch (targetKey) {
      case 'academic_years': {
        const existing = await this.getAcademicYears();
        const updated = overwrite ? [...rows] : [...existing, ...rows];
        setStored(STORAGE_KEYS.ACADEMIC_YEARS, updated);
        if (isSupabaseConfigured && supabase) {
          try { await supabase.from('academic_years').upsert(rows); } catch (e) {}
        }
        return rows.length;
      }
      case 'departments': {
        const existing = await this.getDepartments();
        const updated = overwrite ? [...rows] : [...existing, ...rows];
        setStored(STORAGE_KEYS.DEPARTMENTS, updated);
        if (isSupabaseConfigured && supabase) {
          try { await supabase.from('departments').upsert(rows); } catch (e) {}
        }
        return rows.length;
      }
      case 'programmes': {
        const existing = await this.getProgrammes();
        const updated = overwrite ? [...rows] : [...existing, ...rows];
        setStored(STORAGE_KEYS.PROGRAMMES, updated);
        if (isSupabaseConfigured && supabase) {
          try { await supabase.from('programmes').upsert(rows); } catch (e) {}
        }
        return rows.length;
      }
      case 'faculty': {
        const existing = await this.getFaculty();
        const updated = overwrite ? [...rows] : [...existing, ...rows];
        setStored(STORAGE_KEYS.FACULTY, updated);
        if (isSupabaseConfigured && supabase) {
          try { await supabase.from('faculty').upsert(rows); } catch (e) {}
        }
        return rows.length;
      }
      case 'courses': {
        const existing = await this.getCourses();
        const updated = overwrite ? [...rows] : [...existing, ...rows];
        setStored(STORAGE_KEYS.COURSES, updated);
        if (isSupabaseConfigured && supabase) {
          try { await supabase.from('courses').upsert(rows); } catch (e) {}
        }
        return rows.length;
      }
      case 'mappings': {
        const existing = await this.getMappings();
        const updated = overwrite ? [...rows] : [...existing, ...rows];
        setStored(STORAGE_KEYS.MAPPINGS, updated);
        if (isSupabaseConfigured && supabase) {
          try { await supabase.from('faculty_course_mappings').upsert(rows); } catch (e) {}
        }
        return rows.length;
      }
      case 'questions': {
        const existing = await this.getQuestions();
        const updated = overwrite ? [...rows] : [...existing, ...rows];
        setStored(STORAGE_KEYS.QUESTIONS, updated);
        if (isSupabaseConfigured && supabase) {
          try { await supabase.from('feedback_questions').upsert(rows); } catch (e) {}
        }
        return rows.length;
      }
      case 'implementation_plan': {
        const existing = await this.getImplementationPlan();
        const updated = overwrite ? [...rows] : [...existing, ...rows];
        setStored(STORAGE_KEYS.IMPLEMENTATION_PLAN, updated);
        return rows.length;
      }
      case 'database_schema': {
        const existing = await this.getDatabaseSchemaRows();
        const updated = overwrite ? [...rows] : [...existing, ...rows];
        setStored(STORAGE_KEYS.DATABASE_SCHEMA, updated);
        return rows.length;
      }
      case 'grading_standards': {
        const existing = await this.getGradingStandards();
        const updated = overwrite ? [...rows] : [...existing, ...rows];
        setStored(STORAGE_KEYS.GRADING_STANDARDS, updated);
        return rows.length;
      }
      default:
        return 0;
    }
  },

  // User Access Roles & Page Views
  async getUserRoles(): Promise<UserRoleAccess[]> {
    return getStored<UserRoleAccess[]>(STORAGE_KEYS.USER_ROLES, [
      {
        role_id: 'role-student',
        role_name: 'Student (Anonymous Evaluator)',
        description: 'Enrolled students submitting semester teaching feedback across academic courses.',
        target_users: 'All UG/PG Students',
        can_give_feedback: true,
        can_view_analytics: false,
        can_manage_faculty: false,
        can_feed_data: false,
        can_export_reports: false,
        can_manage_settings: false,
        active_sessions_count: 342
      },
      {
        role_id: 'role-faculty',
        role_name: 'Teaching Faculty',
        description: 'Subject teachers and Assistant/Associate Professors viewing self-performance metrics.',
        target_users: 'Department Faculty',
        can_give_feedback: false,
        can_view_analytics: true,
        can_manage_faculty: false,
        can_feed_data: false,
        can_export_reports: true,
        can_manage_settings: false,
        active_sessions_count: 58
      },
      {
        role_id: 'role-iqac',
        role_name: 'IQAC Coordinator / HOD',
        description: 'Department Heads & Quality Assurance Coordinators managing evaluation workflows.',
        target_users: 'HODs & Quality Team',
        can_give_feedback: true,
        can_view_analytics: true,
        can_manage_faculty: true,
        can_feed_data: true,
        can_export_reports: true,
        can_manage_settings: false,
        active_sessions_count: 14
      },
      {
        role_id: 'role-admin',
        role_name: 'System Administrator (Principal)',
        description: 'Full institutional administrative access, data feeding, settings & security controls.',
        target_users: 'Principal & Tech Admin',
        can_give_feedback: true,
        can_view_analytics: true,
        can_manage_faculty: true,
        can_feed_data: true,
        can_export_reports: true,
        can_manage_settings: true,
        active_sessions_count: 4
      }
    ]);
  },

  async saveUserRole(role: UserRoleAccess): Promise<UserRoleAccess[]> {
    const list = await this.getUserRoles();
    const updated = list.map(item => item.role_id === role.role_id ? role : item);
    setStored(STORAGE_KEYS.USER_ROLES, updated);
    return updated;
  },

  async getPageViewAnalytics(): Promise<PageViewAnalytics[]> {
    return getStored<PageViewAnalytics[]>(STORAGE_KEYS.PAGE_VIEWS, [
      { id: 'pv-1', page_title: 'Student Evaluation Wizard', route_path: '/feedback', access_role: 'Student', desktop_views: 1240, mobile_views: 3890, avg_time_seconds: 145, status: 'active' },
      { id: 'pv-2', page_title: 'IQAC Admin Dashboard', route_path: '/admin/dashboard', access_role: 'Administrator', desktop_views: 890, mobile_views: 420, avg_time_seconds: 310, status: 'active' },
      { id: 'pv-3', page_title: 'Faculty Performance Directory', route_path: '/admin/faculty-performance', access_role: 'Faculty / HOD', desktop_views: 650, mobile_views: 280, avg_time_seconds: 220, status: 'active' },
      { id: 'pv-4', page_title: 'Department Performance Summary', route_path: '/admin/department-performance', access_role: 'HOD / IQAC', desktop_views: 520, mobile_views: 190, avg_time_seconds: 195, status: 'active' },
      { id: 'pv-5', page_title: 'Bulk Data Feed Hub (Serial Entry)', route_path: '/admin/feed-data', access_role: 'Administrator', desktop_views: 480, mobile_views: 110, avg_time_seconds: 400, status: 'active' },
      { id: 'pv-6', page_title: 'Official IQAC Printable Reports', route_path: '/admin/reports', access_role: 'Administrator / HOD', desktop_views: 740, mobile_views: 160, avg_time_seconds: 260, status: 'active' }
    ]);
  },

  async recordPageView(routePath: string, isMobile: boolean = false): Promise<void> {
    const list = await this.getPageViewAnalytics();
    const updated = list.map(item => {
      if (item.route_path === routePath) {
        return {
          ...item,
          desktop_views: isMobile ? item.desktop_views : item.desktop_views + 1,
          mobile_views: isMobile ? item.mobile_views + 1 : item.mobile_views
        };
      }
      return item;
    });
    setStored(STORAGE_KEYS.PAGE_VIEWS, updated);
  }
};
