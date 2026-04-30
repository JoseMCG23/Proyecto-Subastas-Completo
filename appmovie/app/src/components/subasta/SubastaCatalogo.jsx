import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SubastaService from "@/services/SubastaService";
import Pusher from "pusher-js";

const API_UPLOADS = "http://localhost:81/appmovie/api/uploads";

export function SubastaCatalogo() {
    const [subastas, setSubastas] = useState([]);
    const [q, setQ] = useState("");
    const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
    const [estadoFiltro, setEstadoFiltro] = useState("todos");
    const [isLoading, setIsLoading] = useState(false);
    void isLoading;

    const [searchParams] = useSearchParams();
    const searchQuery = (searchParams.get("q") || "").toLowerCase();

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setIsLoading(true);
                const res = await SubastaService.getSubastas();
                const list = res.data.data || res.data || [];
                setSubastas(Array.isArray(list) ? list : []);
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
            cargarDatos();
        });

        channel.bind("subasta-actualizada", () => {
            cargarDatos();
        });

        channel.bind("subasta-estado-cambiado", () => {
            cargarDatos();
        });

        return () => {
            channel.unbind_all();
            pusher.unsubscribe("subastas");
        };
    }, []);

    // Categorías dinámicas
    const categoriasDisponibles = useMemo(() => {
        const setCats = new Set();
        subastas.forEach((s) => {
            const cats = s.categorias ? s.categorias.split(",").map(c => c.trim()) : [];
            cats.forEach(c => c && setCats.add(c));
        });
        return Array.from(setCats).sort((a, b) => a.localeCompare(b));
    }, [subastas]);

    // Filtrado
    const filtered = useMemo(() => {
        const text = (q || searchQuery).trim().toLowerCase();

        return subastas.filter((s) => {
            const nombre = (s.objeto || s.nombre || "").toLowerCase();
            const estado = (s.estado || "").toLowerCase();
            const categorias = (s.categorias || "").toLowerCase();

            const coincideBusqueda = !text || nombre.includes(text) || categorias.includes(text);
            const coincideEstado = estadoFiltro === "todos" || estado === estadoFiltro.toLowerCase();
            const coincideCategoria = categoriaFiltro === "todas" || categorias.includes(categoriaFiltro.toLowerCase());

            return coincideBusqueda && coincideEstado && coincideCategoria;
        });
    }, [subastas, q, searchQuery, categoriaFiltro, estadoFiltro]);

    const limpiarFiltros = () => {
        setQ("");
        setCategoriaFiltro("todas");
        setEstadoFiltro("todos");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 px-6 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Filtros laterales */}
                <aside className="h-fit rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-violet-500/5 lg:sticky lg:top-6">
                    <div className="mb-5 flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-violet-500/15 ring-1 ring-violet-400/20">
                            <SlidersHorizontal className="h-4 w-4 text-violet-300" />
                        </div>
                        <h2 className="text-base font-semibold text-white">Filtros</h2>
                    </div>

                    <div className="space-y-4">
                        {/* Buscador */}
                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-white/45">Buscar</label>
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Nombre, estado o categoría..."
                                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-violet-400/40"
                            />
                        </div>

                        {/* Categoría */}
                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-white/45">Categoría</label>
                            <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                                <SelectTrigger className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-400/40">
                                    <SelectValue placeholder="Todas" />
                                </SelectTrigger>
                                <SelectContent className="bg-black/95 border-white/20 text-white">
                                    <SelectItem value="todas">Todas</SelectItem>
                                    {categoriasDisponibles.map((cat) => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Estado */}
                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-white/45">Estado</label>
                            <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
                                <SelectTrigger className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white outline-none focus:border-violet-400/40">
                                    <SelectValue placeholder="Todos" />
                                </SelectTrigger>
                                <SelectContent className="bg-black/95 border-white/20 text-white">
                                    <SelectItem value="todos">Todos</SelectItem>
                                    <SelectItem value="ACTIVA">Activa</SelectItem>
                                    <SelectItem value="PROGRAMADA">Programada</SelectItem>
                                    <SelectItem value="INACTIVA">Inactiva</SelectItem>
                                    <SelectItem value="FINALIZADA">Finalizada</SelectItem>
                                    <SelectItem value="CANCELADA">Cancelada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={limpiarFiltros}
                            className="w-full rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10"
                        >
                            Limpiar filtros
                        </Button>
                    </div>
                </aside>

                {/* Catálogo */}
                <section className="flex-1">
                    <div className="mb-6">
                        <h1 className="text-3xl font-extrabold text-white">Catálogo de subastas</h1>
                        <p className="text-sm text-white/60">{filtered.length} subastas disponibles</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {filtered.map((s) => {
                            const imgName = s.imagen || s.imagen_portada || s.imagenPortada || "";
                            const imgSrc = imgName ? `${API_UPLOADS}/${imgName}` : "";

                            return (
                                <Link
                                    key={s.idsubasta}
                                    to={`/subastas/${s.idsubasta}`}
                                    className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-violet-500/5 transition hover:-translate-y-0.5 hover:border-violet-400/30 relative"
                                >
                                    <div className="relative aspect-square w-full overflow-hidden bg-black/30">
                                        {imgSrc ? (
                                            <img
                                                src={imgSrc}
                                                alt={s.objeto || s.nombre}
                                                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                                            />
                                        ) : (
                                            <div className="grid h-full w-full place-items-center text-sm text-white/40">
                                                Sin imagen
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col">
                                        <p className="font-semibold line-clamp-1">{s.objeto || s.nombre}</p>

                                        <div className="mt-4 flex-1 flex flex-col justify-between min-h-35">
                                            <div>
                                                <p className="text-xs text-white/50">Precio base</p>
                                                <p className="text-lg font-extrabold text-emerald-300">
                                                    ₡{Number(s.precioBase || 0).toLocaleString("es-CR")}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                {(s.estado === "FINALIZADA" || s.estado === "CANCELADA") ? (
                                                    <div className="col-span-2 w-full bg-violet-500/10 border border-violet-500/20 rounded px-2 py-1">
                                                        <p className="text-white/50 text-[10px] text-center">Fecha cierre</p>
                                                        <p className="font-bold text-violet-300 text-center">
                                                            {s.fechafin ? new Date(s.fechafin).toLocaleDateString("es-ES") : "—"}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="bg-violet-500/10 border border-violet-500/20 rounded px-2 py-1">
                                                            <p className="text-white/50 text-[10px]">Pujas</p>
                                                            <p className="font-bold text-violet-300">{s.cantidadPujas || 0}</p>
                                                        </div>
                                                        <div className="bg-blue-500/10 border border-blue-500/20 rounded px-2 py-1">
                                                            <p className="text-white/50 text-[10px]">Incremento mínimo</p>
                                                            <p className="font-bold text-blue-300">₡{Number(s.incre_minimo || 0).toLocaleString("es-CR")}</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
}