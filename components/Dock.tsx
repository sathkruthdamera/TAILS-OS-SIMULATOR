
import React from 'react';
import { APPS_CONFIG } from '../constants';
import { AppDefinition } from '../types';

interface DockProps {
  onAppLaunch: (app: AppDefinition) => void;
}

const Dock: React.FC<DockProps> = ({ onAppLaunch }) => {
  return (
    <div className="fixed left-0 top-8 bottom-0 w-16 bg-slate-900/80 backdrop-blur-sm p-2 flex flex-col items-center space-y-3 shadow-lg select-none z-40">
      {APPS_CONFIG.map((app) => (
        <button
          key={app.id}
          title={app.name}
          onClick={() => onAppLaunch(app)}
          className="p-2 rounded-md hover:bg-slate-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span className="text-gray-200 w-8 h-8 flex items-center justify-center">{app.icon}</span>
        </button>
      ))}
    </div>
  );
};

export default Dock;
