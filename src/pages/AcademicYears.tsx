import React, { useState, useEffect } from 'react';
import { Plus, Edit2, CheckCircle2, XCircle, Star, FileSpreadsheet } from 'lucide-react';
import { dbService } from '../services/dbService';
import { AcademicYear } from '../types';
import { LoadingState } from '../components/common/LoadingState';
import { ExcelImporterModal } from '../components/common/ExcelImporterModal';

export const AcademicYears: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showImporter, setShowImporter] = useState<boolean>(false);
  const [editingYear, setEditingYear] = useState<Partial<AcademicYear> | null>(null);

  const [yearName, setYearName] = useState<string>('');
  const [isCurrent, setIsCurrent] = useState<boolean>(false);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const loadYears = async () => {
    setLoading(true);
    try {
      const data = await dbService.getAcademicYears();
      setYears(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadYears();
  }, []);

  const handleOpenAdd = () => {
    setEditingYear(null);
    setYearName('');
    setIsCurrent(false);
    setStatus('active');
    setShowModal(true);
  };

  const handleOpenEdit = (y: AcademicYear) => {
    setEditingYear(y);
    setYearName(y.year_name);
    setIsCurrent(y.is_current);
    setStatus(y.status);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await dbService.saveAcademicYear({
      id: editingYear?.id,
      year_name: yearName,
      is_current: isCurrent,
      status: status
    });
    setShowModal(false);
    loadYears();
  };

  const handleToggleCurrent = async (y: AcademicYear) => {
    await dbService.saveAcademicYear({ ...y, is_current: true });
    loadYears();
  };

  const handleToggleStatus = async (y: AcademicYear) => {
    const newStatus = y.status === 'active' ? 'inactive' : 'active';
    await dbService.saveAcademicYear({ ...y, status: newStatus });
    loadYears();
  };

  if (loading) {
    return <LoadingState message="Loading Academic Years master list..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Academic Years Management</h1>
          <p className="text-xs text-gray-500 mt-1">Configure academic year sessions and mark current evaluation period.</p>
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
            <span>Add Academic Year</span>
          </button>
        </div>
      </div>

      <ExcelImporterModal
        isOpen={showImporter}
        onClose={() => setShowImporter(false)}
        defaultTarget="academic_years"
        onSuccess={loadYears}
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
            <tr>
              <th className="p-4">Academic Year</th>
              <th className="p-4 text-center">Current Year Flag</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {years.map((y) => (
              <tr key={y.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold text-gray-900 text-sm">{y.year_name}</td>
                <td className="p-4 text-center">
                  {y.is_current ? (
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full inline-flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Current Year
                    </span>
                  ) : (
                    <button
                      onClick={() => handleToggleCurrent(y)}
                      className="px-2 py-1 bg-gray-100 hover:bg-amber-50 hover:text-amber-700 text-gray-500 rounded text-xs font-semibold"
                    >
                      Set as Current
                    </button>
                  )}
                </td>
                <td className="p-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    y.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {y.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => handleOpenEdit(y)}
                    className="p-1.5 text-gray-600 hover:text-brand-600 rounded-lg hover:bg-gray-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(y)}
                    className={`p-1.5 rounded-lg hover:bg-gray-100 ${
                      y.status === 'active' ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {y.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
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
              {editingYear ? 'Edit Academic Year' : 'Add Academic Year'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Academic Year Name *</label>
                <input
                  type="text"
                  required
                  value={yearName}
                  onChange={e => setYearName(e.target.value)}
                  placeholder="e.g. 2026–2027"
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCurrentCheck"
                  checked={isCurrent}
                  onChange={e => setIsCurrent(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600"
                />
                <label htmlFor="isCurrentCheck" className="text-xs font-semibold text-gray-700">Set as Current Active Year</label>
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
                  Save Academic Year
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
