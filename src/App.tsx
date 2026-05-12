import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Patients } from './pages/Patients';
import { Calendar } from './pages/Calendar';
import { Finance } from './pages/Finance';
import { Settings } from './pages/Settings';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Authenticated Routes */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="agenda" element={<Calendar />} />
            <Route path="pacientes" element={<Patients />} />
            <Route path="financeiro" element={<Finance />} />
            <Route path="configuracoes" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
