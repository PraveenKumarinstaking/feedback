import React, { useState, useEffect } from 'react';
import { Plus, Edit2, CheckCircle2, XCircle, Search } from 'lucide-react';
import { dbService } from '../services/dbService';
import { Course, Department, Programme } from '../types';
import { LoadingState } from '../components/common/LoadingState';

export const CoursesPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCrs, setEditingCrs] = useState<Partial<Course> | null>(null);

  const [code, setCode] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [deptId, setDeptId] = useState<string>('');
  const [progId, setProgId] = useState<string>('');
  const [semester, setSemester] = useState<number>(1);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const loadData = async () => {
    setLoading(true);
    try {
      const [cData, dData, pData] = await Promise.all([
        dbService.getCourses(),
        dbService.getDepartments(),
        dbService.getProgrammes()
      ]);
      setCourses(cData);
      setDepartments(dData);
      setProgrammes(pData);
      if (dData.length > 0) setDeptId(dData[0].id);
      if (pData.length > 0) setProgId(pData[0].id);
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
    setEditingCrs(null);
    setCode('CS');
    setTitle('');
    if (departments.length > 0) setDeptId(departments[0].id);
    if (programmes.length > 0) setProgId(programmes[0].id);
    setSemester(1);
    setStatus('active');
    setShowModal(true);
  };

  const handleOpenEdit = (c: Course) => {
    setEditingCrs(c);
    setCode(c.course_code);
    setTitle(c.course_title);
    setDeptId(c.department_id);
    setProgId(c.programme_id);
    setSemester(c.semester);
    setStatus(c.status);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await dbService.saveCourse({
      id: editingCrs?.id,
      course_code: code,
      course_title: title,
      department_id: deptId,
      programme_id: progId,
      semester: Number(semester),
      status: status
    });
    setShowModal(false);
    loadData();
  };

  const handleToggleStatus = async (c: Course) => {
    const newStatus = c.status === 'active' ? 'inactive' : 'active';
    await dbService.saveCourse({ ...c, status: newStatus });
    loadData();
  };

  const filteredCourses = courses.filter(c =>
    c.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.course_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deptMap = new Map(departments.map(d => [d.id, d.department_code]));
  const progMap = new Map(programmes.map(p => [p.id, p.programme_code]));

  if (loading) {
    return <LoadingState message="Loading Academic Courses master list..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Courses Management</h1>
          <p className="text-xs text-gray-500 mt-1">Manage course codes, subject titles, semester allocations & programmes.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Course</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search course code or title..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border-gray-200 text-xs font-medium focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <span className="text-xs text-gray-500 font-semibold">{filteredCourses.length} Courses</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
            <tr>
              <th className="p-4">Course Code</th>
              <th className="p-4">Course Title</th>
              <th className="p-4">Department</th>
              <th className="p-4">Programme</th>
              <th className="p-4 text-center">Semester</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCourses.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <span className="px-2.5 py-1 bg-violet-50 text-violet-700 font-extrabold rounded-lg border border-violet-200">
                    {c.course_code}
                  </span>
                </td>
                <td className="p-4 font-bold text-gray-900 text-sm">{c.course_title}</td>
                <td className="p-4 text-gray-600 font-semibold">{deptMap.get(c.department_id) || 'Dept'}</td>
                <td className="p-4 text-gray-600 font-semibold">{progMap.get(c.programme_id) || 'Prog'}</td>
                <td className="p-4 text-center font-bold text-gray-800">Sem {c.semester}</td>
                <td className="p-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    c.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 text-gray-600 hover:text-brand-600 rounded-lg hover:bg-gray-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(c)}
                    className={`p-1.5 rounded-lg hover:bg-gray-100 ${
                      c.status === 'active' ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {c.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
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
              {editingCrs ? 'Edit Course' : 'Add Course'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Course Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="e.g. CS301"
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Data Structures & Algorithms"
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Department *</label>
                  <select
                    value={deptId}
                    onChange={e => setDeptId(e.target.value)}
                    className="w-full rounded-xl border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.department_code}</option>
                    ))}
                  </select>
                </div>

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

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
