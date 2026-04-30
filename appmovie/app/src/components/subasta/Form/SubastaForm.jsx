import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
// import UsuarioService from "@/services/UsuarioService";



//validaciones
const subastaSchema = yup.object({
    funko_id: yup.number()
    .transform((value, originalValue) => originalValue === "" ? null : value)
    .required("Debe seleccionar un objeto"),
    fechaInicio: yup.string().required("La fecha de inicio es requerida"),
    horaInicio: yup.string().required("La hora de inicio es requerida"),
    fechafin: yup.string().required("La fecha de cierre es requerida"),
    horaFin: yup.string().required("La hora de cierre es requerida"),
    precioBase: yup
    .number()
    .transform((value, originalValue) => originalValue === "" ? null : value)
    .required("El precio base es requerido")
    .positive("El precio base debe ser mayor a 0"),
    incre_minimo: yup
    .number()
    .transform((value, originalValue) => originalValue === "" ? null : value)
    .required("El incremento mínimo es requerido")
    .positive("El incremento mínimo debe ser mayor a 0"),
});

const subastaLimitedSchema = yup.object({
    fechaInicio: yup.string().required("La fecha de inicio es requerida"),
    horaInicio: yup.string().required("La hora de inicio es requerida"),
    fechafin: yup.string().required("La fecha de cierre es requerida"),
    horaFin: yup.string().required("La hora de cierre es requerida"),
    precioBase: yup
        .number()
        .required("El precio base es requerido")
        .positive("El precio base debe ser mayor a 0"),
    incre_minimo: yup
        .number()
        .required("El incremento mínimo es requerido")
        .positive("El incremento mínimo debe ser mayor a 0"),
});

