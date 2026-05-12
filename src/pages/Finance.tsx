import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, DollarSign, Download, Filter, Plus, Search } from 'lucide-react';

const TRANSACTIONS = [
  { id: 'TRX-001', date: '10 Mai 2026', description: 'Consulta - Ana Silva', category: 'Consulta', type: 'INCOME', amount: 350.00, status: 'Pago', method: 'PIX' },
  { id: 'TRX-002', date: '09 Mai 2026', description: 'Material de Escritório', category: 'Despesas Gerais', type: 'EXPENSE', amount: 125.50, status: 'Pago', method: 'Cartão de Crédito' },
  { id: 'TRX-003', date: '09 Mai 2026', description: 'Procedimento - Roberto', category: 'Procedimento', type: 'INCOME', amount: 1200.00, status: 'Pendente', method: 'Boleto' },
  { id: 'TRX-004', date: '08 Mai 2026', description: 'Aluguel Clínica', category: 'Infraestrutura', type: 'EXPENSE', amount: 4500.00, status: 'Pago', method: 'Transferência' },
  { id: 'TRX-005', date: '08 Mai 2026', description: 'Consulta - Fernanda', category: 'Consulta', type: 'INCOME', amount: 350.00, status: 'Pago', method: 'Cartão de Débito' },
];

export function Finance() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Financeiro</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gestão de receitas, despesas e fluxo de caixa.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
            <ArrowDownRight className="w-4 h-4 text-red-500" />
            Nova Despesa
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
            <ArrowUpRight className="w-4 h-4" />
            Nova Receita
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ArrowUpRight className="w-24 h-24 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Entradas (Mês)</p>
          <h3 className="text-3xl font-semibold text-slate-900 dark:text-white">R$ 28.450,00</h3>
          <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 font-medium flex items-center">
            <ArrowUpRight className="w-4 h-4 mr-1" /> +15.3% em relação a Abril
          </p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ArrowDownRight className="w-24 h-24 text-red-500" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Saídas (Mês)</p>
          <h3 className="text-3xl font-semibold text-slate-900 dark:text-white">R$ 12.180,50</h3>
          <p className="text-sm text-red-600 dark:text-red-400 mt-2 font-medium flex items-center">
            <ArrowDownRight className="w-4 h-4 mr-1" /> -2.4% em relação a Abril
          </p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-indigo-600 dark:bg-indigo-600 p-6 rounded-2xl shadow-sm relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <DollarSign className="w-24 h-24" />
          </div>
          <p className="text-sm font-medium text-indigo-100 mb-2">Saldo Geral</p>
          <h3 className="text-3xl font-semibold">R$ 16.269,50</h3>
          <p className="text-sm text-indigo-100 mt-2 font-medium">
            Previsto até o fim do mês: R$ 22.400,00
          </p>
        </motion.div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="font-semibold text-slate-900 dark:text-white px-2">Lançamentos Recentes</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar lançamento..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white text-sm"
              />
            </div>
            <button className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {TRANSACTIONS.map((trx, i) => (
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
                        <p className="text-xs text-slate-500 dark:text-slate-400">{trx.id} • {trx.method}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {trx.date}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {trx.category}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      trx.status === 'Pago' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                    }`}>
                      {trx.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right text-sm font-semibold whitespace-nowrap ${
                    trx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                  }`}>
                    {trx.type === 'INCOME' ? '+' : '-'} R$ {trx.amount.toFixed(2).replace('.', ',')}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
