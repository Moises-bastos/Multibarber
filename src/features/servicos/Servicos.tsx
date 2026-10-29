import { useEffect, useState } from "react";
import { Edit, Plus, Scissors, Trash2, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { buscarMinhaBarbearia } from "../../utils/barbearia";

type Servico = {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  duracao: number;
  ativo: boolean;
};

function Servicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [servicoEditando, setServicoEditando] = useState<Servico | null>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [duracao, setDuracao] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarServicos();
  }, []);

  async function carregarServicos() {
    try {
      setCarregando(true);
      setErro("");

      const barbearia = await buscarMinhaBarbearia();

      const { data, error } = await supabase
        .from("servicos")
        .select("*")
        .eq("barbearia_id", barbearia.id)
        .order("id", { ascending: true });

      if (error) throw error;

      setServicos(data || []);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
      setErro("Não foi possível carregar os serviços.");
    } finally {
      setCarregando(false);
    }
  }

  function abrirNovoServico() {
    setServicoEditando(null);
    setNome("");
    setDescricao("");
    setPreco("");
    setDuracao("");
    setErro("");
    setModalAberto(true);
  }

  function abrirEdicao(servico: Servico) {
    setServicoEditando(servico);
    setNome(servico.nome);
    setDescricao(servico.descricao || "");
    setPreco(String(servico.preco));
    setDuracao(String(servico.duracao));
    setErro("");
    setModalAberto(true);
  }

  function fecharModal() {
    if (salvando) return;

    setModalAberto(false);
    setServicoEditando(null);
    setNome("");
    setDescricao("");
    setPreco("");
    setDuracao("");
    setErro("");
  }

  async function salvarServico() {
    if (!nome.trim() || !preco || !duracao) {
      setErro("Preencha o nome, o preço e a duração.");
      return;
    }

    const precoNumero = Number(preco.replace(",", "."));
    const duracaoNumero = Number(duracao);

    if (!Number.isFinite(precoNumero) || precoNumero < 0) {
      setErro("Informe um preço válido.");
      return;
    }

    if (!Number.isInteger(duracaoNumero) || duracaoNumero <= 0) {
      setErro("A duração deve ser um número inteiro maior que zero.");
      return;
    }

    try {
      setSalvando(true);
      setErro("");

      const barbearia = await buscarMinhaBarbearia();

      if (servicoEditando) {
        const { data, error } = await supabase
          .from("servicos")
          .update({
            nome: nome.trim(),
            descricao: descricao.trim() || null,
            preco: precoNumero,
            duracao: duracaoNumero,
          })
          .eq("id", servicoEditando.id)
          .eq("barbearia_id", barbearia.id)
          .select()
          .single();

        if (error) throw error;

        setServicos((atuais) =>
          atuais.map((servico) =>
            servico.id === servicoEditando.id ? data : servico,
          ),
        );
      } else {
        const { data, error } = await supabase
          .from("servicos")
          .insert({
            barbearia_id: barbearia.id,
            nome: nome.trim(),
            descricao: descricao.trim() || null,
            preco: precoNumero,
            duracao: duracaoNumero,
            ativo: true,
          })
          .select()
          .single();

        if (error) throw error;

        setServicos((atuais) => [...atuais, data]);
      }

      setModalAberto(false);
      setServicoEditando(null);
      setNome("");
      setDescricao("");
      setPreco("");
      setDuracao("");
      setErro("");
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      setErro("Não foi possível salvar o serviço. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirServico(id: number) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este serviço?",
    );

    if (!confirmar) return;

    try {
      setErro("");

      const barbearia = await buscarMinhaBarbearia();

      const { error } = await supabase
        .from("servicos")
        .delete()
        .eq("id", id)
        .eq("barbearia_id", barbearia.id);

      if (error) throw error;

      setServicos((atuais) => atuais.filter((servico) => servico.id !== id));
    } catch (error) {
      console.error("Erro ao excluir serviço:", error);
      setErro("Não foi possível excluir o serviço. Tente novamente.");
    }
  }

  function formatarMoeda(valor: number) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-full overflow-x-clip p-4 sm:p-6 lg:p-8">
      {/* Cabeçalho */}
      <header className="flex w-full min-w-0 flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="break-words text-sm leading-relaxed text-zinc-400 sm:text-base">
            Gerencie os serviços oferecidos pela sua barbearia
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Serviços</h1>
        </div>

        <button
          type="button"
          onClick={abrirNovoServico}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 font-semibold text-black transition hover:bg-amber-400 sm:w-auto sm:min-w-44"
        >
          <Plus size={20} className="shrink-0" />
          <span>Novo serviço</span>
        </button>
      </header>

      {/* Mensagem de erro */}
      {erro && !modalAberto && (
        <div
          role="alert"
          className="mt-5 break-words rounded-xl border border-red-900/50 bg-red-500/10 p-4 text-sm text-red-400"
        >
          {erro}
        </div>
      )}

      {/* Lista */}
      <section className="mt-6 grid w-full min-w-0 grid-cols-1 gap-4 sm:mt-8 sm:gap-5">
        {carregando ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
            <p className="text-zinc-400">Carregando serviços...</p>
          </div>
        ) : servicos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900 p-6 text-center sm:p-10">
            <Scissors size={40} className="mx-auto text-amber-500" />

            <h2 className="mt-4 text-xl font-semibold">
              Nenhum serviço cadastrado
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Cadastre seu primeiro serviço para começar.
            </p>

            <button
              type="button"
              onClick={abrirNovoServico}
              className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400 sm:mx-auto sm:w-auto"
            >
              <Plus size={18} />
              Cadastrar serviço
            </button>
          </div>
        ) : (
          servicos.map((servico) => (
            <article
              key={servico.id}
              className="w-full min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700 sm:p-5 lg:p-6"
            >
              {/* Informações do serviço */}
              <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 sm:h-14 sm:w-14">
                  <Scissors size={24} />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="break-words text-lg font-semibold sm:text-xl">
                    {servico.nome}
                  </h2>

                  <p className="mt-1 break-words text-sm leading-relaxed text-zinc-400">
                    {servico.descricao || "Sem descrição"}
                  </p>

                  <div className="mt-3 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="font-semibold text-amber-500">
                      {formatarMoeda(servico.preco)}
                    </span>

                    <span className="hidden h-1 w-1 rounded-full bg-zinc-600 sm:block" />

                    <span className="text-sm text-zinc-500">
                      {servico.duracao} min
                    </span>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="mt-5 grid grid-cols-2 gap-2 border-t border-zinc-800 pt-4 sm:flex sm:justify-end sm:gap-3">
                <button
                  type="button"
                  onClick={() => abrirEdicao(servico)}
                  aria-label={`Editar serviço ${servico.nome}`}
                  className="flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-white sm:min-w-28"
                >
                  <Edit size={17} className="shrink-0" />
                  <span>Editar</span>
                </button>

                <button
                  type="button"
                  onClick={() => excluirServico(servico.id)}
                  aria-label={`Excluir serviço ${servico.nome}`}
                  className="flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-lg border border-red-900/50 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10 sm:min-w-28"
                >
                  <Trash2 size={17} className="shrink-0" />
                  <span>Excluir</span>
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      {/* Modal de cadastro e edição */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-3 sm:p-5">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-servico"
            className="my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-2xl sm:max-h-[calc(100dvh-2.5rem)] sm:p-6"
          >
            {/* Cabeçalho do modal */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2
                  id="titulo-modal-servico"
                  className="text-xl font-bold sm:text-2xl"
                >
                  {servicoEditando ? "Editar serviço" : "Novo serviço"}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {servicoEditando
                    ? "Atualize as informações do serviço."
                    : "Cadastre um serviço para sua barbearia."}
                </p>
              </div>

              <button
                type="button"
                onClick={fecharModal}
                disabled={salvando}
                aria-label="Fechar modal"
                className="shrink-0 rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                salvarServico();
              }}
            >
              <div>
                <label
                  htmlFor="servico-nome"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Nome do serviço
                </label>

                <input
                  id="servico-nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex.: Corte degradê"
                  maxLength={100}
                  required
                  className="w-full min-w-0 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500"
                />
              </div>

              <div>
                <label
                  htmlFor="servico-descricao"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Descrição
                </label>

                <textarea
                  id="servico-descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva o serviço..."
                  rows={3}
                  className="w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <label
                    htmlFor="servico-preco"
                    className="mb-2 block text-sm font-medium text-zinc-300"
                  >
                    Preço (R$)
                  </label>

                  <input
                    id="servico-preco"
                    type="number"
                    min="0"
                    step="0.01"
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                    placeholder="15,00"
                    required
                    className="w-full min-w-0 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500"
                  />
                </div>

                <div className="min-w-0">
                  <label
                    htmlFor="servico-duracao"
                    className="mb-2 block text-sm font-medium text-zinc-300"
                  >
                    Duração (minutos)
                  </label>

                  <input
                    id="servico-duracao"
                    type="number"
                    min="1"
                    step="1"
                    value={duracao}
                    onChange={(e) => setDuracao(e.target.value)}
                    placeholder="30"
                    required
                    className="w-full min-w-0 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500"
                  />
                </div>
              </div>

              {erro && (
                <p
                  role="alert"
                  className="break-words rounded-lg bg-red-500/10 p-3 text-sm text-red-400"
                >
                  {erro}
                </p>
              )}

              <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={fecharModal}
                  disabled={salvando}
                  className="min-h-12 w-full rounded-xl border border-zinc-700 px-4 py-3 font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  className="min-h-12 w-full rounded-xl bg-amber-500 px-4 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {salvando
                    ? "Salvando..."
                    : servicoEditando
                      ? "Salvar alterações"
                      : "Cadastrar serviço"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Servicos;
