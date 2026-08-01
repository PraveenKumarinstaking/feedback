import React, { useState, useEffect } from 'react';
import { Plus, Edit2, CheckCircle2, XCircle, Search, FileSpreadsheet, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { Faculty, Department } from '../types';
import { LoadingState } from '../components/common/LoadingState';
import { ExcelImporterModal } from '../components/common/ExcelImporterModal';

export const FacultyPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showImporter, setShowImporter] = useState<boolean>(false);
  const [editingFac, setEditingFac] = useState<Partial<Faculty> | null>(null);

  const [code, setCode] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [deptId, setDeptId] = useState<string>('');
  const [designation, setDesignation] = useState<string>('Assistant Professor');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const loadData = async () => {
    setLoading(true);
    try {
      const [fData, dData] = await Promise.all([
        dbService.getFaculty(),
        dbService.getDepartments()
      ]);
      setFacultyList(fData);
      setDepartments(dData);
      if (dData.length > 0) setDeptId(dData[0].id);
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
    setEditingFac(null);
    setCode(`FAC-CS-${100 + facultyList.length + 1}`);
    setName('');
    setEmail('');
    if (departments.length > 0) setDeptId(departments[0].id);
    setDesignation('Assistant Professor');
    setStatus('active');
    setShowModal(true);
  };

  const handleOpenEdit = (f: Faculty) => {
    setEditingFac(f);
    setCode(f.faculty_code);
    setName(f.faculty_name);
    setEmail(f.email);
    setDeptId(f.department_id);
    setDesignation(f.designation);
    setStatus(f.status);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await dbService.saveFaculty({
      id: editingFac?.id,
      faculty_code: code,
      faculty_name: name,
      email: email,
      department_id: deptId,
      designation: designation,
      status: status
    });
    setShowModal(false);
    loadData();
  };

  const handleToggleStatus = async (f: Faculty) => {
    const newStatus = f.status === 'active' ? 'inactive' : 'active';
    await dbService.saveFaculty({ ...f, status: newStatus });
    loadData();
  };

  const filteredFaculty = facultyList.filter(f =>
    f.faculty_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.faculty_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deptMap = new Map(departments.map(d => [d.id, d.department_name]));

  if (loading) {
    return <LoadingState message="Loading Faculty master list..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Faculty Management</h1>
          <p className="text-xs text-gray-500 mt-1">Manage teaching staff directory, designations & department links.</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/feed-data"
            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 flex items-center gap-1.5 transition-colors"
          >
            <UploadCloud className="w-4 h-4" /> Bulk Data Feed
          </Link>
          <button
            onClick={() => setShowImporter(true)}
            className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" /> Import Excel
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Faculty Member
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search faculty by name, code or email..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border-gray-200 text-xs font-medium focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <span className="text-xs text-gray-500 font-semibold">{filteredFaculty.length} Faculty Members</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
            <tr>
              <th className="p-4">Faculty ID</th>
              <th className="p-4">Faculty Name</th>
              <th className="p-4">Designation</th>
              <th className="p-4">Department</th>
              <th className="p-4">Email</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredFaculty.map((f) => (
              <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-800 font-extrabold rounded-lg">
                    {f.faculty_code}
                  </span>
                </td>
                <td className="p-4 font-bold text-gray-900 text-sm">{f.faculty_name}</td>
                <td className="p-4 text-gray-700 font-semibold">{f.designation}</td>
                <td className="p-4 text-gray-600">{deptMap.get(f.department_id) || 'Department'}</td>
                <td className="p-4 text-gray-500">{f.email}</td>
                <td className="p-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    f.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {f.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => handleOpenEdit(f)}
                    className="p-1.5 text-gray-600 hover:text-brand-600 rounded-lg hover:bg-gray-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(f)}
                    className={`p-1.5 rounded-lg hover:bg-gray-100 ${
                      f.status === 'active' ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {f.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
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
              {editingFac ? 'Edit Faculty Member' : 'Add Faculty Member'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Faculty ID Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Dr. S. Rajesh"
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Official Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="rajesh.s@niet.edu"
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Department *</label>
                <select
                  value={deptId}
                  onChange={e => setDeptId(e.target.value)}
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.department_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Academic Designation *</label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={e => setDesignation(e.target.value)}
                  placeholder="e.g. Professor & HOD"
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold"
                />
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
                  Save Faculty Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ExcelImporterModal
        isOpen={showImporter}
        onClose={() => setShowImporter(false)}
        defaultTarget="faculty"
        onSuccess={loadData}
      />
    </div>
  );
};

