import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Clock, User, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export function Calendar() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [patientId, setPatientId] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [type, setType] = useState('Consulta');
  const [notes, setNotes] = useState('');

  // Fetch appointments for the selected date
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', profile?.clinic_id, selectedDate],
    queryFn: async () => {
      if (!profile?.clinic_id) return [];
      const start = `${selectedDate}T00:00:00Z`;
      const end = `${selectedDate}T23:59:59Z`;
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*, patients(name)')
        .eq('clinic_id', profile.clinic_id)
        .gte('start_time', start)
        .lte('start_time', end)
        .order('start_time');
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.clinic_id,
  });

  // Fetch patients for the dropdown
  const { data: patients } = useQuery({
    queryKey: ['patients-list', profile?.clinic_id],
    queryFn: async () => {
      if (!profile?.clinic_id) return [];
      const { data, error } = await supabase
        .from('patients')
        .select('id, name')
        .eq('clinic_id', profile.clinic_id)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.clinic_id && isModalOpen,
  });

  const addAppointmentMutation = useMutation({
    mutationFn: async (newApt: any) => {
      const start = `${selectedDate}T${newApt.startTime}:00Z`;
      const end = `${selectedDate}T${parseInt(newApt.startTime) + 1}:00:00Z`;
      
      const { data, error } = await supabase
        .from('appointments')
        .insert([{ 
          patient_id: newApt.patientId,
          clinic_id: profile?.clinic_id,
          doctor_id: profile?.id, // Assuming the current user is the doctor for simplicity
          start_time: start,
          end_time: end,
          type: newApt.type,
          notes: newApt.notes,
          status: 'SCHEDULED'
        }])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      // Força a atualização de todas as queries de agendamento
      await queryClient.invalidateQueries({ queryKey: ['appointments'] });
      // Também atualiza o dashboard por precaução
      await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      
      setIsModalOpen(false);
      setPatientId('');
      setNotes('');
      alert('Consulta agendada com sucesso!');
    },
  });

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addAppointmentMutation.mutateAsync({
        patientId,
        startTime,
        type,
        notes,
      });
    } catch (error) {
      console.error('Error adding appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Agenda</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gerencie os horários de atendimento da clínica.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-1">
            <button 
              onClick={() => changeDate(-1)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 text-sm font-medium text-slate-700 dark:text-slate-200">
              {new Date(selectedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
            <button 
              onClick={() => changeDate(1)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nova Consulta</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1 overflow-hidden">
        <div className="overflow-y-auto h-full">
          {HOURS.map((hour) => {
            const apt = appointments?.find(a => {
              const aptTime = new Date(a.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              return aptTime === hour;
            });

            return (
              <div key={hour} className="flex border-b border-slate-100 dark:border-slate-800/50 min-h-[100px]">
                <div className="w-20 p-4 border-r border-slate-100 dark:border-slate-800/50 flex flex-col items-center">
                  <span className="text-sm font-medium text-slate-400">{hour}</span>
                </div>
                <div className="flex-1 p-2 relative group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  {apt ? (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 p-3 rounded-xl shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900 dark:text-white">{apt.patients?.name}</p>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded">
                          {apt.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          60 min
                        </div>
                        {apt.notes && <p className="truncate italic">"{apt.notes}"</p>}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setStartTime(hour);
                          setIsModalOpen(true);
                        }}
                        className="text-slate-300 hover:text-indigo-600 text-xs font-medium uppercase tracking-widest"
                      >
                        + Reservar Horário
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Novo Agendamento */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Agendar Consulta</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddAppointment} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Paciente</label>
                  <select 
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  >
                    <option value="">Selecione um paciente...</option>
                    {patients?.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Horário</label>
                    <select 
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    >
                      {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tipo</label>
                    <input 
                      type="text" 
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" 
                      placeholder="Ex: Retorno, Limpeza..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Observações</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white h-24 resize-none" 
                    placeholder="Detalhes adicionais..."
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center disabled:opacity-50"
                  >
                    {isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
