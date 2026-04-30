import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserForm } from "@/components/User/Form/UserForm";
import UsuarioService from "@/services/UsuarioService";
import toast from "react-hot-toast";

export default function UserUpdate() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { state } = useLocation();
    const [loading, setLoading] = useState(true);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        defaultValues: {
            nombreCompleto: "",
            correo: "",
            rol: "",
            fechaRegistro: ""
        }
    });

    useEffect(() => {
        const cargarUsuario = async () => {
            try {

                const res = await UsuarioService.getUsuarioById(id);
                const u = res.data?.data || res.data;

                reset({
                    nombreCompleto: u.nombreCompleto ?? state?.usuario?.nombreCompleto ?? "",
                    correo:
                        u.correo ??
                        u.email ??
                        u.correoElectronico ??
                        state?.usuario?.correo ??
                        state?.usuario?.email ??
                        "",
                    rol: u.rol ?? state?.usuario?.rol ?? "",
                    fechaRegistro:
                        u.fechaRegistro ??
                        u.fecha_registro ??
                        u.fechaCreacion ??
                        state?.usuario?.fechaRegistro ??
                        ""
                });

            } catch (error) {
                console.error(error);
                toast.error("No se pudo cargar el usuario");
            } finally {
                setLoading(false);
            }
        };

        cargarUsuario();

    }, [id, reset, state]);

    const onSubmit = async (data) => {
        try {

            const payload = {
                id: Number(id),
                nombreCompleto: data.nombreCompleto,
                correo: data.correo
            };

            await UsuarioService.updateUsuario(payload);

            toast.success("Usuario actualizado correctamente");

            navigate("/users");

        } catch (error) {

            console.error(error);
            toast.error("Error al actualizar usuario");

        }
    };

    if (loading) {
        return <div className="p-6 text-white">Cargando usuario...</div>;
    }

    return (
        <div className="p-6">

            <h1 className="text-2xl font-bold mb-6">
                Actualizar usuario
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                <UserForm
                    control={control}
                    errors={errors}
                />

                <div className="flex gap-3">

                    <Button type="submit">
                        Actualizar
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/users")}
                    >
                        Cancelar
                    </Button>

                </div>

            </form>

        </div>
    );
}