import React, { useState, useEffect } from 'react';
import { Filter, RefreshCw } from 'lucide-react';
import { GlobalFilterState, AcademicYear, Department, Programme, Course, Faculty } from '../../types';
import { dbService } from '../../services/dbService';

interface FilterBarProps {
  filters: GlobalFilterState;
  onFilterChange: (newFilters: GlobalFilterState) => void;
  onReset: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, onReset }) => {
  const [localFilters, setLocalFilters] = useState<GlobalFilterState>(filters);

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);

  useEffect(() => {
    async function loadMasterData() {
      const [ayList, deptList, progList, crsList, facList] = await Promise.all([
        dbService.getAcademicYears(),
        dbService.getDepartments(),
        dbService.getProgrammes(),
        dbService.getCourses(),
        dbService.getFaculty()
      ]);

      setAcademicYears(ayList);
      setDepartments(deptList.filter(d => d.status === 'active'));
      setProgrammes(progList.filter(p => p.status === 'active'));
      setCourses(crsList.filter(c => c.status === 'active'));
      setFaculty(facList.filter(f => f.status === 'active'));
    }
    loadMasterData();
  }, []);

  const handleChange = (field: keyof GlobalFilterState, value: string) => {
    const updated = { ...localFilters, [field]: value };
    // Dependent resetting
    if (field === 'departmentId') {
      updated.programmeId = '';
      updated.courseId = '';
      updated.facultyId = '';
    }
    setLocalFilters(updated);
  };

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  const handleReset = () => {
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
    setLocalFilters(emptyFilters);
    onReset();
  };

  // Dependent Filter Options
  const filteredProgrammes = localFilters.departmentId
    ? programmes.filter(p => p.department_id === localFilters.departmentId)
    : programmes;

  const filteredCourses = localFilters.departmentId
    ? courses.filter(c => c.department_id === localFilters.departmentId)
    : courses;

  const filteredFaculty = localFilters.departmentId
    ? faculty.filter(f => f.department_id === localFilters.departmentId)
    : faculty;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
        <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
          <Filter className="w-4 h-4 text-brand-600" />
          <span>Global Analytics Filters</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Academic Year */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Academic Year</label>
          <select
            value={localFilters.academicYearId}
            onChange={e => handleChange('academicYearId', e.target.value)}
            className="w-full text-xs font-medium rounded-lg border-gray-200 bg-gray-50 p-2 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="">All Academic Years</option>
            {academicYears.map(ay => (
              <option key={ay.id} value={ay.id}>{ay.year_name} {ay.is_current ? '(Current)' : ''}</option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Department</label>
          <select
            value={localFilters.departmentId}
            onChange={e => handleChange('departmentId', e.target.value)}
            className="w-full text-xs font-medium rounded-lg border-gray-200 bg-gray-50 p-2 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.department_code} - {d.department_name}</option>
            ))}
          </select>
        </div>

        {/* Programme */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Programme</label>
          <select
            value={localFilters.programmeId}
            onChange={e => handleChange('programmeId', e.target.value)}
            className="w-full text-xs font-medium rounded-lg border-gray-200 bg-gray-50 p-2 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="">All Programmes</option>
            {filteredProgrammes.map(p => (
              <option key={p.id} value={p.id}>{p.programme_code}</option>
            ))}
          </select>
        </div>

        {/* Semester */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Semester</label>
          <select
            value={localFilters.semester}
            onChange={e => handleChange('semester', e.target.value)}
            className="w-full text-xs font-medium rounded-lg border-gray-200 bg-gray-50 p-2 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
              <option key={s} value={s.toString()}>Semester {s}</option>
            ))}
          </select>
        </div>

        {/* Course */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Course</label>
          <select
            value={localFilters.courseId}
            onChange={e => handleChange('courseId', e.target.value)}
            className="w-full text-xs font-medium rounded-lg border-gray-200 bg-gray-50 p-2 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="">All Courses</option>
            {filteredCourses.map(c => (
              <option key={c.id} value={c.id}>{c.course_code} - {c.course_title}</option>
            ))}
          </select>
        </div>

        {/* Faculty */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Faculty</label>
          <select
            value={localFilters.facultyId}
            onChange={e => handleChange('facultyId', e.target.value)}
            className="w-full text-xs font-medium rounded-lg border-gray-200 bg-gray-50 p-2 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="">All Faculty</option>
            {filteredFaculty.map(f => (
              <option key={f.id} value={f.id}>{f.faculty_name}</option>
            ))}
          </select>
        </div>

        {/* Date Range Start */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">From Date</label>
          <input
            type="date"
            value={localFilters.startDate}
            onChange={e => handleChange('startDate', e.target.value)}
            className="w-full text-xs font-medium rounded-lg border-gray-200 bg-gray-50 p-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
      </div>
    </div>
  );
};
