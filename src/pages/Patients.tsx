import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MoreVertical, Edit2, Trash2, Mail, Phone, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function Patients() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [document, setDocument] = useState('');

  // Fetch patients
  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients', profile?.clinic_id],
    queryFn: async () => {
      if (!profile?.clinic_id) return [];
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', profile.clinic_id)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.clinic_id,
  });

  // Mutation to add patient
  const addPatientMutation = useMutation({
    mutationFn: async (newPatient: any) => {
      const { data, error } = await supabase
        .from('patients')
        .insert([{ ...newPatient, clinic_id: profile?.clinic_id }])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['patients'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setDocument('');
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.clinic_id) {
      alert('Erro: Seu perfil não foi encontrado. Por favor, recarregue a página ou verifique se o seu usuário está vinculado a uma clínica no banco de dados.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addPatientMutation.mutateAsync({
        name,
        email,
        phone,
        document,
      });
      alert('Paciente cadastrado com sucesso!');
    } catch (error: any) {
      console.error('Error adding patient:', error);
      alert('Erro ao cadastrar paciente: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPatients = patients?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.document?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Pacientes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gerencie os cadastros e prontuários da clínica.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Novo Paciente
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome, CPF ou email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500">Carregando pacientes...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Paciente</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contato</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Documento</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredPatients?.map((patient, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={patient.id} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                          {patient.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer">{patient.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Criado em: {new Date(patient.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {patient.email || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {patient.phone || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {patient.document || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {!filteredPatients?.length && !isLoading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">Nenhum paciente encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Novo Paciente */}
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
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Novo Paciente</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddPatient} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nome Completo</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" 
                    placeholder="Ex: Maria Oliveira"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">E-mail</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" 
                      placeholder="maria@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Telefone</label>
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" 
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">CPF / Documento</label>
                  <input 
                    type="text" 
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" 
                    placeholder="000.000.000-00"
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
                    {isSubmitting ? 'Salvando...' : 'Cadastrar Paciente'}
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
