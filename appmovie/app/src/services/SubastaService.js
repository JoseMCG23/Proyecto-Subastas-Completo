import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "subasta";

class SubastaService {

    getSubastas() {
        return axios.get(BASE_URL);
    }

    getSubastasActivas() {
        return axios.get(`${BASE_URL}/activas`);
    }

    getSubastasFinalizadas() {
        return axios.get(`${BASE_URL}/finalizadas`);
    }

    getSubastaById(idSubasta) {
        return axios.get(`${BASE_URL}/${idSubasta}`);
    }

    getPujasBySubasta(idSubasta) {
        return axios.get(`${BASE_URL}/pujas/${idSubasta}`);
    }



    // Crear
    createSubasta(subasta) {
        return axios.post(BASE_URL, JSON.stringify(subasta));
    }
    // Actualizar
    updateSubasta(subasta) {
        return axios.put(BASE_URL, JSON.stringify(subasta));
    }

    // Publicar
    publicarSubasta(idSubasta) {
        return axios.put(`${BASE_URL}/publicar/${idSubasta}`);
    }

    // Cancelar
    cancelarSubasta(idSubasta) {
        return axios.put(`${BASE_URL}/cancelar/${idSubasta}`);
    }
    // Cerrar
    cerrarSubasta(idSubasta) {
        return axios.get(`${import.meta.env.VITE_BASE_URL}resultadoSubasta/cerrar/${idSubasta}`);
    }
    // Crear puja
    createPuja(puja) {
        return axios.post(import.meta.env.VITE_BASE_URL + "puja", JSON.stringify(puja));
    }

    confirmarPago(idPago) {
        return axios.put(`${import.meta.env.VITE_BASE_URL}pago/confirmarPago/${idPago}`);
    }
}

export default new SubastaService();