import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  CalendarDays,
  Check,
  Clock,
  MapPin,
  Phone,
  Scissors,
  User,
  X,
  Search,
  RefreshCw,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";

type Servico = {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  duracao: number;
};

type Dia = {
  nome: string;
  data: string;
  aberto: boolean;
};

type Barbearia = {
  id: string;
  nome: string;
  telefone: string | null;
  descricao: string | null;
  slug: string;
};

type AgendamentoCriado = {
  id: number;
  codigo_cancelamento: string;
};

type AgendamentoConsultado = {
  agendamento_id: number;
  servico: string;
  data: string;
  horario: string;
  status: string;
  preco: number;
};

type HorarioFuncionamento = {
  dia_semana: number;
  aberto: boolean;
  hora_inicio: string | null;
  hora_fim: string | null;
};

type HorarioOcupado = {
  horario: string;
  duracao: number;
};

type BloqueioAgenda = {
  hora_inicio: string | null;
  hora_fim: string | null;
  dia_inteiro: boolean;
};

function PublicBarber() {
  const { slug } = useParams();

  const [barbearia, setBarbearia] = useState<Barbearia | null>(null);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(
    null,
  );

  const [diaSelecionado, setDiaSelecionado] = useState<Dia | null>(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState("");

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");

  const [telefoneConsulta, setTelefoneConsulta] = useState("");
  const [agendamentosConsultados, setAgendamentosConsultados] = useState<
    AgendamentoConsultado[]
  >([]);
  const [consultouAgendamentos, setConsultouAgendamentos] = useState(false);
  const [consultandoAgendamentos, setConsultandoAgendamentos] = useState(false);
  const [cancelandoConsultaId, setCancelandoConsultaId] = useState<
    number | null
  >(null);
  const [erroConsulta, setErroConsulta] = useState("");
  const [mensagemConsulta, setMensagemConsulta] = useState("");

  const [horariosOcupados, setHorariosOcupados] = useState<HorarioOcupado[]>(
    [],
  );

  const [bloqueiosAgenda, setBloqueiosAgenda] = useState<BloqueioAgenda[]>([]);

  const [horariosFuncionamento, setHorariosFuncionamento] = useState<
    HorarioFuncionamento[]
  >([]);

  const [agendamentoCriado, setAgendamentoCriado] =
    useState<AgendamentoCriado | null>(null);

  const [carregando, setCarregando] = useState(true);
  const [carregandoFuncionamento, setCarregandoFuncionamento] = useState(true);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);

  const [agendando, setAgendando] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  const [cancelado, setCancelado] = useState(false);
  const [erro, setErro] = useState("");

  const nomesDias = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];

  function horarioParaMinutos(horario: string): number {
    const [hora, minuto] = horario.slice(0, 5).split(":").map(Number);
    return hora * 60 + minuto;
  }

  function minutosParaHorario(minutos: number): string {
    const hora = Math.floor(minutos / 60);
    const minuto = minutos % 60;

    return `${String(hora).padStart(2, "0")}:${String(minuto).padStart(
      2,
      "0",
    )}`;
  }

  function gerarDias(): Dia[] {
    const dias: Dia[] = [];
    const hoje = new Date();

    for (let i = 0; i < 7; i++) {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() + i);

      const ano = data.getFullYear();
      const mes = String(data.getMonth() + 1).padStart(2, "0");
      const dia = String(data.getDate()).padStart(2, "0");
      const dataFormatada = `${ano}-${mes}-${dia}`;
      const diaSemana = data.getDay();

      const funcionamento = horariosFuncionamento.find(
        (horario) => horario.dia_semana === diaSemana,
      );

      dias.push({
        nome: nomesDias[diaSemana],
        data: dataFormatada,
        aberto: funcionamento?.aberto ?? false,
      });
    }

    return dias;
  }

  const dias = gerarDias();

  function existeConflito(
    inicioCandidato: number,
    fimCandidato: number,
    inicioOcupado: number,
    fimOcupado: number,
  ): boolean {
    return inicioCandidato < fimOcupado && fimCandidato > inicioOcupado;
  }

  function horarioEstaBloqueado(
    inicioCandidato: number,
    fimCandidato: number,
  ): boolean {
    return bloqueiosAgenda.some((bloqueio) => {
      if (bloqueio.dia_inteiro) {
        return true;
      }

      if (!bloqueio.hora_inicio || !bloqueio.hora_fim) {
        return false;
      }

      const inicioBloqueio = horarioParaMinutos(bloqueio.hora_inicio);
      const fimBloqueio = horarioParaMinutos(bloqueio.hora_fim);

      return existeConflito(
        inicioCandidato,
        fimCandidato,
        inicioBloqueio,
        fimBloqueio,
      );
    });
  }

  function horarioEstaOcupado(
    inicioCandidato: number,
    fimCandidato: number,
  ): boolean {
    return horariosOcupados.some((agendamento) => {
      const inicioOcupado = horarioParaMinutos(agendamento.horario);
      const fimOcupado = inicioOcupado + agendamento.duracao;

      return existeConflito(
        inicioCandidato,
        fimCandidato,
        inicioOcupado,
        fimOcupado,
      );
    });
  }

  function gerarHorariosDisponiveis(): string[] {
    if (!diaSelecionado || !servicoSelecionado) {
      return [];
    }

    const data = new Date(`${diaSelecionado.data}T12:00:00`);
    const diaSemana = data.getDay();

    const funcionamento = horariosFuncionamento.find(
      (horario) => horario.dia_semana === diaSemana,
    );

    if (
      !funcionamento ||
      !funcionamento.aberto ||
      !funcionamento.hora_inicio ||
      !funcionamento.hora_fim
    ) {
      return [];
    }

    const inicio = horarioParaMinutos(funcionamento.hora_inicio);
    const fim = horarioParaMinutos(funcionamento.hora_fim);
    const horariosGerados: string[] = [];
    const INTERVALO_GRADE = 5;

    for (
      let minutos = inicio;
      minutos + servicoSelecionado.duracao <= fim;
      minutos += INTERVALO_GRADE
    ) {
      const fimDoServico = minutos + servicoSelecionado.duracao;

      if (horarioEstaOcupado(minutos, fimDoServico)) {
        continue;
      }

      if (horarioEstaBloqueado(minutos, fimDoServico)) {
        continue;
      }

      horariosGerados.push(minutosParaHorario(minutos));
    }

    return horariosGerados;
  }

  useEffect(() => {
    carregarBarbearia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function carregarBarbearia() {
    try {
      setCarregando(true);
      setCarregandoFuncionamento(true);
      setErro("");

      if (!slug) {
        setErro("Barbearia não encontrada.");
        return;
      }

      const { data, error } = await supabase.rpc("buscar_barbearia_publica", {
        p_slug: slug,
      });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        setErro("Barbearia não encontrada.");
        return;
      }

      const barbeariaEncontrada = data[0] as Barbearia;
      setBarbearia(barbeariaEncontrada);

      await carregarHorariosFuncionamento(barbeariaEncontrada.id);
      await carregarServicos(barbeariaEncontrada.id);
    } catch (error) {
      console.error("ERRO AO CARREGAR BARBEARIA:", error);

      if (error && typeof error === "object" && "message" in error) {
        setErro(String(error.message));
      } else {
        setErro("Não foi possível carregar a barbearia.");
      }
    } finally {
      setCarregando(false);
    }
  }

  async function carregarHorariosFuncionamento(barbeariaId: string) {
    try {
      setCarregandoFuncionamento(true);

      const { data, error } = await supabase.rpc(
        "buscar_horarios_funcionamento_publico",
        {
          p_barbearia_id: barbeariaId,
        },
      );

      if (error) {
        throw error;
      }

      setHorariosFuncionamento((data || []) as HorarioFuncionamento[]);
    } catch (error) {
      console.error("ERRO AO CARREGAR HORÁRIOS DE FUNCIONAMENTO:", error);
      throw error;
    } finally {
      setCarregandoFuncionamento(false);
    }
  }

  async function carregarServicos(barbeariaId: string) {
    const { data, error } = await supabase
      .from("servicos")
      .select("id, nome, descricao, preco, duracao")
      .eq("barbearia_id", barbeariaId)
      .eq("ativo", true)
      .order("nome");

    if (error) {
      throw error;
    }

    setServicos((data || []) as Servico[]);
  }

  async function carregarHorariosOcupados(data: string) {
    if (!barbearia || !servicoSelecionado) {
      return;
    }

    try {
      const { data: horariosBanco, error } = await supabase.rpc(
        "buscar_horarios_ocupados",
        {
          p_barbearia_id: barbearia.id,
          p_data: data,
          p_servico_id: servicoSelecionado.id,
        },
      );

      if (error) {
        throw error;
      }

      const horarios: HorarioOcupado[] = (horariosBanco || []).map(
        (item: { horario: string; duracao: number }) => ({
          horario: item.horario.substring(0, 5),
          duracao: Number(item.duracao),
        }),
      );

      setHorariosOcupados(horarios);
    } catch (error) {
      console.error("ERRO AO CARREGAR HORÁRIOS:", error);

      if (error && typeof error === "object" && "message" in error) {
        setErro(String(error.message));
      } else {
        setErro("Não foi possível verificar os horários.");
      }
    }
  }

  async function carregarBloqueios(data: string) {
    if (!barbearia) {
      return;
    }

    try {
      const { data: bloqueiosBanco, error } = await supabase.rpc(
        "buscar_bloqueios_publicos",
        {
          p_barbearia_id: barbearia.id,
          p_data: data,
        },
      );

      if (error) {
        throw error;
      }

      const bloqueios: BloqueioAgenda[] = (bloqueiosBanco || []).map(
        (item: {
          hora_inicio: string | null;
          hora_fim: string | null;
          dia_inteiro: boolean;
        }) => ({
          hora_inicio: item.hora_inicio
            ? item.hora_inicio.substring(0, 5)
            : null,
          hora_fim: item.hora_fim ? item.hora_fim.substring(0, 5) : null,
          dia_inteiro: item.dia_inteiro,
        }),
      );

      setBloqueiosAgenda(bloqueios);
    } catch (error) {
      console.error("ERRO AO CARREGAR BLOQUEIOS:", error);

      if (error && typeof error === "object" && "message" in error) {
        setErro(String(error.message));
      } else {
        setErro("Não foi possível verificar os bloqueios.");
      }
    }
  }

  async function carregarDisponibilidade(data: string) {
    try {
      setCarregandoHorarios(true);
      setErro("");

      await Promise.all([
        carregarHorariosOcupados(data),
        carregarBloqueios(data),
      ]);
    } finally {
      setCarregandoHorarios(false);
    }
  }

  function selecionarDia(dia: Dia) {
    if (!dia.aberto) {
      return;
    }

    setDiaSelecionado(dia);
    setHorarioSelecionado("");
    setErro("");
    carregarDisponibilidade(dia.data);
  }

  useEffect(() => {
    if (diaSelecionado && servicoSelecionado) {
      setHorarioSelecionado("");
      carregarDisponibilidade(diaSelecionado.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servicoSelecionado]);

  function formatarTelefone(valor: string) {
    const apenasNumeros = valor.replace(/\D/g, "").slice(0, 11);

    if (apenasNumeros.length <= 2) {
      return apenasNumeros;
    }

    if (apenasNumeros.length <= 7) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
    }

    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(
      2,
      7,
    )}-${apenasNumeros.slice(7)}`;
  }

  function formatarData(data: string) {
    const [ano, mes, dia] = data.slice(0, 10).split("-");
    return `${dia}/${mes}/${ano}`;
  }

  function formatarHorario(horario: string) {
    return horario.slice(0, 5);
  }

  function statusLegivel(status: string) {
    const statusNormalizado = status.toLowerCase();

    const nomes: Record<string, string> = {
      agendado: "Agendado",
      confirmado: "Confirmado",
      concluido: "Concluído",
      cancelado: "Cancelado",
      disponível: "Disponível",
      disponivel: "Disponível",
    };

    return nomes[statusNormalizado] || status;
  }

  function statusPodeCancelar(status: string) {
    const statusNormalizado = status.toLowerCase();
    return (
      statusNormalizado === "agendado" || statusNormalizado === "confirmado"
    );
  }

  /*
   * CONSULTAR AGENDAMENTOS PELO TELEFONE
   */
  async function consultarAgendamentos() {
    setErroConsulta("");
    setMensagemConsulta("");
    setConsultouAgendamentos(false);
    setAgendamentosConsultados([]);

    if (!barbearia) {
      setErroConsulta("Barbearia não encontrada.");
      return;
    }

    const telefoneNumeros = telefoneConsulta.replace(/\D/g, "");

    if (telefoneNumeros.length < 10) {
      setErroConsulta("Digite um telefone válido com DDD.");
      return;
    }

    try {
      setConsultandoAgendamentos(true);

      const { data, error } = await supabase.rpc(
        "consultar_agendamentos_publico",
        {
          p_barbearia_id: barbearia.id,
          p_telefone: telefoneNumeros,
        },
      );

      if (error) {
        throw error;
      }

      const resultado = (data || []) as AgendamentoConsultado[];

      const pendentes = resultado.filter(
        (agendamento) => agendamento.status.toLowerCase() === "agendado",
      );

      setAgendamentosConsultados(
        pendentes.map((agendamento) => ({
          ...agendamento,
          horario: formatarHorario(agendamento.horario),
          preco: Number(agendamento.preco),
        })),
      );

      setConsultouAgendamentos(true);

      if (pendentes.length === 0) {
        setMensagemConsulta(
          "Não há agendamentos aguardando confirmação para esse telefone.",
        );
      }

      setConsultouAgendamentos(true);

      if (resultado.length === 0) {
        setMensagemConsulta(
          "Não encontramos agendamentos para esse telefone nesta barbearia.",
        );
      }
    } catch (error) {
      console.error("ERRO AO CONSULTAR AGENDAMENTOS:", error);

      if (error && typeof error === "object" && "message" in error) {
        setErroConsulta(String(error.message));
      } else {
        setErroConsulta("Não foi possível consultar os agendamentos.");
      }
    } finally {
      setConsultandoAgendamentos(false);
    }
  }

  /*
   * CANCELAR UM AGENDAMENTO DA LISTA DE CONSULTA
   */
  async function cancelarAgendamentoConsultado(
    agendamento: AgendamentoConsultado,
  ) {
    if (!barbearia) {
      setErroConsulta("Barbearia não encontrada.");
      return;
    }

    const telefoneNumeros = telefoneConsulta.replace(/\D/g, "");

    if (telefoneNumeros.length < 10) {
      setErroConsulta("Digite novamente um telefone válido.");
      return;
    }

    const confirmar = window.confirm(
      `Deseja realmente cancelar o agendamento de ${agendamento.servico}, em ${formatarData(
        agendamento.data,
      )}, às ${formatarHorario(agendamento.horario)}?`,
    );

    if (!confirmar) {
      return;
    }

    try {
      setCancelandoConsultaId(agendamento.agendamento_id);
      setErroConsulta("");
      setMensagemConsulta("");

      const { data, error } = await supabase.rpc(
        "cancelar_agendamento_por_telefone_publico",
        {
          p_agendamento_id: agendamento.agendamento_id,
          p_barbearia_id: barbearia.id,
          p_telefone: telefoneNumeros,
        },
      );

      if (error) {
        throw error;
      }

      if (!data) {
        setErroConsulta(
          "Não foi possível cancelar. O agendamento pode já ter sido cancelado ou não estar mais disponível para cancelamento.",
        );
        return;
      }

      setAgendamentosConsultados((anteriores) =>
        anteriores.map((item) =>
          item.agendamento_id === agendamento.agendamento_id
            ? { ...item, status: "cancelado" }
            : item,
        ),
      );

      setMensagemConsulta("Agendamento cancelado com sucesso.");
    } catch (error) {
      console.error("ERRO AO CANCELAR AGENDAMENTO CONSULTADO:", error);

      if (error && typeof error === "object" && "message" in error) {
        setErroConsulta(String(error.message));
      } else {
        setErroConsulta("Não foi possível cancelar o agendamento.");
      }
    } finally {
      setCancelandoConsultaId(null);
    }
  }

  async function confirmarAgendamento() {
    setErro("");

    if (!barbearia) {
      setErro("Barbearia não encontrada.");
      return;
    }

    if (!servicoSelecionado) {
      setErro("Selecione um serviço.");
      return;
    }

    if (!diaSelecionado) {
      setErro("Selecione um dia.");
      return;
    }

    if (!horarioSelecionado) {
      setErro("Selecione um horário.");
      return;
    }

    const inicioSelecionado = horarioParaMinutos(horarioSelecionado);
    const fimSelecionado = inicioSelecionado + servicoSelecionado.duracao;

    if (horarioEstaOcupado(inicioSelecionado, fimSelecionado)) {
      setErro("Esse horário acabou de ser ocupado. Escolha outro.");
      await carregarDisponibilidade(diaSelecionado.data);
      return;
    }

    if (horarioEstaBloqueado(inicioSelecionado, fimSelecionado)) {
      setErro("Esse horário não está mais disponível. Escolha outro.");
      await carregarDisponibilidade(diaSelecionado.data);
      return;
    }

    const nomeLimpo = nome.trim();

    if (nomeLimpo.length < 3) {
      setErro("Digite seu nome completo.");
      return;
    }

    if (/^\d+$/.test(nomeLimpo)) {
      setErro("Digite um nome válido.");
      return;
    }

    if (nomeLimpo.length > 80) {
      setErro("O nome deve ter no máximo 80 caracteres.");
      return;
    }

    const telefoneNumeros = telefone.replace(/\D/g, "");

    if (telefoneNumeros.length < 10) {
      setErro("Digite um telefone válido.");
      return;
    }

    try {
      setAgendando(true);

      const { data, error } = await supabase.rpc("criar_agendamento_publico", {
        p_barbearia_id: barbearia.id,
        p_nome: nomeLimpo,
        p_telefone: telefoneNumeros,
        p_servico_id: servicoSelecionado.id,
        p_data: diaSelecionado.data,
        p_horario: horarioSelecionado,
      });

      if (error) {
        console.error("ERRO RETORNADO PELO SUPABASE:", error);

        if (
          error.message.includes("idx_agendamento_horario_unico") ||
          error.message.includes("HORARIO_INDISPONIVEL")
        ) {
          setErro("Esse horário acabou de ser ocupado. Escolha outro.");
          await carregarDisponibilidade(diaSelecionado.data);
          return;
        }

        setErro(error.message);
        return;
      }

      const resultado = Array.isArray(data) ? data[0] : data;

      if (!resultado) {
        throw new Error("O banco não retornou os dados do agendamento.");
      }

      const novoAgendamento: AgendamentoCriado = {
        id: resultado.agendamento_id,
        codigo_cancelamento: resultado.codigo_cancelamento,
      };

      setAgendamentoCriado(novoAgendamento);

      setHorariosOcupados((anteriores) => [
        ...anteriores,
        {
          horario: horarioSelecionado,
          duracao: servicoSelecionado.duracao,
        },
      ]);

      setCancelado(false);
    } catch (error) {
      console.error("ERRO AO AGENDAR:", error);

      if (error && typeof error === "object" && "message" in error) {
        setErro(String(error.message));
      } else {
        setErro("Não foi possível realizar o agendamento.");
      }
    } finally {
      setAgendando(false);
    }
  }

  async function cancelarAgendamento() {
    if (!agendamentoCriado) {
      return;
    }

    try {
      setCancelando(true);
      setErro("");

      const { data, error } = await supabase.rpc(
        "cancelar_agendamento_publico",
        {
          p_agendamento_id: agendamentoCriado.id,
          p_codigo_cancelamento: agendamentoCriado.codigo_cancelamento,
        },
      );

      if (error) {
        throw error;
      }

      if (!data) {
        setErro("Não foi possível cancelar este agendamento.");
        return;
      }

      setCancelado(true);

      if (horarioSelecionado) {
        setHorariosOcupados((anteriores) =>
          anteriores.filter(
            (agendamento) => agendamento.horario !== horarioSelecionado,
          ),
        );
      }
    } catch (error) {
      console.error("ERRO AO CANCELAR:", error);

      if (error && typeof error === "object" && "message" in error) {
        setErro(String(error.message));
      } else {
        setErro("Não foi possível cancelar o agendamento.");
      }
    } finally {
      setCancelando(false);
    }
  }

  function fecharModal() {
    setServicoSelecionado(null);
    setDiaSelecionado(null);
    setHorarioSelecionado("");

    setNome("");
    setTelefone("");

    setAgendamentoCriado(null);
    setCancelado(false);
    setErro("");

    setHorariosOcupados([]);
    setBloqueiosAgenda([]);
  }

  if (carregando || carregandoFuncionamento) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p className="text-zinc-400">Carregando barbearia...</p>
      </div>
    );
  }

  if (erro && !barbearia) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Barbearia não encontrada</h1>
          <p className="text-zinc-400">{erro}</p>
        </div>
      </div>
    );
  }

  if (!barbearia) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{barbearia.nome}</h1>
              <p className="text-zinc-400 mt-2">
                {barbearia.descricao ||
                  "Cortes modernos, barba e atendimento personalizado."}
              </p>
            </div>

            <div className="flex flex-col gap-2 text-sm text-zinc-400">
              {barbearia.telefone && (
                <div className="flex items-center gap-2">
                  <Phone size={17} />
                  {barbearia.telefone}
                </div>
              )}

              <div className="flex items-center gap-2">
                <MapPin size={17} />
                Atendimento presencial
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* CONSULTAR AGENDAMENTOS */}
        <section className="mb-12 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 md:p-7">
          <div className="flex items-center gap-3 mb-3">
            <Search size={22} />
            <h2 className="text-2xl font-bold">Consultar agendamento</h2>
          </div>

          <p className="text-sm text-zinc-400 mb-5">
            Informe o telefone utilizado na reserva para consultar os
            agendamentos desta barbearia.
          </p>

          <form
            className="flex flex-col sm:flex-row gap-3 max-w-2xl"
            onSubmit={(event) => {
              event.preventDefault();
              consultarAgendamentos();
            }}
          >
            <input
              value={telefoneConsulta}
              onChange={(event) => {
                setTelefoneConsulta(formatarTelefone(event.target.value));
                setErroConsulta("");
                setMensagemConsulta("");
              }}
              placeholder="(86) 99999-9999"
              inputMode="numeric"
              autoComplete="tel"
              aria-label="Telefone usado no agendamento"
              className="flex-1 min-w-0 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-zinc-400"
            />

            <button
              type="submit"
              disabled={consultandoAgendamentos}
              className="flex items-center justify-center gap-2 bg-white text-black font-semibold rounded-xl px-5 py-3 hover:bg-zinc-200 disabled:opacity-50"
            >
              {consultandoAgendamentos ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <Search size={18} />
              )}
              {consultandoAgendamentos ? "Consultando..." : "Consultar"}
            </button>
          </form>

          {erroConsulta && (
            <div
              role="alert"
              className="mt-4 bg-red-950/40 border border-red-900 text-red-300 rounded-xl p-4 text-sm"
            >
              {erroConsulta}
            </div>
          )}

          {mensagemConsulta && (
            <div
              role="status"
              className="mt-4 bg-green-950/30 border border-green-900 text-green-300 rounded-xl p-4 text-sm"
            >
              {mensagemConsulta}
            </div>
          )}

          {consultandoAgendamentos && (
            <p className="text-zinc-400 text-sm mt-5">
              Buscando seus agendamentos...
            </p>
          )}

          {consultouAgendamentos && agendamentosConsultados.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold text-lg">
                Agendamentos encontrados ({agendamentosConsultados.length})
              </h3>

              {agendamentosConsultados.map((agendamento) => {
                const podeCancelar = statusPodeCancelar(agendamento.status);
                const cancelamentoEmAndamento =
                  cancelandoConsultaId === agendamento.agendamento_id;

                return (
                  <article
                    key={agendamento.agendamento_id}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 md:p-5"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-lg">
                            {agendamento.servico}
                          </h4>
                          <p className="text-sm text-zinc-400 mt-1">
                            Agendamento #{agendamento.agendamento_id}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-300">
                          <span className="flex items-center gap-2">
                            <CalendarDays size={16} />
                            {formatarData(agendamento.data)}
                          </span>

                          <span className="flex items-center gap-2">
                            <Clock size={16} />
                            {formatarHorario(agendamento.horario)}
                          </span>
                        </div>

                        <p className="text-sm text-zinc-300">
                          Valor:{" "}
                          <strong>
                            R$ {Number(agendamento.preco).toFixed(2)}
                          </strong>
                        </p>

                        <p className="text-sm">
                          Status:{" "}
                          <span
                            className={
                              agendamento.status.toLowerCase() === "cancelado"
                                ? "text-red-400"
                                : agendamento.status.toLowerCase() ===
                                    "concluido"
                                  ? "text-zinc-400"
                                  : "text-green-400"
                            }
                          >
                            {statusLegivel(agendamento.status)}
                          </span>
                        </p>
                      </div>

                      {podeCancelar && (
                        <button
                          type="button"
                          onClick={() =>
                            cancelarAgendamentoConsultado(agendamento)
                          }
                          disabled={cancelamentoEmAndamento}
                          className="flex items-center justify-center gap-2 border border-red-900 text-red-400 rounded-xl px-4 py-3 hover:bg-red-950/40 disabled:opacity-50"
                        >
                          {cancelamentoEmAndamento ? (
                            <RefreshCw size={17} className="animate-spin" />
                          ) : (
                            <X size={17} />
                          )}
                          {cancelamentoEmAndamento
                            ? "Cancelando..."
                            : "Cancelar agendamento"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* SERVIÇOS */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Scissors />
            <h2 className="text-2xl font-bold">Escolha seu serviço</h2>
          </div>

          {servicos.length === 0 ? (
            <p className="text-zinc-400">
              Nenhum serviço disponível no momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {servicos.map((servico) => {
                const selecionado = servicoSelecionado?.id === servico.id;

                return (
                  <button
                    key={servico.id}
                    onClick={() => setServicoSelecionado(servico)}
                    className={`text-left border rounded-2xl p-5 transition ${
                      selecionado
                        ? "border-white bg-zinc-800"
                        : "border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
                    }`}
                  >
                    <div className="flex justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {servico.nome}
                        </h3>

                        {servico.descricao && (
                          <p className="text-sm text-zinc-400 mt-1">
                            {servico.descricao}
                          </p>
                        )}
                      </div>

                      <strong>R$ {Number(servico.preco).toFixed(2)}</strong>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-zinc-400 mt-4">
                      <Clock size={15} />
                      {servico.duracao} minutos
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* DIAS */}
        {servicoSelecionado && (
          <section className="mt-10">
            <div className="flex items-center gap-3 mb-6">
              <CalendarDays />
              <h2 className="text-2xl font-bold">Escolha o dia</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {dias.map((dia) => {
                const selecionado = diaSelecionado?.data === dia.data;

                return (
                  <button
                    key={dia.data}
                    disabled={!dia.aberto}
                    onClick={() => selecionarDia(dia)}
                    className={`rounded-xl border p-4 text-center transition ${
                      !dia.aberto
                        ? "border-zinc-900 bg-zinc-950 text-zinc-700 cursor-not-allowed"
                        : selecionado
                          ? "border-white bg-zinc-800"
                          : "border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
                    }`}
                  >
                    <div className="text-sm">{dia.nome}</div>
                    <div className="text-xs text-zinc-500 mt-2">
                      {dia.data.split("-").reverse().join("/")}
                    </div>
                    {!dia.aberto && <div className="text-xs mt-2">Fechado</div>}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* HORÁRIOS */}
        {diaSelecionado && (
          <section className="mt-10">
            <div className="flex items-center gap-3 mb-6">
              <Clock />
              <h2 className="text-2xl font-bold">Escolha o horário</h2>
            </div>

            {carregandoHorarios ? (
              <p className="text-zinc-400">Verificando horários...</p>
            ) : gerarHorariosDisponiveis().length === 0 ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-zinc-400">
                Não há horários disponíveis para este dia.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {gerarHorariosDisponiveis().map((horario) => {
                  const selecionado = horarioSelecionado === horario;

                  return (
                    <button
                      key={horario}
                      onClick={() => setHorarioSelecionado(horario)}
                      className={`rounded-xl border p-4 transition ${
                        selecionado
                          ? "border-white bg-zinc-800"
                          : "border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
                      }`}
                    >
                      <div className="font-semibold">{horario}</div>
                      <div className="text-xs mt-1">Disponível</div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* FORMULÁRIO */}
        {horarioSelecionado && !agendamentoCriado && (
          <section className="mt-10 max-w-xl">
            <div className="flex items-center gap-3 mb-6">
              <User />
              <h2 className="text-2xl font-bold">Seus dados</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Nome</label>
                <input
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  placeholder="Digite seu nome"
                  maxLength={80}
                  autoComplete="name"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Telefone
                </label>
                <input
                  value={telefone}
                  onChange={(event) =>
                    setTelefone(formatarTelefone(event.target.value))
                  }
                  placeholder="(86) 99999-9999"
                  inputMode="numeric"
                  autoComplete="tel"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-zinc-500"
                />
              </div>

              {erro && (
                <div className="bg-red-950/40 border border-red-900 text-red-300 rounded-xl p-4 text-sm">
                  {erro}
                </div>
              )}

              <button
                onClick={confirmarAgendamento}
                disabled={agendando}
                className="w-full bg-white text-black font-semibold rounded-xl py-4 hover:bg-zinc-200 disabled:opacity-50"
              >
                {agendando ? "Agendando..." : "Confirmar agendamento"}
              </button>
            </div>
          </section>
        )}
      </main>

      {/* MODAL DE SUCESSO */}
      {agendamentoCriado && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full">
            {!cancelado ? (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="bg-green-500/10 text-green-400 rounded-full p-3">
                    <Check />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">
                      Agendamento realizado!
                    </h2>
                    <p className="text-sm text-zinc-400">
                      Seu horário foi reservado.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 bg-zinc-950 rounded-xl p-4">
                  <div>
                    <span className="text-zinc-500 text-sm">Serviço</span>
                    <p className="font-medium">{servicoSelecionado?.nome}</p>
                  </div>

                  <div>
                    <span className="text-zinc-500 text-sm">Data</span>
                    <p className="font-medium">
                      {diaSelecionado?.data.split("-").reverse().join("/")}
                    </p>
                  </div>

                  <div>
                    <span className="text-zinc-500 text-sm">Horário</span>
                    <p className="font-medium">{horarioSelecionado}</p>
                  </div>
                </div>

                {erro && (
                  <div className="mt-4 bg-red-950/40 border border-red-900 text-red-300 rounded-xl p-4 text-sm">
                    {erro}
                  </div>
                )}

                <div className="flex flex-col gap-3 mt-5">
                  <button
                    onClick={cancelarAgendamento}
                    disabled={cancelando}
                    className="w-full border border-red-900 text-red-400 rounded-xl py-3 hover:bg-red-950/30 disabled:opacity-50"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <X size={18} />
                      {cancelando ? "Cancelando..." : "Cancelar agendamento"}
                    </span>
                  </button>

                  <button
                    onClick={fecharModal}
                    className="w-full bg-white text-black rounded-xl py-3 font-semibold hover:bg-zinc-200"
                  >
                    Fechar
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="mx-auto bg-zinc-800 text-zinc-300 rounded-full p-3 w-fit">
                  <Check />
                </div>

                <h2 className="text-xl font-bold mt-4">
                  Agendamento cancelado
                </h2>

                <p className="text-zinc-400 mt-2">
                  O horário voltou a ficar disponível.
                </p>

                <button
                  onClick={fecharModal}
                  className="w-full bg-white text-black rounded-xl py-3 font-semibold mt-6"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ERRO GERAL */}
      {erro && !agendamentoCriado && (
        <div
          role="alert"
          className="fixed bottom-6 right-6 bg-red-950 border border-red-900 text-red-300 rounded-xl px-5 py-4 shadow-xl"
        >
          {erro}
        </div>
      )}
    </div>
  );
}

export default PublicBarber;
