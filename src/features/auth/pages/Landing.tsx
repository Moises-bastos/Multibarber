import { Link } from "react-router-dom";

function Landing() {
    return (
        <main className="min-h-screen bg-black text-white">
            <header className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold">
                    Multi<span className="text-amber-500">Barber</span>
                </h1>

                <Link
                    to="/login"
                    className="border border-zinc-700 px-5 py-2 rounded-lg hover:bg-zinc-900 transition"
                >
                    Entrar
                </Link>
            </header>

            <section className="max-w-7xl mx-auto px-6 pt-24 pb-32">
                <div className="max-w-3xl">
                    <span className="inline-block text-amber-500 font-medium mb-5">
                        A plataforma para o seu negócio
                    </span>

                    <h2 className="text-5xl md:text-7xl font-bold leading-tight">
                        Sua barbearia.
                        <br />
                        <span className="text-amber-500">
                            Seu negócio.
                        </span>
                    </h2>

                    <p className="text-zinc-400 text-lg md:text-xl mt-6 max-w-2xl">
                        Gerencie seus clientes, organize sua agenda e permita
                        que seus clientes agendem horários online.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mt-10">
                        <Link
                            to="/cadastro"
                            className="bg-amber-500 text-black font-semibold px-7 py-3 rounded-lg hover:bg-amber-400 transition"
                        >
                            Começar agora
                        </Link>

                        <button className="border border-zinc-700 px-7 py-3 rounded-lg hover:bg-zinc-900 transition">
                            Conhecer o MultiBarber
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Landing;