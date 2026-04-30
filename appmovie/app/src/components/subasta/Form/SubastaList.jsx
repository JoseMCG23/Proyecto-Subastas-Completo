import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SubastaService from "@/services/SubastaService";
import Pusher from "pusher-js";

const API_UPLOADS = "http://localhost:81/appmovie/api/uploads";

export function SubastaList({ onCreate, onEdit, onViewDetail, onPublish, onCancel }) {
    const [subastas, setSubastas] = useState([]);
    const [error, setError] = useState("");
    const [q, setQ] = useState("");
    const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
    const [estadoFiltro, setEstadoFiltro] = useState("todos");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setIsLoading(true);

                const subastaRes = await SubastaService.getSubastas();
                const subastasData = subastaRes.data?.data || subastaRes.data || [];
                setSubastas(Array.isArray(subastasData) ? subastasData : []);

            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }

            
        };

        cargarDatos();

        const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
            cluster: import.meta.env.VITE_PUSHER_CLUSTER,
        });

        const channel = pusher.subscribe("subastas");

        channel.bind("subasta-creada", () => {
            console.log("📢 subasta-creada");
            cargarDatos();
        });

        channel.bind("subasta-actualizada", () => {
            console.log("📢 subasta-actualizada");
            cargarDatos();
        });

        channel.bind("subasta-estado-cambiado", () => {
            console.log("📢 subasta-estado-cambiado");
            cargarDatos();
        });

        return () => {
    channel.unbind_all();
    pusher.unsubscribe("subastas");
};
    }, []);

    

    const categoriasDisponibles = useMemo(() => {
        const setCategorias = new Set();

        subastas.forEach((s) => {
            const categorias = s?.categorias ? s.categorias.split(',').map(c => c.trim()) : [];
            categorias.forEach((cat) => {
                if (cat) setCategorias.add(cat);
            });
        });

        return Array.from(setCategorias).sort((a, b) => a.localeCompare(b));
    }, [subastas]);

    // Filtrado
    const filtered = useMemo(() => {
        const text = q.trim().toLowerCase();

        return subastas.filter((s) => {
            const nombre = (s?.objeto || s?.nombre || "").toLowerCase();
            const estado = (s?.estado || "").toLowerCase();
            const categorias = (s?.categorias || "").toLowerCase();
            const estadoFiltroNormalizado = (estadoFiltro || "").toLowerCase();

            const coincideBusqueda =
                !text ||
                nombre.includes(text) ||
                estado.includes(text) ||
                categorias.includes(text);

            const coincideEstado =
                estadoFiltroNormalizado === "todos" || estado === estadoFiltroNormalizado;

            const coincideCategoria =
                categoriaFiltro === "todas" ||
                categorias.includes(categoriaFiltro.toLowerCase());

            return coincideBusqueda && coincideEstado && coincideCategoria;
        });
    }, [subastas, q, categoriaFiltro, estadoFiltro]);

    const limpiarFiltros = () => {
        setQ("");
        setCategoriaFiltro("todas");
        setEstadoFiltro("todos");
    };

    if (error) return <div className="p-6 text-white">Error: {error}</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
            <div className="mx-auto w-full max-w-7xl px-6 pb-12 pt-8">
                {/* Encabezado */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
                >
                    <div>
                        <motion.p
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-sm font-bold text-violet-400/90 uppercase tracking-wider"
                        >
                            ADMINISTRACIÓN
                        </motion.p>
                        <motion.h1
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mt-2 text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent"
                        >
                            Mantenimiento de Subastas
                        </motion.h1>
                        <motion.p
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mt-2 text-lg text-white/70"
                        >
                            Creación, edición y administración de subastas
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Button
                            onClick={onCreate}
                            className="h-12 px-6 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 hover:from-violet-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-3"
                            disabled={isLoading}
                        >
                            Nueva Subasta
                        </Button>
                    </motion.div>
                </motion.div>

                <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
                    <aside className="h-fit rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-violet-500/5 lg:sticky lg:top-6">
                        <div className="mb-5 flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-violet-500/15 ring-1 ring-violet-400/20">
                                <SlidersHorizontal className="h-4 w-4 text-violet-300" />
                            </div>
                            <h2 className="text-base font-semibold text-white">Filtros</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-white/45">
                                    Buscar
                                </label>
                                <input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Nombre, estado o categoría..."
                                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-violet-400/40"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-white/45">
                                    Categoría
                                </label>
                                <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                                    <SelectTrigger className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-400/40">
                                        <SelectValue placeholder="Todas" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-black/95 border-white/20 text-white">
                                        <SelectItem value="todas" className="bg-black/80 text-white hover:bg-violet-500/20 hover:text-violet-200 focus:bg-violet-500/30 focus:text-violet-100">Todas</SelectItem>
                                        {categoriasDisponibles.map((cat) => (
                                            <SelectItem key={cat} value={cat} className="bg-black/80 text-white hover:bg-violet-500/20 hover:text-violet-200 focus:bg-violet-500/30 focus:text-violet-100">
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-white/45">
                                    Estado
                                </label>
                                <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
                                    <SelectTrigger className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-400/40">
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-black/95 border-white/20 text-white">
                                        <SelectItem value="todos" className="bg-black/80 text-white hover:bg-violet-500/20 hover:text-violet-200 focus:bg-violet-500/30 focus:text-violet-100">Todos</SelectItem>
                                        <SelectItem value="ACTIVA" className="bg-black/80 text-white hover:bg-violet-500/20 hover:text-violet-200 focus:bg-violet-500/30 focus:text-violet-100">Activa</SelectItem>
                                        <SelectItem value="PROGRAMADA" className="bg-black/80 text-white hover:bg-violet-500/20 hover:text-violet-200 focus:bg-violet-500/30 focus:text-violet-100">Programada</SelectItem>
                                        <SelectItem value="INACTIVA" className="bg-black/80 text-white hover:bg-violet-500/20 hover:text-violet-200 focus:bg-violet-500/30 focus:text-violet-100">Inactiva</SelectItem>
                                        <SelectItem value="FINALIZADA" className="bg-black/80 text-white hover:bg-violet-500/20 hover:text-violet-200 focus:bg-violet-500/30 focus:text-violet-100">Finalizada</SelectItem>
                                        <SelectItem value="CANCELADA" className="bg-black/80 text-white hover:bg-violet-500/20 hover:text-violet-200 focus:bg-violet-500/30 focus:text-violet-100">Cancelada</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={limpiarFiltros}
                                className="w-full rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10"
                            >
                                Limpiar filtros
                            </Button>
                        </div>
                    </aside>

                    <section>
                    {/* Total de subastas */}
                    <div className="mb-6">
                        <p className="text-lg font-bold text-white/90">
                            {filtered.length} subasta{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {filtered.length === 0 ? (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-16 text-center shadow-2xl"
                        >
                            <div className="flex flex-col items-center gap-4">
                                <p className="text-xl text-white/60 font-semibold">No hay subastas para mostrar</p>
                                <p className="text-white/40">Prueba con otros filtros o crea una nueva subasta</p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                            {filtered.map((s, index) => {
                                const imgName = s.imagen || s.imagen_portada || s.imagenPortada || "";
                                const imgSrc = imgName ? `${API_UPLOADS}/${imgName}` : "";

                                const pujasCount = Number(s?.cantidadPujas ?? s?.cantidadTotalPujas ?? 0);
                                const inicioFecha = new Date(s?.fechaInicio);
                                const esEditableEstado = s.estado === "INACTIVA" || s.estado === "PROGRAMADA";
                                const aunNoInicia =
                                    s.estado === "INACTIVA" ||
                                    (!Number.isNaN(inicioFecha.getTime()) && inicioFecha > new Date());
                                const canEdit = esEditableEstado && pujasCount === 0 && aunNoInicia;
                                const canPublish = s.estado === "INACTIVA";
                                const canCancel = s.estado === "INACTIVA" || s.estado === "PROGRAMADA";

                                return (
                                    <motion.div
                                        key={s.idsubasta}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 * index }}
                                        whileHover={{ y: -8 }}
                                        className="group overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 shadow-2xl shadow-violet-500/10 transition-all duration-300 hover:border-violet-400/40 hover:shadow-violet-500/20 relative flex flex-col"
                                    >
                                        {/* Imagen  */}
                                        <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-black/30 to-black/10">
                                            {imgSrc ? (
                                                <img
                                                    src={imgSrc}
                                                    alt={s.objeto || s.nombre}
                                                    className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="grid h-full w-full place-items-center text-white/40">
                                                    <div className="text-center">
                                                        <p className="text-sm">Sin imagen</p>
                                                    </div>
                                                </div>
                                            )}
                                            {/* Overlay con gradiente */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>

                                        {/* Contenido */}
                                        <div className="p-6 flex-1 flex flex-col">
                                            {/* Título */}
                                            <h3 className="font-bold text-xl text-white mb-2 line-clamp-2 min-h-[3.75rem] group-hover:text-violet-300 transition-colors duration-200">
                                                {s.objeto || s.nombre}
                                            </h3>

                                            {/* Información */}
                                            <div className="mt-4 flex-1 flex flex-col justify-between min-h-[155px]">
                                                <div className="mb-4">
                                                    <p className="text-sm text-white/60 mb-1">
                                                        Precio base
                                                    </p>
                                                    <p className="text-2xl font-extrabold text-emerald-300">
                                                        ₡{Number(s.precioBase || 0).toLocaleString("es-CR")}
                                                    </p>
                                                </div>

                                                <div className="flex gap-3 text-xs">
                                                    <div className="flex-1 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-xl px-3 py-2">
                                                        <p className="text-white/50 text-[10px] uppercase tracking-wide mb-1">Pujas</p>
                                                        <p className="font-bold text-violet-300 text-sm">
                                                            {s.cantidadPujas || 0}
                                                        </p>
                                                    </div>

                                                    <div className="flex-1 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl px-3 py-2">
                                                        <p className="text-white/50 text-[10px] uppercase tracking-wide mb-1">Incremento</p>
                                                        <p className="font-bold text-blue-300 text-sm">
                                                            ₡{Number(s.incre_minimo || 0).toLocaleString("es-CR")}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Botones */}
                                            <div className="flex gap-3 mt-6 pt-4 border-t border-white/20">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => onViewDetail(s)}
                                                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 text-white/80 hover:text-white text-sm font-semibold py-3 transition-all duration-200 border border-white/20 hover:border-white/40"
                                                    title="Ver detalle"
                                                >
                                                    Ver
                                                </motion.button>

                                                {canEdit && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => onEdit(s)}
                                                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-blue-300 hover:text-blue-200 text-sm font-semibold py-3 transition-all duration-200 border border-blue-500/30 hover:border-blue-400/50"
                                                        title="Editar"
                                                    >
                                                        Editar
                                                    </motion.button>
                                                )}

                                                {canPublish && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => onPublish(s)}
                                                        disabled={isLoading}
                                                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 text-emerald-300 hover:text-emerald-200 text-sm font-semibold py-3 transition-all duration-200 border border-emerald-500/30 hover:border-emerald-400/50 disabled:opacity-50"
                                                        title="Publicar"
                                                    >
                                                        Publicar
                                                    </motion.button>
                                                )}

                                                {canCancel && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => onCancel(s.idsubasta)}
                                                        disabled={isLoading}
                                                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 text-red-300 hover:text-red-200 text-sm font-semibold py-3 transition-all duration-200 border border-red-500/30 hover:border-red-400/50 disabled:opacity-50"
                                                        title="Cancelar"
                                                    >
                                                        Cancelar
                                                    </motion.button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                    </section>
                </div>
            </div>
        </div>
    );
}

export default SubastaList;