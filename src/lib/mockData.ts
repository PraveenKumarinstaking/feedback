import {
  AcademicYear,
  Department,
  Programme,
  Faculty,
  Course,
  FacultyCourseMapping,
  FeedbackQuestion,
  FeedbackSubmission,
  InstitutionSettings
} from '../types';

export const INITIAL_SETTINGS: InstitutionSettings = {
  institution_name: 'National Institute of Engineering & Technology',
  institution_short_name: 'NIET',
  institution_logo: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=150&auto=format&fit=crop&q=80',
  address: 'University Campus Road, Higher Education Knowledge Hub, City - 400001',
  report_header: 'Internal Quality Assurance Cell (IQAC)',
  feedback_form_open: true,
  anonymous_mode: true,
  report_footer: 'Confidential Academic Evaluation Document',
  principal_name: 'Dr. R. K. Sharma, Ph.D.',
  iqac_coordinator_name: 'Prof. M. V. Kulkarni'
};

export const INITIAL_ACADEMIC_YEARS: AcademicYear[] = [
  { id: 'ay-1', year_name: '2026–2027', is_current: true, status: 'active', created_at: '2026-01-01' },
  { id: 'ay-2', year_name: '2025–2026', is_current: false, status: 'active', created_at: '2025-01-01' },
  { id: 'ay-3', year_name: '2024–2025', is_current: false, status: 'inactive', created_at: '2024-01-01' }
];

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dept-1', department_code: 'CSE', department_name: 'Computer Science & Engineering', status: 'active' },
  { id: 'dept-2', department_code: 'AI&DS', department_name: 'Artificial Intelligence & Data Science', status: 'active' },
  { id: 'dept-3', department_code: 'ECE', department_name: 'Electronics & Communication Engineering', status: 'active' },
  { id: 'dept-4', department_code: 'EEE', department_name: 'Electrical & Electronics Engineering', status: 'active' },
  { id: 'dept-5', department_code: 'MECH', department_name: 'Mechanical Engineering', status: 'active' },
  { id: 'dept-6', department_code: 'CIVIL', department_name: 'Civil Engineering', status: 'active' },
  { id: 'dept-7', department_code: 'MATHS', department_name: 'Mathematics Department', status: 'active' },
  { id: 'dept-8', department_code: 'ENGLISH', department_name: 'Humanities & English Department', status: 'active' }
];

export const INITIAL_PROGRAMMES: Programme[] = [
  { id: 'prog-1', programme_code: 'BE-CSE', programme_name: 'B.E. Computer Science & Engineering', department_id: 'dept-1', semesters_count: 8, status: 'active' },
  { id: 'prog-2', programme_code: 'BE-AIDS', programme_name: 'B.E. Artificial Intelligence & Data Science', department_id: 'dept-2', semesters_count: 8, status: 'active' },
  { id: 'prog-3', programme_code: 'BE-ECE', programme_name: 'B.E. Electronics & Communication Engineering', department_id: 'dept-3', semesters_count: 8, status: 'active' },
  { id: 'prog-4', programme_code: 'BE-EEE', programme_name: 'B.E. Electrical & Electronics Engineering', department_id: 'dept-4', semesters_count: 8, status: 'active' },
  { id: 'prog-5', programme_code: 'BE-MECH', programme_name: 'B.E. Mechanical Engineering', department_id: 'dept-5', semesters_count: 8, status: 'active' },
  { id: 'prog-6', programme_code: 'BE-CIVIL', programme_name: 'B.E. Civil Engineering', department_id: 'dept-6', semesters_count: 8, status: 'active' }
];

