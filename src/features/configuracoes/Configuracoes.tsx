import { useEffect, useState } from "react";
import { Copy, Link as LinkIcon, Save } from "lucide-react";

import { supabase } from "../../lib/supabase";
import { buscarMinhaBarbearia } from "../../utils/barbearia";

type Horario = {
  aberto: boolean;
  inicio: string;
  fim: string;
};

type HorarioBanco = {
  dia_semana: number;
  aberto: boolean;
  hora_inicio: string | null;
  hora_fim: string | null;
};

function Configuracoes() {
  const [barbeariaId, setBarbeariaId] = useState("");
  const [slugBarbearia, setSlugBarbearia] = useState("");
  const [carregandoBarbearia, setCarregandoBarbearia] = useState(true);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [descricao, setDescricao] = useState(
    "Cortes modernos, barba e atendimento personalizado.",
  );

  const [salvandoInformacoes, setSalvandoInformacoes] = useState(false);
  const [mensagemInformacoes, setMensagemInformacoes] = useState("");
  const [erroInformacoes, setErroInformacoes] = useState("");

  const [copiado, setCopiado] = useState(false);
  const [erroLink, setErroLink] = useState("");

  const [carregandoHorarios, setCarregandoHorarios] = useState(true);
  const [salvandoHorarios, setSalvandoHorarios] = useState(false);
  const [mensagemHorarios, setMensagemHorarios] = useState("");
  const [erroHorarios, setErroHorarios] = useState("");

  const [horarios, setHorarios] = useState<Record<string, Horario>>({
    "Segunda-feira": { aberto: true, inicio: "08:00", fim: "18:00" },
    "Terça-feira": { aberto: true, inicio: "08:00", fim: "18:00" },
    "Quarta-feira": { aberto: true, inicio: "08:00", fim: "18:00" },
    "Quinta-feira": { aberto: true, inicio: "08:00", fim: "18:00" },
    "Sexta-feira": { aberto: true, inicio: "08:00", fim: "18:00" },
    Sábado: { aberto: true, inicio: "08:00", fim: "14:00" },
    Domingo: { aberto: false, inicio: "08:00", fim: "18:00" },
  });

  const dias = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];

  useEffect(() => {
    async function carregarDadosBarbearia() {
      try {
        setCarregandoBarbearia(true);
        setErroInformacoes("");

        const barbearia = await buscarMinhaBarbearia();

        setBarbeariaId(barbearia.id);
        setNome(barbearia.nome);
        setSlugBarbearia(barbearia.slug);
      } catch (error) {
        console.error("Erro ao carregar barbearia:", error);
        setErroInformacoes(
          "Não foi possível carregar os dados da barbearia. Verifique se você está conectado.",
        );
      } finally {
        setCarregandoBarbearia(false);
      }
    }

    carregarDadosBarbearia();
  }, []);

  useEffect(() => {
    async function carregarHorarios() {
      try {
        setCarregandoHorarios(true);
        setErroHorarios("");

        const barbearia = await buscarMinhaBarbearia();

        const { data, error } = await supabase
          .from("horarios_funcionamento")
          .select("dia_semana, aberto, hora_inicio, hora_fim")
          .eq("barbearia_id", barbearia.id)
          .order("dia_semana");

        if (error) {
          throw error;
        }

        if (!data || data.length === 0) {
          return;
        }

        const dados = data as HorarioBanco[];

        setHorarios((atuais) => {
          const novos = { ...atuais };

          dados.forEach((horario) => {
            const dia = dias[horario.dia_semana];

            if (!dia) return;

            novos[dia] = {
              aberto: horario.aberto,
              inicio: horario.hora_inicio?.slice(0, 5) ?? "08:00",
              fim: horario.hora_fim?.slice(0, 5) ?? "18:00",
            };
          });

          return novos;
        });
      } catch (error) {
        console.error("Erro ao carregar horários:", error);
        setErroHorarios("Não foi possível carregar os horários.");
      } finally {
        setCarregandoHorarios(false);
      }
    }

    carregarHorarios();
  }, []);

  const linkPublico = slugBarbearia
    ? `${window.location.origin}/barbearia/${slugBarbearia}`
    : "";

  async function salvarInformacoes() {
    if (!barbeariaId) {
      setErroInformacoes("Não foi possível identificar sua barbearia.");
      return;
    }

    if (nome.trim().length < 3) {
      setErroInformacoes(
        "O nome da barbearia precisa ter pelo menos 3 caracteres.",
      );
      return;
    }

    setSalvandoInformacoes(true);
    setMensagemInformacoes("");
    setErroInformacoes("");

    try {
      const { error } = await supabase
        .from("barbearias")
        .update({ nome: nome.trim() })
        .eq("id", barbeariaId);

      if (error) throw error;

      setNome(nome.trim());
      setMensagemInformacoes("Nome da barbearia salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar informações:", error);
      setErroInformacoes("Não foi possível salvar o nome da barbearia.");
    } finally {
      setSalvandoInformacoes(false);
    }
  }

  async function copiarLink() {
    setErroLink("");
    setCopiado(false);

    if (!linkPublico) {
      setErroLink("O link ainda não está disponível.");
      return;
    }

    try {
      await navigator.clipboard.writeText(linkPublico);
      setCopiado(true);
    } catch (error) {
      console.error("Erro ao copiar link:", error);
      setErroLink(
        "Não foi possível copiar automaticamente. Selecione e copie o link manualmente.",
      );
    }
  }

  async function salvarHorarios() {
    setSalvandoHorarios(true);
    setMensagemHorarios("");
    setErroHorarios("");

    try {
      const barbearia = await buscarMinhaBarbearia();

      for (let i = 0; i < dias.length; i++) {
        const dia = dias[i];
        const horario = horarios[dia];

        if (horario.aberto && horario.inicio >= horario.fim) {
          setErroHorarios(
            `Confira os horários de ${dia}: o fechamento precisa ser posterior à abertura.`,
          );
          return;
        }

        const { error } = await supabase.from("horarios_funcionamento").upsert(
          {
            barbearia_id: barbearia.id,
            dia_semana: i,
            aberto: horario.aberto,
            hora_inicio: horario.aberto ? horario.inicio : null,
            hora_fim: horario.aberto ? horario.fim : null,
          },
          {
            onConflict: "barbearia_id,dia_semana",
          },
        );

        if (error) throw error;
      }

      setMensagemHorarios("Horários salvos com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar horários:", error);
      setErroHorarios("Não foi possível salvar os horários. Tente novamente.");
    } finally {
      setSalvandoHorarios(false);
    }
  }

  function atualizarHorario(dia: string, alteracoes: Partial<Horario>) {
    setHorarios((atuais) => ({
      ...atuais,
      [dia]: {
        ...atuais[dia],
        ...alteracoes,
      },
    }));

    setMensagemHorarios("");
    setErroHorarios("");
  }

  return (
    <div className="p-8">
      <header>
        <p className="text-zinc-400">
          Gerencie as informações da sua barbearia
        </p>
        <h1 className="mt-1 text-3xl font-bold">Configurações</h1>
      </header>

      {/* Informações da barbearia */}
      <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-xl font-semibold">Informações da barbearia</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Essas informações serão exibidas para seus clientes.
        </p>

        {carregandoBarbearia ? (
          <p className="mt-6 text-sm text-zinc-400">
            Carregando dados da barbearia...
          </p>
        ) : (
          <>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Nome da barbearia
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-amber-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="Informe o telefone da barbearia"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-amber-500"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm text-zinc-300">
                Descrição
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-amber-500"
              />
            </div>

            <button
              type="button"
              onClick={salvarInformacoes}
              disabled={salvandoInformacoes || carregandoBarbearia}
              className="mt-5 flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={18} />
              {salvandoInformacoes ? "Salvando..." : "Salvar alterações"}
            </button>

            {mensagemInformacoes && (
              <p className="mt-3 text-sm text-green-400">
                {mensagemInformacoes}
              </p>
            )}
            {erroInformacoes && (
              <p className="mt-3 text-sm text-red-400">{erroInformacoes}</p>
            )}
          </>
        )}
      </section>

      {/* Link público */}
      <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <LinkIcon size={22} />
          </div>

          <div>
            <h2 className="text-xl font-semibold">Link de agendamento</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Compartilhe este link para seus clientes agendarem um horário.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            readOnly
            value={
              carregandoBarbearia
                ? "Carregando link..."
                : linkPublico || "Não foi possível carregar o link"
            }
            className="min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-300 outline-none"
          />

          <button
            type="button"
            onClick={copiarLink}
            disabled={carregandoBarbearia || !linkPublico}
            className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700 px-4 py-3 text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Copy size={18} />
            {copiado ? "Copiado!" : "Copiar"}
          </button>
        </div>

        {erroLink && <p className="mt-3 text-sm text-red-400">{erroLink}</p>}

        {copiado && (
          <p className="mt-3 text-sm text-green-400">
            Link copiado! Agora você pode enviá-lo aos seus clientes.
          </p>
        )}
      </section>

      {/* Horários de funcionamento */}
      <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-xl font-semibold">Horário de funcionamento</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Defina os dias e horários em que sua barbearia estará disponível.
        </p>

        {carregandoHorarios ? (
          <div className="mt-6 text-sm text-zinc-500">
            Carregando horários...
          </div>
        ) : (
          <>
            <div className="mt-6 space-y-3">
              {dias.map((dia) => {
                const horario = horarios[dia];

                return (
                  <div
                    key={dia}
                    className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium">{dia}</p>
                        <p
                          className={`mt-1 text-xs ${
                            horario.aberto ? "text-green-400" : "text-zinc-600"
                          }`}
                        >
                          {horario.aberto ? "Aberto" : "Fechado"}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            atualizarHorario(dia, {
                              aberto: !horario.aberto,
                            })
                          }
                          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                            horario.aberto
                              ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                          }`}
                        >
                          {horario.aberto ? "Aberto" : "Fechado"}
                        </button>

                        {horario.aberto && (
                          <>
                            <input
                              type="time"
                              aria-label={`Abertura ${dia}`}
                              value={horario.inicio}
                              onChange={(e) =>
                                atualizarHorario(dia, {
                                  inicio: e.target.value,
                                })
                              }
                              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-amber-500"
                            />

                            <span className="text-zinc-600">até</span>

                            <input
                              type="time"
                              aria-label={`Fechamento ${dia}`}
                              value={horario.fim}
                              onChange={(e) =>
                                atualizarHorario(dia, {
                                  fim: e.target.value,
                                })
                              }
                              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-amber-500"
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={salvarHorarios}
              disabled={salvandoHorarios}
              className="mt-6 flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={18} />
              {salvandoHorarios ? "Salvando..." : "Salvar horários"}
            </button>

            {mensagemHorarios && (
              <p className="mt-3 text-sm text-green-400">{mensagemHorarios}</p>
            )}
            {erroHorarios && (
              <p className="mt-3 text-sm text-red-400">{erroHorarios}</p>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default Configuracoes;
