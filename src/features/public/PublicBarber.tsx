import {
    CalendarDays,
    Clock,
    MapPin,
    Phone,
    Scissors,
} from "lucide-react";

type Servico = {
    id: number;
    nome: string;
    descricao: string;
    preco: number;
    duracao: string;
};

function PublicBarber() {
    const barbearia = {
        nome: "Barbearia do João",
        descricao:
            "Cortes modernos, barba e atendimento personalizado.",
        telefone: "(86) 99999-9999",
        cidade: "Teresina - PI",
    };

    const servicos: Servico[] = [
        {
            id: 1,
            nome: "Corte",
            descricao: "Corte masculino tradicional ou moderno.",
            preco: 30,
            duracao: "30 min",
        },
        {
            id: 2,
            nome: "Barba",
            descricao: "Barba completa com acabamento.",
            preco: 20,
            duracao: "20 min",
        },
        {
            id: 3,
            nome: "Corte + Barba",
            descricao: "Corte completo com barba e acabamento.",
            preco: 45,
            duracao: "45 min",
        },
    ];

    const formatarPreco = (valor: number) => {
        return valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    };

    return (
        <main className="min-h-screen bg-zinc-950 text-white">

            {/* Hero */}
            <section className="border-b border-zinc-800 bg-black">

                <div className="mx-auto max-w-5xl px-6 py-16">

                    {/* Logo */}
                    <div className="mb-12 text-center">

                        <p className="text-sm font-semibold tracking-widest text-amber-500">
                            MULTIBARBER
                        </p>

                    </div>

                    {/* Informações */}
                    <div className="text-center">

                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">

                            <Scissors size={34} />

                        </div>

                        <h1 className="mt-6 text-4xl font-bold md:text-5xl">
                            {barbearia.nome}
                        </h1>

                        <p className="mx-auto mt-4 max-w-xl text-zinc-400">
                            {barbearia.descricao}
                        </p>

                        {/* Informações rápidas */}
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-sm text-zinc-400">

                            <div className="flex items-center gap-2">
                                <MapPin size={16} />
                                {barbearia.cidade}
                            </div>

                            <div className="flex items-center gap-2">
                                <Phone size={16} />
                                {barbearia.telefone}
                            </div>

                        </div>

                    </div>

                </div>

            </section>

            {/* Conteúdo */}
            <div className="mx-auto max-w-5xl px-6 py-12">

                {/* Serviços */}
                <section>

                    <div className="mb-6">

                        <p className="text-sm font-medium text-amber-500">
                            SERVIÇOS
                        </p>

                        <h2 className="mt-1 text-3xl font-bold">
                            Escolha seu serviço
                        </h2>

                        <p className="mt-2 text-zinc-500">
                            Selecione o serviço que deseja realizar.
                        </p>

                    </div>

                    <div className="grid gap-4 md:grid-cols-3">

                        {servicos.map((servico) => (

                            <div
                                key={servico.id}
                                className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:-translate-y-1 hover:border-amber-500/50"
                            >

                                <div className="flex items-center justify-between">

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                                        <Scissors size={20} />
                                    </div>

                                    <span className="text-xl font-bold text-amber-500">
                                        {formatarPreco(
                                            servico.preco
                                        )}
                                    </span>

                                </div>

                                <h3 className="mt-6 text-xl font-semibold">
                                    {servico.nome}
                                </h3>

                                <p className="mt-2 min-h-12 text-sm leading-6 text-zinc-500">
                                    {servico.descricao}
                                </p>

                                <div className="mt-5 flex items-center gap-2 text-sm text-zinc-400">

                                    <Clock size={16} />

                                    {servico.duracao}

                                </div>

                                <button
                                    type="button"
                                    className="mt-6 w-full rounded-lg bg-amber-500 px-4 py-3 font-semibold text-black transition hover:bg-amber-400"
                                >
                                    Agendar este serviço
                                </button>

                            </div>

                        ))}

                    </div>

                </section>

                {/* Horários */}
                <section className="mt-16">

                    <div className="mb-6">

                        <p className="text-sm font-medium text-amber-500">
                            FUNCIONAMENTO
                        </p>

                        <h2 className="mt-1 text-3xl font-bold">
                            Horário de atendimento
                        </h2>

                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

                        <div className="grid gap-3 sm:grid-cols-2">

                            {[
                                ["Segunda-feira", "08:00 - 18:00"],
                                ["Terça-feira", "08:00 - 18:00"],
                                ["Quarta-feira", "08:00 - 18:00"],
                                ["Quinta-feira", "08:00 - 18:00"],
                                ["Sexta-feira", "08:00 - 18:00"],
                                ["Sábado", "08:00 - 14:00"],
                                ["Domingo", "Fechado"],
                            ].map(([dia, horario]) => (

                                <div
                                    key={dia}
                                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                                >

                                    <span className="font-medium">
                                        {dia}
                                    </span>

                                    <span
                                        className={
                                            horario === "Fechado"
                                                ? "text-sm text-zinc-600"
                                                : "text-sm text-zinc-400"
                                        }
                                    >
                                        {horario}
                                    </span>

                                </div>

                            ))}

                        </div>

                    </div>

                </section>

                {/* CTA */}
                <section className="mt-16 overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/10 p-8 text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-black">

                        <CalendarDays size={26} />

                    </div>

                    <h2 className="mt-5 text-2xl font-bold">
                        Pronto para renovar o visual?
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-zinc-400">
                        Escolha um serviço e agende seu horário
                        de forma rápida e fácil.
                    </p>

                    <button
                        type="button"
                        className="mt-6 rounded-lg bg-amber-500 px-6 py-3 font-semibold text-black transition hover:bg-amber-400"
                    >
                        Agendar horário
                    </button>

                </section>

            </div>

            {/* Rodapé */}
            <footer className="border-t border-zinc-800 bg-black">

                <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-zinc-600 sm:flex-row">

                    <span>
                        {barbearia.nome}
                    </span>

                    <span>
                        Agendamentos por MultiBarber
                    </span>

                </div>

            </footer>

        </main>
    );
}

export default PublicBarber;