export const INITIAL_FACULTY: Faculty[] = [
                {
    "id": "fac-101",
    "faculty_code": "FAC-CS-101",
    "faculty_name": "Prof. V. Priyanka (AP/CSE)",
    "email": "v.priyanka@niet.edu",
    "department_id": "dept-1",
    "designation": "Assistant Professor",
    "status": "active"
  },
  {
    "id": "fac-102",
    "faculty_code": "FAC-CS-102",
    "faculty_name": "Prof. J. Justina Princy Thilagavathy (AP/CSE)",
    "email": "justina.p@niet.edu",
    "department_id": "dept-1",
    "designation": "Assistant Professor",
    "status": "active"
  },
  {
    "id": "fac-103",
    "faculty_code": "FAC-CS-103",
    "faculty_name": "Prof. R. Balasubramaniyan (AP/CSE)",
    "email": "r.balasubramaniyan@niet.edu",
    "department_id": "dept-1",
    "designation": "Assistant Professor",
    "status": "active"
  },
  {
    "id": "fac-104",
    "faculty_code": "FAC-CS-104",
    "faculty_name": "Prof. S. P. Subhashini (AP/CSE)",
    "email": "sp.subhashini@niet.edu",
    "department_id": "dept-1",
    "designation": "Assistant Professor",
    "status": "active"
  },
  {
    "id": "fac-105",
    "faculty_code": "FAC-CS-105",
    "faculty_name": "Prof. R. Meiyarasi (AP/CSE)",
    "email": "r.meiyarasi@niet.edu",
    "department_id": "dept-1",
    "designation": "Assistant Professor",
    "status": "active"
  },
  {
    "id": "fac-106",
    "faculty_code": "FAC-CS-106",
    "faculty_name": "Prof. S. Sankari (AP/CSE)",
    "email": "s.sankari@niet.edu",
    "department_id": "dept-1",
    "designation": "Assistant Professor",
    "status": "active"
  },
  {
    "id": "fac-107",
    "faculty_code": "FAC-MA-107",
    "faculty_name": "Prof. R. Shalini (AP/MATHS)",
    "email": "r.shalini@niet.edu",
    "department_id": "dept-7",
    "designation": "Assistant Professor",
    "status": "active"
  },
  {
    "id": "fac-108",
    "faculty_code": "FAC-EN-108",
    "faculty_name": "Prof. G. Gowthami (AP/ENGLISH)",
    "email": "g.gowthami@niet.edu",
    "department_id": "dept-8",
    "designation": "Assistant Professor",
    "status": "active"
  },
  {
    "id": "fac-109",
    "faculty_code": "FAC-MA-109",
    "faculty_name": "Prof. D. Latha (AP/MATHS)",
    "email": "d.latha@niet.edu",
    "department_id": "dept-7",
    "designation": "Assistant Professor",
    "status": "active"
  }
];

