import React, { createContext, useContext, useState, useEffect } from 'react';
import { InstitutionSettings } from '../types';
import { dbService } from '../services/dbService';
import { INITIAL_SETTINGS } from '../lib/mockData';

interface SettingsContextType {
  settings: InstitutionSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<InstitutionSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<InstitutionSettings>(INITIAL_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshSettings = async () => {
    try {
      const data = await dbService.getSettings();
      setSettings(data);
    } catch (e) {
      console.error('Failed to load settings:', e);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<InstitutionSettings>) => {
    const updated = await dbService.updateSettings(newSettings);
    setSettings(updated);
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
