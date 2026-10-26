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

      if (error) {
        throw error;
      }

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
    setPreco(servico.preco.toString());
    setDuracao(servico.duracao.toString());
    setErro("");
    setModalAberto(true);
  }

  function fecharModal() {
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
      setErro("Preencha nome, preço e duração.");
      return;
    }

    const precoNumero = Number(preco);
    const duracaoNumero = Number(duracao);

    if (precoNumero < 0) {
      setErro("O preço não pode ser negativo.");
      return;
    }

    if (duracaoNumero <= 0) {
      setErro("A duração deve ser maior que zero.");
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

        if (error) {
          throw error;
        }

        setServicos((servicosAtuais) =>
          servicosAtuais.map((servico) =>
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

        if (error) {
          throw error;
        }

        setServicos((servicosAtuais) => [...servicosAtuais, data]);
      }

      fecharModal();
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      setErro("Não foi possível salvar o serviço.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirServico(id: number) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este serviço?",
    );

    if (!confirmar) {
      return;
    }

    try {
      setErro("");

      const barbearia = await buscarMinhaBarbearia();

      const { error } = await supabase
        .from("servicos")
        .delete()
        .eq("id", id)
        .eq("barbearia_id", barbearia.id);

      if (error) {
        throw error;
      }

      setServicos((servicosAtuais) =>
        servicosAtuais.filter((servico) => servico.id !== id),
      );
    } catch (error) {
      console.error("Erro ao excluir serviço:", error);
      setErro("Não foi possível excluir o serviço.");
    }
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-full p-4 sm:p-6 lg:p-8">
      {/* Cabeçalho */}
      <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="break-words text-sm text-zinc-400 sm:text-base">
            Gerencie os serviços oferecidos pela sua barbearia
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Serviços</h1>
        </div>

        <button
          type="button"
          onClick={abrirNovoServico}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-3 font-semibold text-black transition hover:bg-amber-400 sm:w-auto sm:px-5"
        >
          <Plus size={20} />
          Novo serviço
        </button>
      </header>

      {/* Erro */}
      {erro && !modalAberto && (
        <p
          role="alert"
          className="mt-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-400"
        >
          {erro}
        </p>
      )}

      {/* Lista de serviços */}
      <div className="mt-5 grid min-w-0 gap-3 sm:mt-7 sm:gap-4">
        {carregando ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
            <p className="text-zinc-400">Carregando serviços...</p>
          </div>
        ) : servicos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900 p-6 text-center sm:p-10">
            <Scissors size={40} className="mx-auto text-zinc-600" />
            <h2 className="mt-4 text-xl font-semibold">
              Nenhum serviço cadastrado
            </h2>
            <p className="mt-2 text-zinc-500">
              Cadastre seu primeiro serviço para começar.
            </p>
            <button
              type="button"
              onClick={abrirNovoServico}
              className="mt-5 w-full rounded-lg bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400 sm:w-auto"
            >
              Cadastrar serviço
            </button>
          </div>
        ) : (
          servicos.map((servico) => (
            <div
              key={servico.id}
              className="flex min-w-0 flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between lg:p-6"
            >
              <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 sm:h-12 sm:w-12">
                  <Scissors size={22} />
                </div>

                <div className="min-w-0">
                  <h2 className="break-words text-base font-semibold sm:text-lg">
                    {servico.nome}
                  </h2>
                  <p className="mt-1 break-words text-sm text-zinc-400">
                    {servico.descricao || "Sem descrição"}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm sm:gap-3">
                    <span className="font-semibold text-amber-500">
                      R$ {Number(servico.preco).toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-500">
                      {servico.duracao} minutos
                    </span>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                <button
                  type="button"
                  onClick={() => abrirEdicao(servico)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-white sm:flex-none sm:px-4 sm:py-2"
                >
                  <Edit size={18} />
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => excluirServico(servico.id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm text-red-400 transition hover:bg-red-500/10 sm:flex-none sm:px-4 sm:py-2"
                >
                  <Trash2 size={18} />
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-3 sm:p-4">
          <div className="my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
            {/* Cabeçalho do modal */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-xl font-bold">
                  {servicoEditando ? "Editar serviço" : "Novo serviço"}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {servicoEditando
                    ? "Atualize as informações do serviço."
                    : "Cadastre um novo serviço para sua barbearia."}
                </p>
              </div>

              <button
                type="button"
                onClick={fecharModal}
                aria-label="Fechar modal"
                className="shrink-0 rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nome */}
            <div className="mt-6">
              <label className="mb-2 block text-sm text-zinc-300">
                Nome do serviço
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Corte degradê"
                className="w-full min-w-0 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500"
              />
            </div>

            {/* Descrição */}
            <div className="mt-4">
              <label className="mb-2 block text-sm text-zinc-300">
                Descrição
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva o serviço..."
                rows={3}
                className="w-full resize-y rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500"
              />
            </div>

            {/* Preço e duração */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="min-w-0">
                <label className="mb-2 block text-sm text-zinc-300">
                  Preço
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  placeholder="30.00"
                  className="w-full min-w-0 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500"
                />
              </div>

              <div className="min-w-0">
                <label className="mb-2 block text-sm text-zinc-300">
                  Duração
                </label>
                <input
                  type="number"
                  min="1"
                  value={duracao}
                  onChange={(e) => setDuracao(e.target.value)}
                  placeholder="30"
                  className="w-full min-w-0 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500"
                />
                <p className="mt-1 text-xs text-zinc-600">minutos</p>
              </div>
            </div>

            {/* Erro dentro do modal */}
            {erro && (
              <p role="alert" className="mt-4 text-sm text-red-400">
                {erro}
              </p>
            )}

            {/* Botões */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={fecharModal}
                disabled={salvando}
                className="w-full rounded-lg border border-zinc-700 px-4 py-3 text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50 sm:flex-1"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={salvarServico}
                disabled={salvando}
                className="w-full rounded-lg bg-amber-500 px-4 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1"
              >
                {salvando
                  ? "Salvando..."
                  : servicoEditando
                    ? "Salvar alterações"
                    : "Cadastrar serviço"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Servicos;
