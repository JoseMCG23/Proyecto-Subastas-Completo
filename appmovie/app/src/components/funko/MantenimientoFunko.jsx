import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import FunkoList from "./FunkoList";
import FunkoCreate from "./FunkoCreate";
import FunkoUpdate from "./FunkoUpdate";
import FunkoDetail from "./FunkoDetail";

export function MantenimientoFunko() {
    const [showCreate, setShowCreate] = useState(false);
    const [showUpdate, setShowUpdate] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedFunko, setSelectedFunko] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleCreate = () => {
        setShowCreate(true);
    };

    const handleEdit = (funko) => {
        setSelectedFunko(funko);
        setShowUpdate(true);
    };

    const handleViewDetail = (funko) => {
        setSelectedFunko(funko);
        setShowDetail(true);
    };

    const handleCloseModals = () => {
        setShowCreate(false);
        setShowUpdate(false);
        setShowDetail(false);
        setSelectedFunko(null);
    };

    const handleSuccess = () => {
        setRefreshKey((prev) => prev + 1);
        handleCloseModals();
    };

    return (
        <>
            <FunkoList
                key={refreshKey}
                onCreate={handleCreate}
                onEdit={handleEdit}
                onViewDetail={handleViewDetail}
            />

            <AnimatePresence>
                {showCreate && (
                    <FunkoCreate
                        onClose={handleCloseModals}
                        onSuccess={handleSuccess}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showUpdate && selectedFunko && (
                    <FunkoUpdate
                        funko={selectedFunko}
                        onClose={handleCloseModals}
                        onSuccess={handleSuccess}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showDetail && selectedFunko && (
                    <FunkoDetail
                        funko={selectedFunko}
                        onClose={handleCloseModals}
                        onEdit={(funkoToEdit) => {
                            setSelectedFunko(funkoToEdit ?? selectedFunko);
                            setShowDetail(false);
                            setShowUpdate(true);
                        }}
                        onSuccess={handleSuccess}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

export default MantenimientoFunko;