import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@/hooks/useUser";
import { Link } from "react-router-dom";
import { Gavel, Clock, ArrowLeft } from "lucide-react";

const API_BASE = "http://localhost:81/appmovie/api";
const API_UPLOADS = "http://localhost:81/appmovie/api/uploads";

export function MisPujas() {
    const { user } = useUser();
    const [pujas, setPujas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarHistorial = async () => {
            try {
                if (!user?.id) {
                    setError("Debe iniciar sesión para ver su historial.");
                    return;
                }

                const response = await axios.get(`${API_BASE}/puja/getByUsuario/${user.id}`);
                setPujas(response.data || []);
            } catch (err) {
                console.error(err);
                setError("No se pudo cargar el historial de pujas.");
            } finally {
                setLoading(false);
            }
        };

        cargarHistorial();
    }, [user?.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 px-6 pt-32 text-white">
                <p>Cargando historial...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 px-6 pt-32 pb-16 text-white">
            <div className="mx-auto max-w-5xl">
                <Link
                    to="/subastas"
                    className="mb-6 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a subastas
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-black">Mi historial de pujas</h1>
                    <p className="mt-2 text-white/60">
                        Aquí puede ver todas las pujas realizadas por el usuario logueado.
                    </p>
                </div>

                {error && (
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
                        {error}
                    </div>
                )}

                {!error && pujas.length === 0 && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
                        Aún no ha realizado pujas.
                    </div>
                )}

                <div className="space-y-4">
                    {pujas.map((puja) => (
                        <div
                            key={puja.idPuja}
                            className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl md:flex-row md:items-center"
                        >
                            <img
                                src={
                                    puja.imagen_portada
                                        ? `${API_UPLOADS}/${puja.imagen_portada}`
                                        : "https://placehold.co/120x120?text=Funko"
                                }
                                alt={puja.nombreFunko}
                                className="h-28 w-28 rounded-2xl object-cover"
                            />

                            <div className="flex-1">
                                <h2 className="text-xl font-bold">{puja.nombreFunko}</h2>

                                <p className="mt-1 text-sm text-white/60">
                                    Subasta #{puja.subastaId} · Estado:{" "}
                                    <span className="font-semibold text-violet-300">
                                        {puja.estadoSubasta}
                                    </span>
                                </p>

                                <div className="mt-3 flex flex-wrap gap-3 text-sm">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-violet-500/15 px-3 py-1 text-violet-200">
                                        <Gavel className="h-4 w-4" />
                                        Puja: ₡{Number(puja.monto).toLocaleString("es-CR")}
                                    </span>

                                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-white/70">
                                        <Clock className="h-4 w-4" />
                                        {puja.fechaYhora}
                                    </span>
                                </div>
                            </div>

                            <Link
                                to={`/subastas/${puja.subastaId}`}
                                className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-center text-sm font-bold text-white hover:from-violet-500 hover:to-fuchsia-500"
                            >
                                Ver subasta
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}