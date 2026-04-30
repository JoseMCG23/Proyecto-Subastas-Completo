import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Save, ArrowLeft, PencilLine, AlertTriangle } from "lucide-react";

import FunkoService from "@/services/FunkoService";
import CategoriaService from "@/services/CategoriaService";


import { FunkoForm } from "@/components/funko/Form/FunkoForm";

const usuarioActual = {
    id: 2,
    nombre: "Usuario Vendedor Simulado",
};

export function FunkoUpdate() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [dataCategorias, setDataCategorias] = useState([]);
    const [files, setFiles] = useState([]);
    const [fileURLs, setFileURLs] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [funkoActual, setFunkoActual] = useState(null);
    const [bloqueado, setBloqueado] = useState(false);

    const funkoSchema = yup.object({
        idFunko: yup.number().required(),
        nombre: yup
            .string()
            .required("El nombre es requerido")
            .min(2, "El nombre debe tener mínimo 2 caracteres")
            .max(100, "El nombre no puede superar los 100 caracteres"),
        descripcion: yup
            .string()
            .required("La descripción es requerida")
            .min(20, "La descripción debe tener mínimo 20 caracteres")
            .max(500, "La descripción no puede superar los 500 caracteres"),
        condicion: yup.string().required("La condición es requerida"),
        categorias: yup
            .array()
            .min(1, "Debe seleccionar al menos una categoría"),
        imagenes: yup.array().of(
            yup.object().shape({
                urlImagen: yup.string().nullable(),
            })
        ),
    });

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        reset,
    } = useForm({
        defaultValues: {
            idFunko: "",
            nombre: "",
            descripcion: "",
            condicion: "",
            estado: "Activo",
            vendedor_id: usuarioActual.id,
            categorias: [],
            imagenes: [{ urlImagen: "" }],
        },
        resolver: yupResolver(funkoSchema),
    });

    const uploadBaseUrl = import.meta.env.VITE_BASE_URL + "uploads/";

    const tieneSubastaActiva = useMemo(() => {
        if (!funkoActual) return false;
        const arr = Array.isArray(funkoActual.subastas) ? funkoActual.subastas : [];
        return arr.some((s) => String(s?.estado ?? "").toLowerCase() === "activa");
    }, [funkoActual]);

    const MAX_IMAGE_SIZE_MB = 5;

    const handleChangeImage = (e, index) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.type.startsWith("image/")) {
            toast.error("El archivo seleccionado no es una imagen válida");
            e.target.value = "";
            return;
        }

        if (selectedFile.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
            toast.error(`La imagen no puede superar los ${MAX_IMAGE_SIZE_MB} MB`);
            e.target.value = "";
            return;
        }

        const newFiles = [...files];
        const newFileURLs = [...fileURLs];

        newFiles[index] = selectedFile;
        newFileURLs[index] = URL.createObjectURL(selectedFile);

        setFiles(newFiles);
        setFileURLs(newFileURLs);
        setValue(`imagenes.${index}.urlImagen`, selectedFile.name, {
            shouldValidate: true,
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriasRes, funkoRes] = await Promise.all([
                    CategoriaService.getCategorias(),
                    FunkoService.getFunkoById(id),
                ]);

                const categoriasLista = categoriasRes.data?.data || [];
                setDataCategorias(categoriasLista);

                const payload = funkoRes.data?.data ?? funkoRes.data;
                setFunkoActual(payload);

                const categoriasIds = Array.isArray(payload?.categorias)
                    ? payload.categorias
                        .map((c) => {
                            if (typeof c === "object" && c?.idCategoria) return c.idCategoria;

                            const encontrada = categoriasLista.find(
                                (cat) => String(cat.nombre).toLowerCase() === String(c).toLowerCase()
                            );

                            return encontrada ? encontrada.idCategoria : null;
                        })
                        .filter(Boolean)
                    : [];

                const imagenPortada = payload?.imagen_portada ?? "";

                const otrasImagenes = Array.isArray(payload?.imagenes)
                    ? payload.imagenes
                        .map((img) =>
                            typeof img === "string"
                                ? img
                                : img?.urlImagen ?? img?.url ?? ""
                        )
                        .filter(Boolean)
                    : [];

                const imagenesOrdenadas = [
                    ...(imagenPortada ? [imagenPortada] : []),
                    ...otrasImagenes.filter((img) => img !== imagenPortada),
                ];

                const imagenesUnicas = [...new Set(imagenesOrdenadas)];

                const imagenesIniciales =
                    imagenesUnicas.length > 0
                        ? imagenesUnicas.map((img) => ({ urlImagen: img }))
                        : [{ urlImagen: "" }];

                const previewInicial = imagenesIniciales
                    .map((img) => img.urlImagen)
                    .filter(Boolean)
                    .map((name) =>
                        name.startsWith("http") ? name : `${uploadBaseUrl}${name}`
                    );

                setFileURLs(previewInicial);
                setFiles(new Array(imagenesIniciales.length).fill(null));

                reset({
                    idFunko: payload?.idFunko ?? payload?.id ?? "",
                    nombre: payload?.nombre ?? "",
                    descripcion: payload?.descripcion ?? "",
                    condicion: payload?.condicion ?? "",
                    estado: payload?.estado ?? "Activo",
                    vendedor_id: payload?.vendedor_id ?? usuarioActual.id,
                    categorias: categoriasIds,
                    imagenes: imagenesIniciales,
                });

                if (
                    Array.isArray(payload?.subastas) &&
                    payload.subastas.some(
                        (s) => String(s?.estado ?? "").toLowerCase() === "activa"
                    )
                ) {
                    setBloqueado(true);
                } else {
                    setBloqueado(false);
                }
            } catch (err) {
                console.error(err);
                setError("Error al cargar el funko para editar");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, reset, setValue, uploadBaseUrl]);

    const onSubmit = async (dataForm) => {
        if (bloqueado || tieneSubastaActiva) {
            toast.error("No se puede editar este funko porque tiene una subasta activa");
            return;
        }

        try {
            const nombresImagenes = dataForm.imagenes
                .map((img, index) => {
                    if (files[index]) return files[index].name;
                    return img?.urlImagen ?? "";
                })
                .filter(Boolean);

            if (nombresImagenes.length === 0) {
                toast.error("Debes seleccionar al menos una imagen para el funko");
                return;
            }

            const payload = {
                idFunko: Number(dataForm.idFunko),
                nombre: dataForm.nombre,
                descripcion: dataForm.descripcion,
                condicion: dataForm.condicion,
                estado: funkoActual?.estado ?? "Activo",
                categorias: dataForm.categorias,
                imagenes: nombresImagenes,
            };

            await FunkoService.updateFunko(payload);

            toast.success(`"${dataForm.nombre}" actualizado correctamente`, {
                duration: 3000,
            });

            navigate("/funkos");
        } catch (err) {
            console.error("ERROR UPDATE FUNKO:", err);
            console.error("RESPUESTA BACKEND:", err?.response?.data);

            toast.error(
                err?.response?.data?.message || "Error al actualizar funko"
            );
        }
    };
    if (loading) return <p className="p-6 text-white">Cargando...</p>;
    if (error) return <p className="p-6 text-red-400">{error}</p>;

    return (
        <div className="mx-auto max-w-6xl px-4 py-6">
            <div className="overflow-hidden rounded-[30px] border border-slate-800 bg-gradient-to-br from-[#0b1220] via-[#0f172a] to-[#111827] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                <div className="border-b border-slate-800 bg-white/[0.02] px-6 py-5 md:px-8">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 ring-1 ring-violet-400/20">
                            <PencilLine className="h-6 w-6 text-violet-300" />
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-white">Actualizar Funko</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Modifica la información del objeto mientras esté permitido.
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 px-6 py-6 md:px-8">
                    {bloqueado && (
                        <div className="flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-amber-200">
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                            <div>
                                <p className="font-medium">Edición no disponible</p>
                                <p className="text-sm text-amber-200/80">
                                    Este funko no se puede editar porque tiene una subasta activa.
                                </p>
                            </div>
                        </div>
                    )}

                    <FunkoForm
                        control={control}
                        errors={errors}
                        dataCategorias={dataCategorias}
                        usuarioActual={usuarioActual}
                        fileURLs={fileURLs}
                        onChangeImage={handleChangeImage}
                    />

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-2xl border-slate-700 bg-slate-900 text-white hover:bg-slate-800"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Regresar
                        </Button>

                        <Button
                            type="submit"
                            disabled={bloqueado || isSubmitting}
                            className="rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[220px]"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            Guardar cambios
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FunkoUpdate;