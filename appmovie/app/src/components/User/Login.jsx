import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import UsuarioService from "@/services/UsuarioService";

import logo from "@/assets/logo2.webp";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail } from "lucide-react";

const schema = yup.object({
    correo: yup
        .string()
        .email("Correo inválido")
        .required("El correo es obligatorio"),
    password: yup.string().required("La contraseña es obligatoria"),
});

export default function Login() {
    const { saveUser } = useUser();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            correo: "",
            password: "",
        },
    });

    const onSubmit = async (data) => {
        try {
            const payload = {
                correo: data.correo,
                password: data.password,
            };

            const response = await UsuarioService.loginUsuario(payload);
            const token = response?.data?.data?.data;

            if (token) {
                saveUser(token);
                toast.success("Inicio de sesión exitoso");
                navigate("/");
            } else {
                toast.error("Credenciales inválidas");
            }
        } catch (error) {
            console.error("Error login:", error);

            const mensaje =
                error?.response?.data?.message ||
                error?.response?.data?.data?.message ||
                "Error al iniciar sesión";

            toast.error(mensaje);
        }
    };

    return (
        <div className="relative left-1/2 -ml-[50vw] -mt-20 flex min-h-screen w-screen items-center justify-center overflow-hidden px-4 pt-24 pb-10">
            <div className="absolute inset-0 bg-neutral-950" />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,_rgba(139,92,246,0.55),_transparent_32%),radial-gradient(circle_at_82%_85%,_rgba(217,70,239,0.42),_transparent_34%),radial-gradient(circle_at_center,_rgba(59,130,246,0.14),_transparent_42%)]" />

            <div className="absolute -left-24 top-20 h-96 w-96 animate-pulse rounded-full bg-violet-600/25 blur-3xl" />
            <div className="absolute -right-24 bottom-[-80px] h-[420px] w-[420px] animate-pulse rounded-full bg-fuchsia-600/25 blur-3xl" />

            <Card className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/70 text-white shadow-2xl shadow-fuchsia-950/30 backdrop-blur-xl">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />

                <CardHeader className="space-y-3 text-center">
                    <img
                        src={logo}
                        alt="Funko"
                        className="mx-auto h-12 w-auto object-contain"
                    />

                    <CardTitle className="text-3xl font-black tracking-tight">
                        Iniciar sesión
                    </CardTitle>

                    <p className="text-sm text-white/60">
                        Accede para participar en las subastas.
                    </p>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="correo" className="text-white/80">
                                Correo electrónico
                            </Label>

                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-white/40" />
                                <Input
                                    id="correo"
                                    {...register("correo")}
                                    placeholder="ejemplo@correo.com"
                                    className="h-12 rounded-2xl border-white/10 bg-white/10 pl-11 text-white placeholder:text-white/35 focus-visible:ring-violet-400"
                                />
                            </div>

                            {errors.correo && (
                                <p className="text-sm text-red-300">{errors.correo.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-white/80">
                                Contraseña
                            </Label>

                            <div className="relative">
                                <Lock className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-white/40" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="********"
                                    {...register("password")}
                                    className="h-12 rounded-2xl border-white/10 bg-white/10 pl-11 text-white placeholder:text-white/35 focus-visible:ring-fuchsia-400"
                                />
                            </div>

                            {errors.password && (
                                <p className="text-sm text-red-300">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-12 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-bold text-white shadow-lg shadow-violet-950/40 transition hover:scale-[1.02] hover:from-violet-500 hover:to-fuchsia-500"
                        >
                            {isSubmitting ? "Ingresando..." : "Ingresar"}
                        </Button>

                        <p className="text-center text-sm text-white/60">
                            ¿No tienes cuenta?{" "}
                            <Link
                                to="/register"
                                className="font-semibold text-violet-300 underline-offset-4 hover:underline"
                            >
                                Regístrate
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );}