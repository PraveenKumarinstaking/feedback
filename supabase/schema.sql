-- =========================================================================
-- EduFeedback – Student Feedback & Teaching Evaluation System
-- Complete PostgreSQL / Supabase Schema Setup Script
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------------------
-- 1. TABLES DEFINITIONS
-- -------------------------------------------------------------------------

-- System Settings
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_name TEXT NOT NULL DEFAULT 'National Institute of Technology & Higher Studies',
    institution_short_name TEXT NOT NULL DEFAULT 'NITH',
    institution_logo TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=120&auto=format&fit=crop&q=80',
    address TEXT NOT NULL DEFAULT 'College Campus Road, Higher Education Complex, City - 400001',
    report_header TEXT NOT NULL DEFAULT 'Internal Quality Assurance Cell (IQAC)',
    feedback_form_open BOOLEAN NOT NULL DEFAULT true,
    anonymous_mode BOOLEAN NOT NULL DEFAULT true,
    report_footer TEXT NOT NULL DEFAULT 'Confidential IQAC Evaluation Document',
    principal_name TEXT NOT NULL DEFAULT 'Dr. R. K. Sharma, Ph.D.',
    iqac_coordinator_name TEXT NOT NULL DEFAULT 'Prof. M. V. Kulkarni',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles (Admins)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Academic Years
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year_name VARCHAR(20) UNIQUE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Departments
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_code VARCHAR(20) UNIQUE NOT NULL,
    department_name TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Programmes
CREATE TABLE IF NOT EXISTS public.programmes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    programme_code VARCHAR(20) UNIQUE NOT NULL,
    programme_name TEXT NOT NULL,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
    semesters_count INTEGER DEFAULT 8,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Faculty
CREATE TABLE IF NOT EXISTS public.faculty (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_code VARCHAR(20) UNIQUE NOT NULL,
    faculty_name TEXT NOT NULL,
    email TEXT UNIQUE,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
    designation TEXT NOT NULL DEFAULT 'Assistant Professor',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_title TEXT NOT NULL,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
    programme_id UUID NOT NULL REFERENCES public.programmes(id) ON DELETE RESTRICT,
    semester INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Faculty-Course Mappings
CREATE TABLE IF NOT EXISTS public.faculty_course_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE RESTRICT,
    faculty_id UUID NOT NULL REFERENCES public.faculty(id) ON DELETE RESTRICT,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    programme_id UUID NOT NULL REFERENCES public.programmes(id) ON DELETE RESTRICT,
    semester INTEGER NOT NULL,
    section VARCHAR(10) DEFAULT 'A',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(academic_year_id, faculty_id, course_id, section)
);

-- Evaluation Questions Master Data
CREATE TABLE IF NOT EXISTS public.feedback_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_number INTEGER UNIQUE NOT NULL,
    question_text TEXT NOT NULL,
    category TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback Parent Submissions
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE RESTRICT,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
    programme_id UUID NOT NULL REFERENCES public.programmes(id) ON DELETE RESTRICT,
    semester INTEGER NOT NULL,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    faculty_id UUID NOT NULL REFERENCES public.faculty(id) ON DELETE RESTRICT,
    mapping_id UUID REFERENCES public.faculty_course_mappings(id) ON DELETE SET NULL,
    suggestion_positive TEXT,
    suggestion_improvement TEXT,
    additional_comments TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback Question Ratings
CREATE TABLE IF NOT EXISTS public.feedback_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feedback_id UUID NOT NULL REFERENCES public.feedback(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL CHECK (question_number BETWEEN 1 AND 15),
    question_id UUID REFERENCES public.feedback_questions(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5)
);