export const INITIAL_COURSES: Course[] = [
                {
    "id": "crs-101",
    "course_code": "CS5101",
    "course_title": "Distributed Computing",
    "department_id": "dept-1",
    "programme_id": "prog-1",
    "semester": 5,
    "status": "active"
  },
  {
    "id": "crs-102",
    "course_code": "CS5102",
    "course_title": "Cryptography and Cyber Security",
    "department_id": "dept-1",
    "programme_id": "prog-1",
    "semester": 5,
    "status": "active"
  },
  {
    "id": "crs-103",
    "course_code": "CS5103",
    "course_title": "Computer  Networks",
    "department_id": "dept-1",
    "programme_id": "prog-1",
    "semester": 5,
    "status": "active"
  },
  {
    "id": "crs-104",
    "course_code": "CS5104",
    "course_title": "Big Data Analytics",
    "department_id": "dept-1",
    "programme_id": "prog-1",
    "semester": 5,
    "status": "active"
  },
  {
    "id": "crs-105",
    "course_code": "CS5105",
    "course_title": "Complier Design",
    "department_id": "dept-1",
    "programme_id": "prog-1",
    "semester": 5,
    "status": "active"
  },
  {
    "id": "crs-106",
    "course_code": "CS5106",
    "course_title": "Web Technology",
    "department_id": "dept-1",
    "programme_id": "prog-1",
    "semester": 5,
    "status": "active"
  },
  {
    "id": "crs-107",
    "course_code": "CS5107",
    "course_title": "Web Technology Lab",
    "department_id": "dept-1",
    "programme_id": "prog-1",
    "semester": 5,
    "status": "active"
  },
  {
    "id": "crs-108",
    "course_code": "CS5108",
    "course_title": "Big Data Analytics Lab",
    "department_id": "dept-1",
    "programme_id": "prog-1",
    "semester": 5,
    "status": "active"
  },
  {
    "id": "crs-109",
    "course_code": "CS5109",
    "course_title": "Computer  Networks Lab",
    "department_id": "dept-1",
    "programme_id": "prog-1",
    "semester": 5,
    "status": "active"
  },
  {
    "id": "crs-110",
    "course_code": "CS5110",
    "course_title": "Complier Design Lab",
    "department_id": "dept-1",
    "programme_id": "prog-1",
    "semester": 5,
    "status": "active"
  },
  {
    "id": "crs-111",
    "course_code": "CS3111",
    "course_title": "Data  Structure",
    "department_id": "dept-1",
    "programme_id": "prog-1",
    "semester": 3,
    "status": "active"
  },
  {
    "id": "crs-112",
    "course_code": "CS3112",
    "course_title": "Java  Programming",
    "department_id": "dept-1",
    "programme_id": "prog-1",
    "semester": 3,
    "status": "active"
  },
  {
    "id": "crs-113",
    "course_code": "CS3113",
    "course_title": "Object Oriented Software Engineering",
    "department_id": "dept-1",
    "programme_id": "prog-1",
    "semester": 3,
    "status": "active"
  },
  {
    "id": "crs-114",
    "course_code": "CS3114",
    "course_title": "Operating  System",
    "department_id": "dept-1",
    "programme_id": "prog-1",
    "semester": 3,
    "status": "active"
  },
  {
    "id": "crs-115",
    "course_code": "CS3115",
    "course_title": "Discrete  Mathematics",
    "department_id": "dept-1",
    "programme_id": "prog-1",
    "semester": 3,
    "status": "active"
  },
  {
    "id": "crs-116",
    "course_code": "CS3116",
    "course_title": "English  Communication Skills",
    "department_id": "dept-1",
    "programme_id": "prog-1",
    "semester": 3,
    "status": "active"
  },
  {
    "id": "crs-117",
    "course_code": "CS3117",
    "course_title": "Skill  Development  Course-I Lab",
    "department_id": "dept-1",
    "programme_id": "prog-1",
    "semester": 3,
    "status": "active"
  },
  {
    "id": "crs-118",
    "course_code": "CS3118",
    "course_title": "Data  Structure Lab",
    "department_id": "dept-1",
    "programme_id": "prog-1",
    "semester": 3,
    "status": "active"
  },
  {
    "id": "crs-119",
    "course_code": "CS3119",
    "course_title": "Java  Programming Lab",
    "department_id": "dept-1",
    "programme_id": "prog-1",
    "semester": 3,
    "status": "active"
  },
  {
    "id": "crs-120",
    "course_code": "CS3120",
    "course_title": "Operating  System Lab",
    "department_id": "dept-1",
    "programme_id": "prog-1",
    "semester": 3,
    "status": "active"
  },
  {
    "id": "crs-121",
    "course_code": "CS3121",
    "course_title": "English Communication Skills",
    "department_id": "dept-1",
    "programme_id": "prog-1",
    "semester": 3,
    "status": "active"
  }
];

