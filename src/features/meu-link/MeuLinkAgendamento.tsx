import { useEffect, useState } from "react";
import { Copy, ExternalLink, Link as LinkIcon } from "lucide-react";
import { buscarMinhaBarbearia } from "../../utils/barbearia";

function MeuLinkAgendamento() {
  const [slugBarbearia, setSlugBarbearia] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarBarbearia() {
      try {
        setCarregando(true);
        setErro("");

        const barbearia = await buscarMinhaBarbearia();
        setSlugBarbearia(barbearia.slug);
      } catch (error) {
        console.error("Erro ao carregar link:", error);
        setErro("Não foi possível carregar o link de agendamento.");
      } finally {
        setCarregando(false);
      }
    }

    carregarBarbearia();
  }, []);

  const linkPublico = slugBarbearia
    ? `${window.location.origin}/barbearia/${slugBarbearia}`
    : "";

  async function copiarLink() {
    setErro("");
    setCopiado(false);

    if (!linkPublico) {
      setErro("O link ainda não está disponível.");
      return;
    }

    try {
      await navigator.clipboard.writeText(linkPublico);
      setCopiado(true);
    } catch (error) {
      console.error("Erro ao copiar link:", error);
      setErro(
        "Não foi possível copiar automaticamente. Selecione e copie o link manualmente.",
      );
    }
  }

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8">
      <header>
        <p className="text-sm text-zinc-400">
          Compartilhe sua página com seus clientes
        </p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
          Meu link de agendamento
        </h1>
      </header>

      <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <LinkIcon size={22} />
          </div>

          <div>
            <h2 className="text-lg font-semibold sm:text-xl">
              Link público da sua barbearia
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Envie este endereço para seus clientes acessarem sua página e
              agendarem um horário.
            </p>
          </div>
        </div>

        <div className="mt-6 flex min-w-0 flex-col gap-3 sm:flex-row">
          <input
            type="text"
            readOnly
            value={
              carregando
                ? "Carregando link..."
                : linkPublico || "Não foi possível carregar o link"
            }
            className="min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300 outline-none"
          />

          <button
            type="button"
            onClick={copiarLink}
            disabled={carregando || !linkPublico}
            className="flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Copy size={18} />
            {copiado ? "Copiado!" : "Copiar link"}
          </button>
        </div>

        {erro && <p className="mt-3 text-sm text-red-400">{erro}</p>}

        {copiado && (
          <p className="mt-3 text-sm text-green-400">
            Link copiado! Agora você pode enviá-lo aos seus clientes.
          </p>
        )}

        {linkPublico && !carregando && (
          <a
            href={linkPublico}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-amber-500 transition hover:text-amber-400"
          >
            <ExternalLink size={17} />
            Abrir página de agendamento
          </a>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
        <h2 className="font-semibold">Como utilizar seu link?</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Copie o endereço acima e compartilhe pelo WhatsApp, Instagram ou
          qualquer outro canal. Seus clientes poderão acessar sua página pública
          e solicitar um agendamento.
        </p>
      </section>
    </div>
  );
}

export default MeuLinkAgendamento;
