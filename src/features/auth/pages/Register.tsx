import { useState } from "react";
import { supabase } from "../../../lib/supabase";

function Register() {
  const [nome, setNome] = useState("");
  const [nomeBarbearia, setNomeBarbearia] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function criarConta(e: React.FormEvent) {
    e.preventDefault();

    setErro("");
    setSucesso("");

    if (nome.trim().length < 3) {
      setErro("Digite seu nome completo.");
      return;
    }

    if (nomeBarbearia.trim().length < 3) {
      setErro("Digite o nome da sua barbearia.");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setCarregando(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,

      options: {
        data: {
          nome: nome.trim(),
          nome_barbearia: nomeBarbearia.trim(),
        },
      },
    });

    setCarregando(false);

    if (error) {
      setErro(error.message);
      return;
    }

    console.log("Usuário criado:", data.user);

    if (!data.session) {
      setSucesso(
        "Conta criada com sucesso! Verifique seu e-mail para confirmar a conta.",
      );
    } else {
      setSucesso("Conta criada com sucesso!");
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">
            Multi<span className="text-amber-500">Barber</span>
          </h1>

          <p className="text-zinc-400 mt-2">Crie sua conta e comece agora</p>
        </div>

        <form onSubmit={criarConta} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-300 mb-2">Seu nome</label>

            <input
              type="text"
              placeholder="Digite seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
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
              value={nomeBarbearia}
              onChange={(e) => setNomeBarbearia(e.target.value)}
              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 text-white outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-2">E-mail</label>

            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 text-white outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-2">Senha</label>

            <input
              type="password"
              placeholder="Crie uma senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 text-white outline-none focus:border-amber-500 transition"
            />
          </div>

          {erro && <p className="text-red-400 text-sm">{erro}</p>}

          {sucesso && <p className="text-green-400 text-sm">{sucesso}</p>}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-amber-500 text-black font-semibold px-4 py-3 rounded-lg hover:bg-amber-400 transition disabled:opacity-50"
          >
            {carregando ? "Criando conta..." : "Criar minha conta"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default Register;
