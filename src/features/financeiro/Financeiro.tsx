import { useState } from "react";
import {
    Wallet,
    TrendingUp,
    CalendarDays,
    Scissors,
    ArrowUpRight,
} from "lucide-react";

type Atendimento = {
    id: number;
    cliente: string;
    servico: string;
    valor: number;
    data: string;
};

function Financeiro() {
    const [atendimentos] = useState<Atendimento[]>([
        {
            id: 1,
            cliente: "João Silva",
            servico: "Corte",
            valor: 30,
            data: "10/08/2026",
        },
        {
            id: 2,
            cliente: "Carlos Santos",
            servico: "Barba",
            valor: 20,
            data: "10/08/2026",
        },
        {
            id: 3,
            cliente: "Pedro Oliveira",
            servico: "Corte + Barba",
            valor: 45,
            data: "09/08/2026",
        },
        {
            id: 4,
            cliente: "Lucas Mendes",
            servico: "Corte",
            valor: 30,
            data: "09/08/2026",
        },
        {
            id: 5,
            cliente: "Rafael Costa",
            servico: "Corte",
            valor: 30,
            data: "08/08/2026",
        },
        {
            id: 6,
            cliente: "Marcos Lima",
            servico: "Corte + Barba",
            valor: 45,
            data: "08/08/2026",
        },
    ]);

    const [periodo, setPeriodo] = useState("mes");

    const faturamentoTotal = atendimentos.reduce(
        (total, atendimento) => total + atendimento.valor,
        0
    );

    const faturamentoHoje = atendimentos
        .filter((atendimento) => atendimento.data === "10/08/2026")
        .reduce(
            (total, atendimento) => total + atendimento.valor,
            0
        );

    const quantidadeAtendimentos = atendimentos.length;

    const ticketMedio =
        quantidadeAtendimentos > 0
            ? faturamentoTotal / quantidadeAtendimentos
            : 0;

    const formatarMoeda = (valor: number) => {
        return valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    };

    return (
        <div className="p-8">

            {/* Cabeçalho */}
            <header className="flex items-end justify-between">

                <div>
                    <p className="text-zinc-400">
                        Acompanhe o desempenho financeiro da sua barbearia
                    </p>

                    <h1 className="mt-1 text-3xl font-bold">
                        Financeiro
                    </h1>
                </div>

                {/* Período */}
                <select
                    value={periodo}
                    onChange={(e) => setPeriodo(e.target.value)}
                    className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none focus:border-amber-500"
                >
                    <option value="hoje">Hoje</option>
                    <option value="semana">Esta semana</option>
                    <option value="mes">Este mês</option>
                </select>

            </header>

            {/* Cards */}
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

                {/* Faturamento */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

                    <div className="flex items-center justify-between">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                            <Wallet size={22} />
                        </div>

                        <ArrowUpRight
                            size={20}
                            className="text-green-400"
                        />

                    </div>

                    <p className="mt-5 text-sm text-zinc-500">
                        Faturamento
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                        {formatarMoeda(faturamentoTotal)}
                    </p>

                    <p className="mt-2 text-xs text-green-400">
                        +12,5% em relação ao período anterior
                    </p>

                </div>

                {/* Hoje */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                        <CalendarDays size={22} />
                    </div>

                    <p className="mt-5 text-sm text-zinc-500">
                        Faturamento hoje
                    </p>

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

                    <p className="mt-5 text-sm text-zinc-500">
                        Atendimentos
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                        {quantidadeAtendimentos}
                    </p>

                    <p className="mt-2 text-xs text-zinc-500">
                        Serviços realizados
                    </p>

                </div>

                {/* Ticket médio */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                        <TrendingUp size={22} />
                    </div>

                    <p className="mt-5 text-sm text-zinc-500">
                        Ticket médio
                    </p>

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
                <section className="xl:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

                    <div className="flex items-center justify-between">

                        <div>
                            <h2 className="text-xl font-semibold">
                                Atendimentos recentes
                            </h2>

                            <p className="mt-1 text-sm text-zinc-500">
                                Serviços que geraram faturamento
                            </p>
                        </div>

                    </div>

                    <div className="mt-6 space-y-3">

                        {atendimentos.map((atendimento) => (

                            <div
                                key={atendimento.id}
                                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                            >

                                <div className="flex items-center gap-4">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                                        <Scissors size={18} />
                                    </div>

                                    <div>

                                        <p className="font-medium">
                                            {atendimento.cliente}
                                        </p>

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
                                        {atendimento.data}
                                    </p>

                                </div>

                            </div>

                        ))}

                    </div>

                </section>

                {/* Resumo */}
                <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

                    <h2 className="text-xl font-semibold">
                        Resumo
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                        Distribuição dos serviços
                    </p>

                    <div className="mt-6 space-y-5">

                        <div>

                            <div className="flex justify-between text-sm">

                                <span className="text-zinc-400">
                                    Corte
                                </span>

                                <span className="font-medium">
                                    R$ 90,00
                                </span>

                            </div>

                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
                                <div className="h-full w-[60%] rounded-full bg-amber-500" />
                            </div>

                        </div>

                        <div>

                            <div className="flex justify-between text-sm">

                                <span className="text-zinc-400">
                                    Corte + Barba
                                </span>

                                <span className="font-medium">
                                    R$ 90,00
                                </span>

                            </div>

                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
                                <div className="h-full w-[60%] rounded-full bg-amber-500" />
                            </div>

                        </div>

                        <div>

                            <div className="flex justify-between text-sm">

                                <span className="text-zinc-400">
                                    Barba
                                </span>

                                <span className="font-medium">
                                    R$ 20,00
                                </span>

                            </div>

                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
                                <div className="h-full w-[20%] rounded-full bg-amber-500" />
                            </div>

                        </div>

                    </div>

                </section>

            </div>

        </div>
    );
}

export default Financeiro;