import { motion } from 'framer-motion';
import { Users, TrendingUp, Calendar as CalendarIcon, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', total: 1200 },
  { name: 'Fev', total: 2100 },
  { name: 'Mar', total: 1800 },
  { name: 'Abr', total: 2400 },
  { name: 'Mai', total: 2800 },
  { name: 'Jun', total: 3200 },
];

const STATS = [
  {
    title: 'Faturamento Total',
    value: 'R$ 45.231,89',
    icon: DollarSign,
    trend: '+20.1%',
    isPositive: true,
  },
  {
    title: 'Novos Pacientes',
    value: '+2,350',
    icon: Users,
    trend: '+180.1%',
    isPositive: true,
  },
  {
    title: 'Consultas Hoje',
    value: '24',
    icon: CalendarIcon,
    trend: '-4%',
    isPositive: false,
  },
  {
    title: 'Taxa de Retenção',
    value: '98.3%',
    icon: TrendingUp,
    trend: '+2.4%',
    isPositive: true,
  },
];

export function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Bem-vindo de volta, aqui está o resumo da sua clínica.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                <stat.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className={`flex items-center text-sm font-medium ${stat.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {stat.isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                {stat.trend}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.title}</h3>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Visão Geral de Receita</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Acompanhamento dos últimos 6 meses</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Próximos Atendimentos</h2>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">P{i}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Paciente Exemplo {i}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Consulta de Retorno</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">14:00</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Em 2h</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
            Ver Agenda Completa
          </button>
        </motion.div>
      </div>
    </div>
  );
}
