import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import SubastaService from "@/services/SubastaService";
import FunkoService from "@/services/FunkoService";
import UsuarioService from "@/services/UsuarioService";
import toast from "react-hot-toast";
import { SubastaForm } from "./SubastaForm";

export function SubastaCreate({ onClose, onSuccess }) {
    const [funkos, setFunkos] = useState([]);
    const [usuario, setUsuario] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                // Cargar subastas para filtrar funkos
                const subastaRes = await SubastaService.getSubastas();
                const subastasList = subastaRes.data.data || subastaRes.data || [];

                // Cargar funkos
                const funkosRes = await FunkoService.getFunkos();
                const funkosList = funkosRes.data.data || funkosRes.data || [];

                // Filtrar funkos no asociados a ninguna subasta
                const funkosDisponibles = funkosList.filter((f) => {
                    if (f.estado !== "DISPONIBLE") return false;

                    const estaEnSubastaActiva = subastasList.some(
                    (s) => s.funko_id === f.idFunko && s.estado === "ACTIVA"
                    );
                    return !estaEnSubastaActiva;
                });

                setFunkos(funkosDisponibles);

                // Cargar usuarios vendedores
                const usuariosRes = await UsuarioService.getUsuarios();
                const usuariosList = usuariosRes.data.data || usuariosRes.data || [];

                
                const vendedor = usuariosList.find(u => u.id === "4");
                setUsuario(vendedor || null);


            } catch (err) {
                console.error(err);
                toast.error("Error al cargar los datos");
            }
        };

        cargarDatos();
    }, []);

    const handleSubmit = async (data) => {
        try {
            setIsLoading(true);

            const payload = {
                ...data,
                vendedor_id: usuario?.id,
                estado: "INACTIVA",
            };

            await SubastaService.createSubasta(payload);
            toast.success("Subasta creada exitosamente");

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || err.message || "Error al crear subasta");
        } finally {
            setIsLoading(false);
        }
    };

    
    return (
        <AnimatePresence>
            <SubastaForm
                onSubmit={handleSubmit}
                onCancel={onClose}
                funkos={funkos}
                usuario={usuario}
                isEditing={false}
                isLoading={isLoading}
                subasta={null}
            />
        </AnimatePresence>
    );
}

export default SubastaCreate;