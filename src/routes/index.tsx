import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "../features/auth/pages/Landing";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import PublicBarber from "../features/public/pages/PublicBarber";

import Dashboard from "../features/dashboard/Dashboard";
import Agenda from "../features/agenda/Agenda";
import Clientes from "../features/clientes/Clientes";
import Servicos from "../features/servicos/Servicos";
import Financeiro from "../features/financeiro/Financeiro";
import Configuracoes from "../features/configuracoes/Configuracoes";
import MeuLinkAgendamento from "../features/meu-link/MeuLinkAgendamento";

import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />

        <Route path="/barbearia/:slug" element={<PublicBarber />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/servicos" element={<Servicos />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/meu-link" element={<MeuLinkAgendamento />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
