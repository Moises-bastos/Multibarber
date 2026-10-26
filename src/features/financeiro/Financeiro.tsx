import { useEffect, useState } from "react";
import {
  Wallet,
  TrendingUp,
  CalendarDays,
  Scissors,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { buscarMinhaBarbearia } from "../../utils/barbearia";

type Atendimento = {
  id: number;
  cliente: string;
  servico: string;
  valor: number;
  data: string;
};

function Financeiro() {
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [periodo, setPeriodo] = useState("mes");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarFinanceiro();
  }, []);

  async function carregarFinanceiro() {
    try {
      setCarregando(true);
      setErro("");

      const barbearia = await buscarMinhaBarbearia();

      const { data, error } = await supabase
        .from("agendamentos")
        .select(
          `
          id,
          data,
          horario,
          status,
          cliente:clientes(
            nome
          ),
          servico:servicos(
            nome,
            preco
          )
        `,
        )
        .eq("barbearia_id", barbearia.id)
        .eq("status", "confirmado")
        .order("data", { ascending: false })
        .order("horario", { ascending: false });

      if (error) {
        throw error;
      }

      const dados: Atendimento[] = (data ?? []).map((item: any) => ({
        id: item.id,
        cliente: item.cliente.nome,
        servico: item.servico.nome,
        valor: Number(item.servico.preco),
        data: item.data,
      }));

      setAtendimentos(dados);
    } catch (error) {
      console.error("ERRO AO CARREGAR FINANCEIRO:", error);
      setErro("Não foi possível carregar os dados financeiros.");
    } finally {
      setCarregando(false);
    }
  }

  function dataHoje() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
  }

  function atendimentosDoPeriodo() {
    const hoje = new Date();

    if (periodo === "hoje") {
      const hojeString = dataHoje();

      return atendimentos.filter(
        (atendimento) => atendimento.data === hojeString,
      );
    }

    if (periodo === "semana") {
      const inicioSemana = new Date(hoje);
      const diaSemana = inicioSemana.getDay();

      inicioSemana.setDate(hoje.getDate() - diaSemana);
      inicioSemana.setHours(0, 0, 0, 0);

      return atendimentos.filter((atendimento) => {
        const data = new Date(`${atendimento.data}T00:00:00`);

        return data >= inicioSemana && data <= hoje;
      });
    }

    return atendimentos.filter((atendimento) => {
      const [ano, mes] = atendimento.data.split("-").map(Number);

      return ano === hoje.getFullYear() && mes === hoje.getMonth() + 1;
    });
  }

  const atendimentosFiltrados = atendimentosDoPeriodo();

  const faturamentoTotal = atendimentosFiltrados.reduce(
    (total, atendimento) => total + atendimento.valor,
    0,
  );

  const faturamentoHoje = atendimentos
    .filter((atendimento) => atendimento.data === dataHoje())
    .reduce((total, atendimento) => total + atendimento.valor, 0);

  const quantidadeAtendimentos = atendimentosFiltrados.length;

  const ticketMedio =
    quantidadeAtendimentos > 0 ? faturamentoTotal / quantidadeAtendimentos : 0;

  function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarData(dataString: string) {
    const [ano, mes, dia] = dataString.split("-").map(Number);

    return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR");
  }

  const servicosResumo = atendimentosFiltrados.reduce(
    (acumulado, atendimento) => {
      const existente = acumulado.find(
        (item) => item.nome === atendimento.servico,
      );

      if (existente) {
        existente.valor += atendimento.valor;
        existente.quantidade += 1;
      } else {
        acumulado.push({
          nome: atendimento.servico,
          valor: atendimento.valor,
          quantidade: 1,
        });
      }

      return acumulado;
    },
    [] as {
      nome: string;
      valor: number;
      quantidade: number;
    }[],
  );

  const maiorValorServico =
    servicosResumo.length > 0
      ? Math.max(...servicosResumo.map((item) => item.valor))
      : 0;

  return (
    <div className="mx-auto w-full min-w-0 max-w-full p-4 sm:p-6 lg:p-8">
      {/* Cabeçalho */}
      <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="break-words text-sm text-zinc-400 sm:text-base">
            Acompanhe o desempenho financeiro da sua barbearia
          </p>

          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Financeiro</h1>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
          <button
            type="button"
            onClick={carregarFinanceiro}
            disabled={carregando}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300 transition hover:border-zinc-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <RefreshCw size={16} className={carregando ? "animate-spin" : ""} />

            {carregando ? "Atualizando..." : "Atualizar"}
          </button>

          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            aria-label="Selecionar período financeiro"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-amber-500 sm:w-auto"
          >
            <option value="hoje">Hoje</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mês</option>
          </select>
        </div>
      </header>

      {/* Erro */}
      {erro && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-900/50 bg-red-500/10 p-4 text-sm text-red-400"
        >
          {erro}
        </div>
      )}

      {carregando ? (
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center sm:p-10">
          <p className="text-zinc-400">Carregando financeiro...</p>
        </div>
      ) : (
        <>
          {/* Cards de indicadores */}
          <div className="mt-5 grid min-w-0 grid-cols-1 gap-3 sm:mt-7 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            {/* Faturamento */}
            <div className="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <Wallet size={22} />
                </div>

                <ArrowUpRight size={20} className="text-green-400" />
              </div>

              <p className="mt-5 text-sm text-zinc-500">Faturamento</p>

              <p className="mt-1 break-words text-xl font-bold sm:text-2xl">
                {formatarMoeda(faturamentoTotal)}
              </p>

              <p className="mt-2 text-xs text-zinc-500">Período selecionado</p>
            </div>

            {/* Faturamento de hoje */}
            <div className="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5 lg:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                <CalendarDays size={22} />
              </div>

              <p className="mt-5 text-sm text-zinc-500">Faturamento hoje</p>

              <p className="mt-1 break-words text-xl font-bold sm:text-2xl">
                {formatarMoeda(faturamentoHoje)}
              </p>

              <p className="mt-2 text-xs text-zinc-500">
                Atendimentos realizados hoje
              </p>
            </div>

            {/* Quantidade de atendimentos */}
            <div className="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5 lg:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Scissors size={22} />
              </div>

              <p className="mt-5 text-sm text-zinc-500">Atendimentos</p>

              <p className="mt-1 break-words text-xl font-bold sm:text-2xl">
                {quantidadeAtendimentos}
              </p>

              <p className="mt-2 text-xs text-zinc-500">Serviços concluídos</p>
            </div>

            {/* Ticket médio */}
            <div className="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5 lg:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <TrendingUp size={22} />
              </div>

              <p className="mt-5 text-sm text-zinc-500">Ticket médio</p>

              <p className="mt-1 break-words text-xl font-bold sm:text-2xl">
                {formatarMoeda(ticketMedio)}
              </p>

              <p className="mt-2 text-xs text-zinc-500">
                Valor médio por atendimento
              </p>
            </div>
          </div>

          {/* Conteúdo inferior */}
          <div className="mt-5 grid min-w-0 gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-3">
            {/* Atendimentos recentes */}
            <section className="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5 lg:p-6 xl:col-span-2">
              <div>
                <h2 className="break-words text-lg font-semibold sm:text-xl">
                  Atendimentos recentes
                </h2>

                <p className="mt-1 break-words text-sm text-zinc-500">
                  Serviços que geraram faturamento
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {atendimentosFiltrados.slice(0, 10).map((atendimento) => (
                  <div
                    key={atendimento.id}
                    className="flex min-w-0 flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
                  >
                    <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                        <Scissors size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="break-words font-medium">
                          {atendimento.cliente}
                        </p>

                        <p className="mt-1 break-words text-sm text-zinc-500">
                          {atendimento.servico}
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:shrink-0 sm:text-right">
                      <p className="break-words font-semibold text-green-400">
                        {formatarMoeda(atendimento.valor)}
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        {formatarData(atendimento.data)}
                      </p>
                    </div>
                  </div>
                ))}

                {atendimentosFiltrados.length === 0 && (
                  <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-950 p-6 text-center sm:p-8">
                    <Scissors size={32} className="mx-auto text-zinc-700" />

                    <p className="mt-3 text-zinc-500">
                      Nenhum atendimento concluído no período.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Resumo por serviço */}
            <section className="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5 lg:p-6">
              <h2 className="break-words text-lg font-semibold sm:text-xl">
                Resumo
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Distribuição dos serviços
              </p>

              <div className="mt-6 space-y-5">
                {servicosResumo.length === 0 ? (
                  <p className="text-sm text-zinc-500">
                    Nenhum serviço concluído no período.
                  </p>
                ) : (
                  servicosResumo.map((servico) => {
                    const porcentagem =
                      maiorValorServico > 0
                        ? (servico.valor / maiorValorServico) * 100
                        : 0;

                    return (
                      <div key={servico.nome} className="min-w-0">
                        <div className="flex min-w-0 items-start justify-between gap-3 text-sm">
                          <span className="min-w-0 break-words text-zinc-400">
                            {servico.nome}
                          </span>

                          <span className="shrink-0 font-medium">
                            {formatarMoeda(servico.valor)}
                          </span>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className="h-full rounded-full bg-amber-500"
                            style={{ width: `${porcentagem}%` }}
                          />
                        </div>

                        <p className="mt-1 text-xs text-zinc-600">
                          {servico.quantidade}{" "}
                          {servico.quantidade === 1
                            ? "atendimento"
                            : "atendimentos"}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

export default Financeiro;
