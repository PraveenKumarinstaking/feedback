import React, { useState, useEffect } from 'react';
import { Plus, Edit2, CheckCircle2, XCircle, FileSpreadsheet } from 'lucide-react';
import { dbService } from '../services/dbService';
import { Department } from '../types';
import { LoadingState } from '../components/common/LoadingState';
import { ExcelImporterModal } from '../components/common/ExcelImporterModal';

export const Departments: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showImporter, setShowImporter] = useState<boolean>(false);
  const [editingDept, setEditingDept] = useState<Partial<Department> | null>(null);

  const [code, setCode] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await dbService.getDepartments();
      setDepartments(data);
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
    setEditingDept(null);
    setCode('');
    setName('');
    setStatus('active');
    setShowModal(true);
  };

  const handleOpenEdit = (d: Department) => {
    setEditingDept(d);
    setCode(d.department_code);
    setName(d.department_name);
    setStatus(d.status);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await dbService.saveDepartment({
      id: editingDept?.id,
      department_code: code,
      department_name: name,
      status: status
    });
    setShowModal(false);
    loadData();
  };

  const handleToggleStatus = async (d: Department) => {
    const newStatus = d.status === 'active' ? 'inactive' : 'active';
    await dbService.saveDepartment({ ...d, status: newStatus });
    loadData();
  };

  if (loading) {
    return <LoadingState message="Loading Departments master list..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Departments Management</h1>
          <p className="text-xs text-gray-500 mt-1">Manage academic departments, department codes & active statuses.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImporter(true)}
            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import Excel</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
        </div>
      </div>

      <ExcelImporterModal
        isOpen={showImporter}
        onClose={() => setShowImporter(false)}
        defaultTarget="departments"
        onSuccess={loadData}
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
            <tr>
              <th className="p-4">Dept Code</th>
              <th className="p-4">Department Name</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {departments.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <span className="px-2.5 py-1 bg-brand-50 text-brand-700 font-extrabold rounded-lg border border-brand-200">
                    {d.department_code}
                  </span>
                </td>
                <td className="p-4 font-bold text-gray-900 text-sm">{d.department_name}</td>
                <td className="p-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    d.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {d.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => handleOpenEdit(d)}
                    className="p-1.5 text-gray-600 hover:text-brand-600 rounded-lg hover:bg-gray-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(d)}
                    className={`p-1.5 rounded-lg hover:bg-gray-100 ${
                      d.status === 'active' ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {d.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
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
              {editingDept ? 'Edit Department' : 'Add Department'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Department Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="e.g. CSE"
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Department Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold focus:ring-brand-500 focus:border-brand-500"
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
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
