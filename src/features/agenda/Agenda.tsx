import { useState } from "react";
import {
    CalendarDays,
    Check,
    Clock,
    Scissors,
    UserRound,
    X,
} from "lucide-react";

const dias = [
    {
        dia: "Segunda-feira",
        data: "10 de Agosto",
    },
    {
        dia: "Terça-feira",
        data: "11 de Agosto",
    },
    {
        dia: "Quarta-feira",
        data: "12 de Agosto",
    },
    {
        dia: "Quinta-feira",
        data: "13 de Agosto",
    },
    {
        dia: "Sexta-feira",
        data: "14 de Agosto",
    },
];

type Status =
    | "agendado"
    | "confirmado"
    | "concluido"
    | "cancelado"
    | "disponivel";

type Agendamento = {
    id: number;
    horario: string;
    cliente?: string;
    telefone?: string;
    servico?: string;
    preco?: number;
    status: Status;
};

function Agenda() {
    const [diaSelecionado, setDiaSelecionado] = useState(0);

    const [agendamentoSelecionado, setAgendamentoSelecionado] =
        useState<Agendamento | null>(null);

    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([
        {
            id: 1,
            horario: "09:00",
            cliente: "João Silva",
            telefone: "(86) 99999-9999",
            servico: "Corte",
            preco: 30,
            status: "confirmado",
        },
        {
            id: 2,
            horario: "10:00",
            cliente: "Carlos Santos",
            telefone: "(86) 98888-8888",
            servico: "Barba",
            preco: 20,
            status: "agendado",
        },
        {
            id: 3,
            horario: "11:00",
            status: "disponivel",
        },
        {
            id: 4,
            horario: "12:00",
            status: "disponivel",
        },
        {
            id: 5,
            horario: "13:00",
            cliente: "Pedro Oliveira",
            telefone: "(86) 97777-7777",
            servico: "Corte + Barba",
            preco: 45,
            status: "concluido",
        },
    ]);

    const diaAtual = dias[diaSelecionado];

    function alterarStatus(
        id: number,
        novoStatus: Status
    ) {
        setAgendamentos((agendamentosAtuais) =>
            agendamentosAtuais.map((agendamento) =>
                agendamento.id === id
                    ? {
                        ...agendamento,
                        status: novoStatus,
                    }
                    : agendamento
            )
        );

        setAgendamentoSelecionado(null);
    }

    function formatarPreco(preco: number) {
        return preco.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    function getStatusTexto(status: Status) {
        switch (status) {
            case "agendado":
                return "Agendado";

            case "confirmado":
                return "Confirmado";

            case "concluido":
                return "Concluído";

            case "cancelado":
                return "Cancelado";

            default:
                return "Disponível";
        }
    }

    function getStatusClasses(status: Status) {
        switch (status) {
            case "agendado":
                return "bg-blue-500/10 text-blue-400";

            case "confirmado":
                return "bg-green-500/10 text-green-400";

            case "concluido":
                return "bg-purple-500/10 text-purple-400";

            case "cancelado":
                return "bg-red-500/10 text-red-400";

            default:
                return "bg-zinc-800 text-zinc-500";
        }
    }

    return (
        <div className="p-8">

            {/* Cabeçalho */}
            <header>

                <p className="text-zinc-400">
                    Organize os horários da sua barbearia
                </p>

                <h1 className="mt-1 text-3xl font-bold">
                    Agenda
                </h1>

            </header>

            {/* Seleção de dias */}
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">

                {dias.map((dia, index) => (

                    <button
                        key={dia.dia}
                        type="button"
                        onClick={() => setDiaSelecionado(index)}
                        className={`rounded-xl border p-4 text-left transition ${diaSelecionado === index
                                ? "border-amber-500 bg-amber-500 text-black"
                                : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-white"
                            }`}
                    >

                        <p className="text-sm">
                            {dia.dia}
                        </p>

                        <p className="mt-1 font-semibold">
                            {dia.data}
                        </p>

                    </button>

                ))}

            </div>

            {/* Data atual */}
            <div className="mt-6 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-5">

                <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                        <CalendarDays size={20} />
                    </div>

                    <div>

                        <p className="text-sm text-zinc-500">
                            Agenda de
                        </p>

                        <p className="font-semibold">
                            {diaAtual.dia}, {diaAtual.data}
                        </p>

                    </div>

                </div>

                <div className="flex items-center gap-2 text-sm text-zinc-500">

                    <Clock size={16} />

                    <span>
                        {agendamentos.filter(
                            (agendamento) =>
                                agendamento.status !== "disponivel" &&
                                agendamento.status !== "cancelado"
                        ).length}{" "}
                        atendimentos

                    </span>

                </div>

            </div>

            {/* Lista de horários */}
            <div className="mt-6 space-y-3">

                {agendamentos.map((agendamento) => (

                    <div
                        key={agendamento.id}
                        className={`flex items-center justify-between rounded-xl border p-5 ${agendamento.status === "disponivel"
                                ? "border-dashed border-zinc-700 bg-zinc-950"
                                : agendamento.status === "cancelado"
                                    ? "border-red-900/30 bg-zinc-950 opacity-60"
                                    : "border-zinc-800 bg-zinc-900"
                            }`}
                    >

                        {/* Horário */}
                        <div className="flex items-center gap-6">

                            <span className="w-16 text-lg font-semibold">
                                {agendamento.horario}
                            </span>

                            {agendamento.status === "disponivel" ? (

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-zinc-600">
                                        <Clock size={18} />
                                    </div>

                                    <div>

                                        <p className="font-medium text-zinc-500">
                                            Horário disponível
                                        </p>

                                        <p className="text-sm text-zinc-600">
                                            Nenhum agendamento
                                        </p>

                                    </div>

                                </div>

                            ) : (

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                                        <UserRound size={18} />
                                    </div>

                                    <div>

                                        <p className="font-medium">
                                            {agendamento.cliente}
                                        </p>

                                        <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">

                                            <Scissors size={14} />

                                            <span>
                                                {agendamento.servico}
                                            </span>

                                            <span>
                                                •
                                            </span>

                                            <span>
                                                {formatarPreco(
                                                    agendamento.preco ?? 0
                                                )}
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            )}

                        </div>

                        {/* Status / ação */}
                        {agendamento.status === "disponivel" ? (

                            <span className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-500">
                                Livre
                            </span>

                        ) : agendamento.status === "agendado" ? (

                            <button
                                type="button"
                                onClick={() =>
                                    alterarStatus(
                                        agendamento.id,
                                        "confirmado"
                                    )
                                }
                                className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 font-medium text-amber-400 transition hover:border-amber-500 hover:bg-amber-500 hover:text-black"
                            >
                                <Clock size={16} />

                                Confirmar
                            </button>

                        ) : (

                            <button
                                type="button"
                                onClick={() =>
                                    setAgendamentoSelecionado(
                                        agendamento
                                    )
                                }
                                className={`rounded-full px-3 py-1 text-sm transition hover:opacity-80 ${getStatusClasses(
                                    agendamento.status
                                )}`}
                            >
                                {getStatusTexto(
                                    agendamento.status
                                )}
                            </button>

                        )}

                    </div>

                ))}

            </div>

            {/* Modal */}
            {agendamentoSelecionado && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

                    <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

                        {/* Cabeçalho */}
                        <div className="flex items-start justify-between">

                            <div>

                                <h2 className="text-xl font-bold">
                                    Agendamento
                                </h2>

                                <p className="mt-1 text-sm text-zinc-500">
                                    Gerencie este atendimento
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setAgendamentoSelecionado(null)
                                }
                                className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        {/* Informações */}
                        <div className="mt-6 space-y-4">

                            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">

                                <p className="text-sm text-zinc-500">
                                    Cliente
                                </p>

                                <p className="mt-1 font-semibold">
                                    {agendamentoSelecionado.cliente}
                                </p>

                                <p className="mt-1 text-sm text-zinc-500">
                                    {agendamentoSelecionado.telefone}
                                </p>

                            </div>

                            <div className="grid grid-cols-2 gap-3">

                                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">

                                    <p className="text-sm text-zinc-500">
                                        Horário
                                    </p>

                                    <p className="mt-1 font-semibold">
                                        {agendamentoSelecionado.horario}
                                    </p>

                                </div>

                                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">

                                    <p className="text-sm text-zinc-500">
                                        Valor
                                    </p>

                                    <p className="mt-1 font-semibold text-amber-500">
                                        {formatarPreco(
                                            agendamentoSelecionado.preco ??
                                            0
                                        )}
                                    </p>

                                </div>

                            </div>

                            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">

                                <p className="text-sm text-zinc-500">
                                    Serviço
                                </p>

                                <p className="mt-1 font-semibold">
                                    {agendamentoSelecionado.servico}
                                </p>

                            </div>

                        </div>

                        {/* Ações */}
                        <div className="mt-6 space-y-3">

                            {agendamentoSelecionado.status ===
                                "agendado" && (

                                    <button
                                        type="button"
                                        onClick={() =>
                                            alterarStatus(
                                                agendamentoSelecionado.id,
                                                "confirmado"
                                            )
                                        }
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-3 font-semibold text-black transition hover:bg-green-400"
                                    >
                                        <Check size={18} />

                                        Confirmar agendamento
                                    </button>

                                )}

                            {agendamentoSelecionado.status ===
                                "confirmado" && (

                                    <button
                                        type="button"
                                        onClick={() =>
                                            alterarStatus(
                                                agendamentoSelecionado.id,
                                                "concluido"
                                            )
                                        }
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-500 px-4 py-3 font-semibold text-white transition hover:bg-purple-400"
                                    >
                                        <Check size={18} />

                                        Marcar como concluído
                                    </button>

                                )}

                            {agendamentoSelecionado.status !==
                                "concluido" &&
                                agendamentoSelecionado.status !==
                                "cancelado" && (

                                    <button
                                        type="button"
                                        onClick={() =>
                                            alterarStatus(
                                                agendamentoSelecionado.id,
                                                "cancelado"
                                            )
                                        }
                                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-900/50 px-4 py-3 text-red-400 transition hover:bg-red-500/10"
                                    >
                                        <X size={18} />

                                        Cancelar agendamento
                                    </button>

                                )}

                            <button
                                type="button"
                                onClick={() =>
                                    setAgendamentoSelecionado(null)
                                }
                                className="w-full rounded-lg border border-zinc-700 px-4 py-3 text-zinc-300 transition hover:bg-zinc-800"
                            >
                                Fechar
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Agenda;