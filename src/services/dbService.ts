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
  DatasetTargetKey
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
  GRADING_STANDARDS: 'edu_grading_standards'
};

// Initialize localStorage if empty or outdated
function initializeLocalStorage() {
  let currentMappings = getStored<any[]>(STORAGE_KEYS.MAPPINGS, []);
  
  // Clean out sample mappings map-1 through map-7 if present
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
    return getStored<InstitutionSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  async updateSettings(settings: Partial<InstitutionSettings>): Promise<InstitutionSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    setStored(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  // Academic Years
  async getAcademicYears(): Promise<AcademicYear[]> {
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
        id: `ay-${Date.now()}`,
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
    return updatedYear!;
  },

  // Departments
  async getDepartments(): Promise<Department[]> {
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
        id: `dept-${Date.now()}`,
        department_code: dept.department_code || 'CODE',
        department_name: dept.department_name || 'New Department',
        status: dept.status || 'active',
        created_at: new Date().toISOString()
      };
      list.push(updatedDept);
      setStored(STORAGE_KEYS.DEPARTMENTS, list);
    }
    return updatedDept!;
  },

  // Programmes
  async getProgrammes(): Promise<Programme[]> {
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
        id: `prog-${Date.now()}`,
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
    return updatedProg!;
  },

  // Faculty
  async getFaculty(): Promise<Faculty[]> {
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
        id: `fac-${Date.now()}`,
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
    return updatedFac!;
  },

  // Courses
  async getCourses(): Promise<Course[]> {
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
        id: `crs-${Date.now()}`,
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
    return updatedCrs!;
  },

  // Faculty Course Mappings
  async getMappings(): Promise<FacultyCourseMapping[]> {
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
        id: `map-${Date.now()}`,
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
    return updatedMap!;
  },

  // Evaluation Questions
  async getQuestions(): Promise<FeedbackQuestion[]> {
    return getStored<FeedbackQuestion[]>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
  },

  // Feedback Submissions
  async getSubmissions(filters?: Partial<GlobalFilterState>): Promise<FeedbackSubmission[]> {
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

    const newSubmission: FeedbackSubmission = {
      id: `fb-${Date.now()}`,
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
    return newSubmission;
  },

  async deleteSubmission(id: string): Promise<boolean> {
    const list = getStored<FeedbackSubmission[]>(STORAGE_KEYS.SUBMISSIONS, []);
    const updated = list.filter(sub => sub.id !== id);
    setStored(STORAGE_KEYS.SUBMISSIONS, updated);
    return true;
  },

  async clearAllSubmissions(): Promise<boolean> {
    setStored(STORAGE_KEYS.SUBMISSIONS, []);
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
  },

  // Generic Bulk Insert / Import
  async bulkInsert(targetKey: DatasetTargetKey, rows: any[], overwrite: boolean = false): Promise<number> {
    switch (targetKey) {
      case 'academic_years': {
        const existing = await this.getAcademicYears();
        const updated = overwrite ? [...rows] : [...existing, ...rows];
        setStored(STORAGE_KEYS.ACADEMIC_YEARS, updated);
        return rows.length;
      }
      case 'departments': {
        const existing = await this.getDepartments();
        const updated = overwrite ? [...rows] : [...existing, ...rows];
        setStored(STORAGE_KEYS.DEPARTMENTS, updated);
        return rows.length;
      }
      case 'programmes': {
        const existing = await this.getProgrammes();
        const updated = overwrite ? [...rows] : [...existing, ...rows];
        setStored(STORAGE_KEYS.PROGRAMMES, updated);
        return rows.length;
      }
      case 'faculty': {
        const existing = await this.getFaculty();
        const updated = overwrite ? [...rows] : [...existing, ...rows];
        setStored(STORAGE_KEYS.FACULTY, updated);
        return rows.length;
      }
      case 'courses': {
        const existing = await this.getCourses();
        const updated = overwrite ? [...rows] : [...existing, ...rows];
        setStored(STORAGE_KEYS.COURSES, updated);
        return rows.length;
      }
      case 'mappings': {
        const existing = await this.getMappings();
        const updated = overwrite ? [...rows] : [...existing, ...rows];
        setStored(STORAGE_KEYS.MAPPINGS, updated);
        return rows.length;
      }
      case 'questions': {
        const existing = await this.getQuestions();
        const updated = overwrite ? [...rows] : [...existing, ...rows];
        setStored(STORAGE_KEYS.QUESTIONS, updated);
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
  }
};

