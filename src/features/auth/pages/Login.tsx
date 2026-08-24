function Login() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-white text-center">
          MultiBarber
        </h1>

        <p className="text-gray-400 text-center mt-2">
          Entre na sua conta
        </p>

        <form className="mt-8 space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 text-white outline-none"
          />

          <input
            type="password"
            placeholder="Senha"
            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 text-white outline-none"
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-amber-500 px-4 py-3 font-semibold text-black"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}

export default Login;
