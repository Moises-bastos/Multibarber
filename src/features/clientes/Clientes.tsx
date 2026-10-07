import { useEffect, useState } from "react";

import { Search, UserRound, Phone, CalendarDays, X } from "lucide-react";

import { supabase } from "../../lib/supabase";
import { buscarMinhaBarbearia } from "../../utils/barbearia";

type Atendimento = {
  id: number;
  data: string;
  servico: string;
  valor: number;
};

type Cliente = {
  id: number;
  nome: string;
  telefone: string;
  visitas: number;
  ultimoAtendimento: string;
  historico: Atendimento[];
};

type ClienteBanco = {
  id: number;
  nome: string;
  telefone: string;
  created_at: string;
};

type AgendamentoBanco = {
  id: number;
  cliente_id: number;
  data: string;
  horario: string;
  status: string;
  servico: {
    nome: string;
    preco: number;
  };
};

function Clientes() {
  const [busca, setBusca] = useState("");

  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(
    null,
  );

  const [carregando, setCarregando] = useState(true);

  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarClientes();
  }, []);

  async function carregarClientes() {
    try {
      setCarregando(true);
      setErro("");

      const barbearia = await buscarMinhaBarbearia();

      /*
       * Busca os clientes da barbearia.
       */
      const { data: clientesData, error: clientesError } = await supabase
        .from("clientes")
        .select("*")
        .eq("barbearia_id", barbearia.id)
        .order("nome", {
          ascending: true,
        });

      if (clientesError) {
        throw clientesError;
      }

      /*
       * Busca os atendimentos concluídos.
       *
       * Somente "concluido" conta como visita.
       */
      const { data: agendamentosData, error: agendamentosError } =
        await supabase
          .from("agendamentos")
          .select(
            `
                    id,
                    cliente_id,
                    data,
                    horario,
                    status,
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

      if (agendamentosError) {
        throw agendamentosError;
      }

      const clientesBanco = (clientesData || []) as ClienteBanco[];

      const agendamentos = (agendamentosData ||
        []) as unknown as AgendamentoBanco[];

      /*
       * Monta os dados completos de cada cliente.
       */
      const clientesFormatados: Cliente[] = clientesBanco.map((cliente) => {
        const atendimentosCliente = agendamentos.filter(
          (agendamento) => agendamento.cliente_id === cliente.id,
        );

        const historico: Atendimento[] = atendimentosCliente.map(
          (agendamento) => ({
            id: agendamento.id,
            data: formatarData(agendamento.data),
            servico: agendamento.servico.nome,
            valor: Number(agendamento.servico.preco),
          }),
        );

        return {
          id: cliente.id,
          nome: cliente.nome,
          telefone: cliente.telefone,

          visitas: historico.length,

          ultimoAtendimento:
            historico.length > 0 ? historico[0].data : "Nenhum atendimento",

          historico,
        };
      });

      setClientes(clientesFormatados);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);

      setErro("Não foi possível carregar os clientes.");
    } finally {
      setCarregando(false);
    }
  }

  function formatarData(dataString: string) {
    const [ano, mes, dia] = dataString.split("-").map(Number);

    const data = new Date(ano, mes - 1, dia);

    return data.toLocaleDateString("pt-BR");
  }

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.telefone.includes(busca),
  );

  return (
    <div className="p-8">
      {/* Cabeçalho */}
      <header>
        <p className="text-zinc-400">Gerencie os clientes da sua barbearia</p>

        <h1 className="mt-1 text-3xl font-bold">Clientes</h1>
      </header>

      {/* Busca */}
      <div className="relative mt-8 max-w-xl">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
        />

        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou telefone..."
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pl-12 pr-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500"
        />
      </div>

      {/* Erro */}
      {erro && (
        <p className="mt-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-400">
          {erro}
        </p>
      )}

      {/* Contador */}
      <div className="mt-6">
        <p className="text-sm text-zinc-500">
          {clientesFiltrados.length}{" "}
          {clientesFiltrados.length === 1
            ? "cliente encontrado"
            : "clientes encontrados"}
        </p>
      </div>

      {/* Lista */}
      <div className="mt-4 space-y-3">
        {carregando ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
            <p className="text-zinc-400">Carregando clientes...</p>
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900 p-10 text-center">
            <UserRound size={40} className="mx-auto text-zinc-600" />

            <h2 className="mt-4 text-xl font-semibold">
              Nenhum cliente encontrado
            </h2>

            <p className="mt-2 text-zinc-500">
              Os clientes aparecerão aqui quando realizarem um agendamento.
            </p>
          </div>
        ) : (
          clientesFiltrados.map((cliente) => (
            <div
              key={cliente.id}
              onClick={() => setClienteSelecionado(cliente)}
              className="flex cursor-pointer items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-zinc-700 hover:bg-zinc-800/80"
            >
              {/* Informações */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                  <UserRound size={22} />
                </div>

                <div>
                  <h2 className="font-semibold">{cliente.nome}</h2>

                  <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
                    <Phone size={14} />

                    <span>{cliente.telefone}</span>
                  </div>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-lg font-semibold text-amber-500">
                    {cliente.visitas}
                  </p>

                  <p className="text-xs text-zinc-500">
                    {cliente.visitas === 1 ? "visita" : "visitas"}
                  </p>
                </div>

                <div className="hidden text-right sm:block">
                  <div className="flex items-center justify-end gap-2 text-sm text-zinc-500">
                    <CalendarDays size={15} />

                    <span>Último atendimento</span>
                  </div>

                  <p className="mt-1 text-sm font-medium text-zinc-300">
                    {cliente.ultimoAtendimento}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {clienteSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            {/* Cabeçalho */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {clienteSelecionado.nome}
                </h2>

                <p className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
                  <Phone size={15} />

                  {clienteSelecionado.telefone}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setClienteSelecionado(null)}
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Resumo */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              {/* Visitas */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                <p className="text-sm text-zinc-500">Visitas</p>

                <p className="mt-2 text-2xl font-bold text-amber-500">
                  {clienteSelecionado.visitas}
                </p>
              </div>

              {/* Total gasto */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                <p className="text-sm text-zinc-500">Total gasto</p>

                <p className="mt-2 text-2xl font-bold text-green-400">
                  {clienteSelecionado.historico
                    .reduce(
                      (total, atendimento) => total + atendimento.valor,
                      0,
                    )
                    .toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                </p>
              </div>
            </div>

            {/* Histórico */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold">
                Histórico de atendimentos
              </h3>

              <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
                {clienteSelecionado.historico.length === 0 ? (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-center">
                    <p className="text-sm text-zinc-500">
                      Nenhum atendimento registrado ainda.
                    </p>
                  </div>
                ) : (
                  clienteSelecionado.historico.map((atendimento) => (
                    <div
                      key={atendimento.id}
                      className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                    >
                      <div>
                        <p className="font-medium">{atendimento.servico}</p>

                        <p className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
                          <CalendarDays size={14} />

                          {atendimento.data}
                        </p>
                      </div>

                      <span className="font-semibold text-amber-500">
                        {atendimento.valor.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clientes;
