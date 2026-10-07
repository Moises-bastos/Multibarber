export type StatusAgendamento =
    | "agendado"
    | "confirmado"
    | "concluido"
    | "cancelado";

export type Agendamento = {
    id: number;
    cliente: string;
    telefone: string;
    servico: string;
    preco: number;
    dia: string;
    data: string;
    horario: string;
    status: StatusAgendamento;
};

const CHAVE_AGENDAMENTOS = "multibarber_agendamentos";

export function buscarAgendamentos(): Agendamento[] {
    const dados = localStorage.getItem(CHAVE_AGENDAMENTOS);

    if (!dados) {
        return [];
    }

    try {
        return JSON.parse(dados);
    } catch {
        return [];
    }
}

export function salvarAgendamentos(
    agendamentos: Agendamento[]
) {
    localStorage.setItem(
        CHAVE_AGENDAMENTOS,
        JSON.stringify(agendamentos)
    );
}

export function adicionarAgendamento(
    agendamento: Agendamento
) {
    const agendamentos = buscarAgendamentos();

    agendamentos.push(agendamento);

    salvarAgendamentos(agendamentos);
}