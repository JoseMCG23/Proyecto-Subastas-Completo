import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import UsuarioService from "@/services/UsuarioService";

import logo from "@/assets/logo2.webp";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, MapPin, IdCard } from "lucide-react";

export default function Register() {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm();

    const onSubmit = async (data) => {
        try {
            const payload = {
                nombre: data.nombre,
                apellido: data.apellido,
                correo: data.correo,
                password: data.password,
                cedula: data.cedula,
                direccion: data.direccion,
            };

            const response = await UsuarioService.createUsuario(payload);

            if (response?.data?.success) {
                toast.success("Usuario registrado correctamente");
                navigate("/login");
            } else {
                toast.error("Error al registrar usuario");
            }
        } catch (error) {
            console.error("Error register:", error);
            const mensaje =
                error?.response?.data?.message || "Error al registrar usuario";
            toast.error(mensaje);
        }
    };

    return (
        <div className="relative left-1/2 -ml-[50vw] -mt-20 flex min-h-screen w-screen items-center justify-center overflow-hidden px-4 pt-24 pb-10">
            <div className="absolute inset-0 bg-neutral-950" />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,_rgba(139,92,246,0.55),_transparent_32%),radial-gradient(circle_at_82%_85%,_rgba(217,70,239,0.42),_transparent_34%),radial-gradient(circle_at_center,_rgba(59,130,246,0.14),_transparent_42%)]" />

            <div className="absolute -left-24 top-20 h-96 w-96 animate-pulse rounded-full bg-violet-600/25 blur-3xl" />
            <div className="absolute -right-24 bottom-[-80px] h-[420px] w-[420px] animate-pulse rounded-full bg-fuchsia-600/25 blur-3xl" />

            <Card className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/70 text-white shadow-2xl shadow-fuchsia-950/30 backdrop-blur-xl">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />

                <CardHeader className="space-y-3 text-center">
                    <img src={logo} alt="Funko" className="mx-auto h-12 w-auto object-contain" />

                    <CardTitle className="text-3xl font-black tracking-tight">
                        Crear cuenta
                    </CardTitle>

                    <p className="text-sm text-white/60">
                        Regístrate como comprador para participar en subastas Funko.
                    </p>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field
                                label="Nombre"
                                icon={<User className="h-5 w-5 text-white/40" />}
                                inputProps={{
                                    ...register("nombre"),
                                    placeholder: "Roberto",
                                }}
                            />

                            <Field
                                label="Apellido"
                                icon={<User className="h-5 w-5 text-white/40" />}
                                inputProps={{
                                    ...register("apellido"),
                                    placeholder: "Meléndez",
                                }}
                            />
                        </div>

                        <Field
                            label="Correo electrónico"
                            icon={<Mail className="h-5 w-5 text-white/40" />}
                            inputProps={{
                                ...register("correo"),
                                placeholder: "ejemplo@correo.com",
                            }}
                        />

                        <Field
                            label="Contraseña"
                            icon={<Lock className="h-5 w-5 text-white/40" />}
                            inputProps={{
                                ...register("password"),
                                type: "password",
                                placeholder: "********",
                            }}
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                            <Field
                                label="Cédula"
                                icon={<IdCard className="h-5 w-5 text-white/40" />}
                                inputProps={{
                                    ...register("cedula"),
                                    placeholder: "123456789",
                                }}
                            />

                            <Field
                                label="Dirección"
                                icon={<MapPin className="h-5 w-5 text-white/40" />}
                                inputProps={{
                                    ...register("direccion"),
                                    placeholder: "Alajuela",
                                }}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-12 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-bold text-white shadow-lg shadow-violet-950/40 transition hover:scale-[1.02] hover:from-violet-500 hover:to-fuchsia-500"
                        >
                            {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
                        </Button>

                        <p className="text-center text-sm text-white/60">
                            ¿Ya tienes cuenta?{" "}
                            <Link
                                to="/login"
                                className="font-semibold text-violet-300 underline-offset-4 hover:underline"
                            >
                                Iniciar sesión
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

function Field({ label, icon, inputProps }) {
    return (
        <div className="space-y-2">
            <Label className="text-white/80">{label}</Label>

            <div className="relative">
                <div className="pointer-events-none absolute left-3 top-3">{icon}</div>
                <Input
                    {...inputProps}
                    className="h-12 rounded-2xl border-white/10 bg-white/10 pl-11 text-white placeholder:text-white/35 focus-visible:ring-violet-400"
                />
            </div>
        </div>
    );
}