import React, { useState, useEffect } from 'react';
import { Plus, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { dbService } from '../services/dbService';
import { Programme, Department } from '../types';
import { LoadingState } from '../components/common/LoadingState';

export const Programmes: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingProg, setEditingProg] = useState<Partial<Programme> | null>(null);

  const [code, setCode] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [deptId, setDeptId] = useState<string>('');
  const [semestersCount, setSemestersCount] = useState<number>(8);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const loadData = async () => {
    setLoading(true);
    try {
      const [pData, dData] = await Promise.all([
        dbService.getProgrammes(),
        dbService.getDepartments()
      ]);
      setProgrammes(pData);
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
    setEditingProg(null);
    setCode('');
    setName('');
    if (departments.length > 0) setDeptId(departments[0].id);
    setSemestersCount(8);
    setStatus('active');
    setShowModal(true);
  };

  const handleOpenEdit = (p: Programme) => {
    setEditingProg(p);
    setCode(p.programme_code);
    setName(p.programme_name);
    setDeptId(p.department_id);
    setSemestersCount(p.semesters_count);
    setStatus(p.status);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await dbService.saveProgramme({
      id: editingProg?.id,
      programme_code: code,
      programme_name: name,
      department_id: deptId,
      semesters_count: Number(semestersCount),
      status: status
    });
    setShowModal(false);
    loadData();
  };

  const handleToggleStatus = async (p: Programme) => {
    const newStatus = p.status === 'active' ? 'inactive' : 'active';
    await dbService.saveProgramme({ ...p, status: newStatus });
    loadData();
  };

  const deptMap = new Map(departments.map(d => [d.id, d.department_name]));

  if (loading) {
    return <LoadingState message="Loading Programmes master list..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Programmes Management</h1>
          <p className="text-xs text-gray-500 mt-1">Configure degree programmes, department affiliations & semester counts.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Programme</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
            <tr>
              <th className="p-4">Prog Code</th>
              <th className="p-4">Programme Name</th>
              <th className="p-4">Department</th>
              <th className="p-4 text-center">Semesters</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {programmes.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-extrabold rounded-lg border border-indigo-200">
                    {p.programme_code}
                  </span>
                </td>
                <td className="p-4 font-bold text-gray-900 text-sm">{p.programme_name}</td>
                <td className="p-4 text-gray-600 font-medium">{deptMap.get(p.department_id) || 'Department'}</td>
                <td className="p-4 text-center font-bold text-gray-800">{p.semesters_count} Semesters</td>
                <td className="p-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 text-gray-600 hover:text-brand-600 rounded-lg hover:bg-gray-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(p)}
                    className={`p-1.5 rounded-lg hover:bg-gray-100 ${
                      p.status === 'active' ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {p.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
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
              {editingProg ? 'Edit Programme' : 'Add Programme'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Programme Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="e.g. BE-CSE"
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Programme Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Bachelor of Engineering - Computer Science"
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
                <label className="block text-xs font-bold text-gray-700 mb-1">Total Semesters *</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={semestersCount}
                  onChange={e => setSemestersCount(Number(e.target.value))}
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
                  Save Programme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
