import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Scissors,
  Wallet,
  Settings,
  LogOut,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function DashboardLayout() {
  const navigate = useNavigate();

  async function sair() {
    await supabase.auth.signOut();

    navigate("/login");
  }
  const location = useLocation();

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

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-zinc-800 bg-black p-6">
        {/* Logo */}
        <Link to="/dashboard" className="text-2xl font-bold">
          Multi<span className="text-amber-500">Barber</span>
        </Link>

        {/* Menu */}
        <nav className="mt-10 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                  active
                    ? "bg-amber-500 text-black font-medium"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <Icon size={20} />

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Menu inferior */}
        <div className="mt-auto space-y-2">
          <Link
            to="/configuracoes"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition ${
              location.pathname === "/configuracoes"
                ? "bg-amber-500 text-black font-medium"
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

      {/* Conteúdo */}
      <section className="ml-64">
        <Outlet />
      </section>
    </main>
  );
}

export default DashboardLayout;
