import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Clock, User } from 'lucide-react';

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
const HOURS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const APPOINTMENTS = [
  { id: 1, day: 0, hour: 1, title: 'Ana Silva', type: 'Retorno', duration: 1, color: 'emerald' },
  { id: 2, day: 1, hour: 0, title: 'Carlos Santos', type: 'Primeira Consulta', duration: 2, color: 'indigo' },
  { id: 3, day: 2, hour: 3, title: 'Mariana Costa', type: 'Exame', duration: 1, color: 'amber' },
  { id: 4, day: 4, hour: 5, title: 'Roberto Almeida', type: 'Retorno', duration: 1, color: 'emerald' },
];

export function Calendar() {
  const [currentDate, setCurrentDate] = useState('10 a 14 de Maio, 2026');

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Agenda</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gerencie os horários de atendimento da clínica.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-1">
            <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 text-sm font-medium text-slate-700 dark:text-slate-200">{currentDate}</span>
            <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nova Consulta</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1 flex flex-col overflow-hidden min-h-[600px]">
        {/* Calendar Header */}
        <div className="grid grid-cols-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="p-4 border-r border-slate-200 dark:border-slate-800 flex items-end justify-center">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Horário</span>
          </div>
          {DAYS.map((day, i) => (
            <div key={day} className={`p-4 text-center ${i !== DAYS.length - 1 ? 'border-r border-slate-200 dark:border-slate-800' : ''}`}>
              <p className="text-sm font-medium text-slate-900 dark:text-white">{day}</p>
              <p className="text-2xl font-light text-slate-500 dark:text-slate-400 mt-1">{10 + i}</p>
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="flex-1 overflow-y-auto">
          {HOURS.map((hour, hourIdx) => (
            <div key={hour} className="grid grid-cols-6 min-h-[100px] border-b border-slate-100 dark:border-slate-800/50 relative">
              <div className="p-2 border-r border-slate-200 dark:border-slate-800 flex items-start justify-center">
                <span className="text-xs font-medium text-slate-400">{hour}</span>
              </div>
              
              {DAYS.map((_, dayIdx) => {
                const appointment = APPOINTMENTS.find(a => a.day === dayIdx && a.hour === hourIdx);
                
                return (
                  <div key={dayIdx} className={`p-1 relative border-r border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors ${dayIdx === DAYS.length - 1 ? 'border-r-0' : ''}`}>
                    {appointment && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`absolute inset-x-2 top-2 rounded-xl p-3 border shadow-sm cursor-pointer hover:shadow-md transition-shadow
                          ${appointment.color === 'emerald' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' : ''}
                          ${appointment.color === 'indigo' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400' : ''}
                          ${appointment.color === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400' : ''}
                        `}
                        style={{ height: `calc(${appointment.duration * 100}% - 16px)`, zIndex: 10 }}
                      >
                        <div className="flex flex-col h-full">
                          <p className="font-semibold text-sm line-clamp-1">{appointment.title}</p>
                          <div className="flex items-center gap-1 mt-1 opacity-80">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">{hour} - {parseInt(hour) + appointment.duration}:00</span>
                          </div>
                          <div className="mt-auto">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-white/50 dark:bg-black/20">
                              {appointment.type}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
