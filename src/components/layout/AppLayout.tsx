import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  WalletCards, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAVIGATION = [
  { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { name: 'Agenda', to: '/agenda', icon: CalendarDays },
  { name: 'Pacientes', to: '/pacientes', icon: Users },
  { name: 'Financeiro', to: '/financeiro', icon: WalletCards },
  { name: 'Configurações', to: '/configuracoes', icon: Settings },
];

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Supabase logout logic here
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex dark:bg-slate-950">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 dark:bg-slate-900 dark:border-slate-800 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo area */}
          <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-xl font-semibold text-slate-900 dark:text-white">
                ClinicSaaS
              </span>
            </div>
            <button 
              className="ml-auto lg:hidden text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {NAVIGATION.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* User Profile / Logout */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400 font-medium text-sm"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 dark:bg-slate-900 dark:border-slate-800 sticky top-0 z-30">
          <button
            className="lg:hidden text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 flex justify-end items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-500 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white dark:border-slate-900" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center dark:bg-indigo-900/30">
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">DR</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-900 dark:text-white">Dr. Roberto</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Administrador</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
