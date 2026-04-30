import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import UsuarioService from "@/services/UsuarioService";
import {
    ArrowLeft,
    Calendar,
    ShieldCheck,
    UserRound,
    Gavel,
    Sparkles,
    Lock,
    Unlock,
} from "lucide-react";

function Pill({ children, tone = "neutral" }) {
    const base =
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1";
    const cls =
        tone === "ok"
            ? "bg-emerald-500/10 text-emerald-200 ring-emerald-500/30"
            : tone === "bad"
                ? "bg-rose-500/10 text-rose-200 ring-rose-500/30"
                : "bg-white/5 text-white/70 ring-white/10";

    return <span className={`${base} ${cls}`}>{children}</span>;
}

export default function UserDetail() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const [loadingAction, setLoadingAction] = useState(false);

    const cargarUsuario = async () => {
        try {
            const res = await UsuarioService.getUsuarioById(id);
            const payload = res.data?.data ?? res.data;
            setUser(payload);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        cargarUsuario();
    }, [id]);

    const handleChangeState = async () => {
        try {
            setLoadingAction(true);
            await UsuarioService.changeState({ id: Number(id) });
            await cargarUsuario();
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoadingAction(false);
        }
    };

    const nombre = user?.nombreCompleto ?? user?.nombre_completo ?? "-";
    const correo =
        user?.correo ?? user?.email ?? user?.correoElectronico ?? "-";
    const rol = user?.rol ?? "-";
    const estado = user?.estado ?? "-";
    const fecha = user?.fechaRegistro ?? user?.fecha_registro ?? "-";

    const roleLower = useMemo(() => String(rol ?? "").toLowerCase(), [rol]);
    const estadoUpper = String(estado ?? "").toUpperCase();

    const estadoTone =
        estadoUpper === "ACTIVO"
            ? "ok"
            : estadoUpper === "BLOQUEADO" || estadoUpper === "INACTIVO"
                ? "bad"
                : "neutral";

    const estadoLabel = estadoUpper === "INACTIVO" ? "BLOQUEADO" : estadoUpper;

    const accionLabel =
        estadoUpper === "ACTIVO" ? "Bloquear usuario" : "Activar usuario";

    const accionIcon =
        estadoUpper === "ACTIVO" ? (
            <Lock className="h-4 w-4" />
        ) : (
            <Unlock className="h-4 w-4" />
        );

    const accionClass =
        estadoUpper === "ACTIVO"
            ? "bg-rose-500/15 text-rose-200 ring-1 ring-rose-500/30 hover:bg-rose-500/20"
            : "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30 hover:bg-emerald-500/20";

    if (error) return <div className="p-6 text-white">Error: {error}</div>;
    if (!user) return <div className="p-6 text-white/80">Cargando...</div>;

    return (
        <div className="mx-auto w-full max-w-4xl px-4 pb-10 pt-6">
            <Link
                to="/users"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white"
            >
                <ArrowLeft className="h-4 w-4" /> Volver
            </Link>

            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-violet-500/10">
                <div className="flex flex-col gap-4 border-b border-white/10 p-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                            <UserRound className="h-5 w-5 text-white/75" />
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-violet-300/90">
                                DETALLE
                            </p>
                            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white">
                                {nombre}
                            </h2>

                            <div className="mt-2 flex flex-wrap gap-2">
                                <Pill tone="neutral">
                                    <ShieldCheck className="mr-1 h-3.5 w-3.5" /> {rol}
                                </Pill>
                                <Pill tone={estadoTone}>{estadoLabel || "-"}</Pill>
                            </div>
                        </div>
                    </div>

                    <div className="text-sm text-white/70">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-white/50" />
                            <span className="font-semibold text-white/80">Registro:</span>
                            <span>{fecha}</span>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 p-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-neutral-950/30 p-5">
                        <p className="text-sm font-semibold text-white/90">Información</p>
                        <div className="mt-3 space-y-2 text-sm text-white/70">
                            <p>
                                <span className="font-semibold text-white/85">Correo:</span>{" "}
                                {correo}
                            </p>
                            <p>
                                <span className="font-semibold text-white/85">Rol:</span> {rol}
                            </p>
                            <p>
                                <span className="font-semibold text-white/85">Estado:</span>{" "}
                                {estadoLabel}
                            </p>
                            <p>
                                <span className="font-semibold text-white/85">ID:</span> {id}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-neutral-950/30 p-5">
                        <p className="text-sm font-semibold text-white/90">Actividad</p>

                        <div className="mt-4 space-y-3">
                            {roleLower === "vendedor" && (
                                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                                    <div className="flex items-center gap-2 text-sm text-white/80">
                                        <Gavel className="h-4 w-4 text-white/60" />
                                        Subastas creadas
                                    </div>
                                    <span className="text-sm font-extrabold text-white">
                                        {user.cantidadSubastasCreadas ?? 0}
                                    </span>
                                </div>
                            )}

                            {roleLower === "comprador" && (
                                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                                    <div className="flex items-center gap-2 text-sm text-white/80">
                                        <Sparkles className="h-4 w-4 text-white/60" />
                                        Pujas realizadas
                                    </div>
                                    <span className="text-sm font-extrabold text-white">
                                        {user.cantidadPujasRealizadas ?? 0}
                                    </span>
                                </div>
                            )}

                            {roleLower !== "vendedor" && roleLower !== "comprador" && (
                                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
                                    No hay actividad
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 p-6">
                    <div className="rounded-2xl border border-white/10 bg-neutral-950/30 p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-white/90">
                                    Estado de la cuenta
                                </p>
                                <p className="mt-1 text-sm text-white/60">
                                    Esta acción realiza un cambio lógico del estado del usuario.
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <Pill tone={estadoTone}>{estadoLabel || "-"}</Pill>

                                <button
                                    type="button"
                                    onClick={handleChangeState}
                                    disabled={loadingAction}
                                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${accionClass}`}
                                >
                                    {accionIcon}
                                    {loadingAction ? "Procesando..." : accionLabel}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <Link
                            to={`/users/update/${id}`}
                            state={{ usuario: user }}
                            className="inline-flex items-center rounded-xl bg-violet-500/15 px-4 py-2 text-sm font-semibold text-violet-200 ring-1 ring-violet-500/30 transition hover:bg-violet-500/20"
                        >
                            Editar usuario
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}