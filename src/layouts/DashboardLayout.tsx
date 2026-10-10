import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Scissors,
  Wallet,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);

  async function sair() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Agenda",
      path: "/agenda",
      icon: CalendarDays,
    },
    {
      label: "Clientes",
      path: "/clientes",
      icon: Users,
    },
    {
      label: "Serviços",
      path: "/servicos",
      icon: Scissors,
    },
    {
      label: "Financeiro",
      path: "/financeiro",
      icon: Wallet,
    },
  ];

  function fecharMenu() {
    setMenuAberto(false);
  }

  const linkAtivo = (path: string) => location.pathname === path;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Barra superior: aparece apenas em telas pequenas */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-800 bg-black px-4 md:hidden">
        <Link
          to="/dashboard"
          onClick={fecharMenu}
          className="text-xl font-bold"
        >
          Multi<span className="text-amber-500">Barber</span>
        </Link>

        <button
          type="button"
          onClick={() => setMenuAberto(!menuAberto)}
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuAberto}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-300 transition hover:bg-zinc-800"
        >
          {menuAberto ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Fundo escuro quando o menu móvel estiver aberto */}
      {menuAberto && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={fecharMenu}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      {/* Menu lateral */}
      <aside
        className={`fixed bottom-0 left-0 top-16 z-50 flex w-72 flex-col border-r border-zinc-800 bg-black p-5 transition-transform duration-200 md:top-0 md:z-30 md:h-screen md:w-64 md:translate-x-0 md:p-6 ${
          menuAberto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link
          to="/dashboard"
          onClick={fecharMenu}
          className="hidden text-2xl font-bold md:block"
        >
          Multi<span className="text-amber-500">Barber</span>
        </Link>

        <nav className="mt-4 space-y-2 md:mt-10">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = linkAtivo(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={fecharMenu}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                  active
                    ? "bg-amber-500 font-medium text-black"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2">
          <Link
            to="/configuracoes"
            onClick={fecharMenu}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition ${
              linkAtivo("/configuracoes")
                ? "bg-amber-500 font-medium text-black"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <Settings size={20} />
            <span>Configurações</span>
          </Link>

          <button
            type="button"
            onClick={sair}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <section className="min-h-screen min-w-0 overflow-x-hidden pt-16 md:ml-64 md:pt-0">
        <Outlet />
      </section>
    </main>
  );
}

export default DashboardLayout;
