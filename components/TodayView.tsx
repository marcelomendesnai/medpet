
import React, { useState, useMemo } from 'react';
import { Medication, MedicationLog } from '../types';

interface TodayViewProps {
  medications: Medication[];
  logDose: (log: MedicationLog) => void;
  removeLog: (medicationId: string, timeSlot: string) => void;
  history: MedicationLog[];
}

const TodayView: React.FC<TodayViewProps> = ({ medications, logDose, removeLog, history }) => {
  const todayStr = new Date().toDateString();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const now = new Date();
  const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const getDoseLog = (medId: string, slotTime: string) => 
    history.find(log => new Date(log.timestamp).toDateString() === todayStr && log.medicationId === medId && log.timeSlot === slotTime);

  const getTreatmentProgress = (medId: string, totalDays: number, frequency: string) => {
    const freqInt = parseInt(frequency.replace('h', '')) || 24;
    const totalDoses = (totalDays || 1) * (24 / freqInt);
    const taken = history.filter(log => log.medicationId === medId && log.status === 'taken').length;
    return { taken, total: Math.max(1, Math.round(totalDoses)) };
  };

  const allDoses = useMemo(() => {
    // Garante que tratamos medicamentos antigos sem o campo status como 'paused' para evitar erros
    const activeMeds = medications.filter(m => (m.status || 'paused') === 'active');
    const doses = activeMeds.flatMap(med => (med.timeSlots || []).map(slot => ({ ...med, slotTime: slot })));
    const sortFn = (a: any, b: any) => a.slotTime.localeCompare(b.slotTime);
    
    return {
      late: doses.filter(d => !getDoseLog(d.id, d.slotTime) && d.slotTime < currentTimeStr).sort(sortFn),
      next: doses.filter(d => !getDoseLog(d.id, d.slotTime) && d.slotTime >= currentTimeStr).sort(sortFn),
      taken: doses.filter(d => !!getDoseLog(d.id, d.slotTime)).sort(sortFn)
    };
  }, [medications, history, currentTimeStr]);

  const handleAction = (med: any, status: 'taken' | 'skipped') => {
    logDose({
      id: Math.random().toString(36).substr(2, 9),
      medicationId: med.id,
      medicationName: med.name,
      subjectName: med.subjectName,
      timestamp: Date.now(),
      timeSlot: med.slotTime,
      status
    });
    setConfirmingId(null);
  };

  // Fixed TypeScript error by using React.FC to correctly handle intrinsic props like 'key' in sub-components
  const MedCard: React.FC<{ item: any, type: 'late' | 'next' | 'taken' }> = ({ item, type }) => {
    const log = getDoseLog(item.id, item.slotTime);
    const progress = getTreatmentProgress(item.id, item.periodDays, item.frequency);
    const isConfirming = confirmingId === `${item.id}-${item.slotTime}`;

    return (
      <div className={`p-4 rounded-[1.5rem] border mb-3 transition-all ${
        type === 'late' ? 'bg-rose-50 border-rose-100' : 
        type === 'taken' ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100 shadow-sm'
      }`}>
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-2 items-center">
            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase text-white ${
              item.subjectName === 'Lua' ? 'bg-indigo-500' : 'bg-amber-500'
            }`}>
              {item.subjectName}
            </span>
            <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{item.slotTime}</span>
          </div>
          <span className="text-[9px] font-bold text-slate-400">Dose {progress.taken}/{progress.total}</span>
        </div>

        <h3 className="text-base font-black text-slate-800 leading-tight">{item.name}</h3>
        <p className="text-[10px] font-bold text-slate-500 mb-3">{item.dosage} • {item.obs1 || 'S/ observ.'}</p>

        {type !== 'taken' ? (
          <div className="flex gap-2">
            <button 
              onClick={() => handleAction(item, 'taken')}
              className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase text-white shadow-lg active:scale-95 ${
                type === 'late' ? 'bg-rose-600 shadow-rose-100' : 'bg-slate-900 shadow-slate-200'
              }`}
            >
              Marcar Tomado
            </button>
            <button 
              onClick={() => handleAction(item, 'skipped')}
              className="px-4 py-3 rounded-xl border border-slate-200 text-slate-400 font-black text-[9px] uppercase active:bg-slate-50"
            >
              Pular
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className={`text-[9px] font-black uppercase ${log?.status === 'skipped' ? 'text-slate-400' : 'text-emerald-600'}`}>
              {log?.status === 'skipped' ? '✖ Dose Pulada' : '✔ Dose Tomada'}
            </div>
            {isConfirming ? (
              <button onClick={() => removeLog(item.id, item.slotTime)} className="text-[9px] font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-lg">Confirmar Erro</button>
            ) : (
              <button onClick={() => setConfirmingId(`${item.id}-${item.slotTime}`)} className="text-[9px] font-bold text-slate-300">Desmarcar</button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="px-4 pt-4">
      <div className="mb-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Hoje</h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            {now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
          </p>
        </div>
      </div>

      {allDoses.late.length > 0 && (
        <div className="mb-6">
          <p className="text-[10px] font-black text-rose-500 uppercase mb-2">Atrasados</p>
          {allDoses.late.map((d, i) => <MedCard key={`l-${i}`} item={d} type="late" />)}
        </div>
      )}

      <div className="mb-6">
        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Próximos Horários</p>
        {allDoses.next.map((d, i) => <MedCard key={`n-${i}`} item={d} type="next" />)}
        {allDoses.next.length === 0 && allDoses.late.length === 0 && (
          <div className="p-8 text-center bg-emerald-50 rounded-3xl border border-emerald-100">
            <p className="text-emerald-700 font-black text-xs uppercase">Tudo em dia! ✨</p>
          </div>
        )}
      </div>

      {allDoses.taken.length > 0 && (
        <div className="opacity-80">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Concluídos</p>
          {allDoses.taken.map((d, i) => <MedCard key={`t-${i}`} item={d} type="taken" />)}
        </div>
      )}
    </div>
  );
};

export default TodayView;
