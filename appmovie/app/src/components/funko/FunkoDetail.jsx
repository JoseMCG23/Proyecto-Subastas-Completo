import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import FunkoService from "@/services/FunkoService";
import { Button } from "@/components/ui/button";
import {
    Pencil,
    Power,
    Trash2,
    CalendarDays,
    UserRound,
    Tag,
    AlertTriangle,
} from "lucide-react";

export default function FunkoDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [funko, setFunko] = useState(null);
    const [error, setError] = useState("");
    const [loadingAction, setLoadingAction] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);

    const uploadBaseUrl = import.meta.env.VITE_BASE_URL + "uploads/";

    const loadFunko = async () => {
        try {
            const res = await FunkoService.getFunkoById(id);
            const payload = res.data?.data ?? res.data;
            setFunko(payload);
            setSelectedImage(0);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        loadFunko();
    }, [id]);

    const portada = funko?.imagen_portada
        ? `${uploadBaseUrl}${funko.imagen_portada}`
        : null;

    const galeria = useMemo(() => {
        if (!funko) return [];

        let extra = [];

        if (Array.isArray(funko.imagenes)) {
            extra = funko.imagenes
                .map((x) => (typeof x === "string" ? x : x?.urlImagen ?? x?.url))
                .filter(Boolean);
        } else if (Array.isArray(funko.imagenes_adicionales)) {
            extra = funko.imagenes_adicionales
                .map((x) => (typeof x === "string" ? x : x?.urlImagen ?? x?.url))
                .filter(Boolean);
        }

        const extraUrls = extra.map((img) =>
            img.startsWith("http") ? img : `${uploadBaseUrl}${img}`
        );

        const all = [...(portada ? [portada] : []), ...extraUrls];
        return [...new Set(all)];
    }, [funko, portada, uploadBaseUrl]);

    const dueno = useMemo(() => {
        if (!funko) return "—";
        return (
            funko.dueno ??
            funko.propietario ??
            funko.duenio ??
            funko.owner ??
            funko.usuario_nombre ??
            funko.nombreUsuario ??
            "—"
        );
    }, [funko]);

    const historial = useMemo(() => {
        if (!funko) return [];
        return Array.isArray(funko.subastas) ? funko.subastas : [];
    }, [funko]);

    const categorias = Array.isArray(funko?.categorias)
        ? funko.categorias
        : funko?.categoria
            ? [funko.categoria]
            : [];

    const tieneSubastaActiva = historial.some(
        (s) => String(s?.estado ?? "").toUpperCase() === "ACTIVA"
    );

    if (error) return <div className="p-6 text-white">Error: {error}</div>;
    if (!funko) return <div className="p-6 text-white">Cargando...</div>;

    const idFunko = funko.idFunko ?? funko.id;
    const condicion = funko.condicion ?? "—";
    const estado = funko.estado ?? "—";
    const fechaRegistro = funko.fechaRegistro ?? funko.fecha_registro ?? "—";

    const noSePuedeEditar =
        tieneSubastaActiva || String(estado).toLowerCase() === "eliminado";

    const handleDeleteLogic = async () => {
        const ok = window.confirm("¿Desea eliminar lógicamente este funko?");
        if (!ok) return;

        try {
            setLoadingAction(true);
            await FunkoService.deleteLogicFunko(idFunko);
            toast.success("Funko eliminado lógicamente");
            navigate("/funkos");
        } catch (err) {
            console.error(err);
            toast.error(
                err?.response?.data?.message ||
                "No se pudo eliminar el funko"
            );
        } finally {
            setLoadingAction(false);
        }
    };

    const handleChangeState = async () => {
        try {
            setLoadingAction(true);
            await FunkoService.changeStateFunko(idFunko);
            toast.success("Estado actualizado correctamente");
            await loadFunko();
        } catch (err) {
            console.error(err);
            toast.error(
                err?.response?.data?.message ||
                "No se pudo cambiar el estado"
            );
        } finally {
            setLoadingAction(false);
        }
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 text-white">
            <Link
                to="/funkos"
                className="inline-flex items-center text-sm text-white/70 hover:text-white"
            >
                ← Volver al catálogo
            </Link>

            <div className="mt-5 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                {/* Galería */}
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="flex items-center justify-center rounded-2xl bg-black/20 p-6">
                            {galeria[selectedImage] ? (
                                <img
                                    src={galeria[selectedImage]}
                                    alt={funko.nombre}
                                    className="max-h-[480px] w-auto object-contain transition-all duration-300"
                                    onError={(e) => (e.currentTarget.style.display = "none")}
                                />
                            ) : (
                                <div className="grid h-[430px] w-full place-items-center text-sm text-white/40">
                                    Sin imagen
                                </div>
                            )}
                        </div>
                    </div>

                    {galeria.length > 1 && (
                        <div className="mt-4 flex flex-wrap gap-3">
                            {galeria.slice(0, 6).map((src, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setSelectedImage(idx)}
                                    className={`overflow-hidden rounded-xl border p-1 transition ${selectedImage === idx
                                            ? "border-violet-400 bg-violet-500/10"
                                            : "border-white/10 bg-white/5 hover:border-white/20"
                                        }`}
                                >
                                    <img
                                        src={src}
                                        alt={`img-${idx}`}
                                        className="h-16 w-16 rounded-lg object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Información */}
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
                    <div className="flex flex-wrap items-center gap-2">
                        {categorias.map((cat, index) => (
                            <span
                                key={index}
                                className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200"
                            >
                                {typeof cat === "string" ? cat : cat?.nombre ?? "—"}
                            </span>
                        ))}

                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
                            {condicion}
                        </span>

                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
                            {estado}
                        </span>
                    </div>

                    <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight">
                        {funko.nombre ?? "Funko"}
                    </h1>

                    <p className="mt-4 text-[15px] leading-7 text-white/75">
                        {funko.descripcion ?? "—"}
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <InfoCard
                            icon={<UserRound className="h-4 w-4" />}
                            label="Dueño"
                            value={dueno}
                        />
                        <InfoCard
                            icon={<CalendarDays className="h-4 w-4" />}
                            label="Fecha registro"
                            value={fechaRegistro}
                        />
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        <Link
                            to={noSePuedeEditar ? "#" : `/funkos/update/${idFunko}`}
                            className="sm:col-span-1"
                            onClick={(e) => {
                                if (noSePuedeEditar) {
                                    e.preventDefault();
                                    toast.error("No se puede editar este funko");
                                }
                            }}
                        >
                            <Button
                                type="button"
                                className="w-full gap-2"
                                disabled={loadingAction || noSePuedeEditar}
                            >
                                <Pencil className="h-4 w-4" />
                                Editar
                            </Button>
                        </Link>

                        <Button
                            type="button"
                            variant="secondary"
                            className="w-full gap-2"
                            onClick={handleChangeState}
                            disabled={
                                loadingAction ||
                                String(estado).toLowerCase() === "eliminado"
                            }
                        >
                            <Power className="h-4 w-4" />
                            {String(estado).toLowerCase() === "inactivo"
                                ? "Activar"
                                : "Desactivar"}
                        </Button>

                        <Button
                            type="button"
                            variant="destructive"
                            className="w-full gap-2"
                            onClick={handleDeleteLogic}
                            disabled={
                                loadingAction ||
                                String(estado).toLowerCase() === "eliminado"
                            }
                        >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                        </Button>
                    </div>

                    {noSePuedeEditar && (
                        <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>
                                    {tieneSubastaActiva
                                        ? "Este funko tiene una subasta activa y no puede editarse."
                                        : "Este funko está eliminado y no puede modificarse."}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Historial */}
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
                <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-violet-300" />
                    <h3 className="text-lg font-semibold">Historial de subastas del objeto</h3>
                </div>
                <p className="mt-1 text-sm text-white/60">ID, inicio, cierre y estado.</p>

                {historial.length > 0 ? (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-white/70">
                                <tr>
                                    <th className="px-4 py-3">#</th>
                                    <th className="px-4 py-3">Inicio</th>
                                    <th className="px-4 py-3">Cierre</th>
                                    <th className="px-4 py-3">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historial.map((s, idx) => {
                                    const sid =
                                        s?.idsubasta ??
                                        s?.idSubasta ??
                                        s?.id_subasta ??
                                        s?.id ??
                                        idx + 1;
                                    const ini = s?.fechaInicio ?? s?.fecha_inicio ?? "—";
                                    const fin = s?.fechafin ?? s?.fechaFin ?? s?.fecha_fin ?? "—";
                                    const est = s?.estado ?? "—";

                                    return (
                                        <tr key={sid} className="border-t border-white/10">
                                            <td className="px-4 py-3">{sid}</td>
                                            <td className="px-4 py-3">{ini}</td>
                                            <td className="px-4 py-3">{fin}</td>
                                            <td className="px-4 py-3">
                                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
                                                    {est}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 px-4 py-5 text-sm text-white/70">
                        Este funko no tiene historial de subastas.
                    </div>
                )}
            </div>
        </div>
    );
}

function InfoCard({ icon, label, value }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
            <div className="flex items-center gap-2 text-sm text-white/60">
                {icon}
                <span>{label}</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-white">{value ?? "—"}</p>
        </div>
    );
}