export const INITIAL_MAPPINGS: FacultyCourseMapping[] = [
                {
    "id": "map-df-8",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-101",
    "course_id": "crs-101",
    "programme_id": "prog-1",
    "semester": 5,
    "section": "A",
    "status": "active"
  },
  {
    "id": "map-df-9",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-102",
    "course_id": "crs-102",
    "programme_id": "prog-1",
    "semester": 5,
    "section": "A",
    "status": "active"
  },
  {
    "id": "map-df-10",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-103",
    "course_id": "crs-103",
    "programme_id": "prog-1",
    "semester": 5,
    "section": "A",
    "status": "active"
  },
  {
    "id": "map-df-11",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-104",
    "course_id": "crs-104",
    "programme_id": "prog-1",
    "semester": 5,
    "section": "A",
    "status": "active"
  },
  {
    "id": "map-df-12",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-101",
    "course_id": "crs-105",
    "programme_id": "prog-1",
    "semester": 5,
    "section": "A",
    "status": "active"
  },
  {
    "id": "map-df-13",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-105",
    "course_id": "crs-106",
    "programme_id": "prog-1",
    "semester": 5,
    "section": "A",
    "status": "active"
  },
  {
    "id": "map-df-14",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-105",
    "course_id": "crs-107",
    "programme_id": "prog-1",
    "semester": 5,
    "section": "A",
    "status": "active"
  },
  {
    "id": "map-df-15",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-104",
    "course_id": "crs-108",
    "programme_id": "prog-1",
    "semester": 5,
    "section": "A",
    "status": "active"
  },
  {
    "id": "map-df-16",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-103",
    "course_id": "crs-109",
    "programme_id": "prog-1",
    "semester": 5,
    "section": "A",
    "status": "active"
  },
  {
    "id": "map-df-17",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-101",
    "course_id": "crs-110",
    "programme_id": "prog-1",
    "semester": 5,
    "section": "A",
    "status": "active"
  },
  {
    "id": "map-df-18",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-106",
    "course_id": "crs-111",
    "programme_id": "prog-1",
    "semester": 3,
    "section": "A",
    "status": "active"
  },
  {
    "id": "map-df-19",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-103",
    "course_id": "crs-112",
    "programme_id": "prog-1",
    "semester": 3,
    "section": "A",
    "status": "active"
  },
  {
    "id": "map-df-20",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-102",
    "course_id": "crs-113",
    "programme_id": "prog-1",
    "semester": 3,
    "section": "A",
    "status": "active"
  },
  {
    "id": "map-df-21",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-104",
    "course_id": "crs-114",
    "programme_id": "prog-1",
    "semester": 3,
    "section": "A",
    "status": "active"
  },
  {
    "id": "map-df-22",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-107",
    "course_id": "crs-115",
    "programme_id": "prog-1",
    "semester": 3,
    "section": "A",
    "status": "active"
  },
  {
    "id": "map-df-23",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-108",
    "course_id": "crs-116",
    "programme_id": "prog-1",
    "semester": 3,
    "section": "A",
    "status": "active"
  },
  {
    "id": "map-df-24",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-108",
    "course_id": "crs-117",
    "programme_id": "prog-1",
    "semester": 3,
    "section": "A",
    "status": "active"
  },
  {
    "id": "map-df-25",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-106",
    "course_id": "crs-118",
    "programme_id": "prog-1",
    "semester": 3,
    "section": "A",
    "status": "active"
  },
  {
    "id": "map-df-26",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-103",
    "course_id": "crs-119",
    "programme_id": "prog-1",
    "semester": 3,
    "section": "A",
    "status": "active"
  },
  {
    "id": "map-df-27",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-104",
    "course_id": "crs-120",
    "programme_id": "prog-1",
    "semester": 3,
    "section": "A",
    "status": "active"
  },
  {
    "id": "map-df-28",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-101",
    "course_id": "crs-111",
    "programme_id": "prog-1",
    "semester": 3,
    "section": "B",
    "status": "active"
  },
  {
    "id": "map-df-29",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-103",
    "course_id": "crs-112",
    "programme_id": "prog-1",
    "semester": 3,
    "section": "B",
    "status": "active"
  },
  {
    "id": "map-df-30",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-105",
    "course_id": "crs-113",
    "programme_id": "prog-1",
    "semester": 3,
    "section": "B",
    "status": "active"
  },
  {
    "id": "map-df-31",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-106",
    "course_id": "crs-114",
    "programme_id": "prog-1",
    "semester": 3,
    "section": "B",
    "status": "active"
  },
  {
    "id": "map-df-32",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-109",
    "course_id": "crs-115",
    "programme_id": "prog-1",
    "semester": 3,
    "section": "B",
    "status": "active"
  },
  {
    "id": "map-df-33",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-108",
    "course_id": "crs-121",
    "programme_id": "prog-1",
    "semester": 3,
    "section": "B",
    "status": "active"
  },
  {
    "id": "map-df-34",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-108",
    "course_id": "crs-117",
    "programme_id": "prog-1",
    "semester": 3,
    "section": "B",
    "status": "active"
  },
  {
    "id": "map-df-35",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-101",
    "course_id": "crs-118",
    "programme_id": "prog-1",
    "semester": 3,
    "section": "B",
    "status": "active"
  },
  {
    "id": "map-df-36",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-103",
    "course_id": "crs-119",
    "programme_id": "prog-1",
    "semester": 3,
    "section": "B",
    "status": "active"
  },
  {
    "id": "map-df-37",
    "academic_year_id": "ay-1",
    "faculty_id": "fac-106",
    "course_id": "crs-120",
    "programme_id": "prog-1",
    "semester": 3,
    "section": "B",
    "status": "active"
  }
];

