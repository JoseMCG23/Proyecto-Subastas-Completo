import { useEffect, useState } from "react";
import axios from "axios";
import {
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "react-hot-toast";

const API_BASE = "http://localhost:81/appmovie/api";

export function ReporteSubastasEstado() {
    const [dataReporte, setDataReporte] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${API_BASE}/subasta/reportePorEstado`);

                const respuesta = response.data;

                const dataApi = Array.isArray(respuesta)
                    ? respuesta
                    : Array.isArray(respuesta?.data)
                    ? respuesta.data
                    : Array.isArray(respuesta?.results)
                    ? respuesta.results
                    : [];

                const estadosBase = [
                    { estado: "ACTIVA", total: 0 },
                    { estado: "FINALIZADA", total: 0 },
                    { estado: "CANCELADA", total: 0 },
                ];

                const datosFinales = estadosBase.map((item) => {
                    const encontrado = dataApi.find(
                        (x) => String(x.estado).toUpperCase() === item.estado
                    );

                    return {
                        estado: item.estado,
                        total: encontrado ? Number(encontrado.total) : 0,
                    };
                });

                setDataReporte(datosFinales);
            } catch (err) {
                console.error(err);
                setError(err.message);
                toast.error("Error al cargar reporte de subastas por estado");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center text-gray-400">
                Cargando reporte...
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-10 text-center font-medium text-red-400">
                Ocurrió un error: {error}
            </div>
        );
    }

    const totalGeneral = dataReporte.reduce(
        (total, item) => total + Number(item.total),
        0
    );

    return (
        <div className="min-h-screen bg-black p-6 pt-28 text-gray-100">
            <Card className="border border-gray-700 bg-neutral-900 shadow-md">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-100">
                        Reporte de Subastas por Estado
                    </CardTitle>
                    <p className="text-sm text-gray-400">
                        ¿Cuántas subastas existen en el sistema y en qué estado se encuentran?
                    </p>
                </CardHeader>

                <CardContent>
                    <div className="mb-6 grid gap-4 md:grid-cols-4">
                        <div className="rounded-xl border border-gray-700 bg-black/40 p-4">
                            <p className="text-sm text-gray-400">Total de subastas</p>
                            <p className="text-3xl font-bold text-white">{totalGeneral}</p>
                        </div>

                        {dataReporte.map((item) => (
                            <div
                                key={item.estado}
                                className="rounded-xl border border-gray-700 bg-black/40 p-4"
                            >
                                <p className="text-sm text-gray-400">{item.estado}</p>
                                <p className="text-3xl font-bold text-white">{item.total}</p>
                            </div>
                        ))}
                    </div>

                    <div className="h-[400px] w-full">
                        <ResponsiveContainer>
                            <BarChart
                                data={dataReporte}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis
                                    dataKey="estado"
                                    stroke="#ccc"
                                    tick={{ fill: "#ccc" }}
                                />
                                <YAxis stroke="#ccc" tick={{ fill: "#ccc" }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1f1f1f",
                                        border: "1px solid #555",
                                        color: "#fff",
                                    }}
                                    labelStyle={{ color: "#aaa" }}
                                />
                                <Legend wrapperStyle={{ color: "#fff" }} />
                                <Bar
                                    dataKey="total"
                                    name="Cantidad de subastas"
                                    fill="#8b5cf6"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}