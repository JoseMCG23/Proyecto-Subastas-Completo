import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import SubastaService from "@/services/SubastaService";
import FunkoService from "@/services/FunkoService";
// import UsuarioService from "@/services/UsuarioService";
import toast from "react-hot-toast";
import { SubastaForm } from "./SubastaForm";

export function SubastaUpdate({ subasta, onClose, onSuccess }) {
    const [funkos, setFunkos] = useState([]);
    // const [usuarios, setUsuarios] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                // Cargar funkos
                const funkosRes = await FunkoService.getFunkos();
                const funkosList = funkosRes.data.data || funkosRes.data || [];
                setFunkos(Array.isArray(funkosList) ? funkosList : []);

                // // Cargar usuarios vendedores
                // const usuariosRes = await UsuarioService.getUsuarios();
                // const usuariosList = usuariosRes.data.data || usuariosRes.data || [];
                // setUsuarios(Array.isArray(usuariosList) ? usuariosList : []);
            } catch (err) {
                console.error(err);
                toast.error("Error al cargar los datos");
            }
        };

        cargarDatos();
    }, []);

    const pujasCount = Number(subasta?.cantidadPujas ?? subasta?.cantidadTotalPujas ?? 0);
    const canEditSubasta =
    (subasta?.estado === "INACTIVA" || subasta?.estado === "PROGRAMADA") &&
    pujasCount === 0 &&
    (subasta?.estado === "INACTIVA" || new Date(subasta?.fechaInicio) > new Date());

    const handleSubmit = async (data) => {
        try {
            setIsLoading(true);

            const payload = {
                idsubasta: subasta.idsubasta,
                funko_id: data.funko_id ?? subasta.funko_id,
                // vendedor_id: data.usuario_id ?? subasta.usuario_id ?? subasta.vendedor_id,
                fechaInicio: data.fechaInicio,
                fechafin: data.fechafin,
                precioBase: data.precioBase,
                incre_minimo: data.incre_minimo,
            };

            await SubastaService.updateSubasta(payload);
            toast.success("Subasta actualizada exitosamente");

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || err.message || "Error al editar subasta");
        } finally {
            setIsLoading(false);
        }
    };

    if (!canEditSubasta) {
        return (
            <AnimatePresence>
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                    <div className="max-w-md w-full rounded-2xl border border-white/20 bg-linear-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-white">Edición no permitida</h3>
                        <p className="mt-3 text-sm text-white/70">
                            Solo se puede editar si la subasta es INACTIVA o PROGRAMADA, no ha iniciado y no tiene pujas.
                        </p>
                        <div className="mt-6 text-right">
                            <button
                                onClick={onClose}
                                className="rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </AnimatePresence>
        );
    }

    return (
        <AnimatePresence>
            <SubastaForm
                onSubmit={handleSubmit}
                onCancel={onClose}
                funkos={funkos}
                // usuarios={usuarios}
                isEditing={true}
                isLoading={isLoading}
                subasta={subasta}
                editLimited={true}
            />
        </AnimatePresence>
    );
}

export default SubastaUpdate;