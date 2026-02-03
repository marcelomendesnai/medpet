
import React, { useState, useEffect } from 'react';
import { Medication, MedicationLog, ViewState } from './types';
import Navigation from './components/Navigation';
import TodayView from './components/TodayView';
import MedsView from './components/MedsView';
import HistoryView from './components/HistoryView';
import AssistantView from './components/AssistantView';
import { ShareIcon } from './components/Icons';

const SEED_MEDS: Medication[] = [
  { id: '1', subjectName: 'Sijugrino', name: 'GAVIZ 10MG', dosage: '1/2 comprimido', frequency: '24h', timeSlots: ['06:00'], obs1: 'em JEJUM', obs2: 'Dar 2ml de água dps', periodDays: 10, startDate: '2025-02-02', status: 'paused' },
  { id: '2', subjectName: 'Sijugrino', name: 'AGEMOXI 250MG', dosage: '1/2 comprimido', frequency: '12h', timeSlots: ['06:00', '18:00'], obs1: 'Alimentada', obs2: 'Dar 2ml de água dps', periodDays: 10, startDate: '2025-02-02', status: 'paused' },
  { id: '3', subjectName: 'Sijugrino', name: 'PREDSIM 3MG/ML', dosage: '1ml', frequency: '24h', timeSlots: ['06:00'], obs1: '', obs2: '', periodDays: 7, startDate: '2025-02-02', status: 'paused' },
  { id: '4', subjectName: 'Sijugrino', name: 'Mucomucil', dosage: '2 doses', frequency: '8h', timeSlots: ['08:00', '16:00', '00:00'], obs1: '', obs2: '', periodDays: 30, startDate: '2025-02-02', status: 'paused' },
  { id: '5', subjectName: 'Sijugrino', name: 'Promun Cat', dosage: '1ml', frequency: '24h', timeSlots: ['08:00'], obs1: '', obs2: '', periodDays: 30, startDate: '2025-02-02', status: 'paused' },
  { id: '6', subjectName: 'Lua', name: 'ACIDO URSODESOXICOLICO', dosage: '1 dose', frequency: '24h', timeSlots: ['08:00'], obs1: '', obs2: '', periodDays: 30, startDate: '2025-02-02', status: 'paused' },
  { id: '7', subjectName: 'Lua', name: 'SAME/SILIMAR/VIT.E', dosage: '1 dose', frequency: '24h', timeSlots: ['08:00'], obs1: '', obs2: '', periodDays: 30, startDate: '2025-02-02', status: 'paused' },
  { id: '8', subjectName: 'Lua', name: 'MACROGARD PASTA', dosage: '5cm', frequency: '24h', timeSlots: ['08:00'], obs1: '', obs2: 'Na boca ou pata', periodDays: 30, startDate: '2025-02-02', status: 'paused' }
];

const STORAGE_KEYS = {
  MEDS: 'cuidador_meds_v12',
  HISTORY: 'cuidador_history_v12',
  INITIALIZED: 'cuidador_init_v12'
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('today');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [history, setHistory] = useState<MedicationLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);

  useEffect(() => {
    try {
      const hasInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
      const savedMeds = localStorage.getItem(STORAGE_KEYS.MEDS);
      const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
      
      let initialMeds = SEED_MEDS;
      if (hasInit && savedMeds) {
        const parsed = JSON.parse(savedMeds);
        // Garante que todos os medicamentos tenham os campos novos
        initialMeds = parsed.map((m: any) => ({
          ...m,
          status: m.status || 'paused',
          startDate: m.startDate || new Date().toISOString().split('T')[0]
        }));
      }

      if (!hasInit || initialMeds.length === 0) {
        setMedications(SEED_MEDS);
        localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      } else {
        setMedications(initialMeds);
      }

      setHistory(savedHistory ? JSON.parse(savedHistory) : []);
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
      setMedications(SEED_MEDS);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.MEDS, JSON.stringify(medications));
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    }
  }, [medications, history, isLoaded]);

  const addMedication = (med: Medication) => setMedications(prev => [...prev, med]);
  const updateMedication = (updated: Medication) => setMedications(prev => prev.map(m => m.id === updated.id ? updated : m));
  const removeMedication = (id: string) => {
    if(confirm("Excluir este remédio?")) {
      setMedications(prev => prev.filter(m => m.id !== id));
    }
  };

  const logDose = (log: MedicationLog) => setHistory(prev => [log, ...prev]);

  const removeLog = (medicationId: string, timeSlot: string) => {
    const todayStr = new Date().toDateString();
    setHistory(prev => prev.filter(log => {
      const logDateStr = new Date(log.timestamp).toDateString();
      return !(log.medicationId === medicationId && log.timeSlot === timeSlot && logDateStr === todayStr);
    }));
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: 'App Cuidador', url }); } 
      catch (err) { copyToClipboard(url); }
    } else { copyToClipboard(url); }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopyTooltip(true);
    setTimeout(() => setShowCopyTooltip(false), 2000);
  };

  if (!isLoaded) return <div className="h-screen w-full flex items-center justify-center text-rose-500 font-black">CARREGANDO...</div>;

  return (
    <div className="app-container max-w-md mx-auto bg-white overflow-hidden relative border-x border-slate-100 shadow-2xl">
      <header className="bg-white/90 backdrop-blur-md px-4 pt-10 pb-2 flex justify-between items-center sticky top-0 z-30 border-b border-slate-50">
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-rose-600 tracking-tighter leading-none">CUIDADOR</h1>
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Gestão de Saúde</p>
        </div>
        
        <div className="flex items-center gap-1">
           <button onClick={handleShare} className="p-2 text-slate-400 relative active:scale-90 transition-transform">
             <ShareIcon />
             {showCopyTooltip && <span className="absolute -bottom-8 right-0 bg-black text-white text-[8px] px-2 py-1 rounded shadow-xl">Link Copiado!</span>}
           </button>
           <div 
             className="w-9 h-9 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-100 cursor-pointer active:scale-90 transition-transform" 
             onClick={() => setCurrentView('today')}
           >
            <span className="text-white text-sm">♥</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        {currentView === 'today' && <TodayView medications={medications} logDose={logDose} removeLog={removeLog} history={history} />}
        {currentView === 'meds' && <MedsView medications={medications} addMedication={addMedication} updateMedication={updateMedication} removeMedication={removeMedication} history={history} />}
        {currentView === 'history' && <HistoryView history={history} />}
        {currentView === 'assistant' && <AssistantView medications={medications} />}
      </main>

      <Navigation currentView={currentView} setView={setCurrentView} />
    </div>
  );
};

export default App;
