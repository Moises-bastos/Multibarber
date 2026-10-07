import { useEffect, useState } from "react";

import { supabase } from "../../lib/supabase";

import { buscarMinhaBarbearia } from "../../utils/barbearia";

function Dashboard() {
  const [nomeBarbearia, setNomeBarbearia] = useState("Minha Barbearia");

  const [agendamentosHoje, setAgendamentosHoje] = useState(0);

  const [clientes, setClientes] = useState(0);

  const [faturamentoHoje, setFaturamentoHoje] = useState(0);

  const [carregando, setCarregando] = useState(true);

  /*
   * Retorna a data atual no formato:
   * YYYY-MM-DD
   *
   * Usamos a data local do computador,
   * evitando problemas de fuso horário.
   */
  function obterDataHoje() {
    const hoje = new Date();

    const ano = hoje.getFullYear();

    const mes = String(hoje.getMonth() + 1).padStart(2, "0");

    const dia = String(hoje.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
  }

  /*
   * Formata o valor para Real brasileiro.
   */
  function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  useEffect(() => {
    async function carregarDashboard() {
      try {
        setCarregando(true);

        /*
         * Descobre qual é a barbearia
         * pertencente ao usuário logado.
         */
        const barbearia = await buscarMinhaBarbearia();

        setNomeBarbearia(barbearia.nome);

        const dataHoje = obterDataHoje();

        /*
         * Busca os três conjuntos de dados
         * ao mesmo tempo.
         */
        const [resultadoAgendamentos, resultadoClientes, resultadoFaturamento] =
          await Promise.all([
            /*
             * 1. Agendamentos de hoje
             *
             * Cancelados não entram na contagem.
             */
            supabase
              .from("agendamentos")
              .select("id", {
                count: "exact",
                head: true,
              })
              .eq("barbearia_id", barbearia.id)
              .eq("data", dataHoje)
              .in("status", ["agendado", "confirmado"]),

            /*
             * 2. Quantidade de clientes
             */
            supabase
              .from("clientes")
              .select("id", {
                count: "exact",
                head: true,
              })
              .eq("barbearia_id", barbearia.id),

            /*
             * 3. Faturamento de hoje
             *
             * Somente atendimentos confirmados
             * entram no faturamento.
             */
            supabase
              .from("agendamentos")
              .select(
                `
                servico:servicos(
                  preco
                )
              `,
              )
              .eq("barbearia_id", barbearia.id)
              .eq("data", dataHoje)
              .eq("status", "confirmado"),
          ]);

        /*
         * Verifica erro dos agendamentos.
         */
        if (resultadoAgendamentos.error) {
          throw resultadoAgendamentos.error;
        }

        /*
         * Verifica erro dos clientes.
         */
        if (resultadoClientes.error) {
          throw resultadoClientes.error;
        }

        /*
         * Verifica erro do faturamento.
         */
        if (resultadoFaturamento.error) {
          throw resultadoFaturamento.error;
        }

        /*
         * Atualiza quantidade de agendamentos.
         */
        setAgendamentosHoje(resultadoAgendamentos.count ?? 0);

        /*
         * Atualiza quantidade de clientes.
         */
        setClientes(resultadoClientes.count ?? 0);

        /*
         * Soma os preços dos serviços
         * dos atendimentos confirmados.
         */
        const totalFaturamento = (resultadoFaturamento.data ?? []).reduce(
          (total: number, agendamento: any) => {
            const servico = Array.isArray(agendamento.servico)
              ? agendamento.servico[0]
              : agendamento.servico;

            const preco = Number(servico?.preco ?? 0);

            return total + preco;
          },
          0,
        );

        setFaturamentoHoje(totalFaturamento);
      } catch (error) {
        console.error("Erro ao carregar Dashboard:", error);
      } finally {
        setCarregando(false);
      }
    }

    carregarDashboard();
  }, []);

  return (
    <div className="p-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-zinc-400">Bem-vindo de volta</p>

          <h1 className="mt-1 text-3xl font-bold">{nomeBarbearia}</h1>
        </div>

        <div className="rounded-full bg-zinc-900 px-4 py-2">
          {nomeBarbearia}
        </div>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Agendamentos */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-zinc-400">Agendamentos hoje</p>

          <h2 className="mt-3 text-3xl font-bold">
            {carregando ? "..." : agendamentosHoje}
          </h2>
        </div>

        {/* Clientes */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-zinc-400">Clientes</p>

          <h2 className="mt-3 text-3xl font-bold">
            {carregando ? "..." : clientes}
          </h2>
        </div>

        {/* Faturamento */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-zinc-400">Faturamento hoje</p>

          <h2 className="mt-3 text-3xl font-bold">
            {carregando ? "..." : formatarMoeda(faturamentoHoje)}
          </h2>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
