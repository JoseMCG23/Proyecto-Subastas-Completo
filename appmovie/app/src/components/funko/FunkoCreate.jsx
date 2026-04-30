import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Save, ArrowLeft, Sparkles } from "lucide-react";

import FunkoService from "@/services/FunkoService";
import CategoriaService from "@/services/CategoriaService";
import ImageService from "@/services/ImageService";

import { FunkoForm } from "@/components/funko/Form/FunkoForm";

import { useUser } from "@/hooks/useUser";



const MAX_IMAGE_SIZE_MB = 5;

export function FunkoCreate() {
    const navigate = useNavigate();
    const { user } = useUser();
    const usuarioActual = {
        id: user?.id,
        nombre: user?.nombre,
    };
    const [dataCategorias, setDataCategorias] = useState([]);
    const [files, setFiles] = useState([]);
    const [fileURLs, setFileURLs] = useState([]);
    const [error, setError] = useState("");

    const funkoSchema = yup.object({
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
        imagenes: yup
            .array()
            .of(
                yup.object().shape({
                    urlImagen: yup.string().required("Debes seleccionar una imagen"),
                })
            )
            .min(1, "Debes agregar al menos una imagen"),
    });

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        trigger,
    } = useForm({
        defaultValues: {
            nombre: "",
            descripcion: "",
            condicion: "",
            estado: "DISPONIBLE",
            vendedor_id: user?.id || "",
            categorias: [],
            imagenes: [{ urlImagen: "" }],
        },
        resolver: yupResolver(funkoSchema),
        mode: "onChange",
        reValidateMode: "onChange",
    });

    const handleChangeImage = async (e, index) => {
        const selectedFile = e.target.files?.[0];

        if (!selectedFile) {
            setValue(`imagenes.${index}.urlImagen`, "", {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
            });
            await trigger(`imagenes.${index}.urlImagen`);
            return;
        }

        if (!selectedFile.type.startsWith("image/")) {
            toast.error("El archivo seleccionado no es una imagen válida");
            e.target.value = "";
            setValue(`imagenes.${index}.urlImagen`, "", {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
            });
            await trigger(`imagenes.${index}.urlImagen`);
            return;
        }

        if (selectedFile.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
            toast.error(`La imagen no puede superar los ${MAX_IMAGE_SIZE_MB} MB`);
            e.target.value = "";
            setValue(`imagenes.${index}.urlImagen`, "", {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
            });
            await trigger(`imagenes.${index}.urlImagen`);
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
            shouldDirty: true,
            shouldTouch: true,
        });

        await trigger(`imagenes.${index}.urlImagen`);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const categoriasRes = await CategoriaService.getCategorias();
                setDataCategorias(categoriasRes.data.data || []);
            } catch (err) {
                console.error(err);
                if (err.name !== "AbortError") setError(err.message);
            }
        };
        fetchData();
    }, []);

    const onSubmit = async (dataForm) => {
        const validFiles = files.filter(Boolean);

        if (validFiles.length === 0) {
            toast.error("Debes seleccionar al menos una imagen para el funko");
            return;
        }

        if (!user?.id) {
            toast.error("Debe iniciar sesión para registrar un funko");
            return;
        }

        try {
            const formDataFunko = {
                nombre: dataForm.nombre,
                descripcion: dataForm.descripcion,
                condicion: dataForm.condicion,
                estado: "DISPONIBLE",
                vendedor_id: user?.id,
                categorias: dataForm.categorias,
                imagenes: validFiles.map((file) => file.name),
            };

            const response = await FunkoService.createFunko(formDataFunko);

            if (response.data) {
                const idFunko =
                    response.data.data?.idFunko ||
                    response.data.data?.id ||
                    response.data.idFunko ||
                    response.data.id;

                for (const file of validFiles) {
                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("funko_id", idFunko);
                    await ImageService.createImage(formData);
                }

                toast.success(`"${dataForm.nombre}" creado correctamente`, {
                    duration: 3000,
                });

                navigate("/funkos");
            } else if (response.error) {
                toast.error(response.error);
            }
        } catch (err) {
            console.error("ERROR CREATE FUNKO:", err);
            console.error("RESPUESTA BACKEND:", err?.response?.data);

            toast.error(
                err?.response?.data?.message || "Error al crear funko"
            );
            setError("Error al crear funko");
        }
    };

    if (error) return <p className="p-6 text-red-400">{error}</p>;

    return (
        <div className="mx-auto max-w-6xl px-4 py-6">
            <div className="overflow-hidden rounded-[30px] border border-slate-800 bg-gradient-to-br from-[#0b1220] via-[#0f172a] to-[#111827] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                <div className="border-b border-slate-800 bg-white/[0.02] px-6 py-5 md:px-8">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 ring-1 ring-violet-400/20">
                            <Sparkles className="h-6 w-6 text-violet-300" />
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-white">Crear Funko</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Registra un nuevo objeto subastable con su información e imágenes.
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 px-6 py-6 md:px-8">
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
                            disabled={isSubmitting}
                            className="rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white hover:opacity-95 sm:min-w-[220px]"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            Guardar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FunkoCreate;