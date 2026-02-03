
import React from 'react';
import { ViewState } from '../types';
import { 
  CalendarIcon, 
  BeakerIcon, 
  ClockIcon, 
  SparklesIcon 
} from './Icons';

interface NavigationProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const tabs = [
    { id: 'today', label: 'Hoje', icon: <CalendarIcon /> },
    { id: 'meds', label: 'Remédios', icon: <BeakerIcon /> },
    { id: 'history', label: 'Histórico', icon: <ClockIcon /> },
    { id: 'assistant', label: 'Ajuda', icon: <SparklesIcon /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-area-bottom flex justify-around items-center max-w-md mx-auto z-20">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setView(tab.id as ViewState)}
          className={`flex flex-col items-center py-3 px-2 w-full transition-colors ${
            currentView === tab.id ? 'text-rose-600' : 'text-slate-400'
          }`}
        >
          <div className={`${currentView === tab.id ? 'scale-110' : ''} transition-transform`}>
            {tab.icon}
          </div>
          <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
          {currentView === tab.id && (
            <div className="w-1 h-1 bg-rose-600 rounded-full mt-1"></div>
          )}
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
