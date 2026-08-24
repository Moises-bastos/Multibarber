import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "../features/auth/pages/Landing";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import Dashboard from "../features/dashboard/Dashboard";
import Agenda from "../features/agenda/Agenda";
import Servicos from "../features/servicos/Servicos";
import Clientes from "../features/clientes/Clientes";
import Financeiro from "../features/financeiro/Financeiro";
import Configuracoes from "../features/configuracoes/Configuracoes";

import DashboardLayout from "../layouts/DashboardLayout";

function AppRoutes() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Páginas públicas */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />

        {/* Área do barbeiro */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/servicos" element={<Servicos />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default AppRoutes;