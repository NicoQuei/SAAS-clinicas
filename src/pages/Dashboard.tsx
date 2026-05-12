import { motion } from 'framer-motion';
import { Users, Calendar as CalendarIcon, DollarSign, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { profile } = useAuth();

  // Fetch counts and stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboard-stats', profile?.clinic_id],
    queryFn: async () => {
      if (!profile?.clinic_id) return null;

      const [patientsCount, appointmentsToday, totalRevenue] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact', head: true }).eq('clinic_id', profile.clinic_id),
        supabase.from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('clinic_id', profile.clinic_id)
          .gte('start_time', new Date().toISOString().split('T')[0]),
        supabase.from('transactions')
          .select('amount')
          .eq('clinic_id', profile.clinic_id)
          .eq('type', 'INCOME')
      ]);

      const revenue = totalRevenue.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

      return {
        patients: patientsCount.count || 0,
        appointmentsToday: appointmentsToday.count || 0,
        revenue: revenue,
      };
    },
    enabled: !!profile?.clinic_id,
  });

  // Fetch upcoming appointments
  const { data: upcomingAppointments } = useQuery({
    queryKey: ['upcoming-appointments', profile?.clinic_id],
    queryFn: async () => {
      if (!profile?.clinic_id) return [];
      const { data, error } = await supabase
        .from('appointments')
        .select('*, patients(name)')
        .eq('clinic_id', profile.clinic_id)
        .gte('start_time', new Date().toISOString())
        .order('start_time')
        .limit(4);
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.clinic_id,
  });

  const STATS = [
    {
      title: 'Faturamento Total',
      value: `R$ ${stats?.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`,
      icon: DollarSign,
      color: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      title: 'Total de Pacientes',
      value: stats?.patients.toString() || '0',
      icon: Users,
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      title: 'Consultas Hoje',
      value: stats?.appointmentsToday.toString() || '0',
      icon: CalendarIcon,
      color: 'bg-indigo-500/10 text-indigo-600',
    },
    {
      title: 'Atividade Recente',
      value: 'Ativo',
      icon: Activity,
      color: 'bg-amber-500/10 text-amber-600',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Bem-vindo de volta, {profile?.name || 'usuário'}. Aqui está o resumo da clínica.</p>
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
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.title}</h3>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">
                {isLoadingStats ? '...' : stat.value}
              </p>
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
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Visão Geral</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Desempenho da clínica</p>
            </div>
          </div>
          <div className="h-[300px] w-full flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
             Gráfico de evolução (em breve com dados históricos)
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
            {upcomingAppointments?.map((apt: any) => (
              <div key={apt.id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold text-xs">
                  {apt.patients?.name.split(' ').map((n: any) => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{apt.patients?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{apt.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {new Date(apt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {upcomingAppointments?.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">Nenhuma consulta agendada.</p>
            )}
          </div>
          <Link 
            to="/agenda"
            className="block w-full mt-6 py-2.5 text-center text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
          >
            Ver Agenda Completa
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
