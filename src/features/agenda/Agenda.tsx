import { useEffect, useState } from "react";

import {
  CalendarDays,
  Check,
  Clock,
  Scissors,
  UserRound,
  X,
  RefreshCw,
  AlertTriangle,
  Ban,
  Plus,
  Trash2,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import { buscarMinhaBarbearia } from "../../utils/barbearia";

type Agendamento = {
  id: number;
  data: string;
  horario: string;
  status: "agendado" | "confirmado" | "cancelado";
  cliente: {
    nome: string;
    telefone: string;
  };
  servico: {
    nome: string;
    preco: number;
    duracao: number;
  };
};

type BloqueioAgenda = {
  id: number;
  data: string;
  hora_inicio: string | null;
  hora_fim: string | null;
  dia_inteiro: boolean;
  motivo: string | null;
};

type TipoBloqueio = "horario" | "dia";

function Agenda() {
  const [diaSelecionado, setDiaSelecionado] = useState(0);
  const [agendamentoSelecionado, setAgendamentoSelecionado] =
    useState<Agendamento | null>(null);

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [dias, setDias] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(true);

  /*
   * Bloqueios da agenda
   */
  const [bloqueios, setBloqueios] = useState<BloqueioAgenda[]>([]);
  const [carregandoBloqueios, setCarregandoBloqueios] = useState(false);

  /*
   * Modal de bloqueio
   */
  const [modalBloqueioAberto, setModalBloqueioAberto] = useState(false);
  const [dataBloqueio, setDataBloqueio] = useState("");
  const [tipoBloqueio, setTipoBloqueio] = useState<TipoBloqueio>("horario");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [motivo, setMotivo] = useState("");
  const [salvandoBloqueio, setSalvandoBloqueio] = useState(false);

  /*
   * Gera os próximos 7 dias.
   */
  function gerarProximosDias() {
    const datas: string[] = [];
    const hoje = new Date();

    for (let i = 0; i < 7; i++) {
      const data = new Date(hoje);

      data.setDate(hoje.getDate() + i);

      const ano = data.getFullYear();
      const mes = String(data.getMonth() + 1).padStart(2, "0");
      const dia = String(data.getDate()).padStart(2, "0");

      datas.push(`${ano}-${mes}-${dia}`);
    }

    return datas;
  }

  /*
   * Busca os agendamentos reais do Supabase.
   */
  async function carregarAgendamentos() {
    try {
      setCarregando(true);

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
              nome,
              telefone
            ),
            servico:servicos(
              nome,
              preco,
              duracao
            )
          `,
        )
        .eq("barbearia_id", barbearia.id)
        .order("data", { ascending: true })
        .order("horario", { ascending: true });

      if (error) {
        throw error;
      }

      const dados: Agendamento[] = (data ?? [])
        .filter(
          (item: any) =>
            item.status === "agendado" ||
            item.status === "confirmado" ||
            item.status === "cancelado",
        )
        .map((item: any) => ({
          id: item.id,
          data: item.data,
          horario: item.horario.slice(0, 5),
          status: item.status,
          cliente: item.cliente,
          servico: {
            ...item.servico,
            preco: Number(item.servico.preco),
            duracao: Number(item.servico.duracao),
          },
        }));

      setAgendamentos(dados);
    } catch (error) {
      console.error("ERRO AO CARREGAR AGENDA:", error);
    } finally {
      setCarregando(false);
    }
  }

  /*
   * Busca os bloqueios da data selecionada.
   */
  async function carregarBloqueios(data: string) {
    if (!data) {
      setBloqueios([]);
      return;
    }

    try {
      setCarregandoBloqueios(true);

      const barbearia = await buscarMinhaBarbearia();

      const { data: dados, error } = await supabase
        .from("bloqueios_agenda")
        .select(
          `
            id,
            data,
            hora_inicio,
            hora_fim,
            dia_inteiro,
            motivo
          `,
        )
        .eq("barbearia_id", barbearia.id)
        .eq("data", data)
        .order("hora_inicio", {
          ascending: true,
          nullsFirst: true,
        });

      if (error) {
        throw error;
      }

      setBloqueios(dados ?? []);
    } catch (error) {
      console.error("ERRO AO CARREGAR BLOQUEIOS:", error);
      setBloqueios([]);
    } finally {
      setCarregandoBloqueios(false);
    }
  }

  /*
   * Carrega a agenda quando a página abre.
   */
  useEffect(() => {
    const proximosDias = gerarProximosDias();

    setDias(proximosDias);

    carregarAgendamentos();
  }, []);

  /*
   * Quando o dia selecionado muda,
   * busca os bloqueios daquele dia.
   */
  useEffect(() => {
    if (dataAtual) {
      carregarBloqueios(dataAtual);
    }
  }, [diaSelecionado, dias]);

  /*
   * Altera o status do agendamento no Supabase.
   */
  async function alterarStatus(id: number, novoStatus: Agendamento["status"]) {
    try {
      const { error } = await supabase
        .from("agendamentos")
        .update({
          status: novoStatus,
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      setAgendamentos((atual) =>
        atual.map((agendamento) =>
          agendamento.id === id
            ? {
                ...agendamento,
                status: novoStatus,
              }
            : agendamento,
        ),
      );

      setAgendamentoSelecionado(null);
    } catch (error) {
      console.error("ERRO AO ALTERAR STATUS:", error);
    }
  }

  /*
   * Abre o modal para criar um bloqueio.
   *
   * IMPORTANTE:
   * Agora a data pode ser escolhida manualmente.
   */
  function abrirModalBloqueio() {
    setDataBloqueio(dataAtual || "");
    setTipoBloqueio("horario");
    setHoraInicio("");
    setHoraFim("");
    setMotivo("");

    setModalBloqueioAberto(true);
  }

  /*
   * Cria um bloqueio no Supabase.
   */
  async function criarBloqueio() {
    try {
      if (!dataBloqueio) {
        alert("Selecione a data do bloqueio.");
        return;
      }

      if (tipoBloqueio === "horario") {
        if (!horaInicio || !horaFim) {
          alert("Informe o horário inicial e final.");
          return;
        }

        if (horaInicio >= horaFim) {
          alert("O horário final deve ser maior que o horário inicial.");
          return;
        }
      }

      setSalvandoBloqueio(true);

      const barbearia = await buscarMinhaBarbearia();

      const { error } = await supabase.from("bloqueios_agenda").insert({
        barbearia_id: barbearia.id,
        data: dataBloqueio,
        hora_inicio: tipoBloqueio === "dia" ? null : horaInicio,
        hora_fim: tipoBloqueio === "dia" ? null : horaFim,
        dia_inteiro: tipoBloqueio === "dia",
        motivo: motivo.trim() || null,
      });

      if (error) {
        throw error;
      }

      setModalBloqueioAberto(false);

      /*
       * Se o bloqueio foi criado para o dia atualmente
       * selecionado, atualiza a lista imediatamente.
       */
      if (dataBloqueio === dataAtual) {
        await carregarBloqueios(dataBloqueio);
      }

      setHoraInicio("");
      setHoraFim("");
      setMotivo("");
    } catch (error) {
      console.error("ERRO AO CRIAR BLOQUEIO:", error);
      alert("Não foi possível criar o bloqueio.");
    } finally {
      setSalvandoBloqueio(false);
    }
  }

  /*
   * Remove um bloqueio.
   */
  async function excluirBloqueio(id: number) {
    const confirmar = window.confirm("Deseja realmente remover este bloqueio?");

    if (!confirmar) {
      return;
    }

    try {
      const { error } = await supabase
        .from("bloqueios_agenda")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      setBloqueios((atual) => atual.filter((bloqueio) => bloqueio.id !== id));
    } catch (error) {
      console.error("ERRO AO EXCLUIR BLOQUEIO:", error);
      alert("Não foi possível remover o bloqueio.");
    }
  }

  /*
   * Formata preço.
   */
  function formatarPreco(preco: number) {
    return preco.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  /*
   * Formata a data.
   */
  function formatarData(dataString: string) {
    const [ano, mes, dia] = dataString.split("-").map(Number);

    const data = new Date(ano, mes - 1, dia);

    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
    });
  }

  /*
   * Descobre o dia da semana.
   */
  function nomeDiaSemana(dataString: string) {
    const [ano, mes, dia] = dataString.split("-").map(Number);

    const data = new Date(ano, mes - 1, dia);

    return data.toLocaleDateString("pt-BR", {
      weekday: "long",
    });
  }

  /*
   * Capitaliza o primeiro caractere.
   */
  function primeiraMaiuscula(texto: string) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  /*
   * Texto do status.
   */
  function getStatusTexto(status: Agendamento["status"]) {
    switch (status) {
      case "agendado":
        return "Pendente";

      case "confirmado":
        return "Atendido";

      case "cancelado":
        return "Cancelado";

      default:
        return "";
    }
  }

  /*
   * Classes do status.
   */
  function getStatusClasses(status: Agendamento["status"]) {
    switch (status) {
      case "agendado":
        return "bg-amber-500/10 text-amber-400";

      case "confirmado":
        return "bg-green-500/10 text-green-400";

      case "cancelado":
        return "bg-red-500/10 text-red-400";

      default:
        return "bg-zinc-800 text-zinc-500";
    }
  }

  /*
   * Data selecionada.
   */
  const dataAtual = dias[diaSelecionado];

  /*
   * Agendamentos daquele dia.
   */
  const agendamentosDoDia = agendamentos.filter(
    (agendamento) => agendamento.data === dataAtual,
  );

  /*
   * Quantidade de atendimentos do dia.
   */
  const quantidadeAtendimentos = agendamentosDoDia.filter(
    (agendamento) => agendamento.status !== "cancelado",
  ).length;

  /*
   * Lista de horários usados no dia.
   */
  const horariosDoDia = agendamentosDoDia;

  return (
    <div className="p-8">
      {/* Cabeçalho */}
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-zinc-400">Organize os horários da sua barbearia</p>

          <h1 className="mt-1 text-3xl font-bold">Agenda</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={abrirModalBloqueio}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-400"
          >
            <Ban size={16} />
            Bloquear horário
          </button>

          <button
            type="button"
            onClick={carregarAgendamentos}
            className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-700 hover:text-white"
          >
            <RefreshCw size={16} />
            Atualizar
          </button>
        </div>
      </header>

      {/* Seleção de dias */}
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
        {dias.map((data, index) => {
          const diaSemana = primeiraMaiuscula(nomeDiaSemana(data));

          return (
            <button
              key={data}
              type="button"
              onClick={() => setDiaSelecionado(index)}
              className={`rounded-xl border p-4 text-left transition ${
                diaSelecionado === index
                  ? "border-amber-500 bg-amber-500 text-black"
                  : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-white"
              }`}
            >
              <p className="text-sm">{diaSemana}</p>

              <p className="mt-1 font-semibold">{formatarData(data)}</p>
            </button>
          );
        })}
      </div>

      {/* Data atual */}
      {dataAtual && (
        <div className="mt-6 flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <CalendarDays size={20} />
            </div>

            <div>
              <p className="text-sm text-zinc-500">Agenda de</p>

              <p className="font-semibold">
                {primeiraMaiuscula(nomeDiaSemana(dataAtual))},{" "}
                {formatarData(dataAtual)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Clock size={16} />

            <span>
              {quantidadeAtendimentos}{" "}
              {quantidadeAtendimentos === 1 ? "atendimento" : "atendimentos"}
            </span>
          </div>
        </div>
      )}

      {/* Bloqueios do dia */}
      {dataAtual && (
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                <Ban size={19} />
              </div>

              <div>
                <h2 className="font-semibold">Bloqueios do dia</h2>

                <p className="text-sm text-zinc-500">
                  Horários em que novos agendamentos não serão permitidos.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={abrirModalBloqueio}
              className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              <Plus size={16} />
              Adicionar bloqueio
            </button>
          </div>

          {carregandoBloqueios ? (
            <p className="mt-5 text-sm text-zinc-500">
              Carregando bloqueios...
            </p>
          ) : bloqueios.length === 0 ? (
            <div className="mt-5 rounded-lg border border-dashed border-zinc-800 p-5 text-center">
              <p className="text-sm text-zinc-600">
                Nenhum bloqueio para este dia.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-2">
              {bloqueios.map((bloqueio) => (
                <div
                  key={bloqueio.id}
                  className="flex flex-col gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Ban size={18} className="shrink-0 text-red-400" />

                    <div>
                      <p className="font-medium text-red-300">
                        {bloqueio.dia_inteiro
                          ? "Dia inteiro bloqueado"
                          : `${bloqueio.hora_inicio?.slice(
                              0,
                              5,
                            )} às ${bloqueio.hora_fim?.slice(0, 5)}`}
                      </p>

                      {bloqueio.motivo && (
                        <p className="mt-1 text-sm text-zinc-500">
                          {bloqueio.motivo}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => excluirBloqueio(bloqueio.id)}
                    className="flex items-center justify-center gap-2 rounded-lg border border-red-900/50 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                  >
                    <Trash2 size={15} />
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Carregando */}
      {carregando && (
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-500">
          Carregando agendamentos...
        </div>
      )}

      {/* Agenda */}
      {!carregando && (
        <div className="mt-6 space-y-3">
          {horariosDoDia.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-950 p-10 text-center">
              <Clock size={32} className="mx-auto text-zinc-700" />

              <p className="mt-3 font-medium text-zinc-500">
                Nenhum agendamento
              </p>

              <p className="mt-1 text-sm text-zinc-600">
                Não existem atendimentos marcados para este dia.
              </p>
            </div>
          ) : (
            horariosDoDia.map((agendamento) => (
              <div
                key={agendamento.id}
                className={`flex flex-col gap-4 rounded-xl border p-5 md:flex-row md:items-center md:justify-between ${
                  agendamento.status === "cancelado"
                    ? "border-red-900/30 bg-zinc-950 opacity-60"
                    : agendamento.status === "agendado"
                      ? "border-amber-500/40 bg-amber-500/5"
                      : "border-zinc-800 bg-zinc-900"
                }`}
              >
                {/* Horário + informações */}
                <div className="flex items-center gap-6">
                  <span className="w-16 text-lg font-semibold">
                    {agendamento.horario}
                  </span>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                      <UserRound size={18} />
                    </div>

                    <div>
                      <p className="font-medium">{agendamento.cliente.nome}</p>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                        <Scissors size={14} />

                        <span>{agendamento.servico.nome}</span>

                        <span>•</span>

                        <span>{formatarPreco(agendamento.servico.preco)}</span>

                        <span>•</span>

                        <span>{agendamento.servico.duracao} min</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status / ação */}
                {agendamento.status === "agendado" ? (
                  <button
                    type="button"
                    onClick={() => setAgendamentoSelecionado(agendamento)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-semibold text-black shadow-lg shadow-green-500/10 transition hover:bg-green-400"
                  >
                    <Check size={17} />
                    Confirmar atendimento
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAgendamentoSelecionado(agendamento)}
                    className={`rounded-full px-3 py-1 text-sm transition hover:opacity-80 ${getStatusClasses(
                      agendamento.status,
                    )}`}
                  >
                    {getStatusTexto(agendamento.status)}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal de agendamento */}
      {agendamentoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            {/* Cabeçalho */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">Agendamento</h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Gerencie este atendimento
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAgendamentoSelecionado(null)}
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Informações */}
            <div className="mt-6 space-y-4">
              {/* Cliente */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-sm text-zinc-500">Cliente</p>

                <p className="mt-1 font-semibold">
                  {agendamentoSelecionado.cliente.nome}
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  {agendamentoSelecionado.cliente.telefone}
                </p>
              </div>

              {/* Horário e valor */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-sm text-zinc-500">Horário</p>

                  <p className="mt-1 font-semibold">
                    {agendamentoSelecionado.horario}
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-sm text-zinc-500">Valor</p>

                  <p className="mt-1 font-semibold text-amber-500">
                    {formatarPreco(agendamentoSelecionado.servico.preco)}
                  </p>
                </div>
              </div>

              {/* Serviço */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-sm text-zinc-500">Serviço</p>

                <p className="mt-1 font-semibold">
                  {agendamentoSelecionado.servico.nome}
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  Duração: {agendamentoSelecionado.servico.duracao} minutos
                </p>
              </div>

              {/* Aviso */}
              {agendamentoSelecionado.status === "agendado" && (
                <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <AlertTriangle
                    size={20}
                    className="mt-0.5 shrink-0 text-amber-400"
                  />

                  <div>
                    <p className="font-semibold text-amber-400">Atenção</p>

                    <p className="mt-1 text-sm leading-relaxed text-amber-200/80">
                      Confirme somente depois de realizar o corte. Ao confirmar,
                      este atendimento será registrado no histórico do cliente e
                      no financeiro.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="mt-6 space-y-3">
              {agendamentoSelecionado.status === "agendado" && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      alterarStatus(agendamentoSelecionado.id, "confirmado")
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-3 font-semibold text-black transition hover:bg-green-400"
                  >
                    <Check size={18} />
                    Confirmar atendimento
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      alterarStatus(agendamentoSelecionado.id, "cancelado")
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-900/50 px-4 py-3 text-red-400 transition hover:bg-red-500/10"
                  >
                    <X size={18} />
                    Cancelar agendamento
                  </button>
                </>
              )}

              {agendamentoSelecionado.status === "confirmado" && (
                <div className="flex items-center justify-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-green-400">
                  <Check size={18} />
                  Atendimento realizado
                </div>
              )}

              {agendamentoSelecionado.status === "cancelado" && (
                <div className="flex items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400">
                  <X size={18} />
                  Agendamento cancelado
                </div>
              )}

              <button
                type="button"
                onClick={() => setAgendamentoSelecionado(null)}
                className="w-full rounded-lg border border-zinc-700 px-4 py-3 text-zinc-300 transition hover:bg-zinc-800"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de bloqueio */}
      {modalBloqueioAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            {/* Cabeçalho */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">Bloquear agenda</h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Impedir novos agendamentos em um período.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalBloqueioAberto(false)}
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Data */}
            <div className="mt-6">
              <label className="text-sm font-medium text-zinc-300">Data</label>

              <input
                type="date"
                value={dataBloqueio}
                onChange={(event) => setDataBloqueio(event.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-white outline-none transition focus:border-amber-500"
              />
            </div>

            {/* Tipo */}
            <div className="mt-5">
              <label className="text-sm font-medium text-zinc-300">
                Tipo de bloqueio
              </label>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTipoBloqueio("horario")}
                  className={`rounded-lg border px-3 py-3 text-sm transition ${
                    tipoBloqueio === "horario"
                      ? "border-amber-500 bg-amber-500/10 text-amber-400"
                      : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <Clock size={17} className="mx-auto mb-1" />
                  Horário
                </button>

                <button
                  type="button"
                  onClick={() => setTipoBloqueio("dia")}
                  className={`rounded-lg border px-3 py-3 text-sm transition ${
                    tipoBloqueio === "dia"
                      ? "border-amber-500 bg-amber-500/10 text-amber-400"
                      : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <Ban size={17} className="mx-auto mb-1" />
                  Dia inteiro
                </button>
              </div>
            </div>

            {/* Horários */}
            {tipoBloqueio === "horario" && (
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Início
                  </label>

                  <input
                    type="time"
                    value={horaInicio}
                    onChange={(event) => setHoraInicio(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-white outline-none transition focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-300">
                    Fim
                  </label>

                  <input
                    type="time"
                    value={horaFim}
                    onChange={(event) => setHoraFim(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-white outline-none transition focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {/* Motivo */}
            <div className="mt-5">
              <label className="text-sm font-medium text-zinc-300">
                Motivo <span className="text-zinc-600">(opcional)</span>
              </label>

              <input
                type="text"
                value={motivo}
                onChange={(event) => setMotivo(event.target.value)}
                placeholder="Ex.: Almoço, médico, compromisso..."
                maxLength={200}
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-white placeholder:text-zinc-600 outline-none transition focus:border-amber-500"
              />
            </div>

            {/* Informação */}
            <div className="mt-5 flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0 text-amber-400"
              />

              <p className="text-sm leading-relaxed text-zinc-400">
                Clientes não poderão agendar horários que coincidam com este
                bloqueio.
              </p>
            </div>

            {/* Ações */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setModalBloqueioAberto(false)}
                className="flex-1 rounded-lg border border-zinc-700 px-4 py-3 text-zinc-300 transition hover:bg-zinc-800"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={criarBloqueio}
                disabled={salvandoBloqueio}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {salvandoBloqueio ? (
                  "Salvando..."
                ) : (
                  <>
                    <Ban size={17} />
                    Bloquear
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Agenda;
