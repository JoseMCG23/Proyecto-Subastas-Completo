import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SubastaService from "@/services/SubastaService";

export function HistorialPujas() {
    const { id } = useParams();
    const [pujas, setPujas] = useState([]);

    useEffect(() => {
        SubastaService.getPujasBySubasta(id)
            .then((r) => setPujas(r.data.data || []))
            .catch(console.error);
    }, [id]);

    return (
        <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white">Historial de Pujas</h1>
                    <p className="text-sm text-white/60">Subasta #{id}</p>
                </div>

                <Link
                    to={`/subastas/${id}`}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white transition"
                >
                    ← Volver a la subasta
                </Link>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                {pujas.length === 0 ? (
                    <p className="text-white/60">Aún no hay pujas registradas.</p>
                ) : (
                    <div className="space-y-3">
                        {pujas.map((p, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-5 py-4"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        {p.usuario || "Usuario"}
                                    </p>
                                    <p className="text-xs text-white/50">{p.fechaYhora || ""}</p>
                                </div>

                                <p className="text-sm font-extrabold text-emerald-300">
                                    ₡{Number(p.monto || 0).toLocaleString("es-CR")}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}