import axios from "axios";

// http://localhost:81/appmovie/api/funko
const BASE_URL = import.meta.env.VITE_BASE_URL + "funko";

class FunkoService {
    // Listado
    getFunkos() {
        return axios.get(BASE_URL);
    }

    // Detalle
    getFunkoById(idFunko) {
        return axios.get(BASE_URL + "/" + idFunko);
    }

    // Crear
    createFunko(funko) {
        return axios.post(BASE_URL, JSON.stringify(funko));
    }
    // Actualizar
    updateFunko(funko) {
        return axios.put(BASE_URL, JSON.stringify(funko));
    }
    deleteLogicFunko(idFunko) {
        return axios.put(BASE_URL + "/deleteLogic", JSON.stringify({ idFunko }));
    }

    changeStateFunko(idFunko) {
        return axios.put(BASE_URL + "/changeState", JSON.stringify({ idFunko }));
    }
}

export default new FunkoService();