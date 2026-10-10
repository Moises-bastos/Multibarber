import { Link } from "react-router-dom";

function Landing() {
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="text-2xl font-bold">
          Multi<span className="text-amber-500">Barber</span>
        </Link>

        <Link
          to="/login"
          className="rounded-lg border border-zinc-700 px-5 py-2 transition hover:bg-zinc-900"
        >
          Entrar
        </Link>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-32 pt-24">
        <div className="max-w-3xl">
          <span className="mb-5 inline-block font-medium text-amber-500">
            A plataforma para o seu negócio
          </span>

          <h2 className="text-5xl font-bold leading-tight md:text-7xl">
            Sua barbearia.
            <br />
            <span className="text-amber-500">Seu negócio.</span>
          </h2>

          <p className="mt-6 max-w-2xl text-lg text-zinc-400 md:text-xl">
            Gerencie seus clientes, organize sua agenda e permita que seus
            clientes agendem horários online.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/cadastro"
              className="rounded-lg bg-amber-500 px-7 py-3 text-center font-semibold text-black transition hover:bg-amber-400"
            >
              Começar agora
            </Link>

            <a
              href="#recursos"
              className="rounded-lg border border-zinc-700 px-7 py-3 text-center transition hover:bg-zinc-900"
            >
              Conhecer a MultiBarber
            </a>
          </div>
        </div>
      </section>

      <section
        id="recursos"
        className="scroll-mt-8 border-t border-zinc-800 bg-zinc-950 px-6 py-20"
      >
        <div className="mx-auto max-w-7xl">
          <p className="font-medium text-amber-500">Conheça a plataforma</p>

          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            Tudo para organizar sua barbearia
          </h2>

          <p className="mt-4 max-w-2xl text-zinc-400">
            Centralize a rotina do seu negócio em um só lugar e facilite o
            agendamento dos seus clientes.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-xl border border-zinc-800 bg-black p-6">
              <h3 className="font-semibold text-amber-500">Agenda</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Organize os horários, acompanhe atendimentos e bloqueie períodos
                indisponíveis.
              </p>
            </article>

            <article className="rounded-xl border border-zinc-800 bg-black p-6">
              <h3 className="font-semibold text-amber-500">Clientes</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Consulte os cadastros e o histórico de atendimentos da sua
                barbearia.
              </p>
            </article>

            <article className="rounded-xl border border-zinc-800 bg-black p-6">
              <h3 className="font-semibold text-amber-500">
                Agendamento online
              </h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Compartilhe seu link para que os clientes escolham serviços e
                horários disponíveis.
              </p>
            </article>

            <article className="rounded-xl border border-zinc-800 bg-black p-6">
              <h3 className="font-semibold text-amber-500">Financeiro</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Acompanhe os valores dos atendimentos registrados como
                realizados.
              </p>
            </article>
          </div>

          <div className="mt-12">
            <Link
              to="/cadastro"
              className="inline-block rounded-lg bg-amber-500 px-7 py-3 font-semibold text-black transition hover:bg-amber-400"
            >
              Começar agora
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Landing;