export const INITIAL_QUESTIONS: FeedbackQuestion[] = [
  { id: 'q-1', question_number: 1, question_text: 'Faculty comes to class regularly and punctually.', category: 'Punctuality & Discipline', is_active: true, display_order: 1 },
  { id: 'q-2', question_number: 2, question_text: 'Faculty demonstrates thorough subject knowledge and command over the course.', category: 'Subject Command', is_active: true, display_order: 2 },
  { id: 'q-3', question_number: 3, question_text: 'Concepts are explained clearly and systematically.', category: 'Clarity & Pedagogy', is_active: true, display_order: 3 },
  { id: 'q-4', question_number: 4, question_text: 'Course outcomes and objectives are explained clearly.', category: 'Curriculum Clarity', is_active: true, display_order: 4 },
  { id: 'q-5', question_number: 5, question_text: 'Teaching methodology is effective.', category: 'Teaching Effectiveness', is_active: true, display_order: 5 },
  { id: 'q-6', question_number: 6, question_text: 'Faculty effectively uses ICT tools such as PPT, videos, smart boards, simulations and LMS.', category: 'ICT & Digital Tools', is_active: true, display_order: 6 },
  { id: 'q-7', question_number: 7, question_text: 'Faculty encourages student participation and interaction.', category: 'Classroom Engagement', is_active: true, display_order: 7 },
  { id: 'q-8', question_number: 8, question_text: 'Faculty explains concepts using real-life and industry examples.', category: 'Practical Application', is_active: true, display_order: 8 },
  { id: 'q-9', question_number: 9, question_text: 'Faculty completes the syllabus according to the academic schedule.', category: 'Syllabus Completion', is_active: true, display_order: 9 },
  { id: 'q-10', question_number: 10, question_text: 'Faculty conducts quizzes, assignments and tutorials regularly.', category: 'Continuous Assessment', is_active: true, display_order: 10 },
  { id: 'q-11', question_number: 11, question_text: 'Faculty provides timely and constructive feedback on assignments and tests.', category: 'Constructive Feedback', is_active: true, display_order: 11 },
  { id: 'q-12', question_number: 12, question_text: 'Internal assessment is fair and transparent.', category: 'Assessment Fairness', is_active: true, display_order: 12 },
  { id: 'q-13', question_number: 13, question_text: 'Faculty is available for academic guidance outside regular class hours.', category: 'Accessibility & Mentoring', is_active: true, display_order: 13 },
  { id: 'q-14', question_number: 14, question_text: 'Faculty motivates students toward higher-order thinking and problem solving.', category: 'Student Motivation', is_active: true, display_order: 14 },
  { id: 'q-15', question_number: 15, question_text: 'Overall effectiveness of teaching.', category: 'Overall Evaluation', is_active: true, display_order: 15 }
];

export function generateSeedSubmissions(): FeedbackSubmission[] {
  const submissions: FeedbackSubmission[] = [];
  
  const sampleData = [
    // Prof. V. Priyanka (High scores)
    { mappingId: 'map-df-1', facId: 'fac-101', crsId: 'crs-101', deptId: 'dept-1', progId: 'prog-1', sem: 5, scores: [5,5,5,4,5,4,5,5,5,4,5,5,5,5,5], pos: 'Excellent explanation of distributed computing and RPC.', imp: 'Please share PDF lecture slides before class.', add: 'Best professor in CSE department!' },
    { mappingId: 'map-df-1', facId: 'fac-101', crsId: 'crs-101', deptId: 'dept-1', progId: 'prog-1', sem: 5, scores: [5,4,5,5,5,5,4,5,4,5,5,4,5,4,5], pos: 'Very punctual and always open for clearing doubts after class.', imp: 'More coding practice problems.', add: 'Great learning experience.' },
    
    // Prof. J. Justina Princy Thilagavathy (Good scores)
    { mappingId: 'map-df-2', facId: 'fac-102', crsId: 'crs-102', deptId: 'dept-1', progId: 'prog-1', sem: 5, scores: [4,4,4,4,4,5,4,4,4,4,4,4,4,4,4], pos: 'Clear presentation slides on cryptography algorithms.', imp: 'Conducted lab sessions can be paced slightly slower.', add: 'Satisfied overall.' },

    // Prof. R. Balasubramaniyan (Outstanding)
    { mappingId: 'map-df-3', facId: 'fac-103', crsId: 'crs-103', deptId: 'dept-1', progId: 'prog-1', sem: 5, scores: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5], pos: 'Deep insight into computer networks protocol stack.', imp: 'Provide Wireshark lab guides.', add: 'Inspirational instructor.' },

    // Prof. S. Sankari (Data Structures)
    { mappingId: 'map-df-11', facId: 'fac-106', crsId: 'crs-111', deptId: 'dept-1', progId: 'prog-1', sem: 3, scores: [5,5,4,5,5,4,5,5,5,5,4,5,4,5,5], pos: 'Great step-by-step algorithms explanation.', imp: 'No suggestions, teaching is perfect.', add: 'Highly recommended.' }
  ];

  sampleData.forEach((s, idx) => {
    const totalScore = s.scores.reduce((acc, curr) => acc + curr, 0);
    const percentage = (totalScore / 75) * 100;
    
    submissions.push({
      id: `fb-${idx + 1}`,
      academic_year_id: 'ay-1',
      department_id: s.deptId,
      programme_id: s.progId,
      semester: s.sem,
      course_id: s.crsId,
      faculty_id: s.facId,
      mapping_id: s.mappingId,
      suggestion_positive: s.pos,
      suggestion_improvement: s.imp,
      additional_comments: s.add,
      submitted_at: new Date(Date.now() - (idx * 86400000 * 2)).toISOString(),
      ratings: s.scores.map((r, qIdx) => ({ question_number: qIdx + 1, rating: r })),
      total_score: totalScore,
      percentage: Math.round(percentage * 100) / 100
    });
  });

  return submissions;
}

