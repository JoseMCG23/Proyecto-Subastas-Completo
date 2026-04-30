import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import SubastaService from "@/services/SubastaService";
import toast from "react-hot-toast";
import { SubastaList } from "./Form/SubastaList";
import { SubastaCreate } from "./Form/SubastaCreate";
import { SubastaUpdate } from "./Form/SubastaUpdate";
import { SubastaDetail } from "./Form/SubastaDetail";

export function MantenimientoSubasta() {
    const [showCreate, setShowCreate] = useState(false);
    const [showUpdate, setShowUpdate] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedSubasta, setSelectedSubasta] = useState(null);

    const handleCreate = () => {
        setShowCreate(true);
    };

    const handleEdit = (subasta) => {
        setSelectedSubasta(subasta);
        setShowUpdate(true);
    };

    const handleViewDetail = (subasta) => {
        setSelectedSubasta(subasta);
        setShowDetail(true);
    };

    const handlePublish = async (subasta) => {
        if (!subasta?.idsubasta) {
            toast.error('ID de subasta no disponible');
            return;
        }

        const ahora = new Date();
        const fechaInicio = new Date(subasta.fechaInicio);

        if (fechaInicio <= ahora) {
            toast.error("No se puede publicar: la fecha de inicio ya pasó o no es válida");
            return;
        }

        try {
            await SubastaService.publicarSubasta(subasta.idsubasta);
            toast.success("Subasta publicada exitosamente");
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || err.message || "Error al publicar subasta");
        }
    };

    const handleCancel = async (idSubasta) => {
        if (!idSubasta) {
            toast.error('ID de subasta no disponible');
            return;
        }
        if (!window.confirm("¿Estás seguro de que deseas cancelar esta subasta?")) {
            return;
        }

        try {
            await SubastaService.cancelarSubasta(idSubasta);
            toast.success("Subasta cancelada exitosamente");
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || err.message || "Error al cancelar subasta");
        }
    };

    const handleCloseModals = () => {
        setShowCreate(false);
        setShowUpdate(false);
        setShowDetail(false);
        setSelectedSubasta(null);
    };

    const handleSuccess = () => {
    };

    return (
        <>
            <SubastaList
                onCreate={handleCreate}
                onEdit={handleEdit}
                onViewDetail={handleViewDetail}
                onPublish={handlePublish}
                onCancel={handleCancel}
            />

            <AnimatePresence>
                {showCreate && (
                    <SubastaCreate
                        onClose={handleCloseModals}
                        onSuccess={handleSuccess}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showUpdate && selectedSubasta && (
                    <SubastaUpdate
                        subasta={selectedSubasta}
                        onClose={handleCloseModals}
                        onSuccess={handleSuccess}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showDetail && selectedSubasta && (
                    <SubastaDetail
                        subasta={selectedSubasta}
                        onClose={handleCloseModals}
                        onEdit={() => {
                            setShowDetail(false);
                            setShowUpdate(true);
                        }}
                        onPublish={() => handlePublish(selectedSubasta.idsubasta)}
                        onCancel={() => handleCancel(selectedSubasta.idsubasta)}
                        onRefresh={async () => {
                            const res = await SubastaService.getSubastaById(selectedSubasta.idsubasta);
                            setSelectedSubasta(res.data?.data ?? null);
                        }}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

export default MantenimientoSubasta;
