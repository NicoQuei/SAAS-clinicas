import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, User, Bell, Shield, Wallet, Paintbrush } from 'lucide-react';

const TABS = [
  { id: 'clinic', name: 'Dados da Clínica', icon: Building2 },
  { id: 'profile', name: 'Meu Perfil', icon: User },
  { id: 'notifications', name: 'Notificações', icon: Bell },
  { id: 'security', name: 'Segurança', icon: Shield },
  { id: 'billing', name: 'Assinatura', icon: Wallet },
  { id: 'appearance', name: 'Aparência', icon: Paintbrush },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState('clinic');

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Configurações</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gerencie as preferências da sua clínica e do seu perfil.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8"
          >
            {activeTab === 'clinic' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Dados da Clínica</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Informações públicas que aparecerão para os pacientes.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome da Clínica</label>
                    <input type="text" defaultValue="Clínica Exemplo" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CNPJ</label>
                    <input type="text" defaultValue="00.000.000/0001-00" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone / WhatsApp</label>
                    <input type="text" defaultValue="(11) 99999-9999" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Endereço Completo</label>
                    <textarea rows={3} defaultValue="Av. Paulista, 1000 - Bela Vista, São Paulo - SP" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white resize-none" />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                  <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
                    Salvar Alterações
                  </button>
                </div>
              </div>
            )}

            {activeTab !== 'clinic' && (
              <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400">Em breve...</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
