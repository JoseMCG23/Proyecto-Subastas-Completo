import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL + "categoria";

class CategoriaService {
    getCategorias() {
        return axios.get(BASE_URL);
    }
}

export default new CategoriaService();