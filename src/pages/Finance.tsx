import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, DollarSign, Plus, Search, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function Finance() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch transactions
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', profile?.clinic_id],
    queryFn: async () => {
      if (!profile?.clinic_id) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('clinic_id', profile.clinic_id)
        .order('due_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.clinic_id,
  });

  // Stats calculation
  const stats = transactions?.reduce((acc, curr) => {
    const val = Number(curr.amount);
    if (curr.type === 'INCOME') acc.income += val;
    else acc.expense += val;
    return acc;
  }, { income: 0, expense: 0 }) || { income: 0, expense: 0 };

  // Mutation to add transaction
  const addTransactionMutation = useMutation({
    mutationFn: async (newTrx: any) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{ 
          ...newTrx, 
          clinic_id: profile?.clinic_id,
          status: 'PAID' // Defaulting to paid for simplicity in this demo
        }])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsModalOpen(false);
      resetForm();
      alert('Lançamento salvo com sucesso!');
    },
  });

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategory('');
    setDueDate(new Date().toISOString().split('T')[0]);
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addTransactionMutation.mutateAsync({
        description,
        amount: parseFloat(amount),
        type: modalType,
        category,
        due_date: dueDate,
        payment_date: dueDate,
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTransactions = transactions?.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (type: 'INCOME' | 'EXPENSE') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Financeiro</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gestão de receitas, despesas e fluxo de caixa.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => openModal('EXPENSE')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <ArrowDownRight className="w-4 h-4 text-red-500" />
            Nova Despesa
          </button>
          <button 
            onClick={() => openModal('INCOME')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <ArrowUpRight className="w-4 h-4" />
            Nova Receita
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Entradas</p>
          <h3 className="text-3xl font-semibold text-slate-900 dark:text-white">R$ {stats.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Saídas</p>
          <h3 className="text-3xl font-semibold text-slate-900 dark:text-white">R$ {stats.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-indigo-600 p-6 rounded-2xl shadow-sm relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <DollarSign className="w-24 h-24" />
          </div>
          <p className="text-sm font-medium text-indigo-100 mb-2">Saldo Geral</p>
          <h3 className="text-3xl font-semibold">R$ {(stats.income - stats.expense).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </motion.div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="font-semibold text-slate-900 dark:text-white px-2">Lançamentos</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar lançamento..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500">Carregando lançamentos...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Descrição</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredTransactions?.map((trx, i) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    key={trx.id} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          trx.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                        }`}>
                          {trx.type === 'INCOME' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{trx.description}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{trx.payment_method || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {new Date(trx.due_date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {trx.category}
                    </td>
                    <td className={`px-6 py-4 text-right text-sm font-semibold whitespace-nowrap ${
                      trx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                    }`}>
                      {trx.type === 'INCOME' ? '+' : '-'} R$ {Number(trx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </motion.tr>
                ))}
                {!filteredTransactions?.length && !isLoading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">Nenhum lançamento encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Nova Transação */}
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
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {modalType === 'INCOME' ? 'Nova Receita' : 'Nova Despesa'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Descrição</label>
                  <input 
                    type="text" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" 
                    placeholder="Ex: Aluguel, Consulta Particular..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Valor (R$)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" 
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Data</label>
                    <input 
                      type="date" 
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Categoria</label>
                  <input 
                    type="text" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" 
                    placeholder="Ex: Consultas, Marketing, Infraestrutura..."
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
                    className={`flex-1 px-4 py-2.5 text-white font-medium rounded-lg transition-colors shadow-sm flex items-center justify-center disabled:opacity-50 ${
                      modalType === 'INCOME' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {isSubmitting ? 'Salvando...' : 'Salvar Lançamento'}
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
