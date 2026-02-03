
import React from 'react';
import { MedicationLog } from '../types';

interface HistoryViewProps {
  history: MedicationLog[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ history }) => {
  return (
    <div className="animate-in slide-in-from-right duration-300 px-2 pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Histórico</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Registros de Saúde</p>
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-16 text-center shadow-sm border border-slate-100">
          <p className="text-slate-300 font-black text-xs uppercase tracking-widest">Nenhum registro ainda.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {history.map((log) => {
            const date = new Date(log.timestamp);
            const isSkipped = log.status === 'skipped';
            const isLua = log.subjectName === 'Lua';
            
            return (
              <div key={log.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full mt-2 ring-4 ${isSkipped ? 'bg-slate-300 ring-slate-50' : 'bg-emerald-500 ring-emerald-50'}`}></div>
                  <div className="w-0.5 flex-1 bg-slate-200 my-1"></div>
                </div>
                <div className="flex-1 pb-4">
                  <div className={`bg-white p-5 rounded-[2rem] shadow-sm border transition-all ${isSkipped ? 'border-slate-100 opacity-70' : 'border-white shadow-slate-200/50'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className={`text-[8px] font-black uppercase tracking-widest mb-1 px-2 py-0.5 rounded-md inline-block ${
                          isLua ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {log.subjectName}
                        </div>
                        <h4 className="font-black text-slate-800 text-base leading-none">{log.medicationName}</h4>
                      </div>
                      <span className="text-[10px] text-slate-400 font-black">
                        {log.timeSlot}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-end mt-4">
                      <div className="flex flex-col">
                         <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                         </span>
                         <span className="text-[10px] text-slate-300 italic">
                          Registrado às {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border ${
                        isSkipped 
                          ? 'bg-slate-50 border-slate-100 text-slate-500' 
                          : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isSkipped ? 'bg-slate-400' : 'bg-emerald-500'}`}></div>
                        <span className="text-[9px] font-black uppercase tracking-wider">
                          {isSkipped ? 'DOSE PULADA' : 'TOMADO'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