export const INITIAL_IMPLEMENTATION_PLAN = [
  { id: 'plan-1', phase: 'Phase 1', phase_name: 'UI & Frontend Foundation', target_modules: 'Landing Page, Student Feedback Wizard, Admin Login, Responsive Navigation', key_tasks: 'Setup Vite + React project, Tailwind CSS, Lucide icons, setup App router, craft responsive UI components, step wizard layout.', status: 'Planned', expected_output: 'Complete, styled frontend skeleton and pages' },
  { id: 'plan-2', phase: 'Phase 2', phase_name: 'Database & Schema Setup', target_modules: 'Supabase PostgreSQL Schema, RLS Policies, Seed Data, Transaction Functions', key_tasks: 'Write supabase/schema.sql script with 11 tables, foreign keys, indexes, submit_feedback_atomic RPC function, RLS security policies.', status: 'Planned', expected_output: 'Production SQL setup script & local data service' },
  { id: 'plan-3', phase: 'Phase 3', phase_name: 'Student Feedback Module', target_modules: 'Multi-step Feedback Portal, Dependent Dropdowns, Rating Scale, Review Step', key_tasks: 'Implement 4-step wizard: Academic Selection -> 15 Rating Questions -> Student Suggestions -> Review & Atomic DB Submission.', status: 'Planned', expected_output: 'Fully functional student feedback submission portal' },
  { id: 'plan-4', phase: 'Phase 4', phase_name: 'Master Data Management', target_modules: 'CRUD for Academic Years, Depts, Programmes, Faculty, Courses, Mappings', key_tasks: 'Build admin management interfaces with search, filtering, modal forms, activation toggles, and soft deletion protection.', status: 'Planned', expected_output: 'Complete admin master data CRUD suite' },
  { id: 'plan-5', phase: 'Phase 5', phase_name: 'Analytics & Dashboard', target_modules: 'KPI Metrics Cards, 5 Recharts Visualizations, Global Filtering Toolbar', key_tasks: 'Build KPI calculations, Faculty averages, Department bar chart, Grade donut chart, Q1-Q15 breakdown, trend line chart, global filter state.', status: 'Planned', expected_output: 'Real-time interactive administrative analytics dashboard' },
  { id: 'plan-6', phase: 'Phase 6', phase_name: 'IQAC Reports & Export', target_modules: 'Interactive Report Generator, Printable PDF View (@media print), CSV Export', key_tasks: 'Implement filtered report view, printable CSS layout formatted for institutional headers, signature blocks, browser print & CSV download.', status: 'Planned', expected_output: 'IQAC compliant report generation & export engine' },
  { id: 'plan-7', phase: 'Phase 7', phase_name: 'Security & Quality Assurance', target_modules: 'Auth Protection, RLS Enforcement, Form Validation, Mobile Responsive QA', key_tasks: 'Protect admin routes, enforce validation rules, test duplicate submission handling, verify mobile touch targets & error boundaries.', status: 'Planned', expected_output: 'Tested, secure, production-ready web application' }
];

