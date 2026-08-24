
function Dashboard() {
  return (
    <div className="p-8">

      <header className="flex items-center justify-between">

        <div>
          <p className="text-zinc-400">
            Bem-vindo de volta
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            João Barber 
          </h1>
        </div>

        <div className="rounded-full bg-zinc-900 px-4 py-2">
          João
        </div>

      </header>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-zinc-400">
            Agendamentos hoje
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            12
          </h2>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-zinc-400">
            Clientes
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            248
          </h2>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-zinc-400">
            Faturamento hoje
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            R$ 480
          </h2>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;