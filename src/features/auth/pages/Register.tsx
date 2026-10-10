import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";

function Register() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [nomeBarbearia, setNomeBarbearia] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function criarConta(e: React.FormEvent<HTMLFormElement>) {
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

    if (!email.trim()) {
      setErro("Digite seu e-mail.");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setCarregando(true);

    try {
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

      if (error) {
        setErro(error.message);
        return;
      }

      if (data.session) {
        setSucesso("Conta criada! Redirecionando para o painel...");
        navigate("/dashboard", { replace: true });
        return;
      }

      setSucesso(
        "Conta criada, mas não houve uma sessão ativa. Confira a configuração de confirmação de e-mail no Supabase.",
      );
    } catch (error) {
      console.error("Erro ao criar conta:", error);
      setErro("Não foi possível criar a conta. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  const classesInput =
    "w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-amber-500";

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold">
            Multi<span className="text-amber-500">Barber</span>
          </h1>
          <p className="mt-2 text-zinc-400">Crie sua conta e comece agora</p>
        </div>

        <form onSubmit={criarConta} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-zinc-300">Seu nome</label>
            <input
              type="text"
              placeholder="Digite seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={classesInput}
              autoComplete="name"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Nome da barbearia
            </label>
            <input
              type="text"
              placeholder="Ex.: João Barber"
              value={nomeBarbearia}
              onChange={(e) => setNomeBarbearia(e.target.value)}
              className={classesInput}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={classesInput}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">Senha</label>
            <input
              type="password"
              placeholder="Crie uma senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={classesInput}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          {erro && (
            <p role="alert" className="text-sm text-red-400">
              {erro}
            </p>
          )}

          {sucesso && (
            <p role="status" className="text-sm text-green-400">
              {sucesso}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg bg-amber-500 px-4 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {carregando ? "Criando conta..." : "Criar minha conta"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default Register;
