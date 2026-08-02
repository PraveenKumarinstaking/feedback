import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, ShieldCheck, Lock, Unlock, EyeOff } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { LoadingState } from '../components/common/LoadingState';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, loading } = useSettings();
  const [formData, setFormData] = useState(settings);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuickToggle = async (field: keyof typeof formData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    setSaving(true);
    setSavedSuccess(false);

    try {
      await updateSettings({ [field]: value });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await updateSettings(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading institutional & feedback settings..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Institutional & Feedback Settings</h1>
          <p className="text-xs text-gray-500 mt-1">Configure college branding, report signatures & feedback collection status.</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold rounded-xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Institution settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quick Toggles: Feedback Form Status & Anonymous Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`p-5 rounded-2xl border transition-all ${
            formData.feedback_form_open ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Feedback Form Access</span>
                <h3 className="text-base font-extrabold text-gray-900 mt-0.5">
                  {formData.feedback_form_open ? 'Collection Open' : 'Collection Closed'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => handleQuickToggle('feedback_form_open', !formData.feedback_form_open)}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl shadow-sm transition-all flex items-center gap-1.5 ${
                  formData.feedback_form_open
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {formData.feedback_form_open ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                <span>{formData.feedback_form_open ? 'Close Feedback Form' : 'Open Feedback Form'}</span>
              </button>
            </div>
          </div>

          <div className="p-5 bg-brand-50/60 border border-brand-200 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Privacy & Anonymity</span>
                <h3 className="text-base font-extrabold text-gray-900 mt-0.5">
                  {formData.anonymous_mode ? 'Anonymous Mode Active' : 'Identified Mode'}
                </h3>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.anonymous_mode}
                  onChange={e => handleQuickToggle('anonymous_mode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Institution Details */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Institution Profile & Branding</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Institution Full Name *</label>
              <input
                type="text"
                required
                value={formData.institution_name}
                onChange={e => handleChange('institution_name', e.target.value)}
                className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Short Name / Abbreviation *</label>
              <input
                type="text"
                required
                value={formData.institution_short_name}
                onChange={e => handleChange('institution_short_name', e.target.value)}
                className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Institution Logo URL</label>
            <input
              type="text"
              value={formData.institution_logo}
              onChange={e => handleChange('institution_logo', e.target.value)}
              className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Campus Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => handleChange('address', e.target.value)}
              className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-xs font-semibold"
            />
          </div>
        </div>

        {/* IQAC Report Signatures & Formatting */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">IQAC Printable Report Configuration</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Report Header Title</label>
              <input
                type="text"
                value={formData.report_header}
                onChange={e => handleChange('report_header', e.target.value)}
                className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Report Confidential Footer</label>
              <input
                type="text"
                value={formData.report_footer}
                onChange={e => handleChange('report_footer', e.target.value)}
                className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">IQAC Coordinator Name & Designation</label>
              <input
                type="text"
                value={formData.iqac_coordinator_name}
                onChange={e => handleChange('iqac_coordinator_name', e.target.value)}
                className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Principal / Head of Institution Name</label>
              <input
                type="text"
                value={formData.principal_name}
                onChange={e => handleChange('principal_name', e.target.value)}
                className="w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-xs font-semibold"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-brand-500/20 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Institution Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
