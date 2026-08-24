import { useState } from "react";
import {
    Search,
    UserRound,
    Phone,
    CalendarDays,
    X,
} from "lucide-react";

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

function Clientes() {
    const [busca, setBusca] = useState("");

    const [clienteSelecionado, setClienteSelecionado] =
        useState<Cliente | null>(null);

    const [clientes] = useState<Cliente[]>([
        {
            id: 1,
            nome: "João Silva",
            telefone: "(86) 99999-9999",
            visitas: 8,
            ultimoAtendimento: "08/08/2026",
            historico: [
                {
                    id: 1,
                    data: "08/08/2026",
                    servico: "Corte",
                    valor: 30,
                },
                {
                    id: 2,
                    data: "01/08/2026",
                    servico: "Corte + Barba",
                    valor: 45,
                },
                {
                    id: 3,
                    data: "25/07/2026",
                    servico: "Corte",
                    valor: 30,
                },
            ],
        },
        {
            id: 2,
            nome: "Carlos Santos",
            telefone: "(86) 98888-8888",
            visitas: 5,
            ultimoAtendimento: "05/08/2026",
            historico: [
                {
                    id: 4,
                    data: "05/08/2026",
                    servico: "Barba",
                    valor: 20,
                },
                {
                    id: 5,
                    data: "28/07/2026",
                    servico: "Corte",
                    valor: 30,
                },
            ],
        },
        {
            id: 3,
            nome: "Pedro Oliveira",
            telefone: "(86) 97777-7777",
            visitas: 3,
            ultimoAtendimento: "02/08/2026",
            historico: [
                {
                    id: 6,
                    data: "02/08/2026",
                    servico: "Corte",
                    valor: 30,
                },
            ],
        },
        {
            id: 4,
            nome: "Lucas Mendes",
            telefone: "(86) 96666-6666",
            visitas: 12,
            ultimoAtendimento: "01/08/2026",
            historico: [
                {
                    id: 7,
                    data: "01/08/2026",
                    servico: "Corte + Barba",
                    valor: 45,
                },
                {
                    id: 8,
                    data: "25/07/2026",
                    servico: "Corte",
                    valor: 30,
                },
                {
                    id: 9,
                    data: "18/07/2026",
                    servico: "Barba",
                    valor: 20,
                },
            ],
        },
    ]);

    const clientesFiltrados = clientes.filter(
        (cliente) =>
            cliente.nome
                .toLowerCase()
                .includes(busca.toLowerCase()) ||
            cliente.telefone.includes(busca)
    );

    return (
        <div className="p-8">

            {/* Cabeçalho */}
            <header>
                <p className="text-zinc-400">
                    Gerencie os clientes da sua barbearia
                </p>

                <h1 className="mt-1 text-3xl font-bold">
                    Clientes
                </h1>
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

                {clientesFiltrados.length === 0 ? (

                    <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900 p-10 text-center">

                        <UserRound
                            size={40}
                            className="mx-auto text-zinc-600"
                        />

                        <h2 className="mt-4 text-xl font-semibold">
                            Nenhum cliente encontrado
                        </h2>

                        <p className="mt-2 text-zinc-500">
                            Tente buscar por outro nome ou telefone.
                        </p>

                    </div>

                ) : (

                    clientesFiltrados.map((cliente) => (

                        <div
                            key={cliente.id}
                            onClick={() =>
                                setClienteSelecionado(cliente)
                            }
                            className="flex cursor-pointer items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-zinc-700 hover:bg-zinc-800/80"
                        >

                            {/* Informações */}
                            <div className="flex items-center gap-4">

                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                                    <UserRound size={22} />
                                </div>

                                <div>

                                    <h2 className="font-semibold">
                                        {cliente.nome}
                                    </h2>

                                    <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">

                                        <Phone size={14} />

                                        <span>
                                            {cliente.telefone}
                                        </span>

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
                                        {cliente.visitas === 1
                                            ? "visita"
                                            : "visitas"}
                                    </p>

                                </div>

                                <div className="hidden text-right sm:block">

                                    <div className="flex items-center justify-end gap-2 text-sm text-zinc-500">

                                        <CalendarDays size={15} />

                                        <span>
                                            Último atendimento
                                        </span>

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

            {/* Modal de detalhes */}
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
                                onClick={() =>
                                    setClienteSelecionado(null)
                                }
                                className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        {/* Resumo */}
                        <div className="mt-6 grid grid-cols-2 gap-4">

                            {/* Visitas */}
                            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">

                                <p className="text-sm text-zinc-500">
                                    Visitas
                                </p>

                                <p className="mt-2 text-2xl font-bold text-amber-500">
                                    {clienteSelecionado.visitas}
                                </p>

                            </div>

                            {/* Total gasto */}
                            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">

                                <p className="text-sm text-zinc-500">
                                    Total gasto
                                </p>

                                <p className="mt-2 text-2xl font-bold text-green-400">
                                    R${" "}
                                    {clienteSelecionado.historico
                                        .reduce(
                                            (total, atendimento) =>
                                                total +
                                                atendimento.valor,
                                            0
                                        )
                                        .toFixed(2)
                                        .replace(".", ",")}
                                </p>

                            </div>

                        </div>

                        {/* Histórico */}
                        <div className="mt-6">

                            <h3 className="text-lg font-semibold">
                                Histórico de atendimentos
                            </h3>

                            <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">

                                {clienteSelecionado.historico.map(
                                    (atendimento) => (

                                        <div
                                            key={atendimento.id}
                                            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                                        >

                                            <div>

                                                <p className="font-medium">
                                                    {atendimento.servico}
                                                </p>

                                                <p className="mt-1 flex items-center gap-2 text-sm text-zinc-500">

                                                    <CalendarDays
                                                        size={14}
                                                    />

                                                    {atendimento.data}

                                                </p>

                                            </div>

                                            <span className="font-semibold text-amber-500">
                                                R${" "}
                                                {atendimento.valor
                                                    .toFixed(2)
                                                    .replace(
                                                        ".",
                                                        ","
                                                    )}
                                            </span>

                                        </div>

                                    )
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