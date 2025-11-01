import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { SunIcon, MoonIcon } from '../Icons';

const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-primary dark:text-gray-100 mb-6">Settings</h1>
      <div className="bg-surface dark:bg-[#424242] rounded-lg shadow-sm border border-divider dark:border-gray-700">
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {theme === 'light' ? (
                <SunIcon className="w-6 h-6 text-secondary dark:text-gray-400" />
            ) : (
                <MoonIcon className="w-6 h-6 text-secondary dark:text-gray-400" />
            )}
            <div>
              <h2 className="font-semibold text-primary dark:text-gray-100">Appearance</h2>
              <p className="text-sm text-secondary dark:text-gray-400">
                Customize how ConnectSphere looks. Currently in {theme === 'light' ? 'Light' : 'Dark'} Mode.
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors bg-gray-200 dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <span
              className={`${
                theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
              } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;