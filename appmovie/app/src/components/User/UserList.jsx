import { useEffect, useMemo, useState } from "react";
import UsuarioService from "@/services/UsuarioService";
import { Link } from "react-router-dom";
import {
    Search,
    Users,
    CircleCheckBig,
    Ban,
    ShieldCheck,
    ChevronRight,
} from "lucide-react";

function StatusBadge({ value }) {
    const v = String(value ?? "").toUpperCase();
    const isActivo = v === "ACTIVO";
    const isBloq = v === "BLOQUEADO" || v === "INACTIVO";

    const cls = isActivo
        ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
        : isBloq
            ? "border-rose-400/20 bg-rose-500/10 text-rose-200"
            : "border-white/10 bg-white/5 text-white/70";

    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${cls}`}
        >
            {v || "-"}
        </span>
    );
}

function RoleBadge({ value }) {
    const v = String(value ?? "");
    return (
        <span className="inline-flex items-center rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold text-violet-200">
            {v || "-"}
        </span>
    );
}

function MiniStat({ icon, label, value, tone = "neutral" }) {
    const toneCls =
        tone === "ok"
            ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/20"
            : tone === "bad"
                ? "text-rose-300 bg-rose-500/10 border-rose-500/20"
                : tone === "violet"
                    ? "text-violet-300 bg-violet-500/10 border-violet-500/20"
                    : "text-white/70 bg-white/5 border-white/10";

    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
                    {label}
                </p>
                <div className={`grid h-9 w-9 place-items-center rounded-xl border ${toneCls}`}>
                    {icon}
                </div>
            </div>
            <p className="mt-3 text-2xl font-black tracking-tight text-white">{value}</p>
        </div>
    );
}

function getInitials(name) {
    const safe = String(name ?? "").trim();
    if (!safe) return "U";
    const parts = safe.split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase()).join("");
}

function UserCard({ user }) {
    const id = user.idUsuario ?? user.id ?? user.id_usuario;
    const nombre = user.nombreCompleto ?? "Usuario";
    const initials = getInitials(nombre);

    return (
        <article className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-violet-500/[0.05] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-violet-400/20 hover:shadow-[0_0_40px_rgba(139,92,246,0.10)]">
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-20 w-20 rounded-full bg-fuchsia-500/10 blur-2xl" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 ring-1 ring-white/10">
                        <span className="text-sm font-bold tracking-wide text-white/90">
                            {initials}
                        </span>
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <Link
                                to={`/users/${id}`}
                                className="truncate text-lg font-bold tracking-tight text-white transition hover:text-violet-300"
                            >
                                {nombre}
                            </Link>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/50">
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <RoleBadge value={user.rol} />
                            <StatusBadge value={user.estado} />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                    <Link
                        to={`/users/${id}`}
                        className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
                    >
                        Ver detalle
                    </Link>

                    <Link
                        to={`/users/update/${id}`}
                        state={{ usuario: user }}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-500/15 px-4 py-2.5 text-sm font-semibold text-violet-200 ring-1 ring-violet-500/25 transition hover:bg-violet-500/20 hover:text-white"
                    >
                        Editar
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </article>
    );
}

export default function UserList() {
    const [data, setData] = useState([]);
    const [error, setError] = useState("");
    const [q, setQ] = useState("");

    useEffect(() => {
        UsuarioService.getUsuarios()
            .then((res) => {
                const payload = res.data;

                if (Array.isArray(payload)) setData(payload);
                else if (payload && Array.isArray(payload.data)) setData(payload.data);
                else if (payload && Array.isArray(payload.results)) setData(payload.results);
                else if (payload && Array.isArray(payload.usuarios)) setData(payload.usuarios);
                else {
                    console.log("RESPUESTA USUARIOS (NO ARRAY):", payload);
                    setData([]);
                }
            })
            .catch((err) => setError(err.message));
    }, []);

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return data;

        return data.filter((u) => {
            const nombre = String(u.nombreCompleto ?? "").toLowerCase();
            const rol = String(u.rol ?? "").toLowerCase();
            const estado = String(u.estado ?? "").toLowerCase();
            const correo = String(u.correo ?? u.email ?? "").toLowerCase();
            return (
                nombre.includes(s) ||
                rol.includes(s) ||
                estado.includes(s) ||
                correo.includes(s)
            );
        });
    }, [data, q]);

    const stats = useMemo(() => {
        const total = data.length;
        const activos = data.filter(
            (u) => String(u.estado ?? "").toUpperCase() === "ACTIVO"
        ).length;
        const bloqueados = data.filter((u) => {
            const estado = String(u.estado ?? "").toUpperCase();
            return estado === "BLOQUEADO" || estado === "INACTIVO";
        }).length;
        const roles = new Set(
            data.map((u) => String(u.rol ?? "").trim()).filter(Boolean)
        ).size;

        return { total, activos, bloqueados, roles };
    }, [data]);

    if (error) return <div className="p-6 text-white">Error: {error}</div>;

    return (
        <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-8">
            <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                <aside className="xl:sticky xl:top-24 xl:self-start">
                    <div className="overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-violet-500/[0.06] p-6 shadow-2xl shadow-violet-900/10">
                        <div className="absolute" />

                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-300/90">
                            Mantenimiento
                        </p>

                        <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
                            Usuarios
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-white/60">
                            Consulta, filtra y administra la información de los usuarios registrados.
                        </p>

                        <div className="relative mt-5">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Buscar usuario..."
                                className="h-12 w-full rounded-2xl border border-white/10 bg-black/20 pl-10 pr-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-violet-400/40 focus:bg-white/[0.06] focus:ring-2 focus:ring-violet-500/10"
                            />
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                            <MiniStat
                                label="Total usuarios"
                                value={stats.total}
                                icon={<Users className="h-4 w-4" />}
                            />
                            <MiniStat
                                label="Activos"
                                value={stats.activos}
                                icon={<CircleCheckBig className="h-4 w-4" />}
                                tone="ok"
                            />
                            <MiniStat
                                label="Bloqueados"
                                value={stats.bloqueados}
                                icon={<Ban className="h-4 w-4" />}
                                tone="bad"
                            />
                            <MiniStat
                                label="Roles"
                                value={stats.roles}
                                icon={<ShieldCheck className="h-4 w-4" />}
                                tone="violet"
                            />
                        </div>
                    </div>
                </aside>

                <section className="space-y-4">
                    <div className="flex items-end justify-between border-b border-white/10 pb-4">
                        <div>
                            <p className="text-lg font-bold tracking-tight text-white">
                                Listado de usuarios
                            </p>
                            <p className="text-sm text-white/45">
                                {filtered.length} resultado{filtered.length === 1 ? "" : "s"} encontrados
                            </p>
                        </div>
                    </div>

                    {filtered.length > 0 ? (
                        <div className="space-y-4">
                            {filtered.map((u, index) => (
                                <UserCard
                                    key={(u.idUsuario ?? u.id ?? u.id_usuario ?? index).toString()}
                                    user={u}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[30px] border border-dashed border-white/10 bg-white/[0.03] text-center">
                            <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                                <Search className="h-5 w-5 text-white/50" />
                            </div>
                            <p className="text-sm font-semibold text-white/75">
                                No hay usuarios para mostrar
                            </p>
                            <p className="mt-1 text-xs text-white/45">
                                Ajusta la búsqueda para intentar de nuevo.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}