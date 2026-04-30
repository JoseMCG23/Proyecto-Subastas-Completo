import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import FunkoService from "@/services/FunkoService";

const imgUrl = (name) =>
    name ? `${import.meta.env.VITE_BASE_URL}uploads/${name}` : "";

const chipBase =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-white/10";
const selectClass =
    "w-full appearance-none rounded-2xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20";
function EstadoChip({ estado }) {
    const value = String(estado ?? "").toLowerCase();

    let cls = "bg-white/10 text-white/80";

    if (value === "activo" || value === "disponible") {
        cls = "bg-emerald-500/15 text-emerald-200 ring-emerald-400/20";
    } else if (value === "inactivo") {
        cls = "bg-amber-500/15 text-amber-200 ring-amber-400/20";
    } else if (value === "eliminado") {
        cls = "bg-red-500/15 text-red-200 ring-red-400/20";
    }

    return (
        <span className={`${chipBase} ${cls}`}>
            {String(estado ?? "—").toUpperCase()}
        </span>
    );
}

export default function FunkoList() {
    const [funkos, setFunkos] = useState([]);
    const [q, setQ] = useState("");

    const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
    const [estadoFiltro, setEstadoFiltro] = useState("todos");
    const [condicionFiltro, setCondicionFiltro] = useState("todas");
    const [editabilidadFiltro, setEditabilidadFiltro] = useState("todos");

    useEffect(() => {
        FunkoService.getFunkos()
            .then((res) =>
                setFunkos(Array.isArray(res.data) ? res.data : res.data?.data ?? [])
            )
            .catch(() => setFunkos([]));
    }, []);

    const categoriasDisponibles = useMemo(() => {
        const setCategorias = new Set();

        funkos.forEach((f) => {
            const categorias = Array.isArray(f?.categorias)
                ? f.categorias
                : f?.categoria
                ? [f.categoria]
                : [];

            categorias.forEach((cat) => {
                const nombre = typeof cat === "string" ? cat : cat?.nombre;
                if (nombre) setCategorias.add(nombre);
            });
        });

        return Array.from(setCategorias).sort((a, b) => a.localeCompare(b));
    }, [funkos]);

    const filtered = useMemo(() => {
        const text = q.trim().toLowerCase();

        return funkos.filter((f) => {
            const nombre = (f?.nombre ?? "").toLowerCase();
            const estado = (f?.estado ?? "").toString().toLowerCase();
            const condicion = (f?.condicion ?? "").toString().toLowerCase();

            const categorias = Array.isArray(f?.categorias)
                ? f.categorias
                : f?.categoria
                ? [f.categoria]
                : [];

            const categoriasTexto = categorias
                .map((c) => (typeof c === "string" ? c : c?.nombre ?? ""))
                .join(" ")
                .toLowerCase();

            const noSePuedeEditar =
                f?.tieneSubastaActiva === true ||
                estado === "eliminado";

            const coincideBusqueda =
                !text ||
                nombre.includes(text) ||
                categoriasTexto.includes(text) ||
                estado.includes(text) ||
                condicion.includes(text);

            const coincideEstado =
                estadoFiltro === "todos" || estado === estadoFiltro;

            const coincideCondicion =
                condicionFiltro === "todas" || condicion === condicionFiltro;

            const coincideCategoria =
                categoriaFiltro === "todas" ||
                categorias.some((cat) => {
                    const nombreCat = typeof cat === "string" ? cat : cat?.nombre ?? "";
                    return nombreCat === categoriaFiltro;
                });

            const coincideEditabilidad =
                editabilidadFiltro === "todos" ||
                (editabilidadFiltro === "editables" && !noSePuedeEditar) ||
                (editabilidadFiltro === "no_editables" && noSePuedeEditar);

            return (
                coincideBusqueda &&
                coincideEstado &&
                coincideCondicion &&
                coincideCategoria &&
                coincideEditabilidad
            );
        });
    }, [funkos, q, categoriaFiltro, estadoFiltro, condicionFiltro, editabilidadFiltro]);

    const limpiarFiltros = () => {
        setQ("");
        setCategoriaFiltro("todas");
        setEstadoFiltro("todos");
        setCondicionFiltro("todas");
        setEditabilidadFiltro("todos");
    };

    return (
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        Catálogo de Funkos
                    </h1>
                    <p className="mt-1 text-sm text-white/60">
                        {filtered.length} objetos disponibles
                    </p>
                </div>

                <Link to="/funkos/create">
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Nuevo Funko
                    </Button>
                </Link>
            </div>

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
                                placeholder="Nombre, categoría o estado..."
                                className={selectClass}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-white/45">
                                Categoría
                            </label>
                            <select
                                value={categoriaFiltro}
                                onChange={(e) => setCategoriaFiltro(e.target.value)}
                                className={selectClass}
                            >
                                <option value="todas" style={{ backgroundColor: "#18181b", color: "#ffffff" }}>
                                    Todas
                                </option>
                                {categoriasDisponibles.map((cat) => (
                                    <option
                                        key={cat}
                                        value={cat}
                                        style={{ backgroundColor: "#18181b", color: "#ffffff" }}
                                    >
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-white/45">
                                Estado
                            </label>
                            <select
                                value={estadoFiltro}
                                onChange={(e) => setEstadoFiltro(e.target.value)}
                                className={selectClass}
                            >
                                <option value="todos" style={{ backgroundColor: "#18181b", color: "#ffffff" }}>
                                    Todos
                                </option>
                                <option value="activo" style={{ backgroundColor: "#18181b", color: "#ffffff" }}>
                                    Activo
                                </option>
                                <option value="disponible" style={{ backgroundColor: "#18181b", color: "#ffffff" }}>
                                    Programada
                                </option>
                                <option value="inactivo" style={{ backgroundColor: "#18181b", color: "#ffffff" }}>
                                    Inactivo
                                </option>
                                <option value="eliminado" style={{ backgroundColor: "#18181b", color: "#ffffff" }}>
                                    Eliminado
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-white/45">
                                Condición
                            </label>
                            <select
                                value={condicionFiltro}
                                onChange={(e) => setCondicionFiltro(e.target.value)}
                                className={selectClass}
                            >
                                <option value="todas" style={{ backgroundColor: "#18181b", color: "#ffffff" }}>
                                    Todas
                                </option>
                                <option value="nuevo" style={{ backgroundColor: "#18181b", color: "#ffffff" }}>
                                    Nuevo
                                </option>
                                <option value="usado" style={{ backgroundColor: "#18181b", color: "#ffffff" }}>
                                    Usado
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-white/45">
                                Editabilidad
                            </label>
                            <select
                                value={editabilidadFiltro}
                                onChange={(e) => setEditabilidadFiltro(e.target.value)}
                                className={selectClass}
                            >
                                <option value="todos" style={{ backgroundColor: "#18181b", color: "#ffffff" }}>
                                    Todos
                                </option>
                                <option value="editables" style={{ backgroundColor: "#18181b", color: "#ffffff" }}>
                                    Solo editables
                                </option>
                                <option value="no_editables" style={{ backgroundColor: "#18181b", color: "#ffffff" }}>
                                    Solo no editables
                                </option>
                            </select>
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
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((f) => {
                            const id = f?.idFunko ?? f?.id ?? f?.id_funko;
                            const nombre = f?.nombre ?? "Sin nombre";
                            const estado = f?.estado ?? "—";
                            const portada = f?.imagen_portada ?? f?.imagenPortada ?? f?.portada;

                            const categorias = Array.isArray(f?.categorias)
                                ? f.categorias
                                : f?.categoria
                                ? [f.categoria]
                                : [];

                            const noSePuedeEditar =
                                f?.tieneSubastaActiva === true ||
                                String(estado).toLowerCase() === "eliminado";

                            return (
                                <div
                                    key={id}
                                    className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-violet-500/5 transition hover:-translate-y-0.5 hover:border-violet-400/30"
                                >
                                    <div className="relative aspect-square w-full overflow-hidden bg-black/30">
                                        {portada ? (
                                            <img
                                                src={imgUrl(portada)}
                                                alt={nombre}
                                                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                                                onError={(e) => (e.currentTarget.style.opacity = 0.2)}
                                            />
                                        ) : (
                                            <div className="grid h-full w-full place-items-center text-sm text-white/40">
                                                Sin imagen
                                            </div>
                                        )}

                                        <div className="absolute left-3 top-3 flex max-w-[85%] flex-wrap gap-2">
                                            {categorias.length > 0
                                                ? categorias.slice(0, 1).map((cat, index) => (
                                                      <span
                                                          key={index}
                                                          className={`${chipBase} bg-violet-500/15 text-violet-200`}
                                                      >
                                                          {typeof cat === "string"
                                                              ? cat
                                                              : cat?.nombre ?? "—"}
                                                      </span>
                                                  ))
                                                : null}
                                        </div>
                                    </div>

                                    <div className="flex h-[125px] flex-col p-5">
                                        <h3 className="line-clamp-2 min-h-[56px] text-[17px] font-semibold text-white">
                                            {nombre}
                                        </h3>

                                        <div className="mt-auto flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <EstadoChip estado={estado} />

                                                {!noSePuedeEditar && (
                                                    <Link
                                                        to={`/funkos/update/${id}`}
                                                        className="text-sm text-amber-300 hover:text-amber-200"
                                                    >
                                                        Editar
                                                    </Link>
                                                )}
                                            </div>

                                            <Link
                                                to={`/funkos/${id}`}
                                                className="text-sm text-violet-300 hover:text-violet-200"
                                            >
                                                Ver detalle →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filtered.length === 0 && (
                        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
                            No hay resultados con esos filtros.
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}