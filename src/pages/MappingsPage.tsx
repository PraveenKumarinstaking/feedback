import React, { useState, useEffect } from 'react';
import { Plus, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { dbService } from '../services/dbService';
import { FacultyCourseMapping, AcademicYear, Faculty, Course, Programme } from '../types';
import { LoadingState } from '../components/common/LoadingState';

export const MappingsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [mappings, setMappings] = useState<FacultyCourseMapping[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingMap, setEditingMap] = useState<Partial<FacultyCourseMapping>>({});

  const [ayId, setAyId] = useState<string>('');
  const [facId, setFacId] = useState<string>('');
  const [crsId, setCrsId] = useState<string>('');
  const [progId, setProgId] = useState<string>('');
  const [semester, setSemester] = useState<number>(1);
  const [section, setSection] = useState<string>('A');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const loadData = async () => {
    setLoading(true);
    try {
      const [mList, aList, fList, cList, pList] = await Promise.all([
        dbService.getMappings(),
        dbService.getAcademicYears(),
        dbService.getFaculty(),
        dbService.getCourses(),
        dbService.getProgrammes()
      ]);

      setMappings(mList);
      setAcademicYears(aList);
      setFacultyList(fList);
      setCourses(cList);
      setProgrammes(pList);

      if (aList.length > 0) setAyId(aList.find(a => a.is_current)?.id || aList[0].id);
      if (fList.length > 0) setFacId(fList[0].id);
      if (cList.length > 0) setCrsId(cList[0].id);
      if (pList.length > 0) setProgId(pList[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingMap({});
    if (academicYears.length > 0) setAyId(academicYears.find(a => a.is_current)?.id || academicYears[0].id);
    if (facultyList.length > 0) setFacId(facultyList[0].id);
    if (courses.length > 0) setCrsId(courses[0].id);
    if (programmes.length > 0) setProgId(programmes[0].id);
    setSemester(1);
    setSection('A');
    setStatus('active');
    setShowModal(true);
  };

  const handleOpenEdit = (m: FacultyCourseMapping) => {
    setEditingMap(m);
    setAyId(m.academic_year_id);
    setFacId(m.faculty_id);
    setCrsId(m.course_id);
    setProgId(m.programme_id);
    setSemester(m.semester);
    setSection(m.section);
    setStatus(m.status);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await dbService.saveMapping({
      id: editingMap.id,
      academic_year_id: ayId,
      faculty_id: facId,
      course_id: crsId,
      programme_id: progId,
      semester: Number(semester),
      section: section,
      status: status
    });
    setShowModal(false);
    loadData();
  };

  const handleToggleStatus = async (m: FacultyCourseMapping) => {
    const newStatus = m.status === 'active' ? 'inactive' : 'active';
    await dbService.saveMapping({ ...m, status: newStatus });
    loadData();
  };

  const ayMap = new Map(academicYears.map(a => [a.id, a.year_name]));
  const facMap = new Map(facultyList.map(f => [f.id, f.faculty_name]));
  const crsMap = new Map(courses.map(c => [c.id, `${c.course_code} - ${c.course_title}`]));
  const progMap = new Map(programmes.map(p => [p.id, p.programme_code]));

  if (loading) {
    return <LoadingState message="Loading Faculty-Course Mappings..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Faculty–Course Mappings</h1>
          <p className="text-xs text-gray-500 mt-1">Assign faculty members to courses, sections & academic years.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty Assignment</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
            <tr>
              <th className="p-4">Academic Year</th>
              <th className="p-4">Faculty Member</th>
              <th className="p-4">Assigned Course</th>
              <th className="p-4">Programme</th>
              <th className="p-4 text-center">Sem / Sec</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mappings.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold text-gray-800">{ayMap.get(m.academic_year_id) || 'AY'}</td>
                <td className="p-4 font-bold text-brand-700 text-sm">{facMap.get(m.faculty_id) || 'Faculty'}</td>
                <td className="p-4 font-semibold text-gray-900">{crsMap.get(m.course_id) || 'Course'}</td>
                <td className="p-4 text-gray-600 font-medium">{progMap.get(m.programme_id) || 'Prog'}</td>
                <td className="p-4 text-center font-extrabold text-gray-800">
                  Sem {m.semester} ({m.section})
                </td>
                <td className="p-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    m.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {m.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => handleOpenEdit(m)}
                    className="p-1.5 text-gray-600 hover:text-brand-600 rounded-lg hover:bg-gray-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(m)}
                    className={`p-1.5 rounded-lg hover:bg-gray-100 ${
                      m.status === 'active' ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {m.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingMap.id ? 'Edit Faculty Assignment' : 'Add Faculty Assignment'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Academic Year *</label>
                <select
                  value={ayId}
                  onChange={e => setAyId(e.target.value)}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold"
                >
                  {academicYears.map(a => (
                    <option key={a.id} value={a.id}>{a.year_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Faculty Member *</label>
                <select
                  value={facId}
                  onChange={e => setFacId(e.target.value)}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold"
                >
                  {facultyList.map(f => (
                    <option key={f.id} value={f.id}>{f.faculty_name} ({f.designation})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Course *</label>
                <select
                  value={crsId}
                  onChange={e => setCrsId(e.target.value)}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.course_code} - {c.course_title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Programme *</label>
                  <select
                    value={progId}
                    onChange={e => setProgId(e.target.value)}
                    className="w-full rounded-xl border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold"
                  >
                    {programmes.map(p => (
                      <option key={p.id} value={p.id}>{p.programme_code}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Semester *</label>
                  <select
                    value={semester}
                    onChange={e => setSemester(Number(e.target.value))}
                    className="w-full rounded-xl border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Section (A / B / C)</label>
                <input
                  type="text"
                  value={section}
                  onChange={e => setSection(e.target.value)}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-600 rounded-lg hover:bg-brand-700 shadow-sm"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
