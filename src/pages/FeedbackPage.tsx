import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { useSettings } from '../contexts/SettingsContext';
import { dbService } from '../services/dbService';
import {
  AcademicYear,
  Department,
  Programme,
  Course,
  Faculty,
  FacultyCourseMapping,
  FeedbackQuestion
} from '../types';

export const FeedbackPage: React.FC = () => {
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Master Data
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [mappings, setMappings] = useState<FacultyCourseMapping[]>([]);
  const [questions, setQuestions] = useState<FeedbackQuestion[]>([]);

  // Form State
  const [selectedAY, setSelectedAY] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedProg, setSelectedProg] = useState<string>('');
  const [selectedSem, setSelectedSem] = useState<number>(1);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');
  const [selectedMapping, setSelectedMapping] = useState<string>('');

  // 15 Ratings Map (question_number -> rating score 1..5)
  const [ratings, setRatings] = useState<Record<number, number>>({});

  // Suggestions Textareas
  const [posSuggestion, setPosSuggestion] = useState<string>('');
  const [impSuggestion, setImpSuggestion] = useState<string>('');
  const [addComments, setAddComments] = useState<string>('');

  useEffect(() => {
    async function initData() {
      const [ays, depts, progs, crss, facs, maps, qns] = await Promise.all([
        dbService.getAcademicYears(),
        dbService.getDepartments(),
        dbService.getProgrammes(),
        dbService.getCourses(),
        dbService.getFaculty(),
        dbService.getMappings(),
        dbService.getQuestions()
      ]);

      const activeAYs = ays.filter(a => a.status === 'active');
      setAcademicYears(activeAYs);
      const current = activeAYs.find(a => a.is_current) || activeAYs[0];
      if (current) setSelectedAY(current.id);

      setDepartments(depts.filter(d => d.status === 'active'));
      setProgrammes(progs.filter(p => p.status === 'active'));
      setCourses(crss.filter(c => c.status === 'active'));
      setFacultyList(facs.filter(f => f.status === 'active'));
      setMappings(maps.filter(m => m.status === 'active'));
      setQuestions(qns.filter(q => q.is_active));
    }
    initData();
  }, []);

  // Filtered dropdown lists for dependent selections
  const filteredProgrammes = selectedDept
    ? programmes.filter(p => p.department_id === selectedDept)
    : programmes;

  const filteredCourses = selectedDept && selectedProg && selectedSem
    ? courses.filter(c => c.department_id === selectedDept && c.programme_id === selectedProg && c.semester === Number(selectedSem))
    : courses;

  // Auto-select mapped faculty when course is picked
  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
    const mapMatch = mappings.find(m =>
      m.course_id === courseId &&
      (!selectedAY || m.academic_year_id === selectedAY)
    );
    if (mapMatch) {
      setSelectedFaculty(mapMatch.faculty_id);
      setSelectedMapping(mapMatch.id);
    } else {
      setSelectedFaculty('');
      setSelectedMapping('');
    }
  };

  // Step Navigation Validation
  const handleNextStep = () => {
    setErrorMessage('');
    if (currentStep === 1) {
      if (!selectedAY || !selectedDept || !selectedProg || !selectedCourse || !selectedFaculty) {
        setErrorMessage('Please complete all academic information fields before proceeding.');
        return;
      }
    } else if (currentStep === 2) {
      // Validate all 15 questions answered
      const answeredCount = Object.keys(ratings).length;
      if (answeredCount < questions.length) {
        setErrorMessage(`Please answer all ${questions.length} evaluation questions (${answeredCount}/${questions.length} completed).`);
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setErrorMessage('');
    setCurrentStep(prev => prev - 1);
  };

  // Submit Feedback
  const handleSubmitFeedback = async () => {
    setSubmitting(true);
    setErrorMessage('');

    try {
      const ratingArray = Object.entries(ratings).map(([qNum, score]) => ({
        question_number: Number(qNum),
        rating: score
      }));

      await dbService.submitFeedback({
        academic_year_id: selectedAY,
        department_id: selectedDept,
        programme_id: selectedProg,
        semester: Number(selectedSem),
        course_id: selectedCourse,
        faculty_id: selectedFaculty,
        mapping_id: selectedMapping,
        ratings: ratingArray,
        suggestion_positive: posSuggestion,
        suggestion_improvement: impSuggestion,
        additional_comments: addComments
      });

      navigate('/feedback/success');
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e?.message || 'Unable to submit feedback. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!settings.feedback_form_open) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 max-w-md shadow-lg">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Feedback Form Closed</h2>
            <p className="text-sm text-gray-600 mt-2">
              Student feedback collection is currently closed by the academic administration.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Lookup Names for Review
  const ayObj = academicYears.find(a => a.id === selectedAY);
  const deptObj = departments.find(d => d.id === selectedDept);
  const progObj = programmes.find(p => p.id === selectedProg);
  const courseObj = courses.find(c => c.id === selectedCourse);
  const facultyObj = facultyList.find(f => f.id === selectedFaculty);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {/* Form Header Banner */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6 flex flex-col sm:flex-row items-center gap-4">
          {settings.institution_logo ? (
            <img src={settings.institution_logo} alt="Logo" className="w-14 h-14 object-cover rounded-xl border border-gray-200" />
          ) : (
            <div className="p-3 bg-brand-600 text-white rounded-xl">
              <GraduationCap className="w-8 h-8" />
            </div>
          )}
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">{settings.institution_name}</h1>
            <p className="text-sm font-semibold text-brand-700">Student Feedback Form – Teaching–Learning Process</p>
            <p className="text-xs text-gray-500 mt-1 flex items-center justify-center sm:justify-start gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              “Your feedback is confidential and will be used only for improving the quality of teaching and learning.”
            </p>
          </div>
        </div>

        {/* Progress Step Indicator */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-8">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-2 px-2">
            <span className={currentStep >= 1 ? 'text-brand-600' : ''}>1. Academic Details</span>
            <span className={currentStep >= 2 ? 'text-brand-600' : ''}>2. Evaluation (15 Questions)</span>
            <span className={currentStep >= 3 ? 'text-brand-600' : ''}>3. Suggestions</span>
            <span className={currentStep >= 4 ? 'text-brand-600' : ''}>4. Review & Submit</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-brand-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm font-medium text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 1: ACADEMIC INFORMATION */}
        {/* ============================================================ */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm animate-fadeIn">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-6">
              Step 1: Select Academic & Course Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Academic Year */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Academic Year *</label>
                <select
                  value={selectedAY}
                  onChange={e => setSelectedAY(e.target.value)}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm font-medium focus:ring-brand-500 focus:border-brand-500"
                >
                  <option value="">-- Select Academic Year --</option>
                  {academicYears.map(ay => (
                    <option key={ay.id} value={ay.id}>{ay.year_name} {ay.is_current ? '(Current)' : ''}</option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Department *</label>
                <select
                  value={selectedDept}
                  onChange={e => {
                    setSelectedDept(e.target.value);
                    setSelectedProg('');
                    setSelectedCourse('');
                    setSelectedFaculty('');
                  }}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm font-medium focus:ring-brand-500 focus:border-brand-500"
                >
                  <option value="">-- Select Department --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.department_code} – {d.department_name}</option>
                  ))}
                </select>
              </div>

              {/* Programme */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Programme / Degree *</label>
                <select
                  value={selectedProg}
                  onChange={e => {
                    setSelectedProg(e.target.value);
                    setSelectedCourse('');
                    setSelectedFaculty('');
                  }}
                  disabled={!selectedDept}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm font-medium focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50"
                >
                  <option value="">-- Select Programme --</option>
                  {filteredProgrammes.map(p => (
                    <option key={p.id} value={p.id}>{p.programme_code} – {p.programme_name}</option>
                  ))}
                </select>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Semester *</label>
                <select
                  value={selectedSem}
                  onChange={e => {
                    setSelectedSem(Number(e.target.value));
                    setSelectedCourse('');
                    setSelectedFaculty('');
                  }}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm font-medium focus:ring-brand-500 focus:border-brand-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              {/* Course Code & Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Course Code & Title *</label>
                <select
                  value={selectedCourse}
                  onChange={e => handleCourseChange(e.target.value)}
                  disabled={!selectedDept || !selectedProg}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm font-medium focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50"
                >
                  <option value="">-- Select Course --</option>
                  {filteredCourses.map(c => (
                    <option key={c.id} value={c.id}>{c.course_code} – {c.course_title}</option>
                  ))}
                </select>
              </div>

              {/* Faculty Name (Auto-identified or manual fallback) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Assigned Faculty Member *</label>
                <select
                  value={selectedFaculty}
                  onChange={e => setSelectedFaculty(e.target.value)}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm font-medium focus:ring-brand-500 focus:border-brand-500"
                >
                  <option value="">-- Select Faculty --</option>
                  {facultyList.map(f => (
                    <option key={f.id} value={f.id}>{f.faculty_name} ({f.designation})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNextStep}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/20 flex items-center gap-2 transition-all"
              >
                <span>Continue to Teaching Evaluation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: 15 EVALUATION QUESTIONS & RATING SCALE */}
        {/* ============================================================ */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm animate-fadeIn">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <h2 className="text-lg font-bold text-gray-900">Step 2: Teaching Evaluation Criteria (15 Questions)</h2>
              <p className="text-xs text-gray-500 mt-1">
                Rate each parameter on a scale from 1 (Poor) to 5 (Excellent). All questions are mandatory.
              </p>

              {/* Rating Scale Legend */}
              <div className="mt-4 grid grid-cols-5 gap-2 bg-slate-50 p-3 rounded-xl text-center text-xs font-semibold text-gray-700 border border-slate-200">
                <div className="p-1 rounded bg-rose-50 text-rose-700 border border-rose-100">1 - Poor</div>
                <div className="p-1 rounded bg-orange-50 text-orange-700 border border-orange-100">2 - Fair</div>
                <div className="p-1 rounded bg-amber-50 text-amber-700 border border-amber-100">3 - Good</div>
                <div className="p-1 rounded bg-blue-50 text-blue-700 border border-blue-100">4 - Very Good</div>
                <div className="p-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">5 - Excellent</div>
              </div>
            </div>

            <div className="space-y-6">
              {questions.map((q) => {
                const currentRating = ratings[q.question_number] || 0;

                return (
                  <div key={q.id} className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <span className="text-xs font-extrabold text-brand-600 uppercase tracking-wider">
                          Question {q.question_number} of 15 • {q.category}
                        </span>
                        <h3 className="text-sm font-bold text-gray-900 mt-1">{q.question_text}</h3>
                      </div>
                      {currentRating > 0 && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-700 shrink-0">
                          Score: {currentRating}/5
                        </span>
                      )}
                    </div>

                    {/* Large Accessible Rating Buttons */}
                    <div className="grid grid-cols-5 gap-2 sm:gap-4 mt-3">
                      {[1, 2, 3, 4, 5].map((score) => {
                        const isSelected = currentRating === score;
                        const scoreStyles: Record<number, string> = {
                          1: isSelected ? 'bg-rose-600 text-white shadow-rose-200' : 'bg-white hover:bg-rose-50 text-gray-700 border-gray-200',
                          2: isSelected ? 'bg-orange-500 text-white shadow-orange-200' : 'bg-white hover:bg-orange-50 text-gray-700 border-gray-200',
                          3: isSelected ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-white hover:bg-amber-50 text-gray-700 border-gray-200',
                          4: isSelected ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-white hover:bg-blue-50 text-gray-700 border-gray-200',
                          5: isSelected ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-white hover:bg-emerald-50 text-gray-700 border-gray-200',
                        };

                        return (
                          <button
                            key={score}
                            type="button"
                            onClick={() => setRatings(prev => ({ ...prev, [q.question_number]: score }))}
                            className={`py-3 sm:py-3.5 rounded-xl border text-sm font-black transition-all transform active:scale-95 shadow-sm ${scoreStyles[score]}`}
                          >
                            {score}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={handlePrevStep}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={handleNextStep}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/20 flex items-center gap-2 transition-all"
              >
                <span>Continue to Suggestions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: STUDENT SUGGESTIONS */}
        {/* ============================================================ */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm animate-fadeIn">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-6">
              Step 3: Student Suggestions & Comments (Optional)
            </h2>

            <div className="space-y-6">
              {/* Question 1 */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-gray-700">1. What did you like most about this course/faculty?</label>
                  <span className="text-[11px] text-gray-400">{500 - posSuggestion.length} chars left</span>
                </div>
                <textarea
                  maxLength={500}
                  rows={3}
                  value={posSuggestion}
                  onChange={e => setPosSuggestion(e.target.value)}
                  placeholder="Share constructive positive aspects, effective teaching methods, or strengths..."
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              {/* Question 2 */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-gray-700">2. What improvements would you suggest?</label>
                  <span className="text-[11px] text-gray-400">{500 - impSuggestion.length} chars left</span>
                </div>
                <textarea
                  maxLength={500}
                  rows={3}
                  value={impSuggestion}
                  onChange={e => setImpSuggestion(e.target.value)}
                  placeholder="Suggest area for improvement (pacing, lab practicals, LMS notes, class interaction)..."
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              {/* Question 3 */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-gray-700">3. Any additional comments?</label>
                  <span className="text-[11px] text-gray-400">{500 - addComments.length} chars left</span>
                </div>
                <textarea
                  maxLength={500}
                  rows={3}
                  value={addComments}
                  onChange={e => setAddComments(e.target.value)}
                  placeholder="Any other comments or feedback..."
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={handlePrevStep}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={handleNextStep}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/20 flex items-center gap-2 transition-all"
              >
                <span>Review Feedback</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 4: REVIEW & CONFIRM SUBMISSION */}
        {/* ============================================================ */}
        {currentStep === 4 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm animate-fadeIn">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-6">
              Step 4: Review Your Feedback
            </h2>

            <div className="bg-brand-50/50 border border-brand-100 rounded-xl p-4 mb-6 text-xs text-brand-900 space-y-1">
              <p className="font-bold text-brand-700">Academic Summary:</p>
              <p><strong>Academic Year:</strong> {ayObj?.year_name}</p>
              <p><strong>Department:</strong> {deptObj?.department_name} ({deptObj?.department_code})</p>
              <p><strong>Programme & Semester:</strong> {progObj?.programme_code} • Semester {selectedSem}</p>
              <p><strong>Course:</strong> {courseObj?.course_code} - {courseObj?.course_title}</p>
              <p><strong>Faculty:</strong> {facultyObj?.faculty_name}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center">
                <span className="block text-xs font-semibold text-gray-500">Questions Completed</span>
                <span className="text-lg font-black text-emerald-600">15 / 15</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center">
                <span className="block text-xs font-semibold text-gray-500">Positive Comments</span>
                <span className="text-lg font-black text-gray-800">{posSuggestion ? 'Provided' : 'None'}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center">
                <span className="block text-xs font-semibold text-gray-500">Improvements</span>
                <span className="text-lg font-black text-gray-800">{impSuggestion ? 'Provided' : 'None'}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center">
                <span className="block text-xs font-semibold text-gray-500">Anonymity</span>
                <span className="text-lg font-black text-brand-600">Protected</span>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={handlePrevStep}
                disabled={submitting}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Edit Feedback</span>
              </button>

              <button
                onClick={handleSubmitFeedback}
                disabled={submitting}
                className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting Feedback...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Confirm & Submit Feedback</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