-- -------------------------------------------------------------------------
-- 2. INDEXES FOR HIGH-PERFORMANCE ANALYTICS
-- -------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_feedback_ay ON public.feedback(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_feedback_dept ON public.feedback(department_id);
CREATE INDEX IF NOT EXISTS idx_feedback_prog ON public.feedback(programme_id);
CREATE INDEX IF NOT EXISTS idx_feedback_course ON public.feedback(course_id);
CREATE INDEX IF NOT EXISTS idx_feedback_faculty ON public.feedback(faculty_id);
CREATE INDEX IF NOT EXISTS idx_ratings_feedback ON public.feedback_ratings(feedback_id);
CREATE INDEX IF NOT EXISTS idx_ratings_qnum ON public.feedback_ratings(question_number);

-- -------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- -------------------------------------------------------------------------
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_course_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_ratings ENABLE ROW LEVEL SECURITY;

-- Public/Student Policies (Read active master data, Insert new feedback)
CREATE POLICY "Public Read Settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Public Read Active Academic Years" ON public.academic_years FOR SELECT USING (status = 'active');
CREATE POLICY "Public Read Active Departments" ON public.departments FOR SELECT USING (status = 'active');
CREATE POLICY "Public Read Active Programmes" ON public.programmes FOR SELECT USING (status = 'active');
CREATE POLICY "Public Read Active Faculty" ON public.faculty FOR SELECT USING (status = 'active');
CREATE POLICY "Public Read Active Courses" ON public.courses FOR SELECT USING (status = 'active');
CREATE POLICY "Public Read Active Mappings" ON public.faculty_course_mappings FOR SELECT USING (status = 'active');
CREATE POLICY "Public Read Questions" ON public.feedback_questions FOR SELECT USING (is_active = true);
CREATE POLICY "Public Insert Feedback" ON public.feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Feedback Ratings" ON public.feedback_ratings FOR INSERT WITH CHECK (true);

-- Admin Policies (Full Access for authenticated users)
CREATE POLICY "Admin Full Access Settings" ON public.settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access Profiles" ON public.profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access Academic Years" ON public.academic_years FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access Departments" ON public.departments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access Programmes" ON public.programmes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access Faculty" ON public.faculty FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access Courses" ON public.courses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access Mappings" ON public.faculty_course_mappings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access Questions" ON public.feedback_questions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Read Feedback" ON public.feedback FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Read Ratings" ON public.feedback_ratings FOR SELECT USING (auth.role() = 'authenticated');

-- -------------------------------------------------------------------------
-- 4. ATOMIC TRANSACTION SUBMISSION PROCEDURE (RPC)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION submit_feedback_atomic(
    p_academic_year_id UUID,
    p_department_id UUID,
    p_programme_id UUID,
    p_semester INTEGER,
    p_course_id UUID,
    p_faculty_id UUID,
    p_mapping_id UUID,
    p_suggestion_positive TEXT,
    p_suggestion_improvement TEXT,
    p_additional_comments TEXT,
    p_ratings JSONB
) RETURNS UUID AS $$
DECLARE
    v_feedback_id UUID;
    v_rating_item JSONB;
BEGIN
    -- Insert Feedback Header
    INSERT INTO public.feedback (
        academic_year_id, department_id, programme_id, semester,
        course_id, faculty_id, mapping_id,
        suggestion_positive, suggestion_improvement, additional_comments
    ) VALUES (
        p_academic_year_id, p_department_id, p_programme_id, p_semester,
        p_course_id, p_faculty_id, p_mapping_id,
        p_suggestion_positive, p_suggestion_improvement, p_additional_comments
    ) RETURNING id INTO v_feedback_id;

    -- Insert 15 Ratings Loop
    FOR v_rating_item IN SELECT * FROM jsonb_array_elements(p_ratings)
    LOOP
        INSERT INTO public.feedback_ratings (
            feedback_id, question_number, rating
        ) VALUES (
            v_feedback_id,
            (v_rating_item->>'question_number')::INTEGER,
            (v_rating_item->>'rating')::INTEGER
        );
    END LOOP;

    RETURN v_feedback_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -------------------------------------------------------------------------
-- 5. INITIAL DEFAULT QUESTIONS SEED DATA
-- -------------------------------------------------------------------------
INSERT INTO public.feedback_questions (question_number, question_text, category, display_order) VALUES
(1, 'Faculty comes to class regularly and punctually.', 'Punctuality & Discipline', 1),
(2, 'Faculty demonstrates thorough subject knowledge and command over the course.', 'Subject Command', 2),
(3, 'Concepts are explained clearly and systematically.', 'Clarity & Pedagogy', 3),
(4, 'Course outcomes and objectives are explained clearly.', 'Curriculum Clarity', 4),
(5, 'Teaching methodology is effective.', 'Teaching Effectiveness', 5),
(6, 'Faculty effectively uses ICT tools such as PPT, videos, smart boards, simulations and LMS.', 'ICT & Digital Tools', 6),
(7, 'Faculty encourages student participation and interaction.', 'Classroom Engagement', 7),
(8, 'Faculty explains concepts using real-life and industry examples.', 'Practical Application', 8),
(9, 'Faculty completes the syllabus according to the academic schedule.', 'Syllabus Completion', 9),
(10, 'Faculty conducts quizzes, assignments and tutorials regularly.', 'Continuous Assessment', 10),
(11, 'Faculty provides timely and constructive feedback on assignments and tests.', 'Constructive Feedback', 11),
(12, 'Internal assessment is fair and transparent.', 'Assessment Fairness', 12),
(13, 'Faculty is available for academic guidance outside regular class hours.', 'Accessibility & Mentoring', 13),
(14, 'Faculty motivates students toward higher-order thinking and problem solving.', 'Student Motivation', 14),
(15, 'Overall effectiveness of teaching.', 'Overall Evaluation', 15)
ON CONFLICT (question_number) DO NOTHING;

-- Initial Settings Row
INSERT INTO public.settings (id) VALUES ('00000000-0000-0000-0000-000000000001') ON CONFLICT DO NOTHING;
