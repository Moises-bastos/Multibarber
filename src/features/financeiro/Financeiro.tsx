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

      /*
       * Financeiro considera apenas
       * atendimentos concluídos.
       */
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
        .order("data", {
          ascending: false,
        })
        .order("horario", {
          ascending: false,
        });

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

  /*
   * Data de hoje no formato YYYY-MM-DD.
   */
  function dataHoje() {
    const hoje = new Date();

    const ano = hoje.getFullYear();

    const mes = String(hoje.getMonth() + 1).padStart(2, "0");

    const dia = String(hoje.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
  }

  /*
   * Filtra os atendimentos conforme
   * o período selecionado.
   */
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

    /*
     * Mês atual.
     */
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

  /*
   * Calcula o faturamento por serviço.
   */
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
    <div className="p-8">
      {/* Cabeçalho */}
      <header className="flex items-end justify-between">
        <div>
          <p className="text-zinc-400">
            Acompanhe o desempenho financeiro da sua barbearia
          </p>

          <h1 className="mt-1 text-3xl font-bold">Financeiro</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={carregarFinanceiro}
            className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300 transition hover:border-zinc-700 hover:text-white"
          >
            <RefreshCw size={16} />
            Atualizar
          </button>

          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-amber-500"
          >
            <option value="hoje">Hoje</option>

            <option value="semana">Esta semana</option>

            <option value="mes">Este mês</option>
          </select>
        </div>
      </header>

      {erro && (
        <div className="mt-6 rounded-xl border border-red-900/50 bg-red-500/10 p-4 text-sm text-red-400">
          {erro}
        </div>
      )}

      {carregando ? (
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
          <p className="text-zinc-400">Carregando financeiro...</p>
        </div>
      ) : (
        <>
          {/* Cards */}
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {/* Faturamento */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <Wallet size={22} />
                </div>

                <ArrowUpRight size={20} className="text-green-400" />
              </div>

              <p className="mt-5 text-sm text-zinc-500">Faturamento</p>

              <p className="mt-1 text-2xl font-bold">
                {formatarMoeda(faturamentoTotal)}
              </p>

              <p className="mt-2 text-xs text-zinc-500">Período selecionado</p>
            </div>

            {/* Hoje */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                <CalendarDays size={22} />
              </div>

              <p className="mt-5 text-sm text-zinc-500">Faturamento hoje</p>

              <p className="mt-1 text-2xl font-bold">
                {formatarMoeda(faturamentoHoje)}
              </p>

              <p className="mt-2 text-xs text-zinc-500">
                Atendimentos realizados hoje
              </p>
            </div>

            {/* Atendimentos */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Scissors size={22} />
              </div>

              <p className="mt-5 text-sm text-zinc-500">Atendimentos</p>

              <p className="mt-1 text-2xl font-bold">
                {quantidadeAtendimentos}
              </p>

              <p className="mt-2 text-xs text-zinc-500">Serviços concluídos</p>
            </div>

            {/* Ticket médio */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <TrendingUp size={22} />
              </div>

              <p className="mt-5 text-sm text-zinc-500">Ticket médio</p>

              <p className="mt-1 text-2xl font-bold">
                {formatarMoeda(ticketMedio)}
              </p>

              <p className="mt-2 text-xs text-zinc-500">
                Valor médio por atendimento
              </p>
            </div>
          </div>

          {/* Conteúdo inferior */}
          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            {/* Atendimentos recentes */}
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 xl:col-span-2">
              <div>
                <h2 className="text-xl font-semibold">Atendimentos recentes</h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Serviços que geraram faturamento
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {atendimentosFiltrados.slice(0, 10).map((atendimento) => (
                  <div
                    key={atendimento.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                        <Scissors size={18} />
                      </div>

                      <div>
                        <p className="font-medium">{atendimento.cliente}</p>

                        <p className="mt-1 text-sm text-zinc-500">
                          {atendimento.servico}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-green-400">
                        {formatarMoeda(atendimento.valor)}
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">
                        {formatarData(atendimento.data)}
                      </p>
                    </div>
                  </div>
                ))}

                {atendimentosFiltrados.length === 0 && (
                  <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-950 p-8 text-center">
                    <Scissors size={32} className="mx-auto text-zinc-700" />

                    <p className="mt-3 text-zinc-500">
                      Nenhum atendimento concluído no período.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Resumo */}
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-xl font-semibold">Resumo</h2>

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
                      <div key={servico.nome}>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">{servico.nome}</span>

                          <span className="font-medium">
                            {formatarMoeda(servico.valor)}
                          </span>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className="h-full rounded-full bg-amber-500"
                            style={{
                              width: `${porcentagem}%`,
                            }}
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
