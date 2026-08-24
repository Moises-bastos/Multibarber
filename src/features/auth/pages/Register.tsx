function Register() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">
            Multi<span className="text-amber-500">Barber</span>
          </h1>

          <p className="text-zinc-400 mt-2">
            Crie sua conta e comece agora
          </p>
        </div>

        <form className="space-y-4">

          <div>
            <label className="block text-sm text-zinc-300 mb-2">
              Seu nome
            </label>

            <input
              type="text"
              placeholder="Digite seu nome"
              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 text-white outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-2">
              Nome da barbearia
            </label>

            <input
              type="text"
              placeholder="Ex: João Barber"
              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 text-white outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-2">
              E-mail
            </label>

            <input
              type="email"
              placeholder="seu@email.com"
              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 text-white outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-2">
              Senha
            </label>

            <input
              type="password"
              placeholder="Crie uma senha"
              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 text-white outline-none focus:border-amber-500 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 text-black font-semibold px-4 py-3 rounded-lg hover:bg-amber-400 transition"
          >
            Criar minha conta
          </button>

        </form>
      </div>
    </main>
  );
}

export default Register;