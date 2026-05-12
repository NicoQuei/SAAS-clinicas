export function Patients() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Pacientes</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          Novo Paciente
        </button>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center">
        <p className="text-slate-500 dark:text-slate-400">Página de pacientes em construção.</p>
      </div>
    </div>
  );
}
