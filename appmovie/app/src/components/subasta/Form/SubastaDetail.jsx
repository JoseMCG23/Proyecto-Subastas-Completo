import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import Pusher from "pusher-js";

const API_UPLOADS = "http://localhost:81/appmovie/api/uploads";

export function SubastaDetail({ subasta, onClose, onEdit, onPublish, onCancel, onRefresh }) {
    const imgSrc = subasta?.imagen
        ? `${API_UPLOADS}/${subasta.imagen}`
        : "";

    const pujasCount = Number(subasta?.cantidadPujas ?? subasta?.cantidadTotalPujas ?? 0);
    const canEdit = (subasta?.estado === "INACTIVA" || subasta?.estado === "PROGRAMADA") && pujasCount === 0;
    const canPublish = subasta?.estado === "INACTIVA";
    const canCancel = subasta?.estado === "INACTIVA" || subasta?.estado === "PROGRAMADA";

    const nombreUsuarioCreador = subasta?.usuarioCreador || "Usuario desconocido";

    useEffect(() => {
        if (!subasta?.idsubasta) return;

        const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
            cluster: import.meta.env.VITE_PUSHER_CLUSTER,
        });

        const channel = pusher.subscribe(`subasta-${subasta.idsubasta}`);

        channel.bind("subasta-cerrada", () => {
            if (onRefresh) onRefresh();
        });

        channel.bind("subasta-actualizada", () => {
            if (onRefresh) onRefresh();
        });

        channel.bind("subasta-estado-cambiado", () => {
            if (onRefresh) onRefresh();
        });

        channel.bind("puja-registrada", () => {
            if (onRefresh) onRefresh();
        });

        return () => {
            channel.unbind_all();
            pusher.unsubscribe(`subasta-${subasta.idsubasta}`);
        };
    }, [subasta?.idsubasta, onRefresh]);

    
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
                    className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/20 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-4 shadow-2xl"
                >
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                {subasta?.objeto || "Subasta"}
                            </h2>
                            <p className="mt-2 text-sm text-white/70">
                                {subasta?.categorias || "Sin categorías"}
                            </p>
                        </motion.div>
                        <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            onClick={onClose}
                            className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all duration-200"
                        >
                            ✕
                        </motion.button>
                    </div>

                    
                    {imgSrc && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mb-8 rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
                        >
                            <img
                                src={imgSrc}
                                alt={subasta?.objeto}
                                className="w-full h-auto max-h-[600px] object-cover bg-black/20"
                            />
                        </motion.div>
                    )}

                    
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-2 mb-4"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 shadow-xl">
                                <CardHeader className="pb-1">
                                    <CardTitle className="text-sm text-white/70">
                                        Estado de la Subasta
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-1 pb-1">
                                    <p className="text-base font-semibold text-white text-center">
                                        {(subasta?.estado || "PROGRAMADA").charAt(0) + (subasta?.estado || "PROGRAMADA").slice(1).toLowerCase()}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 shadow-xl">
                                <CardHeader className="pb-1">
                                    <CardTitle className="text-sm text-white/70">
                                        Usuario Creador
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-1 pb-1">
                                    <p className="text-base font-semibold text-white text-center">
                                        {nombreUsuarioCreador}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-400/20 shadow-xl">
                            <CardHeader className="pb-1">
                                <CardTitle className="text-sm text-white/70">
                                    Precio Base
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-1 pb-1">
                                <p className="text-2xl font-extrabold text-emerald-300 text-center">
                                    ₡{Number(subasta?.precioBase || 0).toLocaleString("es-CR")}
                                </p>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 shadow-xl">
                                <CardHeader className="pb-1">
                                    <CardTitle className="text-sm text-white/70">
                                        Fecha Inicio
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-1 pb-1">
                                    <p className="text-base font-semibold text-white text-center">
                                        {subasta?.fechaInicio || "—"}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 shadow-xl">
                                <CardHeader className="pb-1">
                                    <CardTitle className="text-xs text-white/70">
                                        Fecha Cierre
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-1 pb-1">
                                    <p className="text-base font-semibold text-white text-center">
                                        {subasta?.fechafin || "—"}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 shadow-xl">
                                <CardHeader className="pb-1">
                                    <CardTitle className="text-xs text-white/70">
                                        Incremento Mínimo
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-1 pb-1">
                                    <p className="text-base font-semibold text-white text-center">
                                        ₡{Number(subasta?.incre_minimo || 0).toLocaleString("es-CR")}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 shadow-xl">
                                <CardHeader className="pb-1">
                                    <CardTitle className="text-xs text-white/70">
                                        Total Pujas
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-1 pb-1">
                                    <p className="text-base font-semibold text-white text-center">
                                        {subasta?.cantidadTotalPujas || 0}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>

                    
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap gap-2 pt-3 border-t border-white/20"
                    >
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 min-w-[120px] h-12 text-white border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-200"
                        >
                            Cerrar
                        </Button>
                        {canEdit && (
                            <Button
                                onClick={onEdit}
                                className="flex-1 min-w-[120px] h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                            >
                                Editar
                            </Button>
                        )}
                        {canPublish && (
                            <Button
                                onClick={onPublish}
                                className="flex-1 min-w-[120px] h-12 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                            >
                                Publicar
                            </Button>
                        )}
                        {canCancel && (
                            <Button
                                onClick={onCancel}
                                className="flex-1 min-w-[120px] h-12 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                            >
                                Cancelar
                            </Button>
                        )}
                    </motion.div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default SubastaDetail;