export const INITIAL_SCHEMA_ROWS = [
  { id: 'sch-1', table_name: 'profiles', column_name: 'id', data_type: 'UUID', constraints: 'PRIMARY KEY', description: 'Unique profile identifier' },
  { id: 'sch-2', table_name: 'profiles', column_name: 'user_id', data_type: 'UUID', constraints: 'FK -> auth.users(id)', description: 'Supabase Auth user link' },
  { id: 'sch-3', table_name: 'profiles', column_name: 'full_name', data_type: 'TEXT', constraints: 'NOT NULL', description: 'Admin full name' },
  { id: 'sch-4', table_name: 'profiles', column_name: 'role', data_type: 'TEXT', constraints: "DEFAULT 'admin'", description: 'User access role' },
  { id: 'sch-5', table_name: 'academic_years', column_name: 'id', data_type: 'UUID', constraints: 'PRIMARY KEY', description: 'Academic year ID' },
  { id: 'sch-6', table_name: 'academic_years', column_name: 'year_name', data_type: 'VARCHAR(20)', constraints: 'UNIQUE, NOT NULL', description: 'Year label (e.g. 2026-2027)' },
  { id: 'sch-7', table_name: 'academic_years', column_name: 'is_current', data_type: 'BOOLEAN', constraints: 'DEFAULT false', description: 'Current active academic year flag' },
  { id: 'sch-8', table_name: 'departments', column_name: 'id', data_type: 'UUID', constraints: 'PRIMARY KEY', description: 'Department ID' },
  { id: 'sch-9', table_name: 'departments', column_name: 'department_code', data_type: 'VARCHAR(20)', constraints: 'UNIQUE, NOT NULL', description: 'Dept code (e.g. CSE)' },
  { id: 'sch-10', table_name: 'departments', column_name: 'department_name', data_type: 'TEXT', constraints: 'NOT NULL', description: 'Full department name' },
  { id: 'sch-11', table_name: 'programmes', column_name: 'id', data_type: 'UUID', constraints: 'PRIMARY KEY', description: 'Programme ID' },
  { id: 'sch-12', table_name: 'programmes', column_name: 'programme_code', data_type: 'VARCHAR(20)', constraints: 'UNIQUE, NOT NULL', description: 'Programme code (e.g. BE-CSE)' },
  { id: 'sch-13', table_name: 'faculty', column_name: 'id', data_type: 'UUID', constraints: 'PRIMARY KEY', description: 'Faculty ID' },
  { id: 'sch-14', table_name: 'faculty', column_name: 'faculty_code', data_type: 'VARCHAR(20)', constraints: 'UNIQUE, NOT NULL', description: 'Faculty employee ID' },
  { id: 'sch-15', table_name: 'courses', column_name: 'id', data_type: 'UUID', constraints: 'PRIMARY KEY', description: 'Course ID' },
  { id: 'sch-16', table_name: 'courses', column_name: 'course_code', data_type: 'VARCHAR(20)', constraints: 'UNIQUE, NOT NULL', description: 'Course code (e.g. CS301)' },
  { id: 'sch-17', table_name: 'faculty_course_mappings', column_name: 'id', data_type: 'UUID', constraints: 'PRIMARY KEY', description: 'Mapping ID' },
  { id: 'sch-18', table_name: 'feedback', column_name: 'id', data_type: 'UUID', constraints: 'PRIMARY KEY', description: 'Feedback submission ID' },
  { id: 'sch-19', table_name: 'feedback_ratings', column_name: 'id', data_type: 'UUID', constraints: 'PRIMARY KEY', description: 'Rating item ID' }
];

export const INITIAL_GRADING_STANDARDS = [
  { id: 'grd-1', score_range: '68 – 75', grade: 'A+', performance: 'Outstanding', action_level: 'Commendation & Exemplary Teaching' },
  { id: 'grd-2', score_range: '60 – 67', grade: 'A', performance: 'Excellent', action_level: 'Highly Satisfactory' },
  { id: 'grd-3', score_range: '52 – 59', grade: 'B+', performance: 'Very Good', action_level: 'Meets High Standards' },
  { id: 'grd-4', score_range: '45 – 51', grade: 'B', performance: 'Good', action_level: 'Satisfactory Performance' },
  { id: 'grd-5', score_range: '37 – 44', grade: 'C', performance: 'Satisfactory', action_level: 'Minor Guidance Recommended' },
  { id: 'grd-6', score_range: 'Below 37', grade: 'D', performance: 'Needs Improvement', action_level: 'Mandatory Teaching Review & Action Plan' }
];