export function SubastaForm({
    onSubmit,
    onCancel,
    funkos,
    usuario,
    isEditing,
    isLoading,
    subasta,
    editLimited = false,
}) {
    const validationSchema = editLimited ? subastaLimitedSchema : subastaSchema;

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            funko_id: subasta?.funko_id || "",
            fechaInicio: subasta?.fechaInicio?.split(" ")[0] || "",
            horaInicio: subasta?.fechaInicio?.split(" ")[1]?.substring(0, 5) || "",
            fechafin: subasta?.fechafin?.split(" ")[0] || "",
            horaFin: subasta?.fechafin?.split(" ")[1]?.substring(0, 5) || "",
            precioBase: subasta?.precioBase || "",
            incre_minimo: subasta?.incre_minimo || "",
        },
        resolver: yupResolver(validationSchema),
    });

    useEffect(() => {
        reset({
            funko_id: subasta?.funko_id || "",
            fechaInicio: subasta?.fechaInicio?.split(" ")[0] || "",
            horaInicio: subasta?.fechaInicio?.split(" ")[1]?.substring(0, 5) || "",
            fechafin: subasta?.fechafin?.split(" ")[0] || "",
            horaFin: subasta?.fechafin?.split(" ")[1]?.substring(0, 5) || "",
            precioBase: subasta?.precioBase || "",
            incre_minimo: subasta?.incre_minimo || "",
        });
    }, [subasta, reset]);

    const handleFormSubmit = async (data) => {
        try {
            // Combinar fecha y hora
            const construirFechaLocal = (fecha, hora) => {
                const [year, month, day] = fecha.split("-").map(Number);
                const [hours, minutes] = hora.split(":").map(Number);
                return new Date(year, month - 1, day, hours, minutes, 0, 0);
            };

            const fechaInicioDate = construirFechaLocal(data.fechaInicio, data.horaInicio);
            const fechaFinDate = construirFechaLocal(data.fechafin, data.horaFin);

            const fechaInicioCompleta = `${data.fechaInicio} ${data.horaInicio}:00`;
            const fechaFinCompleta = `${data.fechafin} ${data.horaFin}:00`;

            const ahora = new Date();
            ahora.setSeconds(0, 0);

            console.log("=== VALIDACIONES DE FECHA ===");
            console.log("Fecha inicio:", fechaInicioDate);
            console.log("Fecha fin:", fechaFinDate);
            console.log("Ahora:", ahora);

            // Validar fecha de inicio no sea en el pasado
            if (fechaInicioDate < ahora) {
                console.log("❌ ERROR: Fecha de inicio en el pasado");
                toast.error("La fecha de inicio debe ser en el futuro");
                return;
            }

            // Validar fecha cierre > fecha inicio
            if (fechaFinDate <= fechaInicioDate) {
                console.log("❌ ERROR: Fecha de fin <= fecha de inicio");
                toast.error("La fecha de cierre debe ser mayor a la de inicio");
                return;
            }

            console.log('✅ Validaciones pasaron, enviando...');
            

            const payload = {
                ...data,
                fechaInicio: fechaInicioCompleta,
                fechafin: fechaFinCompleta,
            };

            await onSubmit(payload);
            reset();
        } catch (error) {
            console.error('❌ Error en handleFormSubmit:', error);
            alert("Error: " + (error.message || "Error al procesar el formulario"));
            toast.error(error.message || "Error al procesar el formulario");
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/20 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-8 shadow-2xl"
                >
                    <div className="mb-8">
                        <motion.div
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                {isEditing ? "Editar Subasta" : "Crear Nueva Subasta"}
                            </h2>
                            <p className="mt-2 text-sm text-white/70">
                                {isEditing ? "Modifica los datos de la subasta" : "Completa los datos para crear una nueva subasta"}
                            </p>
                        </motion.div>
                    </div>

                    <motion.form
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        onSubmit={handleSubmit(handleFormSubmit)}
                        className="space-y-6"
                    >
                        {editLimited && (
                            <div></div>
                        )}

                        {!editLimited && (
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <label className="block text-sm font-bold text-white mb-3">
                                    Funko *
                                </label>
                                <Controller
                                    name="funko_id"
                                    control={control}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            disabled={isEditing}
                                            className={`w-full rounded-xl border px-4 py-3 text-white bg-gradient-to-r from-white/10 to-white/5 placeholder:text-white/40 transition-all duration-200 hover:border-violet-400/50 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 ${
                                                errors.funko_id ? "border-red-500/50 focus:border-red-500" : "border-white/20"
                                            } ${isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                                        >
                                            <option value="" className="bg-neutral-800">Seleccione un Funko</option>
                                            {funkos.map((f) => (
                                                <option key={f.idFunko} value={f.idFunko} className="bg-neutral-800">
                                                    {f.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                />
                                {errors.funko_id && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-xs text-red-400 mt-2"
                                    >
                                        {errors.funko_id.message}
                                    </motion.p>
                                )}
                            </motion.div>
                        )}

                        {!editLimited && (
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <label className="block text-sm font-bold text-white mb-3">
                                    Vendedor
                                </label>

                                <input

                                
                                    value={usuario?.nombreCompleto || "Cargando..."}
                                    disabled
                                    className="w-full rounded-xl border px-4 py-3 text-white bg-white/10 border-white/20 opacity-70 cursor-not-allowed"
                                />
                            </motion.div>
                        )}

                        {/* Fecha y Hora Inicio */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="grid grid-cols-2 gap-4"
                        >
                            <div>
                                <label className="block text-sm font-bold text-white mb-3">
                                    Fecha Inicio *
                                </label>
                                <Controller
                                    name="fechaInicio"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="date"
                                            className={`w-full rounded-xl border px-4 py-3 text-white bg-gradient-to-r from-white/10 to-white/5 placeholder:text-white/40 transition-all duration-200 hover:border-emerald-400/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 ${
                                                errors.fechaInicio ? "border-red-500/50 focus:border-red-500" : "border-white/20"
                                            }`}
                                        />
                                    )}
                                />
                                {errors.fechaInicio && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-xs text-red-400 mt-2"
                                    >
                                        {errors.fechaInicio.message}
                                    </motion.p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-white mb-3">
                                    Hora Inicio *
                                </label>
                                <Controller
                                    name="horaInicio"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="time"
                                            className={`w-full rounded-xl border px-4 py-3 text-white bg-gradient-to-r from-white/10 to-white/5 placeholder:text-white/40 transition-all duration-200 hover:border-emerald-400/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 ${
                                                errors.horaInicio ? "border-red-500/50 focus:border-red-500" : "border-white/20"
                                            }`}
                                        />
                                    )}
                                />
                                {errors.horaInicio && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-xs text-red-400 mt-2"
                                    >
                                        {errors.horaInicio.message}
                                    </motion.p>
                                )}
                            </div>
                        </motion.div>

                        {/* Fecha y Hora Cierre */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="grid grid-cols-2 gap-4"
                        >
                            <div>
                                <label className="block text-sm font-bold text-white mb-3">
                                    Fecha Cierre *
                                </label>
                                <Controller
                                    name="fechafin"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="date"
                                            className={`w-full rounded-xl border px-4 py-3 text-white bg-gradient-to-r from-white/10 to-white/5 placeholder:text-white/40 transition-all duration-200 hover:border-orange-400/50 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 ${
                                                errors.fechafin ? "border-red-500/50 focus:border-red-500" : "border-white/20"
                                            }`}
                                        />
                                    )}
                                />
                                {errors.fechafin && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-xs text-red-400 mt-2"
                                    >
                                        {errors.fechafin.message}
                                    </motion.p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-white mb-3">
                                    Hora Cierre *
                                </label>
                                <Controller
                                    name="horaFin"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="time"
                                            className={`w-full rounded-xl border px-4 py-3 text-white bg-gradient-to-r from-white/10 to-white/5 placeholder:text-white/40 transition-all duration-200 hover:border-orange-400/50 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 ${
                                                errors.horaFin ? "border-red-500/50 focus:border-red-500" : "border-white/20"
                                            }`}
                                        />
                                    )}
                                />
                                {errors.horaFin && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-xs text-red-400 mt-2"
                                    >
                                        {errors.horaFin.message}
                                    </motion.p>
                                )}
                            </div>
                        </motion.div>

                        {/* Precio Base */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                        >
                            <label className="block text-sm font-bold text-white mb-3">
                                Precio Base (₡) *
                            </label>
                            <Controller
                                name="precioBase"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="number"
                                        step="500"
                                        min="0"
                                        className={`w-full rounded-xl border px-4 py-3 text-white bg-gradient-to-r from-white/10 to-white/5 placeholder:text-white/40 transition-all duration-200 hover:border-green-400/50 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 ${
                                            errors.precioBase ? "border-red-500/50 focus:border-red-500" : "border-white/20"
                                        }`}
                                        placeholder="0"
                                    />
                                )}
                            />
                            {errors.precioBase && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-xs text-red-400 mt-2"
                                >
                                    {errors.precioBase.message}
                                </motion.p>
                            )}
                        </motion.div>

                        {/* Incremento Mínimo */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            <label className="block text-sm font-bold text-white mb-3">
                                Incremento Mínimo (₡) *
                            </label>
                            <Controller
                                name="incre_minimo"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="number"
                                        step="500"
                                        min="0"
                                        className={`w-full rounded-xl border px-4 py-3 text-white bg-gradient-to-r from-white/10 to-white/5 placeholder:text-white/40 transition-all duration-200 hover:border-purple-400/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 ${
                                            errors.incre_minimo ? "border-red-500/50 focus:border-red-500" : "border-white/20"
                                        }`}
                                        placeholder="0"
                                    />
                                )}
                            />
                            {errors.incre_minimo && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-xs text-red-400 mt-2"
                                >
                                    {errors.incre_minimo.message}
                                </motion.p>
                            )}
                        </motion.div>


                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.9 }}
                            className="flex gap-4 pt-8 border-t border-white/20"
                        >
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 h-12 text-white border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-200"
                                onClick={onCancel}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 h-12 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 hover:from-violet-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Procesando...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        {isEditing ? "Guardar Cambios" : "Crear Subasta"}
                                    </div>
                                )}
                            </Button>
                        </motion.div>
                    </motion.form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default SubastaForm;