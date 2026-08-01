import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { dbService } from '../../services/dbService';
import { DatasetTargetKey } from '../../types';

interface ExcelImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTarget?: DatasetTargetKey;
  onSuccess?: () => void;
}

export const ExcelImporterModal: React.FC<ExcelImporterModalProps> = ({
  isOpen,
  onClose,
  defaultTarget = 'departments',
  onSuccess
}) => {
  const [targetKey, setTargetKey] = useState<DatasetTargetKey>(defaultTarget);
  const [mode, setMode] = useState<'append' | 'overwrite'>('append');
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setMessage(null);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Parse JSON rows
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
        
        if (jsonData.length === 0) {
          setMessage({ type: 'error', text: 'The selected Excel file is empty.' });
          setParsedRows([]);
          setHeaders([]);
        } else {
          setHeaders(Object.keys(jsonData[0]));
          setParsedRows(jsonData);
          setMessage({
            type: 'success',
            text: `Successfully parsed ${jsonData.length} row(s) from sheet "${sheetName}".`
          });
        }
      } catch (err: any) {
        setMessage({ type: 'error', text: `Failed to read Excel file: ${err.message}` });
      } finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(uploadedFile);
  };

  const handleCommitImport = async () => {
    if (parsedRows.length === 0) {
      setMessage({ type: 'error', text: 'No rows available to insert.' });
      return;
    }

    setLoading(true);
    try {
      // Map parsed rows with IDs if missing
      const processed = parsedRows.map((row, idx) => ({
        id: row.id || `imp-${Date.now()}-${idx}`,
        ...row,
        status: row.status || 'active'
      }));

      const count = await dbService.bulkInsert(targetKey, processed, mode === 'overwrite');
      setMessage({
        type: 'success',
        text: `Successfully inserted ${count} record(s) into ${targetKey.replace('_', ' ')}!`
      });

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (e: any) {
      setMessage({ type: 'error', text: `Error inserting data: ${e.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Bulk Excel Dataset Importer</h3>
              <p className="text-xs text-slate-400">Import & insert dataset rows directly into master data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Target Dataset Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Master Dataset</label>
              <select
                value={targetKey}
                onChange={(e) => setTargetKey(e.target.value as DatasetTargetKey)}
                className="w-full text-sm font-medium border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="academic_years">Academic Years</option>
                <option value="departments">Departments</option>
                <option value="programmes">Programmes</option>
                <option value="faculty">Faculty Members</option>
                <option value="courses">Courses</option>
                <option value="mappings">Faculty-Course Mappings</option>
                <option value="questions">Evaluation Questions (Q1-Q15)</option>
                <option value="implementation_plan">Implementation Plan</option>
                <option value="database_schema">Database Schema</option>
                <option value="grading_standards">Grading Standards</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Import Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as 'append' | 'overwrite')}
                className="w-full text-sm font-medium border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="append">Append (Insert new rows to existing dataset)</option>
                <option value="overwrite">Overwrite (Replace whole dataset with Excel file)</option>
              </select>
            </div>
          </div>

          {/* File Upload Drop Zone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Upload Excel Spreadsheet (.xlsx, .xls, .csv)</label>
            <label className="border-2 border-dashed border-slate-300 hover:border-brand-500 bg-slate-50 hover:bg-brand-50/40 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all">
              <Upload className="w-8 h-8 text-brand-600 mb-2 animate-bounce" />
              <span className="text-sm font-bold text-slate-700">
                {file ? file.name : 'Click to select or drag & drop Excel file'}
              </span>
              <span className="text-xs text-slate-500 mt-1">Supports dataform.xlsx or custom spreadsheets</span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Status Message */}
          {message && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 text-xs font-medium ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Parsed Rows Preview */}
          {parsedRows.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Parsed Preview ({parsedRows.length} Rows)
                </span>
                <span className="text-[11px] text-slate-500">First 5 rows displayed</span>
              </div>
              <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-48 scrollbar-thin">
                <table className="min-w-full text-xs text-left">
                  <thead className="bg-slate-100 font-semibold text-slate-700 border-b border-slate-200">
                    <tr>
                      {headers.map((h, i) => (
                        <th key={i} className="px-3 py-2 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.slice(0, 5).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50">
                        {headers.map((h, cIdx) => (
                          <td key={cIdx} className="px-3 py-2 whitespace-nowrap text-slate-600">
                            {String(row[h] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCommitImport}
            disabled={loading || parsedRows.length === 0}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-lg shadow-sm transition-all"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Inserting Data...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Insert Dataset Records ({parsedRows.length})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
