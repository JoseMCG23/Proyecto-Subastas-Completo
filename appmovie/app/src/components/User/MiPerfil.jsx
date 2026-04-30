import { useUser } from "@/hooks/useUser";
import { UserRound, ShieldCheck, Mail } from "lucide-react";

export default function MiPerfil() {
    const { user } = useUser();

    if (!user) {
        return (
            <div className="min-h-screen bg-neutral-950 px-6 pt-32 text-white">
                Debe iniciar sesión para ver su perfil.
            </div>
        );
    }

    const nombre =
        user.nombreCompleto ||
        user.nombre_completo ||
        `${user.nombre || ""} ${user.apellido || ""}`.trim() ||
        "Usuario";

    const correo = user.correo || user.email || "-";
    const rol = user.rol || "-";

    return (
        <div className="min-h-screen bg-neutral-950 px-6 pt-32 pb-16 text-white">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8">
                    <p className="text-sm font-semibold text-violet-300">
                        PERFIL DE USUARIO
                    </p>
                    <h1 className="mt-2 text-3xl font-black">Mi perfil</h1>
                    <p className="mt-2 text-white/60">
                        Información del usuario en el sistema.
                    </p>
                </div>

                <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-violet-500/10">
                    <div className="flex flex-col gap-4 border-b border-white/10 p-6 sm:flex-row sm:items-center">
                        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-violet-500/15 ring-1 ring-violet-500/30">
                            <UserRound className="h-8 w-8 text-violet-200" />
                        </div>

                        <div>
                            <h2 className="text-2xl font-extrabold">{nombre}</h2>
                            <p className="mt-1 text-sm text-white/60">{correo}</p>
                        </div>
                    </div>

                    <div className="grid gap-4 p-6 md:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-neutral-950/40 p-5">
                            <div className="mb-2 flex items-center gap-2 text-white/80">
                                <Mail className="h-4 w-4 text-white/50" />
                                <span className="text-sm font-semibold">Correo</span>
                            </div>
                            <p className="text-white">{correo}</p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-neutral-950/40 p-5">
                            <div className="mb-2 flex items-center gap-2 text-white/80">
                                <ShieldCheck className="h-4 w-4 text-white/50" />
                                <span className="text-sm font-semibold">Rol</span>
                            </div>
                            <p className="text-white">{rol}</p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-neutral-950/40 p-5">
                            <div className="mb-2 flex items-center gap-2 text-white/80">
                                <UserRound className="h-4 w-4 text-white/50" />
                                <span className="text-sm font-semibold">ID de usuario</span>
                            </div>
                            <p className="text-white">{user.id || user.idUsuario || "-"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}