
import React, { useState, useMemo, useEffect } from 'react';
import { Medication, MedicationLog } from '../types';
import { PlusIcon, TrashIcon } from './Icons';

interface MedsViewProps {
  medications: Medication[];
  addMedication: (med: Medication) => void;
  updateMedication: (med: Medication) => void;
  removeMedication: (id: string) => void;
}

const MedsView: React.FC<MedsViewProps & { history?: MedicationLog[] }> = ({ medications, addMedication, updateMedication, removeMedication, history = [] }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  
  const [subject, setSubject] = useState('Sijugrino');
  const [newName, setNewName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newFreq, setNewFreq] = useState('24h');
  const [newTime, setNewTime] = useState('08:00');
  const [newObs1, setNewObs1] = useState('');
  const [newObs2, setNewObs2] = useState('');
  const [newPeriod, setNewPeriod] = useState(10);
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'active' | 'paused'>('paused');

  const calculatedSlots = useMemo(() => {
    if (!newTime) return [];
    const [hours, minutes] = newTime.split(':').map(Number);
    const intervalStr = newFreq.replace('h', '');
    const interval = parseInt(intervalStr);
    
    if (isNaN(interval) || interval <= 0) return [newTime];
    
    const count = Math.min(Math.floor(24 / interval), 24);
    const slots = [];
    for (let i = 0; i < count; i++) {
      const nextHour = (hours + i * interval) % 24;
      slots.push(`${nextHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    }
    return slots;
  }, [newTime, newFreq]);

  const getProgress = (medId: string, totalDays: number, frequency: string) => {
    const timesPerDay = 24 / parseInt(frequency.replace('h', ''));
    const totalDoses = totalDays * timesPerDay;
    const taken = history.filter(l => l.medicationId === medId && l.status === 'taken').length;
    return { taken, total: totalDoses, percent: Math.min((taken / totalDoses) * 100, 100) };
  };

  const resetForm = () => {
    setNewName('');
    setNewDosage('');
    setNewObs1('');
    setNewObs2('');
    setNewStartDate(new Date().toISOString().split('T')[0]);
    setEditingMedId(null);
    setShowForm(false);
    setStatus('paused');
  };

  const handleEdit = (med: Medication) => {
    setEditingMedId(med.id);
    setSubject(med.subjectName);
    setNewName(med.name);
    setNewDosage(med.dosage);
    setNewFreq(med.frequency);
    setNewTime(med.timeSlots[0] || '08:00');
    setNewObs1(med.obs1);
    setNewObs2(med.obs2);
    setNewPeriod(med.periodDays);
    setNewStartDate(med.startDate || new Date().toISOString().split('T')[0]);
    setStatus(med.status || 'paused');
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!newName || !newDosage) return;
    
    const medData: Medication = {
      id: editingMedId || Math.random().toString(36).substr(2, 9),
      subjectName: subject,
      name: newName,
      dosage: newDosage,
      frequency: newFreq,
      timeSlots: calculatedSlots,
      obs1: newObs1,
      obs2: newObs2,
      periodDays: newPeriod,
      startDate: newStartDate,
      status: status
    };
    
    if (editingMedId) {
      updateMedication(medData);
    } else {
      addMedication(medData);
    }
    
    resetForm();
  };

  const toggleStatus = (med: Medication, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = med.status === 'active' ? 'paused' : 'active';
    updateMedication({ ...med, status: newStatus });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--/--';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="animate-in slide-in-from-right duration-300 space-y-6 px-2">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Remédios</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Farmácia do Cuidador</p>
        </div>
        <button 
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className={`p-4 rounded-3xl shadow-xl transition-all active:scale-90 ${
            showForm ? 'bg-slate-800 text-white rotate-45' : 'bg-rose-500 text-white shadow-rose-200'
          }`}
        >
          <PlusIcon />
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-rose-50 space-y-5 animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-6 bg-rose-500 rounded-full"></div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
              {editingMedId ? 'Editar Remédio' : 'Novo Cadastro'}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <button 
                onClick={() => setSubject('Sijugrino')}
                className={`py-3 rounded-2xl font-black text-[10px] border-2 transition-all ${subject === 'Sijugrino' ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-100' : 'bg-white border-slate-100 text-slate-400'}`}
             >
               SIJUGRINO
             </button>
             <button 
                onClick={() => setSubject('Lua')}
                className={`py-3 rounded-2xl font-black text-[10px] border-2 transition-all ${subject === 'Lua' ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400'}`}
             >
               LUA
             </button>
          </div>

          <div className="space-y-4">
            <input 
              type="text" 
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 text-slate-800 focus:border-rose-500 focus:bg-white outline-none font-bold transition-all text-sm"
              placeholder="Nome do Medicamento"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" 
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 text-slate-800 focus:border-rose-500 focus:bg-white outline-none font-bold transition-all text-sm"
                placeholder="Dose (ex: 1ml)"
                value={newDosage}
                onChange={e => setNewDosage(e.target.value)}
              />
              <select 
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 text-slate-800 focus:border-rose-500 focus:bg-white outline-none font-bold transition-all appearance-none text-sm"
                value={newFreq}
                onChange={e => setNewFreq(e.target.value)}
              >
                <option value="24h">24h (1x/dia)</option>
                <option value="12h">12h (2x/dia)</option>
                <option value="8h">8h (3x/dia)</option>
                <option value="6h">6h (4x/dia)</option>
                <option value="4h">4h (6x/dia)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">1ª Hora</label>
                <input 
                  type="time" 
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 text-slate-800 focus:border-rose-500 focus:bg-white outline-none font-bold text-sm"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Duração (Dias)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 text-slate-800 focus:border-rose-500 focus:bg-white outline-none font-bold text-sm"
                  value={newPeriod}
                  onChange={e => setNewPeriod(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block">Data de Início</label>
              <input 
                type="date" 
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 text-slate-800 focus:border-rose-500 focus:bg-white outline-none font-bold text-sm"
                value={newStartDate}
                onChange={e => setNewStartDate(e.target.value)}
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Slots de Horário:</p>
               <div className="flex flex-wrap gap-2">
                 {calculatedSlots.map(s => (
                   <span key={s} className="bg-white px-3 py-1 rounded-lg text-[10px] font-black text-rose-600 border border-rose-100 shadow-sm">{s}</span>
                 ))}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setStatus('active')}
                className={`py-3 rounded-2xl font-black text-[10px] border-2 transition-all ${status === 'active' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-white border-slate-100 text-slate-400'}`}
              >
                ATIVO
              </button>
              <button 
                type="button"
                onClick={() => setStatus('paused')}
                className={`py-3 rounded-2xl font-black text-[10px] border-2 transition-all ${status === 'paused' ? 'bg-slate-400 border-slate-400 text-white shadow-lg shadow-slate-100' : 'bg-white border-slate-100 text-slate-400'}`}
              >
                PAUSADO
              </button>
            </div>

            <div className="flex gap-2 pt-2">
               {editingMedId && (
                 <button 
                  onClick={resetForm}
                  className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-3xl font-black text-xs uppercase"
                 >
                   Cancelar
                 </button>
               )}
               <button 
                  onClick={handleSubmit}
                  className="flex-[2] bg-rose-500 text-white py-4 rounded-3xl font-black shadow-xl shadow-rose-100 active:scale-95 transition-all text-xs uppercase tracking-widest"
                >
                  {editingMedId ? 'Atualizar' : 'Salvar'}
                </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 pb-20">
        {medications.map(med => {
          const prog = getProgress(med.id, med.periodDays, med.frequency);
          const isPaused = med.status === 'paused';
          
          return (
            <div 
              key={med.id} 
              className={`group bg-white p-5 rounded-[2.2rem] flex flex-col gap-4 border shadow-sm transition-all active:scale-[0.98] ${
                isPaused ? 'border-slate-100 opacity-80' : 'border-slate-100 hover:shadow-md'
              }`}
              onClick={() => handleEdit(med)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center text-[10px] font-black shadow-sm ${
                    med.subjectName === 'Lua' 
                      ? (isPaused ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600') 
                      : (isPaused ? 'bg-slate-100 text-slate-400' : 'bg-amber-50 text-amber-600')
                  }`}>
                    {med.subjectName.substring(0,3).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-black text-base leading-none ${isPaused ? 'text-slate-400' : 'text-slate-800'}`}>
                        {med.name}
                      </h4>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                        isPaused ? 'bg-slate-100 text-slate-400' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {isPaused ? 'Pausado' : 'Ativo'}
                      </span>
                    </div>
                    <div className="flex flex-col mt-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400">{med.dosage}</span>
                        <span className="w-0.5 h-0.5 bg-slate-300 rounded-full"></span>
                        <span className={`text-[10px] font-black uppercase ${isPaused ? 'text-slate-300' : 'text-rose-500'}`}>
                          {med.frequency}
                        </span>
                      </div>
                      <span className="text-[8px] font-black text-slate-300 uppercase mt-0.5 tracking-wider">
                        Início: {formatDate(med.startDate)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={(e) => toggleStatus(med, e)}
                    className={`p-3 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest ${
                      isPaused ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isPaused ? 'Iniciar' : 'Pausar'}
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeMedication(med.id);
                    }}
                    className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 px-1">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                  <span>Tratamento</span>
                  <span>{prog.taken} de {prog.total} doses</span>
                </div>
                <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      isPaused ? 'bg-slate-200' : (med.subjectName === 'Lua' ? 'bg-indigo-500' : 'bg-amber-500')
                    }`}
                    style={{ width: `${prog.percent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
        {medications.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
             <p className="text-slate-300 font-black uppercase tracking-widest text-xs">Nenhum Registro Encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedsView;
