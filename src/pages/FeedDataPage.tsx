import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Plus,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Users,
  Building2,
  BookOpen,
  Layers,
  Link2,
  Calendar,
  MessageSquare,
  Sparkles,
  Download,
  Key,
  Database,
  ArrowRight
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { dbService } from '../services/dbService';
import { DatasetTargetKey, Department, Programme, Course, Faculty, AcademicYear } from '../types';
import { LoadingState } from '../components/common/LoadingState';

export const FeedDataPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'excel' | 'serial' | 'seed'>('serial');
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Master Data Lookups for dropdowns
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // ----------------------------------------------------
  // Serial Key Entry State
  // ----------------------------------------------------
  const [targetDataset, setTargetDataset] = useState<DatasetTargetKey>('faculty');
  const [serialKey, setSerialKey] = useState<string>('');

  // Faculty form fields
  const [facName, setFacName] = useState<string>('');
  const [facEmail, setFacEmail] = useState<string>('');
  const [facDeptId, setFacDeptId] = useState<string>('');
  const [facDesignation, setFacDesignation] = useState<string>('Assistant Professor');

  // Department form fields
  const [deptCode, setDeptCode] = useState<string>('');
  const [deptName, setDeptName] = useState<string>('');

  // Course form fields
  const [courseCode, setCourseCode] = useState<string>('');
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [courseDeptId, setCourseDeptId] = useState<string>('');
  const [courseProgId, setCourseProgId] = useState<string>('');
  const [courseSem, setCourseSem] = useState<number>(1);

  // ----------------------------------------------------
  // Excel File Upload State
  // ----------------------------------------------------
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [importTarget, setImportTarget] = useState<DatasetTargetKey>('faculty');
  const [importMode, setImportMode] = useState<'append' | 'overwrite'>('append');

  useEffect(() => {
    loadLookups();
  }, []);

  useEffect(() => {
    generateAutoSerialKey(targetDataset);
  }, [targetDataset, facultyList, departments, courses, academicYears]);

  const loadLookups = async () => {
    try {
      const [ays, depts, progs, facs, crss] = await Promise.all([
        dbService.getAcademicYears(),
        dbService.getDepartments(),
        dbService.getProgrammes(),
        dbService.getFaculty(),
        dbService.getCourses()
      ]);
      setAcademicYears(ays);
      setDepartments(depts);
      setProgrammes(progs);
      setFacultyList(facs);
      setCourses(crss);

      if (depts.length > 0) setFacDeptId(depts[0].id);
      if (depts.length > 0) setCourseDeptId(depts[0].id);
      if (progs.length > 0) setCourseProgId(progs[0].id);
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  const generateAutoSerialKey = (dataset: DatasetTargetKey) => {
    const timestamp = Date.now().toString().slice(-4);
    switch (dataset) {
      case 'faculty':
        setSerialKey(`FAC-CS-${100 + facultyList.length + 1}`);
        break;
      case 'departments':
        setSerialKey(`DEPT-0${departments.length + 1}`);
        break;
      case 'courses':
        setSerialKey(`CS${300 + courses.length + 1}`);
        break;
      case 'academic_years':
        setSerialKey(`AY-2026-${timestamp}`);
        break;
      case 'programmes':
        setSerialKey(`PROG-0${programmes.length + 1}`);
        break;
      default:
        setSerialKey(`KEY-${timestamp}`);
        break;
    }
  };

  // Submit Serial Key Data Entry
  const handleSerialEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (targetDataset === 'faculty') {
        if (!facName.trim()) {
          showToast('error', 'Please enter faculty member name.');
          setLoading(false);
          return;
        }
        await dbService.saveFaculty({
          faculty_code: serialKey || `FAC-${Date.now().toString().slice(-3)}`,
          faculty_name: facName,
          email: facEmail || `${facName.toLowerCase().replace(/\s+/g, '.')}@niet.edu`,
          department_id: facDeptId || (departments[0]?.id || ''),
          designation: facDesignation,
          status: 'active'
        });
        showToast('success', `Faculty record "${facName}" (${serialKey}) added successfully!`);
        setFacName('');
        setFacEmail('');
      } else if (targetDataset === 'departments') {
        if (!deptName.trim() || !deptCode.trim()) {
          showToast('error', 'Please enter department name and code.');
          setLoading(false);
          return;
        }
        await dbService.saveDepartment({
          department_code: deptCode.toUpperCase(),
          department_name: deptName,
          status: 'active'
        });
        showToast('success', `Department "${deptName}" (${deptCode}) added successfully!`);
        setDeptName('');
        setDeptCode('');
      } else if (targetDataset === 'courses') {
        if (!courseTitle.trim() || !courseCode.trim()) {
          showToast('error', 'Please enter course title and code.');
          setLoading(false);
          return;
        }
        await dbService.saveCourse({
          course_code: courseCode.toUpperCase(),
          course_title: courseTitle,
          department_id: courseDeptId || (departments[0]?.id || ''),
          programme_id: courseProgId || (programmes[0]?.id || ''),
          semester: courseSem,
          status: 'active'
        });
        showToast('success', `Course "${courseTitle}" (${courseCode}) added successfully!`);
        setCourseTitle('');
        setCourseCode('');
      }

      await loadLookups();
    } catch (e: any) {
      showToast('error', `Failed to add record: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Excel File Upload & Parse
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

        if (jsonData.length === 0) {
          showToast('error', 'The uploaded Excel file contains no records.');
          setParsedRows([]);
          setParsedHeaders([]);
        } else {
          setParsedHeaders(Object.keys(jsonData[0]));
          setParsedRows(jsonData);
          showToast('success', `Parsed ${jsonData.length} record(s) from "${uploadedFile.name}".`);
        }
      } catch (err: any) {
        showToast('error', `Excel parsing error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  // Commit Excel File Import
  const handleCommitFileImport = async () => {
    if (parsedRows.length === 0) {
      showToast('error', 'No parsed rows available to import.');
      return;
    }
    setLoading(true);
    try {
      const processed = parsedRows.map((row, idx) => ({
        id: row.id || `imp-${Date.now()}-${idx}`,
        ...row,
        status: row.status || 'active'
      }));

      const count = await dbService.bulkInsert(importTarget, processed, importMode === 'overwrite');
      showToast('success', `Successfully imported & stored ${count} record(s) into ${importTarget.replace('_', ' ')}!`);
      setParsedRows([]);
      setFile(null);
      await loadLookups();
    } catch (e: any) {
      showToast('error', `Import failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Download Excel Template
  const handleDownloadTemplate = () => {
    let headers: string[] = [];
    let sampleRow: Record<string, any> = {};

    if (importTarget === 'faculty') {
      headers = ['faculty_code', 'faculty_name', 'email', 'department_id', 'designation', 'status'];
      sampleRow = {
        faculty_code: 'FAC-CS-110',
        faculty_name: 'Dr. A. K. Sundaram',
        email: 'ak.sundaram@niet.edu',
        department_id: departments[0]?.id || 'dept-1',
        designation: 'Associate Professor',
        status: 'active'
      };
    } else if (importTarget === 'courses') {
      headers = ['course_code', 'course_title', 'department_id', 'programme_id', 'semester', 'status'];
      sampleRow = {
        course_code: 'CS5120',
        course_title: 'Cloud Computing & DevOps',
        department_id: departments[0]?.id || 'dept-1',
        programme_id: programmes[0]?.id || 'prog-1',
        semester: 5,
        status: 'active'
      };
    } else {
      headers = ['department_code', 'department_name', 'status'];
      sampleRow = {
        department_code: 'AI&ML',
        department_name: 'Artificial Intelligence & Machine Learning',
        status: 'active'
      };
    }

    const ws = XLSX.utils.json_to_sheet([sampleRow], { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `${importTarget}_feed_template.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold animate-in fade-in slide-in-from-top-2 ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Data Feed & Bulk Import Hub</h1>
          <p className="text-xs text-gray-500 mt-1">
            Feed serial entry records manually or upload Excel/CSV spreadsheets to automatically parse and store institutional master details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" /> Total Stored Faculty: {facultyList.length}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
        <button
          onClick={() => setActiveTab('serial')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'serial'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-900/20'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Serial Key Data Feeder</span>
        </button>

        <button
          onClick={() => setActiveTab('excel')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'excel'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-900/20'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Excel / CSV Bulk File Upload</span>
        </button>

        <button
          onClick={() => setActiveTab('seed')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'seed'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-900/20'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Quick Template & Seed Feed</span>
        </button>
      </div>

      {/* TAB 1: Serial Entry Data Feeder */}
      {activeTab === 'serial' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Key Serial Entry & Feed Form</h2>
              <p className="text-xs text-gray-500">Auto-assigns serial key numbers and saves record details into the system database.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">Auto Serial Key:</span>
              <span className="px-3 py-1 bg-brand-50 text-brand-700 border border-brand-200 rounded-lg text-xs font-black">
                {serialKey}
              </span>
            </div>
          </div>

          <form onSubmit={handleSerialEntrySubmit} className="space-y-6">
            {/* Target Dataset Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Select Target Dataset to Feed</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTargetDataset('faculty')}
                  className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    targetDataset === 'faculty' ? 'border-brand-500 bg-brand-50/50 text-brand-900 font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-5 h-5 text-brand-600" />
                  <div>
                    <div className="text-xs font-bold">Faculty Members</div>
                    <div className="text-[11px] text-gray-400 font-medium">{facultyList.length} Stored Records</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetDataset('departments')}
                  className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    targetDataset === 'departments' ? 'border-brand-500 bg-brand-50/50 text-brand-900 font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-brand-600" />
                  <div>
                    <div className="text-xs font-bold">Departments</div>
                    <div className="text-[11px] text-gray-400 font-medium">{departments.length} Stored Records</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetDataset('courses')}
                  className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    targetDataset === 'courses' ? 'border-brand-500 bg-brand-50/50 text-brand-900 font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <BookOpen className="w-5 h-5 text-brand-600" />
                  <div>
                    <div className="text-xs font-bold">Courses</div>
                    <div className="text-[11px] text-gray-400 font-medium">{courses.length} Stored Records</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Dynamic Fields for Faculty */}
            {targetDataset === 'faculty' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Serial Employee Code</label>
                  <input
                    type="text"
                    value={serialKey}
                    onChange={e => setSerialKey(e.target.value)}
                    className="w-full text-xs font-bold border-gray-200 rounded-lg p-2.5 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Faculty Full Name *</label>
                  <input
                    type="text"
                    value={facName}
                    onChange={e => setFacName(e.target.value)}
                    placeholder="e.g. Prof. S. Ramesh"
                    className="w-full text-xs font-medium border-gray-200 rounded-lg p-2.5 focus:ring-brand-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={facEmail}
                    onChange={e => setFacEmail(e.target.value)}
                    placeholder="e.g. s.ramesh@niet.edu"
                    className="w-full text-xs font-medium border-gray-200 rounded-lg p-2.5 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Department</label>
                  <select
                    value={facDeptId}
                    onChange={e => setFacDeptId(e.target.value)}
                    className="w-full text-xs font-semibold border-gray-200 rounded-lg p-2.5 bg-white"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.department_name} ({d.department_code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Designation</label>
                  <select
                    value={facDesignation}
                    onChange={e => setFacDesignation(e.target.value)}
                    className="w-full text-xs font-semibold border-gray-200 rounded-lg p-2.5 bg-white"
                  >
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor & HOD">Professor & HOD</option>
                  </select>
                </div>
              </div>
            )}

            {/* Dynamic Fields for Department */}
            {targetDataset === 'departments' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Department Code *</label>
                  <input
                    type="text"
                    value={deptCode}
                    onChange={e => setDeptCode(e.target.value)}
                    placeholder="e.g. AI&ML"
                    className="w-full text-xs font-bold border-gray-200 rounded-lg p-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Department Name *</label>
                  <input
                    type="text"
                    value={deptName}
                    onChange={e => setDeptName(e.target.value)}
                    placeholder="e.g. Artificial Intelligence & Machine Learning"
                    className="w-full text-xs font-medium border-gray-200 rounded-lg p-2.5"
                    required
                  />
                </div>
              </div>
            )}

            {/* Dynamic Fields for Course */}
            {targetDataset === 'courses' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Course Code *</label>
                  <input
                    type="text"
                    value={courseCode}
                    onChange={e => setCourseCode(e.target.value)}
                    placeholder="e.g. CS4101"
                    className="w-full text-xs font-bold border-gray-200 rounded-lg p-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Course Title *</label>
                  <input
                    type="text"
                    value={courseTitle}
                    onChange={e => setCourseTitle(e.target.value)}
                    placeholder="e.g. Machine Learning & Neural Networks"
                    className="w-full text-xs font-medium border-gray-200 rounded-lg p-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Department</label>
                  <select
                    value={courseDeptId}
                    onChange={e => setCourseDeptId(e.target.value)}
                    className="w-full text-xs font-semibold border-gray-200 rounded-lg p-2.5 bg-white"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.department_name} ({d.department_code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Semester</label>
                  <select
                    value={courseSem}
                    onChange={e => setCourseSem(Number(e.target.value))}
                    className="w-full text-xs font-semibold border-gray-200 rounded-lg p-2.5 bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Feed & Store Serial Record</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Excel / CSV Bulk Importer */}
      {activeTab === 'excel' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Excel / CSV File Importer Feed</h2>
              <p className="text-xs text-gray-500">Automatically parses uploaded spreadsheet columns and stores details into system storage.</p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs border border-emerald-200 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download Template (.xlsx)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Target Master Dataset</label>
              <select
                value={importTarget}
                onChange={e => setImportTarget(e.target.value as DatasetTargetKey)}
                className="w-full text-xs font-semibold border-gray-200 rounded-xl p-2.5 bg-white"
              >
                <option value="faculty">Faculty Members</option>
                <option value="courses">Courses</option>
                <option value="departments">Departments</option>
                <option value="programmes">Programmes</option>
                <option value="academic_years">Academic Years</option>
                <option value="mappings">Faculty-Course Mappings</option>
                <option value="questions">Evaluation Questions</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Import Mode</label>
              <select
                value={importMode}
                onChange={e => setImportMode(e.target.value as 'append' | 'overwrite')}
                className="w-full text-xs font-semibold border-gray-200 rounded-xl p-2.5 bg-white"
              >
                <option value="append">Append (Add new records to existing dataset)</option>
                <option value="overwrite">Overwrite (Replace entire dataset with uploaded file)</option>
              </select>
            </div>
          </div>

          {/* File Upload Drop Area */}
          <div>
            <label className="border-2 border-dashed border-gray-300 hover:border-brand-500 bg-gray-50/60 hover:bg-brand-50/30 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all">
              <UploadCloud className="w-10 h-10 text-brand-600 mb-2 animate-bounce" />
              <span className="text-sm font-bold text-gray-800">
                {file ? file.name : 'Click to select or drag & drop Excel / CSV File'}
              </span>
              <span className="text-xs text-gray-500 mt-1">Supports dataform.xlsx, custom spreadsheets, or CSV logs</span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Parsed Preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Parsed Data Preview ({parsedRows.length} Rows)
                </span>
                <span className="text-[11px] text-gray-400">First 5 rows displayed</span>
              </div>
              <div className="overflow-x-auto border border-gray-200 rounded-xl max-h-56 scrollbar-thin">
                <table className="min-w-full text-xs text-left">
                  <thead className="bg-gray-100 font-bold text-gray-700 border-b border-gray-200">
                    <tr>
                      {parsedHeaders.map((h, i) => (
                        <th key={i} className="px-3.5 py-2.5 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parsedRows.slice(0, 5).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-gray-50">
                        {parsedHeaders.map((h, cIdx) => (
                          <td key={cIdx} className="px-3.5 py-2 whitespace-nowrap text-gray-600">
                            {String(row[h] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  onClick={handleCommitFileImport}
                  disabled={loading}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                  <span>Import & Store {parsedRows.length} Records Automatically</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Quick Template & Seed Feed */}
      {activeTab === 'seed' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900">Seed & Master Data Feed Utilities</h2>
            <p className="text-xs text-gray-500">Quickly feed standard institutional master datasets or reset to default IQAC Dataform benchmarks.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
              <div className="flex items-center gap-2 text-brand-700 font-bold text-sm">
                <Sparkles className="w-5 h-5" />
                <span>Reset to Dataform Dataset</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Restores default institutional sample data for 8 academic departments, 9 faculty members, 21 courses, and 37 mappings.
              </p>
              <button
                onClick={async () => {
                  setLoading(true);
                  await dbService.resetToDataformDataset();
                  await loadLookups();
                  setLoading(false);
                  showToast('success', 'Dataform dataset reset successfully!');
                }}
                disabled={loading}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all"
              >
                Reset Dataform Benchmarks
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <FileSpreadsheet className="w-5 h-5" />
                <span>Download Sample Excel Templates</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Download pre-formatted Excel template files for Faculty, Courses, or Department bulk imports.
              </p>
              <button
                onClick={handleDownloadTemplate}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all"
              >
                Download Excel Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
