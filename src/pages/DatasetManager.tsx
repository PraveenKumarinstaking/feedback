import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertCircle,
  Save,
  Layers,
  Table as TableIcon
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { dbService } from '../services/dbService';
import { DatasetTargetKey } from '../types';
import { LoadingState } from '../components/common/LoadingState';
import { ExcelImporterModal } from '../components/common/ExcelImporterModal';

export const DatasetManager: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<DatasetTargetKey>('implementation_plan');
  const [datasetRows, setDatasetRows] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Importer Modal State
  const [showImporter, setShowImporter] = useState<boolean>(false);

  // New Row Form State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newRowData, setNewRowData] = useState<Record<string, string>>({});

  // Toast notification
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const tabs: { key: DatasetTargetKey; label: string; count?: number }[] = [
    { key: 'implementation_plan', label: 'Implementation Plan' },
    { key: 'database_schema', label: 'Database Schema' },
    { key: 'questions', label: 'Evaluation Questions (Q1-Q15)' },
    { key: 'grading_standards', label: 'Grading & IQAC Standards' },
    { key: 'academic_years', label: 'Academic Years' },
    { key: 'departments', label: 'Departments' },
    { key: 'programmes', label: 'Programmes' },
    { key: 'faculty', label: 'Faculty Members' },
    { key: 'courses', label: 'Courses' },
    { key: 'mappings', label: 'Faculty-Course Mappings' }
  ];

  const loadDataset = async () => {
    setLoading(true);
    try {
      let data: any[] = [];
      switch (activeTab) {
        case 'implementation_plan':
          data = await dbService.getImplementationPlan();
          break;
        case 'database_schema':
          data = await dbService.getDatabaseSchemaRows();
          break;
        case 'questions':
          data = await dbService.getQuestions();
          break;
        case 'grading_standards':
          data = await dbService.getGradingStandards();
          break;
        case 'academic_years':
          data = await dbService.getAcademicYears();
          break;
        case 'departments':
          data = await dbService.getDepartments();
          break;
        case 'programmes':
          data = await dbService.getProgrammes();
          break;
        case 'faculty':
          data = await dbService.getFaculty();
          break;
        case 'courses':
          data = await dbService.getCourses();
          break;
        case 'mappings':
          data = await dbService.getMappings();
          break;
      }
      setDatasetRows(data);
    } catch (e) {
      console.error('Failed to load dataset:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataset();
  }, [activeTab]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleResetDataformPresets = async () => {
    if (window.confirm('Are you sure you want to reset and reload all default data from dataform.xlsx? Custom changes will be overwritten.')) {
      setLoading(true);
      await dbService.resetToDataformDataset();
      await loadDataset();
      showNotification('success', 'Reset successfully to default dataform.xlsx datasets!');
    }
  };

  const handleInsertRow = async (e: React.FormEvent) => {
    e.preventDefault();
    const rowToInsert = {
      id: newRowData.id || `rec-${Date.now()}`,
      ...newRowData,
      status: newRowData.status || 'active'
    };

    const updated = [rowToInsert, ...datasetRows];
    await dbService.bulkInsert(activeTab, updated, true);
    setDatasetRows(updated);
    setShowAddModal(false);
    setNewRowData({});
    showNotification('success', 'New dataset row inserted successfully!');
  };

  const handleDeleteRow = async (id: string) => {
    if (window.confirm('Delete this row from the dataset?')) {
      const updated = datasetRows.filter(r => r.id !== id);
      await dbService.bulkInsert(activeTab, updated, true);
      setDatasetRows(updated);
      showNotification('success', 'Row deleted from dataset.');
    }
  };

  const handleExportExcel = () => {
    if (datasetRows.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(datasetRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeTab);
    XLSX.writeFile(workbook, `edu_feedback_${activeTab}_dataset.xlsx`);
    showNotification('success', `Exported ${activeTab} dataset to Excel!`);
  };

  const filteredRows = datasetRows.filter(row => {
    if (!searchTerm) return true;
    return Object.values(row).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getHeaders = () => {
    if (datasetRows.length === 0) return [];
    return Object.keys(datasetRows[0]);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel Dataset Controller</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Dataset & Master Data Management</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Insert, modify, edit, or import datasets directly from <strong className="text-white font-mono">dataform.xlsx</strong> or custom Excel files.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowImporter(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Import Excel</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handleResetDataformPresets}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-200 text-xs font-bold rounded-xl border border-rose-800 transition-all"
            title="Reset dataset to default dataform.xlsx values"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reload dataform.xlsx Presets</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm flex items-center gap-1 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab.replace('_', ' ')}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs font-medium pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs font-bold text-slate-500">
              Total Rows: {datasetRows.length}
            </span>
            <button
              onClick={() => {
                setNewRowData({});
                setShowAddModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Insert Data Row</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        {loading ? (
          <LoadingState message="Loading dataset..." />
        ) : filteredRows.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Layers className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold">No dataset records found</p>
            <p className="text-xs text-slate-400 mt-1">
              Click "Insert Data Row" or "Import Excel" to add records to this dataset.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-center w-12">#</th>
                  {getHeaders().map((header, idx) => (
                    <th key={idx} className="px-4 py-3 whitespace-nowrap">
                      {header.replace(/_/g, ' ')}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredRows.map((row, rIdx) => (
                  <tr key={row.id || rIdx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 text-center text-slate-400 font-mono">
                      {rIdx + 1}
                    </td>
                    {getHeaders().map((header, cIdx) => (
                      <td key={cIdx} className="px-4 py-3 text-slate-700">
                        {typeof row[header] === 'boolean' ? (
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              row[header]
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {row[header] ? 'TRUE' : 'FALSE'}
                          </span>
                        ) : (
                          <span className="line-clamp-2 max-w-md" title={String(row[header] ?? '')}>
                            {String(row[header] ?? '')}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteRow(row.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Insert Data Row Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Insert Row into {activeTab.replace(/_/g, ' ')}</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleInsertRow} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {getHeaders().map((header, idx) => (
                <div key={idx}>
                  <label className="block text-xs font-bold text-slate-700 capitalize mb-1">
                    {header.replace(/_/g, ' ')}
                  </label>
                  <input
                    type="text"
                    required={header === 'id' || header.includes('code') || header.includes('name')}
                    value={newRowData[header] || ''}
                    onChange={(e) => setNewRowData({ ...newRowData, [header]: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder={`Enter ${header.replace(/_/g, ' ')}...`}
                  />
                </div>
              ))}
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm"
                >
                  Insert Row
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel Importer Modal */}
      <ExcelImporterModal
        isOpen={showImporter}
        onClose={() => setShowImporter(false)}
        defaultTarget={activeTab}
        onSuccess={() => {
          loadDataset();
          showNotification('success', 'Dataset imported and updated successfully!');
        }}
      />
    </div>
  );
};
