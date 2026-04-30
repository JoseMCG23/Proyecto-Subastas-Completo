import axios from "axios";

// http://localhost:81/appmovie/api/usuario
const BASE_URL = import.meta.env.VITE_BASE_URL + "usuario";

class UsuarioService {
    // Listado de usuarios
    getUsuarios() {
        return axios.get(BASE_URL);
    }

    // Detalle de usuario
    getUsuarioById(idUsuario) {
        return axios.get(BASE_URL + "/" + idUsuario);
    }

    changeState(usuario) {
        return axios({
            method: "patch",
            url: BASE_URL + "/changeState",
            data: JSON.stringify(usuario),
        });
    }

    // Actualizar usuario
    updateUsuario(usuario) {
        return axios({
            method: "put",
            url: BASE_URL,
            data: JSON.stringify(usuario),
        });
    }

    // 🔥 NUEVO - Registrar usuario
    createUsuario(usuario) {
        return axios({
            method: "post",
            url: BASE_URL + "/create",
            data: JSON.stringify(usuario),
        });
    }

    // 🔥 NUEVO - Login usuario
    loginUsuario(usuario) {
        return axios({
            method: "post",
            url: BASE_URL + "/login",
            data: JSON.stringify(usuario),
        });
    }
}

export default new UsuarioService();